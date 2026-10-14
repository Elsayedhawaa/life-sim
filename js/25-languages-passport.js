/* =====================================================================
   25. LANGUAGES, TOEFL AND PASSPORT REALITY (Education tab)
   Connects ONLY through GameHooks (see 90-hooks.js).

   - German and Dutch courses (one language course per year), with exams.
   - TOEFL as an alternative to IELTS. A TOEFL result is converted to an
     IELTS-equivalent band and stored in S.ielts, so master's applications accept it.
   - Living in Germany or the Netherlands raises that language through daily life,
     and being unable to speak it makes life harder.
   - A passport card that explains how passport strength shapes your options.
   Saved data: S.lang, S.langDone, S.toefl, S.certs
   ===================================================================== */

const LANG_INFO = {
  german: {name:'German', flag:'🇩🇪', country:'deu', exams:[['B1','Goethe-Zertifikat B1',45,'Needed for many residence and citizenship routes'],['B2','Goethe-Zertifikat B2',60,'Often asked by employers and universities']]},
  dutch:  {name:'Dutch',  flag:'🇳🇱', country:'nld', exams:[['B1','Staatsexamen NT2 I (B1)',45,'Basic working level for integration'],['B2','Staatsexamen NT2 II (B2)',60,'Needed for many Dutch-taught jobs and studies']]}
};
const LANG_COURSES = [['Self-study (apps and videos)',0,3],['Online course',250,6],['Language institute',900,10],['Private tutor + speaking club',2200,14]];

/* Rough passport strength = how many countries you can enter without a pre-approved visa.
   Approximate and it changes every year; the lesson is the gap, not the exact number. */
const PASSPORTS = {
  egy:{n:'Egyptian',  v:50,  note:'Many countries want a visa, bank statements, insurance and proof that you will return.'},
  ind:{n:'Indian',    v:57,  note:'Visas are needed for most developed countries.'},
  nga:{n:'Nigerian',  v:46,  note:'Strict checks and high refusal rates for many destinations.'},
  bra:{n:'Brazilian', v:170, note:'Strong access to Europe for short stays.'},
  tur:{n:'Turkish',   v:110, note:'Schengen visas are still required.'},
  uae:{n:'Emirati',   v:180, note:'Very wide visa-free access.'},
  usa:{n:'US',        v:185, note:'Wide access, but several countries still require visas.'},
  gbr:{n:'British',   v:187, note:'Very wide access.'},
  can:{n:'Canadian',  v:185, note:'Very wide access.'},
  deu:{n:'German',    v:190, note:'One of the strongest passports in the world.'},
  nld:{n:'Dutch',     v:189, note:'One of the strongest passports in the world.'}
};

function langInit(o){
  if (!o) return;
  if (!o.lang || typeof o.lang!=='object') o.lang = {};
  if (!Number.isFinite(o.lang.german)) o.lang.german = 0;
  if (!Number.isFinite(o.lang.dutch)) o.lang.dutch = 0;
  if (!o.certs || typeof o.certs!=='object') o.certs = {};
  if (!Number.isFinite(o.toefl)) o.toefl = 0;
  if (!Number.isFinite(o.langDone)) o.langDone = -1;
}
function langLevelName(p){ return p>=80?'C1 (advanced)':p>=60?'B2 (upper-intermediate)':p>=45?'B1 (intermediate)':p>=30?'A2 (basic)':p>=15?'A1 (beginner)':'No language skill yet'; }

/* ---------- actions ---------- */
function takeLang(lang, i){
  langInit(S);
  const info = LANG_INFO[lang], c = LANG_COURSES[i]; if (!info || !c) return;
  if (S.age < 12) return hint('Language courses start at 12.');
  if (S.langDone === S.age) return hint('One language course per year. You can still study English in the section above.');
  const cost = svc(c[1]);
  if (S.wealth < cost) return hint('Not enough cash for this course.');
  S.wealth -= cost; S.langDone = S.age;
  S.lang[lang] = Math.min(100, S.lang[lang] + c[2]);
  fx({smarts:1});
  log(`${c[0]} (${info.name}): your ${info.name} is now about ${langLevelName(S.lang[lang])}.`);
  hint(); render();
}
function toeflEquivalent(score){ return score>=110?8:score>=102?7.5:score>=94?7:score>=79?6.5:score>=60?5.5:5; }
function takeToefl(){
  langInit(S);
  if (S.age < 16) return hint('You can take TOEFL from 16.');
  const fee = imp(250);
  if (S.wealth < fee) return hint('Not enough cash for the TOEFL fee.');
  S.wealth -= fee;
  S.toefl = Math.max(0, Math.min(120, Math.round(S.eng/100*120 + (Math.random()-.5)*14)));
  const eq = toeflEquivalent(S.toefl);
  if (eq > (S.ielts||0)) S.ielts = eq;
  log(`TOEFL iBT result: ${S.toefl}/120, accepted by universities as roughly IELTS band ${eq}.`);
  hint(); render();
}
function takeLangExam(lang, idx){
  langInit(S);
  const info = LANG_INFO[lang], ex = info && info.exams[idx]; if (!ex) return;
  const key = lang+ex[0];
  if (S.certs[key]) return hint('You already hold this certificate.');
  const fee = imp(180);
  if (S.wealth < fee) return hint('Not enough cash for the exam fee.');
  S.wealth -= fee;
  const pass = Math.random() < Math.max(.03, Math.min(.97, (S.lang[lang]-ex[2]+8)/16));
  if (pass){ S.certs[key] = true; fx({happiness:4}); log(`You passed the ${ex[1]} exam.`); }
  else { fx({happiness:-2}); log(`You did not pass the ${ex[1]} exam. The fee is not refunded. More study first.`); }
  hint(); render();
}

/* ---------- yearly effects ---------- */
function langYear(){
  if (!S || S.dead) return;
  langInit(S);
  const here = Object.keys(LANG_INFO).find(k=>LANG_INFO[k].country===S.country);
  if (!here) return;
  const info = LANG_INFO[here], before = S.lang[here];
  S.lang[here] = Math.min(100, before + 4);                 // daily life teaches you
  if (S.lang[here] < 30 && S.age >= 18){
    fx({happiness:-1});
    log(`Daily life in ${COUNTRIES[S.country].n} is harder without ${info.name}: paperwork, doctors and friendships all take extra effort.`);
  } else if (S.lang[here] >= 60){
    fx({happiness:1});
  }
}

/* ---------- screen ---------- */
function langCard(lang){
  const info = LANG_INFO[lang], lvl = S.lang[lang];
  const certs = info.exams.map((ex,i)=>{
    const have = S.certs[lang+ex[0]];
    return have ? ROW(ex[1],'Passed ✓') : B(`Take ${ex[1]}`, `${money(imp(180))} · ${ex[3]}`, `takeLangExam('${lang}',${i})`, S.wealth<imp(180));
  }).join('');
  return SEC(`${info.flag} ${info.name} · ${langLevelName(lvl)}`,
    bar(info.name,lvl,'var(--cyan)') +
    PR(`${info.name} matters if you want to live and work in ${COUNTRIES[info.country].n}. Even where English works at work, daily life, bureaucracy and many jobs need the local language. Living there also teaches you faster.`) +
    LANG_COURSES.map((c,i)=>B(c[0], `${svc(c[1])?money(svc(c[1])):'Free'} · +${c[2]} ${info.name}`, `takeLang('${lang}',${i})`, S.langDone===S.age||S.wealth<svc(c[1]))).join('') + certs);
}
function passportCard(){
  const home = PASSPORTS[S.home||S.country], abroad = PASSPORTS[S.country];
  if (!home) return '';
  const lines = [
    `<b>Why it matters:</b> ${home.note}`,
    `A visa application costs money, takes weeks, and is not refunded if it is refused. Officers look for proof that you will go home: a job, family, property or savings.`,
    `Studying or working abroad can lead to permanent residence, then citizenship. A stronger passport opens many more countries without a visa.`,
    `<b>Staying is also a real choice.</b> Home means family, a language you master, and no visa stress. The costs are lower pay in dollars and imported goods and housing that are hard to afford. Remote work, a local master’s degree or a career at home are all real paths.`
  ];
  return SEC('🛂 Your passport and your options',
    ROW(`${home.n} passport`, `~${home.v} destinations visa-free`) + bar('Access', Math.round(home.v/190*100), 'var(--cyan)') +
    (PASSPORTS.deu ? ROW('German passport (for comparison)', `~${PASSPORTS.deu.v}`) : '') +
    PR('Numbers are approximate and change every year.') + lines.map(PR).join(''));
}
function langRenderPanel(){
  const view = $('view'); if (!view || typeof activeTab==='undefined' || activeTab!=='school' || !S || S.age<12) return;
  langInit(S);
  ['lang-panel'].forEach(id=>{ const old=$(id); if (old) old.remove(); });
  const wrap = document.createElement('div'); wrap.id='lang-panel'; wrap.style.cssText='display:flex;flex-direction:column;gap:12px';
  let html = '';
  if (S.age >= 16) html += SEC('TOEFL iBT', PR(`An alternative to IELTS. Result: ${S.toefl?S.toefl+'/120':'not taken'}. Your English level (${S.eng}%) decides the score.`)+B('Take TOEFL iBT', money(imp(250)), 'takeToefl()', S.wealth<imp(250)));
  html += langCard('german') + langCard('dutch');
  if (S.age >= 16) html += passportCard();
  wrap.innerHTML = html;
  view.appendChild(wrap);
}

GameHooks.on('migrate', langInit);
GameHooks.on('newGame', langInit);
GameHooks.on('year', langYear);
GameHooks.on('render', langRenderPanel);
