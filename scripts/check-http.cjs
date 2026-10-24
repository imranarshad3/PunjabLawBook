/* eslint-disable @typescript-eslint/no-require-imports */
const assert=require('node:assert/strict');
const origin=process.env.CHECK_URL||'http://localhost:3001';
(async()=>{
 const routes=['/','/products','/products/5966','/collections','/collections/bestsellers','/about','/contact','/delivery','/returns','/help','/privacy','/terms','/request-a-book','/account','/account/register','/account/forgot-password','/cart','/checkout','/wishlist'];
 for(const route of routes){ const r=await fetch(origin+route);assert.equal(r.status,200,route);assert((await r.text()).includes('<main'),route); }
 const r=await fetch(origin+'/products');assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('x-frame-options'),'DENY');assert(r.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
 const admin=await fetch(origin+'/admin/books',{redirect:'manual'});assert([302,303,307,308].includes(admin.status),'signed-out admin redirect');
 for(const [url,method] of [['/api/admin/invite','POST'],['/api/admin/invite?id=invalid','DELETE'],['/api/admin/claim','POST']]) {const response=await fetch(origin+url,{method,headers:{'Content-Type':'application/json'},body:method==='POST'?'{}':undefined});assert.equal(response.status,401,url);}
 console.log('PASS: 19 public HTTP routes; security headers; signed-out admin redirect; 3 protected API operations reject unauthenticated requests');
})().catch(e=>{console.error(e);process.exitCode=1;});
