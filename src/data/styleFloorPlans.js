// Shared by drawing and furnishing lookup, so room identity cannot drift.
const room=(no,key,name,x,y,w,h)=>({no,key,name,x,y,w,h,m2:w*h/1200,flr:['bathroom','wc','kitchen'].includes(key)?'tile':'wood'});
const floor=(rooms,core=null,courtyard=null)=>({code:'A-101',title:'FICTIONAL STYLE PLAN',dimsMm:['schematic','schematic'],shell:{x:60,y:60,w:600,h:420},baysX:[],baysY:[],rooms,core,courtyard});
export const STYLE_FLOOR_PLANS={
 courtyard_single:[floor([
 room('101','foyer','Screened entrance',60,350,170,130),room('102','office','Guest reception',60,60,170,160),room('103','kitchen','Kitchen and pantry',490,350,170,130),room('104','living','Family living room',230,60,260,160),room('105','bedroom','Main bedroom',490,60,170,160),room('106','kids','Family bedroom',60,220,170,130),room('107','bathroom','Bathroom and washroom',490,220,170,130)
 ],null,{x:230,y:220,w:260,h:260})],
 courtyard_double:[floor([
 room('101','foyer','Screened entrance',60,350,170,130),room('102','office','Guest reception',60,60,170,160),room('103','kitchen','Separate kitchen',490,350,170,130),room('104','living','Family reception and dining',230,60,260,160),room('105','bathroom','Washroom and laundry',490,220,170,130),room('106','corridor','Stair hall',60,220,170,130),room('107','office','Family sitting room',490,60,170,160)
 ],{x:90,y:240,w:100,h:95},{x:230,y:220,w:260,h:260}),floor([
 room('201','bedroom','Main bedroom',230,60,260,160),room('202','kids','Family bedroom',60,60,170,160),room('203','office','Guest bedroom',490,60,170,160),room('204','bathroom','Family bathroom',490,220,170,130),room('205','corridor','Stair landing',60,220,170,130),room('206','corridor','Screened courtyard gallery',230,220,260,65)
 ],{x:90,y:240,w:100,h:95},{x:230,y:285,w:260,h:195})],
 modern_villa:[floor([
 room('101','foyer','Entrance',60,350,140,130),room('102','office','Guest reception',60,60,200,175),room('103','wc','Guest toilet',60,235,140,115),room('104','corridor','Stair hall',200,235,150,245),room('105','living','Family reception and dining',350,235,310,245),room('106','kitchen','Separate kitchen',260,60,240,175),room('107','bathroom','Laundry and washroom',500,60,160,175)
 ],{x:222,y:270,w:105,h:140}),floor([
 room('201','bedroom','Main bedroom',60,60,220,175),room('202','kids','Family bedroom',280,60,220,175),room('203','office','Guest bedroom',500,60,160,175),room('204','bathroom','Family bathroom',500,235,160,135),room('205','corridor','Upstairs landing',60,235,440,85),room('206','living','Family sitting room',280,320,220,160)
 ],{x:90,y:340,w:120,h:115})]
};

// US form families: floor counts and circulation differ, not just facade color.
STYLE_FLOOR_PLANS.bungalow=[floor([
 room('101','foyer','Porch entry',60,350,140,130),room('102','living','Living and dining room',60,60,300,290),room('103','kitchen','Rear kitchen',360,60,150,175),room('104','bathroom','Shared bathroom',510,60,150,175),room('105','corridor','Bedroom hall',360,235,300,65),room('106','bedroom','Main bedroom',200,350,160,130),room('107','kids','Second bedroom',360,300,300,180)
])];
STYLE_FLOOR_PLANS.ranch=[floor([
 room('101','foyer','Entry and mudroom',60,350,140,130),room('102','living','Open living and dining room',60,60,300,290),room('103','kitchen','Open kitchen',360,60,150,175),room('104','bathroom','Family bathroom',510,60,150,175),room('105','corridor','Bedroom wing hall',360,235,300,65),room('106','bedroom','Main bedroom',200,350,160,130),room('107','kids','Second bedroom',360,300,150,180),room('108','office','Third bedroom',510,300,150,180)
])];
const lower=(kind)=>floor([
 room('101','foyer',kind==='brownstone'?'Stoop entry vestibule':'Entrance hall',60,350,160,130),room('102','living',kind==='victorian'?'Front parlor':'Front sitting room',60,60,260,175),room('103','living','Dining room',320,60,190,175),room('104','kitchen','Rear kitchen',510,60,150,175),room('105','wc','Downstairs toilet',510,235,150,100),room('106','corridor','Stair hall',220,235,290,245),room('107','office','Study',60,235,160,115)
],{x:265,y:285,w:150,h:145});
const upper=(offset=200)=>floor([
 room(String(offset+1),'bedroom','Main bedroom',60,60,260,175),room(String(offset+2),'kids','Second bedroom',320,60,190,175),room(String(offset+3),'office','Third bedroom',510,60,150,175),room(String(offset+4),'bathroom','Family bathroom',510,235,150,145),room(String(offset+5),'corridor','Stair landing',60,235,450,100)
],{x:265,y:350,w:150,h:110});
STYLE_FLOOR_PLANS.colonial=[lower('colonial'),upper()];
STYLE_FLOOR_PLANS.victorian=[lower('victorian'),upper(),floor([
 room('301','office','Attic hobby room',60,60,300,175),room('302','bathroom','Attic washroom',360,60,150,175),room('303','corridor','Attic stair landing',60,235,450,100)
],{x:265,y:350,w:150,h:110})];
STYLE_FLOOR_PLANS.brownstone=[lower('brownstone'),upper(),floor([
 room('301','bedroom','Upper main bedroom',60,60,260,175),room('302','office','Upper study',320,60,190,175),room('303','bathroom','Upper bathroom',510,60,150,175),room('304','corridor','Upper stair landing',60,235,450,100)
],{x:265,y:350,w:150,h:110}),floor([
 room('401','living','Top-floor family room',60,60,300,175),room('402','office','Top-floor studio',360,60,300,175),room('403','corridor','Top stair landing',60,235,450,100)
],{x:265,y:350,w:150,h:110})];

STYLE_FLOOR_PLANS.chalet_one=[floor([
 room('101','living','Living and dining room',60,60,300,270),room('102','kitchen','Kitchenette',60,330,190,150),room('103','bedroom','Bedroom',360,60,300,270),room('104','bathroom','Bathroom',360,330,300,150),room('105','foyer','Entrance',250,330,110,150)
])];

STYLE_FLOOR_PLANS.family_duplex=[floor([
 room('101','foyer','Entrance hall',60,350,160,130),room('102','living','Reception and dining',60,60,310,290),room('103','kitchen','Separate kitchen',370,60,290,175),room('104','bathroom','Guest washroom',510,235,150,100),room('105','corridor','Internal stair hall',220,350,290,130),room('106','office','Study',370,235,140,115)
],{x:265,y:365,w:150,h:100}),upper()];

// Lower ground is physically below the raised entrance, not a fourth upper storey.
const brownstoneLevels=STYLE_FLOOR_PLANS.brownstone;
const lowerGround=brownstoneLevels[3];
lowerGround.rooms.forEach(r=>{r.name=r.name.replace('Top-floor','Lower-ground').replace('Top stair','Lower-ground stair');});
STYLE_FLOOR_PLANS.brownstone=[lowerGround,brownstoneLevels[0],brownstoneLevels[1],brownstoneLevels[2]];

// Three-storey attached family houses: two bedrooms on each sleeping floor.
const upperTwo=JSON.parse(JSON.stringify(upper()));
upperTwo.rooms=upperTwo.rooms.filter(r=>r.no!=='203');
upperTwo.rooms.find(r=>r.no==='202').w=340;
const topTwo=JSON.parse(JSON.stringify(upperTwo));
topTwo.rooms.forEach(r=>{r.no=String(Number(r.no)+100);r.name=r.name.replace('Main bedroom','Third bedroom').replace('Second bedroom','Fourth bedroom');});
STYLE_FLOOR_PLANS.terrace_three=[lower('terrace'),upperTwo,topTwo];
STYLE_FLOOR_PLANS.cottage_two=[floor([room('101','foyer','Entrance',60,350,160,130),room('102','living','Sitting and dining room',60,60,330,290),room('103','kitchen','Kitchen',390,60,270,230),room('104','wc','Downstairs toilet',510,290,150,190),room('105','corridor','Stair hall',220,350,290,130),room('106','office','Utility and storage',390,290,120,60)]),upperTwo];

// Japanese house families keep genkan, shared LDK and compact service spaces.
for(const [target,base] of [['jpn_family','family_duplex'],['jpn_single','bungalow'],['jpn_cottage','cottage_two'],['jpn_three','terrace_three']]){
 const levels=JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS[base]));
 for(const level of levels)for(const r of level.rooms){
  if(r.key==='foyer')r.name='Genkan entrance and shoe storage';
  if(r.key==='living')r.name=/Dining/.test(r.name)?'Dining and family space':'Living and dining room';
  if(r.key==='kitchen')r.name='Kitchen beside living and dining';
  if(r.key==='office'&&!/bedroom/i.test(r.name))r.name='Flexible room / storage';
  if(r.key==='bathroom')r.name='Bath and washroom';
  if(r.key==='wc')r.name='Separate toilet';
 }
 STYLE_FLOOR_PLANS[target]=levels;
}

// One raised living level; shaded open undercroft is not an extra indoor floor.
STYLE_FLOOR_PLANS.aus_highset=JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS.bungalow));
STYLE_FLOOR_PLANS.aus_highset[0].rooms.find(r=>r.key==='foyer').name='Veranda entry';

// Shared fictional courtyard families retain open courts and bedroom counts.
for(const [target,base] of [['ind_court_one','courtyard_single'],['ind_court_two','courtyard_double']]){
 const levels=JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS[base]));
 for(const level of levels)for(const r of level.rooms){
  if(r.key==='foyer')r.name='Courtyard entrance';
  if(r.name==='Screened courtyard gallery')r.name='Upper courtyard gallery';
  if(r.name==='Family reception and dining')r.name='Family living and dining';
 }
 STYLE_FLOOR_PLANS[target]=levels;
}

STYLE_FLOOR_PLANS.ita_court_two=JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS.courtyard_double));
for(const level of STYLE_FLOOR_PLANS.ita_court_two)for(const r of level.rooms){
 if(r.key==='foyer')r.name='Courtyard entrance';
 if(r.name==='Screened courtyard gallery')r.name='Upper courtyard gallery';
 if(r.name==='Family reception and dining')r.name='Family living and dining';
}

// Dutch pitched-roof homes include a smaller attic, not a full bedroom storey.
STYLE_FLOOR_PLANS.nld_attic=JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS.victorian));
STYLE_FLOOR_PLANS.nld_gable=JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS.terrace_three));
const nldAttic=JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS.victorian[2]));
for(const r of nldAttic.rooms)r.no=String(Number(r.no)+100);
STYLE_FLOOR_PLANS.nld_gable.push(nldAttic);

STYLE_FLOOR_PLANS.tur_court_two=JSON.parse(JSON.stringify(STYLE_FLOOR_PLANS.ita_court_two));
