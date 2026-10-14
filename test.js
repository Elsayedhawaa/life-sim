const {JSDOM,VirtualConsole}=require('jsdom');
async function run(file,years){
  const errs=[];const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e);if(!/fonts.googleapis/.test(m))errs.push(m.slice(0,160));});
  const dom=await JSDOM.fromFile(file,{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,
    beforeParse(w){let s=777;w.Math.random=()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};
      w.alert=()=>{};w.confirm=()=>true;w.prompt=()=>'1000';}});
  await new Promise(r=>dom.window.addEventListener('load',r));await new Promise(r=>setTimeout(r,300));
  const w=dom.window;
  try{
    w.eval("document.getElementById('name-input').value='Test';startGame()");
    for(let i=0;i<years;i++){
      w.eval(`(function(){
        if(S.age<18){ try{ pickSchool('national'); }catch(e){ window.__err=(window.__err||'')+' pick:'+e.message; } }
        for(let k=0;k<4&&S.pending&&S.ev&&S.ev.choices&&S.ev.choices.length;k++){ try{ choose(0); }catch(e){ window.__err=(window.__err||'')+' choose@'+S.age+':'+e.message; } }
        try{ ageUp(); }catch(e){ window.__err=(window.__err||'')+' ageUp@'+S.age+':'+e.message; }
        // render every tab each year to catch view crashes
        for(const t of ['life','school','career','assets','shop','mine']){ try{ go(t); }catch(e){ window.__err=(window.__err||'')+' tab '+t+':'+e.message; } }
      })()`);
    }
    const o=JSON.parse(w.eval("JSON.stringify({age:S.age,year:S.year,wealth:Math.round(S.wealth||0),log:S.logRows.length,keys:Object.keys(S).length,err:window.__err||'',hint:document.getElementById('hint').textContent.slice(0,90)})"));
    return {o,errs:[...new Set(errs)].slice(0,5)};
  }catch(e){return {fatal:e.message,errs}}
}
(async()=>{for(const f of process.argv.slice(3)){console.log(f,JSON.stringify(await run(f,+process.argv[2])))}})();
