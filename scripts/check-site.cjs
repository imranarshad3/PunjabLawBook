/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
const origin=process.env.CHECK_URL||'http://localhost:3001';
(async()=>{const browser=await chromium.launch({headless:true});try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const routes=['/','/products','/products/5966','/collections','/collections/bestsellers','/about','/contact','/request-a-book','/account','/cart','/checkout','/wishlist','/privacy','/terms','/delivery','/returns'];
for(const width of [375,1225]){await page.setViewportSize({width,height:900});for(const route of routes){const response=await page.goto(origin+route);assert.equal(response.status(),200,route);await page.locator('main h1').first().waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow: ${route} at ${width}`);}}
assert.deepEqual(errors,[]);console.log('PASS: public routes, responsive geometry and runtime errors; no orders submitted');}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
