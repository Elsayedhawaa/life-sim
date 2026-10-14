/* ---------- Boot ---------- */
renderPick();
$('name-input').addEventListener('keydown', e => { if (e.key==='Enter') startGame(); });
window.addEventListener('beforeunload', () => save());
if (initStart()){   // a save exists: restore it straight away
  try { loadGame(); }
  catch(err){ S=null; $('game').classList.add('hidden'); $('start').classList.remove('hidden'); }
}
