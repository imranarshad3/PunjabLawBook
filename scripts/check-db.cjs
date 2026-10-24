/* eslint-disable @typescript-eslint/no-require-imports */
// Creates a disposable, network-isolated database. Never reads .env or production credentials.
const {spawnSync,spawn}=require('node:child_process');
const fs=require('node:fs');const path=require('node:path');
const container=`plbh-regression-${process.pid}`;
function docker(args,input){const r=spawnSync('docker',args,{input,encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr||r.stdout||'Docker failed');return r.stdout;}
const query=(sql)=>docker(['exec','-i',container,'psql','-U','postgres','-v','ON_ERROR_STOP=1','-q'],sql);
const bootstrap=`create role anon nologin; create role authenticated nologin; create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
create schema storage; create table storage.buckets(id text primary key,name text,public boolean); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;
grant usage on schema public,auth,storage to anon,authenticated; alter default privileges in schema public grant all on tables to anon,authenticated; alter default privileges in schema public grant usage,select on sequences to anon,authenticated;`;
function concurrent(sql){return new Promise((resolve,reject)=>{const p=spawn('docker',['exec','-i',container,'psql','-U','postgres','-v','ON_ERROR_STOP=1','-q']);let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('error',reject);p.on('close',code=>code?reject(new Error(err)):resolve(out));p.stdin.end(sql);});}
(async()=>{let started=false;try{
 docker(['run','-d','--name',container,'--network','none','-e','POSTGRES_PASSWORD=disposable-test-only','postgres:17']);started=true;
 let ready=false;for(let i=0;i<50;i++){if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0){ready=true;break;}await new Promise(r=>setTimeout(r,200));}if(!ready)throw new Error('Local test database did not start');
 query(bootstrap);
 for(const file of fs.readdirSync(path.join(__dirname,'../supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())query(fs.readFileSync(path.join(__dirname,'../supabase/migrations',file),'utf8'));
 console.log(query(fs.readFileSync(path.join(__dirname,'check-audit-integrity.sql'),'utf8')));
 query(`insert into books(title,slug,price,stock,status) values('QA concurrency','qa-concurrency',50,3,'published'); insert into store_settings(id,store_name,shipping_flat_fee) values(true,'QA store',100);`);
 const request=`select * from public.place_order('{"full_name":"QA concurrency","phone":"0","address":"Local only","city":"QA"}',jsonb_build_array(jsonb_build_object('legacy_id',(select legacy_id from books where slug='qa-concurrency'),'quantity',2)),null,'22222222-2222-4222-8222-222222222222');`;
 await Promise.all([concurrent(request),concurrent(request)]);
 query(`do $$ begin if (select count(*) from orders)<>1 or (select stock from books where slug='qa-concurrency')<>1 then raise exception 'Concurrent exact-once test failed'; end if; end $$;`);
 console.log('PASS: fresh migration chain and concurrent exact-once checkout');
}finally{if(started)docker(['rm','-f',container]);}})().catch(e=>{console.error(e.message);process.exitCode=1;});
