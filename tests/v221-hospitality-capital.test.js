import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{listAllBusinessVentures,ventureRepriced}from'../src/systems/businessEngine.js';
/* A 3-room spare-room letting is furnished with linen and beds, not built. Its start-up cost should sit next to a small cafe's, not four times above it (the US card read 152k USD against a cafe's 38k). */
for(const c of['usa','gbr','egy','deu']){const s=createNewLifeState({country:c,seed:5});ensureExtendedState(s);s.year=2026;s.player.age=30;const rows=listAllBusinessVentures(s),h=rows.find(x=>x.id==='enterprise_hospitality'),f=rows.find(x=>x.id==='enterprise_food');const ch=ventureRepriced(s,h).capitalLocal,cf=ventureRepriced(s,f).capitalLocal;assert.ok(ch>0&&ch<=cf*2,c+' guesthouse capital '+ch+' vs cafe '+cf);}
console.log('ok v221 hospitality capital');
