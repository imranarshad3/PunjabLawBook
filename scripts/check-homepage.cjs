/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node.js verification script. */
// Run with PLAYWRIGHT_MODULE pointing to an available Playwright installation.
// No checkout, contact messages, or live-store mutations are performed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const output = process.env.CHECK_OUTPUT || "/tmp/plbh-checks";
  fs.mkdirSync(output, { recursive: true });
  const results = [];
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(process.env.CHECK_URL || "http://127.0.0.1:3000", {
      waitUntil: "networkidle",
    });
    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    await page.locator(".site-header").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/${width}.png`, fullPage: true });
    const result = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      sections: [...document.querySelectorAll("[data-section]")].map(
        (el) => el.dataset.section,
      ),
      headings: document.querySelectorAll("h1").length,
      overflow: [...document.querySelectorAll("main *, header *, footer *")]
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return (
            !el.closest(".bestseller-track") &&
            box.width > 0 &&
            (box.right > innerWidth + 1 || box.left < -1) &&
            getComputedStyle(el).position !== "absolute"
          );
        })
        .map((el) => `${el.tagName}.${el.className}`)
        .slice(0, 10),
      brokenImages: [...document.images]
        .filter((image) => image.complete && !image.naturalWidth)
        .map((image) => image.src),
      // Cart control and WhatsApp share one row in every featured card.
      rowActions: [
        ...document.querySelectorAll(".featured-grid .book-actions"),
      ].every((el) => {
        const [a, b] = [...el.children].map((child) =>
          child.getBoundingClientRect(),
        );
        return Math.abs(a.top - b.top) < 1 && b.left >= a.right;
      }),
    }));
    assert.equal(result.sections.length, 12, "Exactly 12 sections");
    assert.equal(new Set(result.sections).size, 12, "No duplicated sections");
    assert.deepEqual(
      result.sections.map((s) => s.slice(0, 2)),
      Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
    );
    assert.equal(result.headings, 1);
    assert.equal(result.scrollWidth, width, `Page overflow at ${width}`);
    assert.equal(result.rowActions, true);
    assert.deepEqual(result.brokenImages, []);
    results.push(result);
    console.log(JSON.stringify(result));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Bookshop" }).click();
  assert.equal(await page.getByRole("link", { name: /All Law Books/ }).isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("button", { name: "Bookshop" }).getAttribute("aria-expanded"), "false");
  await page.setViewportSize({ width: 375, height: 850 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Featured books" })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Open navigation" })
      .getAttribute("aria-expanded"),
    "false",
  );
  const save = page.locator(".wishlist-button").first();
  await save.click();
  assert.equal(await save.getAttribute("aria-pressed"), "true");
  await save.click();
  assert.equal(await save.getAttribute("aria-pressed"), "false");
  await page.getByRole("button", { name: "Next bestselling books" }).click();
  await page.waitForFunction(
    () => document.querySelector("#bestseller-track").scrollLeft > 100,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Previous bestselling books" })
      .isDisabled(),
    false,
  );
  await page
    .getByRole("button", { name: "Previous bestselling books" })
    .click();
  await page.waitForFunction(
    () => document.querySelector("#bestseller-track").scrollLeft < 2,
  );
  assert.equal(await page.locator("#newsletter-email").isDisabled(), true);
  const links = await page
    .locator("a")
    .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));
  assert.equal(
    links.some((href) => !href || href === "#"),
    false,
    "No empty or fake links",
  );
  const search = page.getByRole("search");
  assert.equal(
    await search.getAttribute("action"),
    "https://punjablawbookhouse.com/",
  );
  if (process.env.AXE_PATH) {
    await page.addScriptTag({ path: process.env.AXE_PATH });
    const audit = await page.evaluate(async () =>
      window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      }),
    );
    fs.writeFileSync(
      `${output}/accessibility.json`,
      JSON.stringify(audit.violations, null, 2),
    );
    console.log(
      "Accessibility violations:",
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    );
    assert.equal(audit.violations.length, 0);
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${output}/responsive.json`,
    JSON.stringify(results, null, 2),
  );
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
