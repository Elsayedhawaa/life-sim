// Hyundai sells only the Ioniq 5 and Nexo in Japan (Reuters, 2022-02-08); a Verna or Accent is not a Japanese-market car.
import assert from 'node:assert/strict';
const {carSoldInCountry}=await import('../src/data/megaCarsAndShop.js');
assert.equal(carSoldInCountry({brand:'hyundai',name:'Hyundai Verna'},'jpn'),false);
assert.equal(carSoldInCountry({brand:'hyundai',name:'Hyundai Accent'},'jpn'),false);
assert.equal(carSoldInCountry({brand:'hyundai',name:'Hyundai Ioniq 5'},'jpn'),true);
assert.equal(carSoldInCountry({brand:'hyundai',name:'Hyundai Verna'},'egy'),true);
console.log('PASS v221-hyundai-japan');
