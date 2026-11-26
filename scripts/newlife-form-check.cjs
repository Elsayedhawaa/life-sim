const{chromium}=require('/downloads/out/node_modules/playwright-core');(async()=>{const url=process.argv[2];const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.addInitScript(()=>{window.__sets=0;const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(/draft/i.test(k))window.__sets++;return o.call(this,k,v)};window.__pv=0;});
await p.goto(url);await p.waitForTimeout(1500);
await p.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>/New Life/.test(b.innerText))?.click()});await p.waitForTimeout(800);
await p.evaluate(()=>{window.__mo=new MutationObserver(m=>{window.__pv+=m.length});window.__mo.observe(document.getElementById('nl-preview'),{childList:true,subtree:true})});
const f=p.locator('#new-life-form input[name=firstName]');await f.click();await f.pressSequentially('Abcdefghijklmnopqr',{delay:20});
const mid=await p.evaluate(()=>({sets:window.__sets,pv:window.__pv,focus:document.activeElement?.name,val:document.querySelector('[name=firstName]').value}));
await p.waitForTimeout(700);const after=await p.evaluate(()=>({sets:window.__sets,draft:Object.entries(localStorage).filter(([k])=>/draft/i.test(k)).map(([k,v])=>v.slice(0,120))}));
await p.selectOption('#new-life-form select[name=country]',{index:3});await p.waitForTimeout(300);
const sel=await p.evaluate(()=>({sets:window.__sets,pv:window.__pv,country:document.querySelector('[name=country]').value,k:document.getElementById('nl-preview').dataset.k}));
// type then refresh before debounce
await f.fill('');await f.pressSequentially('Zed',{delay:10});await p.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
await p.reload();await p.waitForTimeout(1500);
await p.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>/New Life/.test(b.innerText))?.click()});await p.waitForTimeout(600);
const rec=await p.evaluate(()=>({fn:document.querySelector('[name=firstName]')?.value,country:document.querySelector('[name=country]')?.value}));
await p.locator('#new-life-form button[type=submit]').first().click();await p.waitForTimeout(1500);
const st=await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('world_life_2_save_v1')||'{}');return {name:s.player?.fullName,country:s.country,draftLeft:Object.keys(localStorage).filter(k=>/draft/i.test(k))}});
console.log(JSON.stringify({mid,after,sel,rec,st}));await b.close()})();
