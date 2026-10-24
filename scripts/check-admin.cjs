/* eslint-disable @typescript-eslint/no-require-imports */
// Run against an isolated staging database with manually authenticated staff storage state.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.CHECK_URL||'http://localhost:3001';
(async()=>{
 if(!process.env.PLAYWRIGHT_STORAGE_STATE)throw new Error('BLOCKED: set PLAYWRIGHT_STORAGE_STATE to an authenticated staging staff session; this test does not bypass authentication.');
 const browser=await chromium.launch({headless:true});
 try {const page=await browser.newPage({storageState:process.env.PLAYWRIGHT_STORAGE_STATE});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [375,1225]){await page.setViewportSize({width,height:900});for(const slug of ['', 'books','reviews','categories','orders','customers','inventory','promotions','content','analytics','media','enquiries','team','settings']){
 await page.goto(`${origin}/admin${slug?'/'+slug:''}`);await page.locator('#admin-main h1').waitFor();
 assert.equal(await page.locator('#admin-main h1').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow: ${slug} at ${width}`);
 }}assert.deepEqual(errors,[]);console.log('PASS: authenticated admin route, responsive overflow and runtime error checks');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
