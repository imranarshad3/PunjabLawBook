/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
async function assertEventually(actual, expected, message) {
  const deadline = Date.now() + 10000;
  let value;
  do {
    value = await actual();
    if (Object.is(value, expected)) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  } while (Date.now() < deadline);
  assert.equal(value, expected, message);
}
const fs = require("node:fs/promises");
const catalogue = require("../src/data/catalogue.json");
const books = [...catalogue.featured, ...catalogue.bestsellers];
const origin = process.env.CHECK_URL || "http://localhost:3000";
const views = ["Overview", "Book catalogue", "Categories", "Inventory", "Media library", "Website content", "Book enquiries", "Orders", "Customers", "Analytics", "Team & access", "Settings"];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    async function navigate(name) {
      if (page.viewportSize().width <= 760) {
        await page.getByRole("button", { name: "Open navigation", exact: true }).click();
      }
      const link = page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", { name, exact: true });
      const href = await link.getAttribute("href");
      await link.click();
      await page.waitForURL(url => url.pathname === href);
      await page.getByRole("heading", { name: name === "Overview" ? "A new chapter for your bookstore." : name, exact: true, level: 1 }).waitFor();
    }
    const response = await page.goto(`${origin}/admin`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    await page.keyboard.press("Tab");
    assert(await page.locator(".plbh-admin-skip").evaluate(node => node === document.activeElement), "Keyboard reaches skip link first");
    await page.keyboard.press("Enter");
    assert(await page.locator("#admin-main").evaluate(node => node === document.activeElement), "Skip link focuses main content");
    await assertEventually(() => page.locator(".plbh-admin-metric").first().locator("strong").innerText(), String(books.length));
    await assertEventually(() => page.getByText("Total revenue", { exact: true }).count(), 0);
    await assertEventually(() => page.getByRole("button", { name: "Add book", exact: true }).count(), 0);

    // Every module must render when loaded directly, without callback initialization errors.
    for (const slug of ["books", "categories", "inventory", "media", "content", "enquiries", "orders", "customers", "analytics", "team", "settings"]) {
      assert.equal((await page.goto(`${origin}/admin/${slug}`, { waitUntil: "networkidle" })).status(), 200);
      await assertEventually(() => page.locator("h1:visible").count(), 1, `Direct admin route ${slug}`);
    }
    await page.goto(`${origin}/admin/books?page=2`, { waitUntil: "networkidle" });
    await page.getByRole("textbox", { name: "Search catalogue" }).focus();
    await page.keyboard.press("ArrowLeft");
    assert.equal(new URL(page.url()).searchParams.get("page"), "2", "Typing shortcuts must not paginate");
    await page.goto(`${origin}/admin`, { waitUntil: "networkidle" });

    // A stale draft from the original UI must never override the real catalogue.
    await page.evaluate(() => localStorage.setItem("plbh-admin-books-v1", JSON.stringify([{ id: 123, name: "Invented test title", price: 9 }])));
    await page.reload({ waitUntil: "networkidle" });
    await navigate("Book catalogue");
    await assertEventually(() => page.locator(".plbh-admin-book-card").count(), Math.min(8, books.length));
    await assertEventually(() => page.getByRole("button", { name: "Previous", exact: true }).isDisabled(), true);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await assertEventually(() => page.locator(".plbh-admin-book-card").count(), books.length - 8);
    await assertEventually(() => page.getByRole("button", { name: "Next", exact: true }).isDisabled(), true);
    await page.getByRole("textbox", { name: "Search catalogue" }).fill("5966");
    await assertEventually(() => page.locator(".plbh-admin-book-card").count(), 1);
    await assertEventually(() => page.locator(".plbh-admin-book-card h3").innerText(), books.find(b => b.id === 5966).name);
    await page.getByRole("textbox", { name: "Search catalogue" }).fill("no-matching-book");
    await assertEventually(() => page.getByRole("heading", { name: "No matching books" }).count(), 1);
    await page.getByRole("button", { name: "Clear all filters" }).click();
    await page.getByRole("combobox", { name: "Category filter" }).selectOption("Exam Guides");
    await assertEventually(() => page.locator(".plbh-admin-book-card").count(), 4);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export catalogue" }).click();
    const download = await downloadPromise;
    const csv = await fs.readFile(await download.path(), "utf8");
    assert.equal(csv.trim().split("\r\n").length, 5, "Filtered CSV includes four actual books and a header");
    assert(csv.includes("5966"));
    assert(!csv.includes("Invented test title"));
    await page.getByRole("button", { name: "Dismiss notification" }).click();
    await page.getByRole("combobox", { name: "Category filter" }).selectOption("All categories");
    await page.getByRole("combobox", { name: "Sort catalogue" }).selectOption("Price low to high");
    await assertEventually(() => page.locator(".plbh-admin-book-card h3").first().innerText(), [...books].sort((a, b) => a.price - b.price)[0].name);
    await page.getByRole("combobox", { name: "Sort catalogue" }).selectOption("Price high to low");
    await assertEventually(() => page.locator(".plbh-admin-book-card h3").first().innerText(), [...books].sort((a, b) => b.price - a.price)[0].name);
    await page.getByRole("combobox", { name: "Availability filter" }).selectOption("Out of stock");
    await assertEventually(() => page.locator(".plbh-admin-book-card").count(), books.filter(b => !b.inStock).length);
    await navigate("Categories");
    await page.getByRole("button", { name: "Exam Guides 4 titles" }).click();
    await assertEventually(() => page.getByRole("combobox", { name: "Category filter" }).inputValue(), "Exam Guides");
    await navigate("Overview");
    await page.getByRole("button", { name: "Browse Criminal Law: 2 titles", exact: true }).click();
    await assertEventually(() => page.getByRole("combobox", { name: "Category filter" }).inputValue(), "Criminal Law");
    await navigate("Website content");
    const links = await page.locator(".plbh-admin-content-grid a").evaluateAll(nodes => nodes.map(a => a.getAttribute("href")));
    for (const href of links) {
      assert.equal((await page.request.get(origin + href)).status(), 200, `CMS preview ${href}`);
    }
    for (const book of books) {
      assert.equal((await page.request.get(origin + book.url)).status(), 200, `Book preview ${book.id}`);
      assert.equal((await page.request.get(origin + book.image)).status(), 200, `Book image ${book.id}`);
    }
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const view of views) {
        await navigate(view);
        await assertEventually(() => page.locator("h1:visible").count(), 1, `${view} has a single h1`);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No viewport overflow: ${width}, ${view}`);
      }
      if (process.env.ADMIN_SCREENSHOT_DIR && [375, 1440].includes(width)) {
        await navigate("Overview");
        await page.screenshot({ path: `${process.env.ADMIN_SCREENSHOT_DIR}/admin-${width}.png`, fullPage: true });
      }
    }
    assert.deepEqual(errors, [], "No browser runtime errors");
    if (process.env.AXE_PATH) {
      // Execute the audit through the browser debugging context, without
      // weakening the application's production Content Security Policy.
      await page.evaluate(await fs.readFile(process.env.AXE_PATH, "utf8"));
      const violations = [];
      for (const view of views) {
        await navigate(view);
        const result = await page.evaluate(async () => window.axe.run(document.querySelector(".plbh-admin-app"), {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        }));
        violations.push(...result.violations.map(v => ({ view, rule: v.id, targets: v.nodes.map(n => n.target) })));
      }
      assert.deepEqual(violations, [], "No automated WCAG A/AA violations");
    }
    console.log("PASS: real counts, stale-draft isolation, search, filters, sorting, pagination, filtered CSV, category drill-down, preview routes/images, 12 views at 5 widths, no runtime errors.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
