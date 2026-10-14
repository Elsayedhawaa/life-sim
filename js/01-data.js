/* =====================================================================
   1. GAME DATA TABLES
   ===================================================================== */
const FAMILY = ['Modest','Comfortable','Wealthy'];

const SCHOOLS = {
  national:      {name:'National school',      cost:0,    mult:1,   social:0, need:0, approve:0,  desc:'State-funded and free. Solid basics, large classes.'},
  private:       {name:'Private school',       cost:2500, mult:1.4, social:0, need:1, approve:40, desc:'Smaller classes and better results.'},
  international: {name:'International school', cost:9000, mult:1.7, social:1, need:2, approve:55, desc:'Top teaching and a global network.'}
};

const UNIS = {
  national: {name:'National university', tuition:500,   mult:1,   minOff:0,   desc:'Almost free, competitive admission.'},
  private:  {name:'Private university',  tuition:14000, mult:1.3, minOff:-10, desc:'Expensive. Parents, cash or a student loan.'}
};

const MAJORS = {
  medicine:{name:'Medicine',min:75,years:6}, law:{name:'Law',min:65,years:4}, cs:{name:'Computer Science',min:60,years:4},
  business:{name:'Business',min:50,years:4}, biology:{name:'Biology',min:55,years:4}
};

const PAYERS = {
  parents:{label:'Ask my parents',  desc:'They may agree or refuse, depending on their money and your bond. One request a year.'},
  self:   {label:'Pay myself',      desc:'Paid from your cash. Any shortfall becomes a student loan.'},
  loan:   {label:'Student loan',    desc:'Borrow the full tuition at 5% interest.'}
};
const LOAN_CAP = 60000;

const PART_JOBS = [
  {id:'baby',  title:'Babysitter',    pay:1200, stress:1, minAge:14, smarts:0},
  {id:'cafe',  title:'Cafe barista',  pay:3500, stress:3, minAge:16, smarts:0},
  {id:'tutor', title:'Private tutor', pay:4500, stress:2, minAge:16, smarts:65}
];

const EFFORT = {
  hard:  {label:'Study hard', smarts:4,  happiness:-3, social:-1},
  coast: {label:'Coast by',   smarts:1,  happiness:0,  social:0},
  skip:  {label:'Skip class', smarts:-3, happiness:4,  social:2}
};

/* --- Detailed Multi-Tiered Career Tracks --- */
const TRACKS = {
  entry: {
    name: 'General Service & Entry',
    levels: [
      {title:'Fast Food Crew', salary:14000, hrs:40, stress:2, reqSmarts:0, diploma:false},
      {title:'Retail Associate', salary:19000, hrs:40, stress:2, reqSmarts:0, diploma:true},
      {title:'Customer Support Rep', salary:26000, hrs:40, stress:3, reqSmarts:35, diploma:true},
      {title:'Shift Supervisor', salary:36000, hrs:45, stress:4, reqSmarts:45, diploma:true},
      {title:'Branch Operations Manager', salary:52000, hrs:50, stress:5, reqSmarts:55, diploma:true}
    ]
  },
  tech: {
    name: 'Technology & Software', degree:'cs',
    levels: [
      {title:'Junior Developer', salary:48000, hrs:40, stress:3, reqSmarts:50, diploma:true},
      {title:'Software Engineer', salary:72000, hrs:40, stress:4, reqSmarts:60, diploma:true},
      {title:'Senior Tech Lead', salary:105000, hrs:45, stress:5, reqSmarts:70, diploma:true},
      {title:'Engineering Manager', salary:145000, hrs:50, stress:6, reqSmarts:75, diploma:true},
      {title:'VP of Engineering / CTO', salary:210000, hrs:55, stress:8, reqSmarts:85, diploma:true}
    ]
  },
  finance: {
    name: 'Finance & Business', degree:'business',
    levels: [
      {title:'Junior Business Analyst', salary:42000, hrs:40, stress:3, reqSmarts:45, diploma:true},
      {title:'Financial Analyst', salary:64000, hrs:45, stress:4, reqSmarts:55, diploma:true},
      {title:'Senior Portfolio Manager', salary:98000, hrs:50, stress:5, reqSmarts:65, diploma:true},
      {title:'Director of Finance', salary:140000, hrs:55, stress:7, reqSmarts:75, diploma:true},
      {title:'Chief Financial Officer (CFO)', salary:225000, hrs:60, stress:9, reqSmarts:85, diploma:true}
    ]
  },
  law: {
    name: 'Legal Services', degree:'law',
    levels: [
      {title:'Junior Legal Associate', salary:55000, hrs:45, stress:4, reqSmarts:60, diploma:true},
      {title:'Staff Attorney', salary:82000, hrs:50, stress:5, reqSmarts:65, diploma:true},
      {title:'Senior Associate', salary:120000, hrs:55, stress:6, reqSmarts:72, diploma:true},
      {title:'Partner', salary:185000, hrs:60, stress:8, reqSmarts:80, diploma:true},
      {title:'Managing Senior Partner', salary:260000, hrs:65, stress:9, reqSmarts:88, diploma:true}
    ]
  },
  medical: {
    name: 'Healthcare & Medicine', degree:'medicine',
    levels: [
      {title:'Resident Doctor', salary:72000, hrs:60, stress:7, reqSmarts:70, diploma:true},
      {title:'Attending Physician', salary:125000, hrs:50, stress:6, reqSmarts:75, diploma:true},
      {title:'Specialist Surgeon', salary:190000, hrs:50, stress:7, reqSmarts:82, diploma:true},
      {title:'Department Head', salary:250000, hrs:55, stress:8, reqSmarts:88, diploma:true},
      {title:'Chief Medical Officer (CMO)', salary:340000, hrs:60, stress:9, reqSmarts:92, diploma:true}
    ]
  },
  bio: {
    name: 'Biotechnology & Science', degree:'biology',
    levels: [
      {title:'Lab Technician', salary:36000, hrs:40, stress:2, reqSmarts:50, diploma:true},
      {title:'Research Scientist', salary:58000, hrs:40, stress:3, reqSmarts:60, diploma:true},
      {title:'Senior Biochemist', salary:88000, hrs:45, stress:4, reqSmarts:70, diploma:true},
      {title:'R&D Director', salary:130000, hrs:50, stress:6, reqSmarts:80, diploma:true},
      {title:'Chief Scientist', salary:195000, hrs:50, stress:7, reqSmarts:88, diploma:true}
    ]
  }
};

/* --- Cost of Living (base values are 2026 dollars; the Era Pack scales them by year) --- */
const FOOD = {
  cheap:{name:'Cheap',    cost:2400, hp:-1, hap:0, desc:'Budget groceries and instant meals.'},
  mid:  {name:'Standard', cost:4200, hp:0,  hap:0, desc:'Balanced, everyday groceries.'},
  lux:  {name:'Luxury',   cost:7500, hp:1,  hap:2, desc:'Fresh, organic and dining out.'}
};
const TRANSPORT = {
  bus:{name:'Public transport', cost:600,  hap:0, desc:'Cheap, a bit slow.'},
  car:{name:'Own a car',        cost:3500, hap:1, desc:'Fuel, insurance and upkeep.'}
};
const PHONE = 600;
const INSURANCE = 1500;
const PAYROLL = 0.06;
const PROP_TAX = 0.01;
const RETIRE_MIN = 62, RETIRE_FORCED = 67;
const BRACKETS = [[12000,0],[40000,.10],[90000,.20],[Infinity,.30]];
const CHILD_COST = 3000;
const SAVE_KEY = 'lifeline_save_v4';   // old saves load as United States
const NAMES = ['Sam','Jordan','Taylor','Morgan','Casey','Riley','Jamie','Quinn','Avery','Dana','Noor','Layla','Omar','Youssef','Mona','Karim'];
const rnd = n => Math.floor(Math.random()*n);
const pick = a => a[rnd(a.length)];

/* Catalog of Available Properties (rent = per year, buy = price + yearly mortgage payment `pay`) */
const HOUSING_CATALOG = [
  {id:'room',   kind:'rent', name:'Shared Room (1 BR)',        cost:5000,  util:900,  hap:-1, hp:-1, desc:'Cheap, small shared space.'},
  {id:'studio', kind:'rent', name:'Studio Apartment (1 BR)',   cost:8000,  util:1500, hap:0,  hp:0,  desc:'Private compact studio.'},
  {id:'apt2',   kind:'rent', name:'2-Bedroom Apartment',       cost:13000, util:2200, hap:1,  hp:1,  desc:'Spacious urban apartment.'},
  {id:'condo',  kind:'buy',  name:'3-Bedroom Condo',           price:65000,  pay:4200, util:2500, rentInc:7200,  hap:2, hp:1, desc:'Modern condo with amenities.'},
  {id:'house',  kind:'buy',  name:'Suburban Family House',     price:120000, pay:7800, util:3800, rentInc:13000, hap:3, hp:1, desc:'Large backyard and garage.'},
  {id:'villa',  kind:'buy',  name:'Luxury Villa & Estate',     price:350000, pay:22000,util:8000, rentInc:38000, hap:5, hp:2, desc:'Gated luxury villa with pool.'}
];

/* --- Shopping data --- */
const PORTABLE = ['phone','laptop','tablet','fashion','watch'];   // these travel with you; everything else is installed in a home
const STORAGE = [[128,0],[256,100],[512,300],[1024,550]];
const PLANS = {inst:{years:3,rate:.15}, inst5:{years:5,rate:.30}}; // longer plan = more interest
const PROMOS = [
  {label:'Back-to-school tech sale',cats:['phone','laptop','tablet'],pct:.10},
  {label:'Black Friday week',cats:['all'],pct:.15},
  {label:'Home & living week',cats:['appliance','furn'],pct:.12},
  {label:'Fashion clearance',cats:['fashion','watch'],pct:.25},
  {label:'Phone trade-in event',cats:['phone'],pct:.08}
];
/* Gadgets are filled in by the Era Pack (section 7), which knows what existed in each year */
const STATIC = [];
/* Appliances: [type, label, base life, big?, health-type?, [[model, price, specs] x3 = basic, good, excellent]] */
const APPL = [
  ['kettle','Kettle',4,0,0,[["Russell Hobbs Classic 1.7L",30,"1.7L, 2200W, auto shut-off"],["Breville Smart Kettle",90,"1.7L, variable temperature, keep-warm"],["Smeg Retro Kettle",180,"1.7L, 7 temperature presets, design icon"]]],
  ['toaster','Toaster',5,0,0,[["Morphy Richards 2-slice",25,"2 slots, 6 browning levels"],["Breville Lift & Look 4-slice",80,"4 slots, lift-and-look"],["Smeg 4-slice Toaster",190,"4 slots, bagel and defrost modes"]]],
  ['microwave','Microwave',8,0,0,[["Panasonic NN-ST25 20L",90,"20L, 800W, 5 power levels"],["Samsung MS23 Grill 23L",160,"23L, ceramic enamel, grill"],["Bosch Series 6 Built-in 25L",420,"25L, 900W, touch control, sensor cooking"]]],
  ['oven','Oven',12,1,0,[["Beko Built-in Oven 65L",320,"65L, 6 functions"],["Bosch Series 4 Oven 71L",650,"71L, 3D hot air, EcoClean"],["Miele PureLine Oven",1600,"76L, pyrolytic self-cleaning, app control"]]],
  ['coffee','Coffee machine',6,0,0,[["Nescafe Dolce Gusto Mini Me",70,"Pod machine, 15 bar"],["De'Longhi Magnifica Evo",450,"Bean-to-cup, automatic milk frother"],["Jura E8",1500,"Bean-to-cup, 15 specialty drinks, app"]]],
  ['blender','Blender',5,0,0,[["NutriBullet 600",60,"600W personal blender"],["Vitamix E310",350,"2HP motor, 48oz container"],["Vitamix Ascent A3500",650,"Touchscreen, self-detect containers"]]],
  ['airfryer','Air fryer',5,0,0,[["Ninja AF101 4L",90,"4L, 1550W"],["Philips Airfryer 5000 XL",200,"6.2L, rapid air"],["Ninja Foodi Dual Zone 9.5L",270,"Two baskets, sync-finish"]]],
  ['fridge','Fridge-freezer',12,1,1,[["Beko 250L Fridge-Freezer",480,"250L, frost free"],["Samsung Bespoke 350L",1200,"350L, twin cooling"],["LG InstaView French Door 600L",2800,"600L, door-in-door, water dispenser"]]],
  ['dishwasher','Dishwasher',9,1,1,[["Beko 12-place Dishwasher",380,"12 place settings, 5 programmes"],["Bosch Series 4 13-place",650,"13 place settings, quiet 44dB"],["Miele G7000 14-place",1500,"14 place settings, AutoDos, cutlery tray"]]],
  ['washer','Washing machine',9,1,0,[["Beko 8kg Front Load",360,"8kg, 1400rpm"],["Bosch Series 8 Washing Machine",1100,"9kg, i-DOS, 1400rpm"],["Miele WWH860 9kg TwinDos",1900,"9kg, TwinDos, WiFi"]]],
  ['dryer','Dryer',9,1,0,[["Beko 8kg Condenser Dryer",420,"8kg, condenser"],["Samsung Heat Pump Smart Dryer",1250,"9kg, heat pump, SmartThings"],["Miele T1 Heat-pump 9kg",1800,"9kg, heat pump, honeycomb drum"]]],
  ['iron','Iron & steamer',6,0,0,[["Philips EasySpeed Iron",45,"2100W, steam"],["Tefal Ultimate Pure",130,"2800W, anti-scale"],["Rowenta Steam Station",280,"Pressurised steam station, 7.5 bar"]]],
  ['vacuum','Vacuum cleaner',6,0,0,[["Shark Rocket Corded",130,"Corded upright, anti-hair-wrap"],["Dyson V12 Detect Slim",550,"Cordless, laser dust detection"],["Dyson V15 Detect",750,"Cordless, piezo sensor, 60 min runtime"]]],
  ['robovac','Robot vacuum',5,0,0,[["Eufy RoboVac 11S",180,"Slim, 100 min runtime"],["Roborock S8 Robot Vacuum & Mop",850,"6000Pa suction, mopping"],["Roborock S8 MaxV Ultra",1600,"Auto-empty, self-wash dock, AI obstacle avoidance"]]],
  ['airpure','Air purifier',7,0,1,[["Levoit Core 300",100,"HEPA, rooms up to 40 sqm"],["Dyson Purifier Cool",450,"HEPA + carbon, fan, app"],["Blueair Pro XL",900,"HEPA, rooms up to 80 sqm"]]],
  ['water','Water filter',6,0,1,[["Brita Maxtra Jug",25,"Jug filter, 2.4L"],["Philips Under-sink Filter",140,"Under-sink, 3000L cartridge"],["Zip HydroTap",900,"Boiling, chilled and sparkling tap"]]]
];

/* Furnishing: category -> [label, [[name, price, happiness, health, smarts, value-added fraction] x options]] */
const FURN_RAW = {
  sofa:['Sofa & living room',[['Basic fabric sofa',350,1,0,0,0],['Leather sectional',1400,2,0,0,0],['Designer modular sofa set',4200,3,0,0,0]]],
  bed:['Bed & mattress',[['Standard mattress & frame',400,1,1,0,0],['Orthopedic queen bed',1100,1,2,0,0],['Luxury king bed (memory foam)',2800,2,3,0,0]]],
  ac:['Air conditioning',[['Window AC unit',450,1,0,0,.3],['Inverter split AC',1300,2,1,0,.5],['Smart multi-room AC system',3600,3,1,0,.6]]],
  floor:['Flooring',[['Vinyl planks',1500,0,0,0,.5],['Laminate',3000,1,0,0,.6],['Hardwood',7000,2,0,0,.8],['Italian marble',12000,3,0,0,.8]]],
  rug:['Rugs',[['Cotton rug',120,0,0,0,0],['Wool area rug',600,1,0,0,0],['Hand-knotted Persian rug',2400,2,0,0,0]]],
  curtains:['Curtains & blinds',[['Basic blinds',100,0,0,0,0],['Blackout curtains',420,1,1,0,0],['Motorized smart blinds',1500,2,0,0,0]]],
  light:['Lighting',[['LED bulbs & lamps',90,0,0,0,0],['Designer light fixtures',450,1,0,0,0],['Smart lighting system',1500,2,0,0,0]]],
  desk:['Desk & workspace',[['Simple desk & chair',220,0,0,1,0],['Ergonomic desk setup',800,0,1,1,0],['Executive standing desk set',1900,1,1,2,0]]],
  dining:['Dining set',[['Folding table & chairs',250,0,0,0,0],['Wooden 4-seat set',950,1,0,0,0],['Marble 8-seat set',3200,2,0,0,0]]],
  wardrobe:['Wardrobe & storage',[['Basic wardrobe',260,0,0,0,0],['Sliding-door wardrobe',900,1,0,0,0],['Walk-in closet system',2600,1,0,0,0]]]
};
const FURN = Object.fromEntries(Object.entries(FURN_RAW).map(([k,v])=>[k,{label:v[0],opts:v[1].map((o,i)=>({id:k+i,n:o[0],cost:o[1],hap:o[2],hp:o[3],sm:o[4],val:o[5]}))}]));

/* Property renovations: cost, condition gained, value added */
const RENOS = {repair:{n:'Repairs',cost:3000,cond:25,val:.08}, kitchen:{n:'Kitchen remodel',cost:8000,cond:10,val:.06}, bath:{n:'Bathroom remodel',cost:5000,cond:5,val:.04}};

const ACTIVITIES = [
  {label:'Hit the gym',      cost:120, fx:{health:6, happiness:1},   msg:'You spent the year getting fitter.'},
  {label:'Read a book',      cost:0,   fx:{smarts:3},                msg:'You lost yourself in a good book.'},
  {label:'Meet up with friends', cost:40, fx:{social:6, happiness:3}, msg:'You made time for friends.'},
  {label:'Volunteer',        cost:0,   fx:{social:3, happiness:4},   msg:'Helping out felt great.'}
];

const TONES = ['\u{1F3FB}','\u{1F3FD}','\u{1F3FF}'];
const FACES = {f:['👧','👩','👵'], m:['👦','👨','👴'], n:['🧒','🧑','🧓']};
const face = (g,t,age) => age<3 ? '👶'+TONES[t||0] : FACES[g||'n'][age<13?0:age<65?1:2] + TONES[t||0];

/* Random events. cost (number or function) is checked against your cash; a cost of 0 is always free. */
const EVENTS = [
  {id:'exam',min:6,max:18,title:'Big exam tomorrow',text:'A major exam is tomorrow and you are not ready.',choices:[
    {label:'Study all night',fx:{smarts:6,health:-3,happiness:-3},result:'You studied late and did well, but you were tired.'},
    {label:'Wing it',fx:{smarts:-1,happiness:2},result:'You slept well and scraped a pass.'},
    {label:'Copy a classmate',fx:()=>Math.random()<.5?{smarts:2,happiness:3,msg:'You got away with it.'}:{smarts:-3,happiness:-6,social:-3,msg:'You were caught cheating.'}}]},
  {id:'bully',min:7,max:17,title:'The bully',text:'An older kid keeps taking your lunch money.',choices:[
    {label:'Stand up to them',fx:{health:-6,happiness:4,social:2},result:'You took a bruise, but they backed off.'},
    {label:'Tell a teacher',fx:{happiness:2,social:1},result:'The teacher stepped in and it stopped.'},
    {label:'Keep quiet',fx:{happiness:-7,social:-2},result:'You stayed quiet and it kept happening.'}]},
  {id:'parent_plan',min:18,max:19,ok:()=>parents().length>0 && S.diploma && !S.uni && !S.degree,title:'Your parents have a plan',
    text:'Your parents would like you to study Law at a national university, and they offer to pay the tuition. You can also skip university and work with your high school diploma.',choices:[
    {label:'Accept their offer (Law, tuition paid)',fx:()=>{ S.uni={type:'national',major:'law',year:0,pay:'parents',scholar:false}; return {happiness:5,social:3,msg:'You enrolled in Law at a national university. Your parents pay the tuition.'}; }},
    {label:'No thanks, I will stick with my diploma',fx:()=>{ parents().forEach(m=>m.bond=clamp(m.bond-2)); return {happiness:2,msg:'You politely declined and kept your high school diploma. Careers are open in the Career tab.'}; }}]},
  {id:'medical',min:18,max:100,title:'Medical bill',
    text:()=>S.insured?'An unexpected illness leads to a bill. Your insurance covers most of it and you owe $180.':'An unexpected illness leads to a $900 medical bill. You have no health insurance.',choices:[
    {label:'Pay for treatment',cost:()=>S.insured?180:900,fx:()=>{ const c=S.insured?180:900; return {wealth:-c,health:3,msg:`You paid ${money(c)} and recovered.`}; }},
    {label:'Skip treatment',fx:{health:-10,happiness:-3},result:'You skipped treatment and it hit your health.'}]},
  {id:'date',min:18,max:45,ok:()=>!partner(),title:'Someone special',text:'You keep running into someone you like.',choices:[
    {label:'Ask them out',fx:()=>{ if(Math.random()<.6){ addMember('Partner',S.age+rnd(5)-2,60); return {happiness:8,social:4,msg:'You started dating.'}; } return {happiness:-4,msg:'They politely said no.'}; }},
    {label:'Stay friends',fx:{social:2},result:'You kept it casual.'}]},
  {id:'proposal',min:22,max:60,ok:()=>{const p=partner(); return p&&p.role==='Partner'&&p.bond>=70;},title:'Marriage',text:'Your relationship is strong. A wedding would cost $2,000.',choices:[
    {label:'Propose',cost:2000,fx:()=>{ partner().role='Spouse'; return {wealth:-2000,happiness:8,social:4,msg:'You got married. The wedding cost $2,000.'}; }},
    {label:'Not yet',fx:{},result:'You decided to wait.'}]},
  {id:'baby',min:22,max:42,ok:()=>{const p=partner(); return p&&p.role==='Spouse'&&kids().length<3;},title:'Starting a family',text:'You and your spouse talk about having a child. A child costs about $3,000 a year until 18.',choices:[
    {label:'Have a child',fx:()=>{ addMember('Child',0,85); return {happiness:8,health:-2,msg:'You welcomed a child.'}; }},
    {label:'Not now',fx:{},result:'You decided to wait.'}]}
];

