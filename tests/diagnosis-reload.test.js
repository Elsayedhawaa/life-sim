import {MEDICAL_CONDITIONS} from '../src/data/institutions.js';
import {treatmentCostLocal} from '../src/systems/mortalityModel.js';
import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {buildDiagnosisScene,restoreDiagnosisScene} from '../src/systems/healthDirectorEngine.js';
const s=createNewLifeState({country:'egy',seed:7});ensureExtendedState(s);s.player.age=21;s.familyTier='wealthy';s.education.university={};s.money.cash=1e8;
s.medical.conditions=[{id:'arrhythmia',label:'Cardiac Arrhythmia',chronic:true,sinceYear:s.year,managed:false,treatmentStatus:'untreated',treatmentUsd2026:900}];
const q={conditionId:'arrhythmia',sinceYear:s.year,year:s.year,country:s.country},scene=buildDiagnosisScene(s,q);assert(scene);assert(scene.diagnosisSnapshot.costs.private>0);const saved=JSON.parse(JSON.stringify(scene)),r=restoreDiagnosisScene(s,saved);assert.deepEqual(r.choices.map(c=>c.label),scene.choices.map(c=>c.label));const cash=s.money.cash;r.choices[0].effect(s);assert.equal(s.money.cash,cash-scene.diagnosisSnapshot.costs.private);assert(s.medical.conditions[0].managed);const after=s.money.cash;r.choices[0].effect(s);assert.equal(s.money.cash,after);r.choices[2].effect(s);assert(s.medical.conditions[0].managed);
s.medical.diagnosisReplies={};s.medical.conditions[0].managed=false;s.medical.conditions[0].treatmentStatus='untreated';delete s.medical.conditions[0].lastTreatmentPeriod;s.money.cash=0;const low=restoreDiagnosisScene(s,saved);low.choices[0].effect(s);assert.equal(s.money.cash,0);assert(!s.medical.conditions[0].managed);low.choices[2].effect(s);assert(!s.medical.conditions[0].managed);s.medical.conditions=[];assert.equal(restoreDiagnosisScene(s,saved),null);
console.log('Diagnosis snapshot/actual price/no invented student cover/condition/once/reload pass');

const c=MEDICAL_CONDITIONS.find(c=>c.id==='arrhythmia');assert.equal(treatmentCostLocal(s,{id:c.id},'private'),treatmentCostLocal(s,c,'private'));s.medical.conditions=[{...c,sinceYear:s.year}];assert(restoreDiagnosisScene(s,{key:'med_onset_arrhythmia_'+s.year}));

s.medical.diagnosisReplies={};s.money.cash=1e8;s.medical.conditions=[{id:'heart_disease',label:'Heart Disease',sinceYear:s.year,managed:true,treatmentStatus:'partial',lastTreatmentPeriod:0}];const partial=buildDiagnosisScene(s,{conditionId:'heart_disease',sinceYear:s.year,year:s.year,country:s.country});assert(partial.choices[0].available(s));partial.choices[0].effect(s);assert.equal(s.medical.conditions[0].lastTreatmentPeriod,s.year*12+s.month);
