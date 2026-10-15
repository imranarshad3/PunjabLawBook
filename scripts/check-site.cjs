/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const origin = process.env.CHECK_URL || "http://localhost:3000";
  const routes = [
    "/",
    "/products",
    "/products/5966",
    "/collections",
    "/collections/bestsellers",
    "/about",
    "/contact",
    "/request-a-book",
    "/help",
    "/account",
    "/account/register",
    "/account/forgot-password",
    "/cart",
    "/checkout",
    "/wishlist",
    "/privacy",
    "/terms",
    "/delivery",
    "/returns",
  ];
  for (const width of [320, 375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      const response = await page.goto(origin + route, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200, route);
      assert.equal(await page.locator("h1").count(), 1, route);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow ${width} ${route}`,
      );
      const legacy = await page
        .locator(
          'a[href*="punjablawbookhouse.com"], form[action*="punjablawbookhouse.com"]',
        )
        .count();
      assert.equal(legacy, 0, route);
    }
    await page.goto(origin + "/products", { waitUntil: "networkidle" });
    const search = page.getByRole("combobox", {
      name: "Search books, authors and subjects",
    });
    await search.fill("penal");
    await page.locator(".search-suggestions").waitFor();
    assert.equal(await page.locator(".search-suggestion").count(), 2);
    const input = await search.boundingBox();
    const panel = await page.locator(".search-suggestions").boundingBox();
    assert(
      panel.y >= input.y + input.height,
      "Suggestions should be below input",
    );
    assert(
      panel.x >= 0 && panel.x + panel.width <= width + 1,
      "Suggestions overflow",
    );
    await page.screenshot({
      path: `/tmp/plbh-search-${width}.png`,
      fullPage: false,
    });
    await search.press("ArrowDown");
    await search.press("Enter");
    await page.waitForURL(/\/products\/\d+/);
    await page
      .getByRole("button", { name: "Add to book bag", exact: true })
      .click();
    await page.getByRole("link", { name: "View book bag →" }).click();
    await page.locator(".cart-line").waitFor();
    await page.getByRole("link", { name: "Review checkout" }).click();
    await page.locator(".checkout-book-list").waitFor();
    assert(
      await page
        .getByRole("button", { name: "Ordering opens soon" })
        .isDisabled(),
    );
    await page.screenshot({
      path: `/tmp/plbh-checkout-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + "/products", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Sort books:" }).click();
  await page.getByRole("option", { name: "Price: low to high" }).click();
  assert.match(
    await page.locator(".shop-product-grid .book-card").first().innerText(),
    /250/,
  );
  await page.getByRole("button", { name: "Sort books:" }).click();
  await page.screenshot({
    path: "/tmp/plbh-filters-desktop.png",
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Bookshop", exact: true }).click();
  await page.locator("#bookshop-navigation").waitFor();
  await page.screenshot({ path: "/tmp/plbh-nav-desktop.png", fullPage: false });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#bookshop-navigation").count(), 0);
  await page.getByRole("button", { name: "Bookshop", exact: true }).click();
  await page.mouse.click(1400, 900);
  assert.equal(await page.locator("#bookshop-navigation").count(), 0);
  await page
    .getByRole("textbox", { name: "Search this collection" })
    .fill("not-a-book");
  await page.locator(".shop-empty").waitFor();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await page.getByRole("radio", { name: "Criminal Law" }).check();
  assert.equal(await page.locator(".shop-product-grid .book-card").count(), 2);
  const save = page.locator(".shop-product-grid .wishlist-button").first();
  await save.click();
  await page.goto(origin + "/wishlist", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".book-card").count(), 1);
  await page.goto(origin + "/request-a-book", { waitUntil: "networkidle" });
  await page.getByLabel("Your name").fill("Test Reader");
  await page.getByLabel("Book title").fill("Test Reference");
  await page.getByRole("button", { name: "Prepare book request" }).click();
  await page.getByRole("link", { name: "Continue in WhatsApp" }).waitFor();
  await page.evaluate(() =>
    localStorage.setItem(
      "plbh-book-bag-v1",
      '[{"id":5966,"quantity":-5},{"id":999999,"quantity":1},{"id":253,"quantity":2,"price":0}]',
    ),
  );
  await page.goto(origin + "/cart", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".cart-line").count(), 1);
  assert.match(await page.locator(".summary-total").innerText(), /2,000/);
  await page.evaluate(() =>
    localStorage.setItem("plbh-book-bag-v1", "broken JSON"),
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".empty-bag").waitFor();
  const response = await page.goto(origin + "/products");
  assert.equal(response.headers()["x-content-type-options"], "nosniff");
  assert.equal(response.headers()["x-frame-options"], "DENY");
  assert(
    response
      .headers()
      ["content-security-policy"].includes("frame-ancestors 'none'"),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 76 responsive route checks; local navigation; live search geometry & keyboard; dropdowns; filters; saved books; cart/checkout preview; enquiry preparation; malformed cart validation; security headers.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
