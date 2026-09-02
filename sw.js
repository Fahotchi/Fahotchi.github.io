const CACHE='mizan-secure-v5-0-1';
const SHELL=['/secure-v3.html?v=501','/version.json','/manifest.webmanifest?v=501','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];

self.addEventListener('install',e=>{
 self.skipWaiting();
 e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))));
});

self.addEventListener('activate',e=>{
 e.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
 ]));
});

self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const path=new URL(r.url).pathname;
 if(r.mode==='navigate'||r.destination==='document'||path==='/version.json'){
  e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r).then(x=>x||caches.match('/secure-v3.html?v=501'))));return;
 }
 e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{
  if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
  return res
 }).catch(()=>caches.match(r)));
});
