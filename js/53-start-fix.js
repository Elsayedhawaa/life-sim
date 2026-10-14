/* =====================================================================
   53. START / LOAD SAFETY NET
   Wraps startGame and loadGame so errors are visible, not silent.
   Adds a Reset save button to the start screen.
   Load AFTER 52-monthly-pacing.js and BEFORE 99-boot.js
   ===================================================================== */

/* ---------- Wrap startGame with error handling ---------- */
const P53_startGameBefore = startGame;
startGame = function () {
  try {
    return P53_startGameBefore.apply(this, arguments);
  } catch (err) {
    console.error('startGame crashed:', err);
    alert('Could not start a new life.\n\nError: ' + (err && err.message ? err.message : err) + '\n\nOpen F12 → Console for details. If this keeps happening, click "Reset save" on the start screen.');
  }
};

/* ---------- Wrap loadGame with error handling ---------- */
const P53_loadGameBefore = loadGame;
loadGame = function () {
  try {
    return P53_loadGameBefore.apply(this, arguments);
  } catch (err) {
    console.error('loadGame crashed:', err);
    alert('Could not load your saved game.\n\nError: ' + (err && err.message ? err.message : err) + '\n\nThe save file may be corrupted by a recent patch. Click "Reset save" below to start fresh, or copy the error from F12 → Console.');
  }
};

/* ---------- Add Reset save button to start screen ---------- */
function p53InjectResetButton() {
  const start = document.getElementById('start');
  if (!start) return;
  if (start.querySelector('#p53-reset-btn')) return;
  const refBtn = document.getElementById('cont-btn');
  if (!refBtn) return;

  const btn = document.createElement('button');
  btn.id = 'p53-reset-btn';
  btn.className = 'btn';
  btn.style.cssText = 'text-align:center;margin-top:8px;border-color:var(--rose);color:var(--rose)';
  btn.textContent = 'Reset save (delete and start over)';
  btn.onclick = function () {
    if (!confirm('Delete your saved game permanently?\n\nThis cannot be undone.')) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    location.reload();
  };
  refBtn.parentElement.appendChild(btn);
}

/* ---------- Run on load ---------- */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    /* Only inject if start screen is visible */
    const start = document.getElementById('start');
    if (start && !start.classList.contains('hidden')) {
      p53InjectResetButton();
    }
  });
}

/* Also run once at load */
setTimeout(p53InjectResetButton, 100);
setTimeout(p53InjectResetButton, 500);

/* ---------- Also expose a global reset helper ---------- */
window.p53ResetSave = function () {
  if (!confirm('Delete save and reload?')) return;
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  location.reload();
};
