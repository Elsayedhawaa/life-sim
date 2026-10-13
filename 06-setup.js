/* =====================================================================
   6. SETUP & INITIALIZATION
   ===================================================================== */
let avG='n', avT=0;
function renderPick(){
  $('av-big').textContent = face(avG,avT,6);
  $('av-g').innerHTML = [['f','Girl'],['n','Neutral'],['m','Boy']].map(([g,l])=>`<button class="chip ${avG===g?'sel':''}" onclick="pickG('${g}')">${face(g,avT,20)}</button>`).join('');
  $('av-t').innerHTML = [0,1,2].map(t=>`<button class="chip ${avT===t?'sel':''}" onclick="pickT(${t})">🖐${TONES[t]}</button>`).join('');
}
function pickG(g){ avG=g; renderPick(); }
function pickT(t){ avT=t; renderPick(); }

function hasSave(){ let d=null; try { d=JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e){} return !!(d && d.S); }

function startGame(){
  if (hasSave() && !newArmed){ newArmed=true; $('start-btn').textContent='Tap again to replace saved life'; return; }
  newGame($('name-input').value.trim(), avG, avT);
  activeTab='life'; menuOpen=false; newArmed=false;
  $('start').classList.add('hidden'); $('game').classList.remove('hidden');
  log('Life began at age 6.');
  S.ev={title:'Your story begins',text:`${S.name}, you are 6 years old and starting school. Open the Education tab and choose a school.`,choices:[]};
  render();
}

function initStart(){
  let d=null; try { d=JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e){}
  const b=$('cont-btn');
  if (d && d.S){ b.textContent=`Continue saved life: ${d.S.name}, age ${d.S.age}`; b.classList.remove('hidden'); return true; }
  b.classList.add('hidden'); return false;
}

