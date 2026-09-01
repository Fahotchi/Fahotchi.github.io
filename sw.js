const CACHE='mizan-secure-v4-4';
const SHELL=['/secure-v3.html?v=440','/version.json','/manifest.webmanifest?v=440','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))));
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;

  if(req.mode==='navigate'||req.destination==='document'||new URL(req.url).pathname==='/version.json'){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>res)
        .catch(()=>caches.match(req).then(r=>r||caches.match('/secure-v3.html?v=440')))
    );
    return;
  }

  event.respondWith(
    fetch(req,{cache:'no-store'})
      .then(res=>{
        if(res&&res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return res;
      })
      .catch(()=>caches.match(req))
  );
});
