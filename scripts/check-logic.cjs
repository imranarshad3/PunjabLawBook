/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
function load(relative) {
 const file = path.resolve(__dirname, "..", relative);
 const m = new Module(file, module); m.paths = Module._nodeModulePaths(path.dirname(file));
 m._compile(ts.transpile(fs.readFileSync(file,"utf8"), {module:ts.ModuleKind.CommonJS}),file);
 return m.exports;
}
const {parseCart}=load("src/components/cart-state.ts");
assert.deepEqual(parseCart("broken JSON"),[]);
assert.deepEqual(parseCart(JSON.stringify([{id:1,quantity:2},{id:1,quantity:3},{id:2,quantity:-1},{id:3,quantity:100},{id:4,quantity:1.5}])),[{id:1,quantity:2}]);
assert.deepEqual(parseCart(" ".repeat(8193)),[]);
const {accountReturnTo}=load("src/lib/account-navigation.ts");
const origin="https://books.example";
assert.equal(accountReturnTo("https://books.example/admin/orders",origin),"/admin/orders");
for(const input of ["https://evil.example","//evil.example","https://books.example.evil.example","https://books.example@evil.example","/\\evil.example"]) assert.equal(accountReturnTo(input,origin),"/account");
const {readStoreSettings,storeLogoUrl}=load("src/lib/store-settings.ts");
const settings=readStoreSettings({store_name:"QA Books",shipping_flat_fee:150,free_shipping_over:2000,whatsapp:"03334222005"});
assert.equal(settings.name,"QA Books");assert.equal(settings.shippingFee,150);assert.equal(settings.freeShippingOver,2000);assert.equal(settings.whatsapp,"923334222005");
assert.equal(storeLogoUrl("javascript:alert(1)"),"");
const {orderStatusOptions}=load("src/lib/order-status.ts");
assert.deepEqual(orderStatusOptions("cancelled"),["cancelled"]);
assert.deepEqual(orderStatusOptions("shipped"),["shipped","delivered"]);
console.log("PASS: cart validation; safe account redirects; store identity, shipping and WhatsApp; logo URL validation; terminal order transitions");
