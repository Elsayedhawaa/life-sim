/* =====================================================================
   90. HOOKS — THE LAST WRAPPER EVER
   New features must NOT wrap ageUp / render / migrate / newGame.
   Instead, register a function here from your own file:

     GameHooks.on('year',    S => { ... });   // runs once after each completed year
     GameHooks.on('newGame', S => { ... });   // runs when a new life starts
     GameHooks.on('migrate', S => { ... });   // add new fields so OLD SAVES keep working
     GameHooks.on('render',  S => { ... });   // runs after every screen redraw

   Load your file AFTER this one and BEFORE 99-boot.js.
   ===================================================================== */
const GameHooks = {
  year: [], newGame: [], migrate: [], render: [],
  on(name, fn){ if (!this[name] || !Array.isArray(this[name])) throw new Error('Unknown hook: ' + name); this[name].push(fn); },
  run(name, ...args){ for (const fn of this[name]) { try { fn(...args); } catch(e){ console.error('Hook "' + name + '" failed:', e); } } }
};

const H90_ageUp = ageUp;
ageUp = function(){
  const before = S && S.age;
  H90_ageUp.apply(this, arguments);
  if (S && !S.dead && S.age !== before && GameHooks.year.length){
    GameHooks.run('year', S);
    render();
  }
};

const H90_newGame = newGame;
newGame = function(){
  H90_newGame.apply(this, arguments);
  if (S) GameHooks.run('newGame', S);
};

const H90_migrate = migrate;
migrate = function(o){
  o = H90_migrate.call(this, o);
  GameHooks.run('migrate', o);
  return o;
};

const H90_render = render;
render = function(){
  H90_render.apply(this, arguments);
  if (S) GameHooks.run('render', S);
};
