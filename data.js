/* Lifeline static configuration, prices, world data, job definitions and event content. */
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
  },
  bpo: {
    name: 'BPO & English Call Center',
    levels: [
      {title:'Sutherland Junior Agent', salary:160000, hrs:40, stress:3, reqSmarts:25, diploma:true, eng:40},
      {title:'Vodafone UK Support Specialist', salary:228000, hrs:40, stress:3, reqSmarts:35, diploma:true, eng:55},
      {title:'Concentrix Senior Advisor', salary:312000, hrs:40, stress:4, reqSmarts:45, diploma:true, eng:65},
      {title:'Operations Team Leader', salary:450000, hrs:45, stress:5, reqSmarts:60, diploma:true, eng:75},
      {title:'BPO Operations Director', salary:720000, hrs:50, stress:7, reqSmarts:75, diploma:true, eng:85}
    ]
  },
};

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

const SAVE_KEY = 'lifeline_save_v4';

const NAMES = ['Sam','Jordan','Taylor','Morgan','Casey','Riley','Jamie','Quinn','Avery','Dana','Noor','Layla','Omar','Youssef','Mona','Karim'];

const HOUSING_CATALOG = [
  {id:'room',   kind:'rent', name:'Shared Room (1 BR)',        cost:5000,  util:900,  hap:-1, hp:-1, desc:'Cheap, small shared space.'},
  {id:'studio', kind:'rent', name:'Studio Apartment (1 BR)',   cost:8000,  util:1500, hap:0,  hp:0,  desc:'Private compact studio.'},
  {id:'apt2',   kind:'rent', name:'2-Bedroom Apartment',       cost:13000, util:2200, hap:1,  hp:1,  desc:'Spacious urban apartment.'},
  {id:'condo',  kind:'buy',  name:'3-Bedroom Condo',           price:65000,  pay:4200, util:2500, rentInc:7200,  hap:2, hp:1, desc:'Modern condo with amenities.'},
  {id:'house',  kind:'buy',  name:'Suburban Family House',     price:120000, pay:7800, util:3800, rentInc:13000, hap:3, hp:1, desc:'Large backyard and garage.'},
  {id:'villa',  kind:'buy',  name:'Luxury Villa & Estate',     price:350000, pay:22000,util:8000, rentInc:38000, hap:5, hp:2, desc:'Gated luxury villa with pool.'}
];

const PORTABLE = ['phone','laptop','tablet','fashion','watch'];

const STORAGE = [[128,0],[256,100],[512,300],[1024,550]];

const PLANS = {inst:{years:3,rate:.15}, inst5:{years:5,rate:.30}};

const PROMOS = [
  {label:'Back-to-school tech sale',cats:['phone','laptop','tablet'],pct:.10},
  {label:'Black Friday week',cats:['all'],pct:.15},
  {label:'Home & living week',cats:['appliance','furn'],pct:.12},
  {label:'Fashion clearance',cats:['fashion','watch'],pct:.25},
  {label:'Phone trade-in event',cats:['phone'],pct:.08}
];

const STATIC = [];

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

const RENOS = {repair:{n:'Repairs',cost:3000,cond:25,val:.08}, kitchen:{n:'Kitchen remodel',cost:8000,cond:10,val:.06}, bath:{n:'Bathroom remodel',cost:5000,cond:5,val:.04}};

const ACTIVITIES = [
  {label:'Hit the gym',      cost:120, fx:{health:6, happiness:1},   msg:'You spent the year getting fitter.'},
  {label:'Read a book',      cost:0,   fx:{smarts:3},                msg:'You lost yourself in a good book.'},
  {label:'Meet up with friends', cost:40, fx:{social:6, happiness:3}, msg:'You made time for friends.'},
  {label:'Volunteer',        cost:0,   fx:{social:3, happiness:4},   msg:'Helping out felt great.'}
];

const TONES = ['\u{1F3FB}','\u{1F3FD}','\u{1F3FF}'];

const FACES = {f:['👧','👩','👵'], m:['👦','👨','👴'], n:['🧒','🧑','🧓']};

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

const YD = {
  2007:[2.9,5.5,0,'normal',4.0,6.3,2.80],   2008:[3.8,-37,-9,'recession',3.0,6.0,3.27], 2009:[-0.4,26.5,-3,'recession',1.5,5.0,2.35],
  2010:[1.6,15.1,-3,'normal',.8,4.7,2.79],  2011:[3.2,2.1,-4,'normal',.6,4.5,3.53],    2012:[2.1,16,2,'normal',.5,3.7,3.64],
  2013:[1.5,32.4,11,'boom',.4,4.0,3.53],    2014:[1.6,13.7,5,'normal',.4,4.2,3.37],    2015:[0.1,1.4,5,'normal',.4,3.9,2.45],
  2016:[1.3,12,5,'normal',.5,3.7,2.14],     2017:[2.1,21.8,6,'boom',.9,4.0,2.42],      2018:[2.4,-4.4,5,'normal',1.4,4.5,2.72],
  2019:[1.8,31.5,3.5,'boom',1.8,3.9,2.60],  2020:[1.2,18.4,10,'recession',.5,3.1,2.17], 2021:[4.7,28.7,18,'boom',.1,3.0,3.01],
  2022:[8.0,-18.1,7,'normal',1.5,5.3,3.95], 2023:[4.1,26.3,5,'normal',4.0,6.8,3.52],   2024:[2.9,25,4,'boom',4.2,6.7,3.30],
  2025:[2.7,17,2,'normal',4.0,6.6,3.15],    2026:[2.7,8,1.5,'normal',3.8,6.3,3.30]
};

const Y0=2007, Y1=2026, CPI={2007:1}, HPI={2007:1};

const BASE_BR = BRACKETS.map(b=>b[0]);

const HIST = {2007:'Apple unveils the first iPhone.',2008:'The global financial crisis begins. Markets crash and many families struggle.',2009:'The recession deepens as unemployment climbs.',
  2010:'Apple launches the iPad.',2012:'Smartphones are now part of everyday life.',2013:'Streaming and social media boom.',2016:'Electric cars go mainstream as the Tesla Model 3 is announced.',
  2019:'Foldable phones reach the market.',2020:'COVID-19 sweeps the world. Lockdowns begin and stimulus cheques are sent out.',2021:'Prices start climbing as economies reopen.',
  2022:'Inflation hits a 40-year high and markets fall.',2023:'AI chatbots go mainstream.',2024:'AI features arrive on every new phone.',2025:'Electric cars and AI assistants are everywhere.'};

const FURN_FROM={light2:2013,curtains2:2014,ac2:2015};

const PH = [ // brand, name, year launched, launch price, happiness, social, life, specs, pro(starts at larger storage)
 ['apple','iPhone',2007,499,3,3,5,'3.5" multi-touch, 2MP camera, EDGE data',0],['apple','iPhone 3G',2008,599,3,3,5,'3G data, App Store, GPS',0],
 ['apple','iPhone 3GS',2009,599,3,3,5,'Faster chip, video recording, voice control',0],['apple','iPhone 4',2010,599,4,4,5,'Retina display, 5MP camera, FaceTime',0],
 ['apple','iPhone 4S',2011,649,4,4,5,'8MP camera, Siri, dual-core chip',0],['apple','iPhone 5',2012,649,4,4,5,'4" display, LTE, Lightning port',0],
 ['apple','iPhone 5s',2013,649,4,4,5,'Touch ID, 64-bit A7 chip',0],['apple','iPhone 5c',2013,549,3,3,5,'Colourful plastic body, 8MP camera',0],
 ['apple','iPhone 6',2014,649,4,4,6,'4.7" display, NFC, Apple Pay',0],['apple','iPhone 6 Plus',2014,749,4,4,6,'5.5" display, optical stabilisation',0],
 ['apple','iPhone 6s',2015,649,4,4,6,'3D Touch, 12MP camera, rose gold',0],['apple','iPhone SE',2016,399,2,2,5,'Compact 4" body, A9 chip, 12MP camera',0],
 ['apple','iPhone 7',2016,649,4,4,6,'Water resistant, no headphone jack',0],['apple','iPhone 7 Plus',2016,769,5,4,6,'Dual cameras, portrait mode',0],
 ['apple','iPhone 8',2017,699,4,4,6,'Glass back, wireless charging',0],['apple','iPhone X',2017,999,6,6,6,'Face ID, OLED, edge-to-edge screen',1],
 ['apple','iPhone XR',2018,749,4,4,6,'6.1" LCD, Face ID, many colours',0],['apple','iPhone XS',2018,999,5,5,6,'OLED, dual 12MP cameras',1],
 ['apple','iPhone XS Max',2018,1099,6,5,6,'6.5" OLED display',1],['apple','iPhone 11',2019,699,4,4,6,'Dual cameras, Night mode',0],
 ['apple','iPhone 11 Pro',2019,999,5,5,6,'Triple camera, OLED, 18h battery',1],['apple','iPhone 11 Pro Max',2019,1099,6,5,6,'6.5" OLED, triple camera',1],
 ['apple','iPhone SE (2nd gen)',2020,399,2,2,5,'A13 chip, Touch ID, compact',0],['apple','iPhone 12',2020,799,4,4,6,'5G, OLED, MagSafe',0],
 ['apple','iPhone 12 Pro',2020,999,5,5,6,'LiDAR scanner, ProRAW, stainless steel',1],['apple','iPhone 12 Pro Max',2020,1099,6,5,6,'6.7" OLED, biggest camera sensor yet',1],
 ['apple','iPhone 13',2021,799,4,4,6,'Cinematic mode, A15 chip',0],['apple','iPhone 13 Pro',2021,999,5,5,6,'120Hz ProMotion, macro photos',1],
 ['apple','iPhone 13 Pro Max',2021,1099,6,5,6,'6.7" ProMotion, 28h battery',1],['apple','iPhone SE (3rd gen)',2022,429,2,2,5,'A15 chip, 5G, Touch ID',0],
 ['apple','iPhone 14',2022,799,4,4,6,'Crash detection, satellite SOS',0],['apple','iPhone 14 Pro',2022,999,5,5,6,'Dynamic Island, 48MP camera',1],
 ['apple','iPhone 14 Pro Max',2022,1099,6,5,6,'6.7" always-on display',1],['apple','iPhone 15',2023,799,4,4,6,'USB-C, 48MP camera',0],
 ['apple','iPhone 15 Pro',2023,999,5,5,6,'Titanium body, Action button',1],['apple','iPhone 15 Pro Max',2023,1199,6,5,6,'5x telephoto zoom',1],
 ['apple','iPhone 16',2024,799,4,4,6,'Camera Control, Apple Intelligence',0],['apple','iPhone 16 Pro',2024,999,5,5,6,'Bigger display, 4K 120fps video',1],
 ['apple','iPhone 16 Pro Max',2024,1199,6,5,6,'6.9" display, 33h battery',1],['apple','iPhone 16e',2025,599,2,2,6,'Budget modern iPhone, A18 chip',0],
 ['apple','iPhone 17',2025,799,4,4,6,'6.3" 120Hz display, 48MP dual camera',0],['apple','iPhone 17 Air',2025,999,5,5,6,'Ultra-thin design',1],
 ['apple','iPhone 17 Pro',2025,1099,6,5,6,'Aluminium unibody, 48MP triple camera',1],['apple','iPhone 17 Pro Max',2025,1199,6,6,6,'6.9" display, longest battery life yet',1],
 ['apple','iPhone 18',2026,799,4,4,6,'6.1" OLED, 48MP dual camera, 22h battery',0],['apple','iPhone 18 Plus',2026,899,4,4,6,'6.7" OLED, 28h battery',0],
 ['apple','iPhone 18 Pro',2026,1099,6,5,6,'6.3" ProMotion OLED, 48MP triple + 5x zoom',1],['apple','iPhone 18 Pro Max',2026,1199,6,6,6,'6.9" ProMotion OLED, 33h battery',1],
 ['samsung','Samsung SGH-A707 slider',2007,99,1,1,5,'Slide-out keyboard, basic camera',0],['samsung','Samsung Omnia i900',2008,599,3,2,5,'Touchscreen, Windows Mobile, 5MP camera',0],
 ['samsung','Samsung Galaxy S',2010,529,3,3,5,'4" Super AMOLED, Android 2.1',0],['samsung','Samsung Galaxy S II',2011,549,4,3,5,'Dual-core, 8MP camera',0],
 ['samsung','Samsung Galaxy Note',2011,599,4,4,5,'5.3" screen with S Pen, the first phablet',0],['samsung','Samsung Galaxy S III',2012,650,4,4,5,'4.8" AMOLED, S Voice',0],
 ['samsung','Samsung Galaxy S4',2013,650,4,4,5,'5" full HD, 13MP camera',0],['samsung','Samsung Galaxy Note 3',2013,700,5,4,5,'5.7" display, S Pen',0],
 ['samsung','Samsung Galaxy S5',2014,660,4,4,5,'Water resistant, fingerprint scanner',0],['samsung','Samsung Galaxy S6',2015,680,4,4,5,'Glass and metal body, 16MP camera',0],
 ['samsung','Samsung Galaxy S7',2016,670,5,4,5,'Water resistant, microSD, 12MP camera',0],['samsung','Samsung Galaxy S8',2017,720,5,5,5,'Infinity display, edge to edge',0],
 ['samsung','Samsung Galaxy Note 8',2017,930,6,5,5,'6.3" Infinity display, dual cameras, S Pen',1],['samsung','Samsung Galaxy S9',2018,720,5,5,5,'Variable aperture camera, stereo speakers',0],
 ['samsung','Samsung Galaxy Note 9',2018,1000,6,5,5,'6.4" display, Bluetooth S Pen',1],['samsung','Samsung Galaxy A50',2019,349,2,2,5,'6.4" AMOLED, triple camera',0],
 ['samsung','Samsung Galaxy S10',2019,900,5,5,5,'In-screen fingerprint, triple camera',0],['samsung','Samsung Galaxy Fold',2019,1980,7,7,4,'The first foldable, 7.3" inner screen',1],
 ['samsung','Samsung Galaxy S20',2020,999,5,5,5,'5G, 120Hz display',0],['samsung','Samsung Galaxy S20 Ultra',2020,1399,6,5,5,'108MP camera, 100x zoom',1],
 ['samsung','Samsung Galaxy Z Flip',2020,1380,6,6,4,'Foldable clamshell design',1],['samsung','Samsung Galaxy S21',2021,799,5,5,5,'Flat 120Hz display, 64MP telephoto',0],
 ['samsung','Samsung Galaxy S21 Ultra',2021,1199,6,5,5,'108MP camera, S Pen support',1],['samsung','Samsung Galaxy Z Fold 3',2021,1799,7,7,5,'Water resistant foldable, S Pen',1],
 ['samsung','Samsung Galaxy S22',2022,799,5,5,5,'Bright 120Hz display, 50MP camera',0],['samsung','Samsung Galaxy S22 Ultra',2022,1199,6,6,5,'Built-in S Pen, 108MP camera',1],
 ['samsung','Samsung Galaxy Z Flip 4',2022,999,6,6,5,'Slimmer flip phone, bigger battery',1],['samsung','Samsung Galaxy A53',2022,449,2,2,5,'6.5" AMOLED, 64MP camera',0],
 ['samsung','Samsung Galaxy S23',2023,799,5,5,5,'Snapdragon 8 Gen 2, 50MP camera',0],['samsung','Samsung Galaxy S23 Ultra',2023,1199,6,6,5,'200MP camera, S Pen',1],
 ['samsung','Samsung Galaxy Z Fold 5',2023,1799,7,7,5,'Thinner hinge, tablet-size screen',1],['samsung','Samsung Galaxy S24',2024,799,5,5,5,'Galaxy AI, 6.2" 120Hz display',0],
 ['samsung','Samsung Galaxy S24 Ultra',2024,1299,6,6,5,'Titanium frame, Galaxy AI',1],['samsung','Samsung Galaxy Z Flip 6',2024,1099,6,6,5,'Bigger cover screen, AI features',1],
 ['samsung','Samsung Galaxy S25',2025,799,5,5,5,'6.2" AMOLED 120Hz, 50MP triple camera',0],['samsung','Samsung Galaxy S25 Ultra',2025,1299,6,6,5,'6.9" AMOLED, 200MP quad camera',1],
 ['samsung','Samsung Galaxy Z Fold 7',2025,1999,7,7,5,'8" inner display, only 8.9mm thick',1],['samsung','Samsung Galaxy A56',2025,449,2,2,5,'6.7" AMOLED, 50MP camera, 2-day battery',0],
 ['samsung','Samsung Galaxy S26',2026,799,5,5,5,'6.2" AMOLED 120Hz, 50MP triple camera, 24h battery',0],['samsung','Samsung Galaxy S26 Ultra',2026,1299,7,6,5,'6.9" AMOLED, 200MP quad camera, 32h battery',1],
 ['samsung','Samsung Galaxy Z Flip 8',2026,1099,6,6,5,'Foldable flip, 50MP camera',1],
 ['other','Basic feature phone',2007,60,0,0,6,'Calls, texts and a week-long battery',0],['other','Motorola RAZR V3',2007,150,2,2,5,'Iconic flip phone, VGA camera',0],
 ['other','Nokia N95',2007,700,3,3,5,'5MP camera, GPS, slide design',0],['other','BlackBerry Curve 8310',2007,350,2,3,5,'Full keyboard, email on the go',0],
 ['other','BlackBerry Bold 9000',2008,600,3,4,5,'Premium keyboard phone, 3G',0],['other','T-Mobile G1 (HTC Dream)',2008,400,3,2,5,'The first Android phone',0],
 ['other','Motorola Droid',2009,500,3,3,5,'Slide-out keyboard, Android 2.0',0],['other','Google Nexus One',2010,529,3,3,5,'Google-branded Android phone',0],
 ['other','Nokia Lumia 920',2012,600,3,3,5,'Windows Phone, PureView camera',0],['other','BlackBerry Z10',2013,600,2,2,5,'BlackBerry 10, touchscreen',0],
 ['other','Google Pixel',2016,649,4,3,5,'Best camera of its time, Google Assistant',0],['other','Google Pixel 3',2018,799,4,3,5,'Night Sight, 5.5" OLED',0],
 ['other','OnePlus 6',2018,529,3,3,5,'Flagship specs at a lower price',0],['other','Google Pixel 5',2020,699,3,3,5,'5G, compact, great software',0],
 ['other','Google Pixel 6',2021,599,4,3,5,'Tensor chip, new design',0],['other','Google Pixel 8',2023,699,4,4,5,'AI photo tools, 7 years of updates',0],
 ['other','Google Pixel 9',2024,799,4,4,5,'Gemini AI, 6.3" OLED',0],['other','Google Pixel 10',2025,799,4,4,5,'Tensor G5, 6.3" display',0],
 ['other','Google Pixel 11',2026,799,4,4,5,'6.3" OLED, 7 years of updates',0]
];

const NOMINAL_CATS=['laptop','tablet','tv','console'];

const APF={airfryer:[2011,2011,2011],vacuum:[2007,2016,2020],robovac:[2007,2015,2020],airpure:[2007,2015,2015],water:[2007,2007,2012],coffee:[2007,2010,2010],blender:[2007,2007,2017],dryer:[2007,2010,2010]};

const CARS=[ // id, make, model, class, price in 2026 dollars, mpg (or MPGe), happiness, social, life, from, until, hybrid from, electric
 ['rio','Kia','Rio','econ',17000,34,1,0,11,2007,2023,0,0],['versa','Nissan','Versa','econ',18000,32,1,0,10,2007,2025,0,0],['fit','Honda','Fit','econ',19500,35,1,1,12,2007,2020,0,0],
 ['corolla','Toyota','Corolla','compact',23000,33,2,1,13,2007,9999,2020,0],['civic','Honda','Civic','compact',25000,34,2,2,13,2007,9999,2007,0],
 ['focus','Ford','Focus','compact',21000,30,2,1,10,2007,2018,0,0],['elantra','Hyundai','Elantra','compact',22500,33,2,1,11,2007,9999,2017,0],
 ['prius','Toyota','Prius','compact',28000,52,2,2,13,2007,9999,2007,0],['leaf','Nissan','Leaf','compact',33000,112,2,2,10,2011,9999,0,1],
 ['bolt','Chevrolet','Bolt EV','compact',28000,120,3,2,11,2017,9999,0,1],['camry','Toyota','Camry','mid',29000,31,2,1,14,2007,9999,2007,0],
 ['accord','Honda','Accord','mid',30000,30,2,2,14,2007,9999,2014,0],['malibu','Chevrolet','Malibu','mid',25500,30,2,1,10,2007,2024,0,0],
 ['tesla3','Tesla','Model 3','mid',40000,130,5,5,12,2017,9999,0,1],['crv','Honda','CR-V','suv',32000,30,3,2,13,2007,9999,2020,0],
 ['rav4','Toyota','RAV4','suv',33000,30,3,2,14,2007,9999,2016,0],['explorer','Ford','Explorer','suv',40000,24,3,3,12,2007,9999,2020,0],
 ['tahoe','Chevrolet','Tahoe','suv',62000,18,4,4,13,2007,9999,0,0],['teslay','Tesla','Model Y','suv',45000,120,5,5,12,2020,9999,0,1],
 ['ioniq5','Hyundai','Ioniq 5','suv',42000,114,4,4,12,2022,9999,0,1],['f150','Ford','F-150','truck',42000,20,3,3,14,2007,9999,2021,0],
 ['silverado','Chevrolet','Silverado','truck',40000,20,3,3,14,2007,9999,0,0],['lightning','Ford','F-150 Lightning','truck',55000,70,4,4,12,2022,2025,0,1],
 ['bmw3','BMW','3 Series','lux',48000,28,5,5,12,2007,9999,0,0],['cclass','Mercedes-Benz','C-Class','lux',49000,27,5,5,12,2007,9999,0,0],
 ['a4','Audi','A4','lux',46000,28,4,4,12,2007,9999,0,0],['es','Lexus','ES','lux',44000,30,4,4,14,2007,9999,2013,0],
 ['taycan','Porsche','Taycan','lux',100000,85,8,8,13,2020,9999,0,1],['mustang','Ford','Mustang','sport',40000,23,5,5,12,2007,9999,0,0],
 ['corvette','Chevrolet','Corvette','sport',70000,21,6,7,14,2007,9999,0,0],['p911','Porsche','911','sport',120000,22,7,8,15,2007,9999,0,0],
 ['sclass','Mercedes-Benz','S-Class','exec',120000,22,7,8,14,2007,9999,0,0],['rr','Land Rover','Range Rover','exec',105000,18,7,8,13,2007,9999,0,0],
 ['teslas','Tesla','Model S','exec',90000,100,7,8,12,2012,9999,0,1],['lucid','Lucid','Air','exec',80000,140,8,8,12,2021,9999,0,1],
 ['ferrari','Ferrari','Roma / F8','exec',280000,15,9,10,15,2007,9999,0,0],['rolls','Rolls-Royce','Ghost','exec',350000,14,10,10,20,2010,9999,0,0]
];

const CLS={econ:'Economy',compact:'Compact',mid:'Mid-size',suv:'SUV',truck:'Pickup',lux:'Luxury',sport:'Sports',exec:'Executive'};

const CSERV={econ:450,compact:500,mid:600,suv:750,truck:800,lux:1400,sport:1500,exec:3000}, CREP={econ:700,compact:800,mid:900,suv:1100,truck:1200,lux:2500,sport:2800,exec:6000};

const TRIMS=[{n:'Base',m:1,hap:0,soc:0},{n:'Sport',m:1.16,hap:1,soc:1},{n:'Premium',m:1.34,hap:1,soc:2}];

const COLORS=[['White','#f4f4f4',0],['Black','#16161a',0],['Silver','#b9bcc4',0],['Gray','#6b6f7a',0],['Red','#c8202f',550],['Blue','#2457c5',550],['Green','#2f7d4f',550],['Orange','#e8731a',550],['Pearl White','#fbfaf3',900],['Matte Black','#2a2a2e',1800]];

const INTS=[['Cloth seats',0,0,0],['Leather seats',1800,1,0],['Premium leather / Alcantara',3800,2,1],['Sport leather, red stitching',2600,1,1]];

const INTC=['Black','Grey','Tan','Red'];

const OPTS=[ // id, label, price (2026 dollars), happiness, social, safety, from, until
 ['sun','Panoramic sunroof',1200,1,0,0,2007,9999],['audio','Premium audio system',1100,1,0,0,2007,9999],['nav','Built-in navigation',1200,1,0,0,2007,2016],
 ['carplay','Apple CarPlay / Android Auto',400,1,0,0,2014,9999],['cam','Backup camera',600,0,0,1,2008,9999],['adas','Adaptive cruise and lane assist',2200,1,0,2,2015,9999],
 ['heat','Heated seats and steering wheel',700,1,0,0,2007,9999],['remote','Remote start',450,1,0,0,2007,9999],['qi','Wireless phone charging',350,1,0,0,2017,9999],
 ['wheels','19-inch alloy wheels',1400,0,1,0,2007,9999],['winter','Winter package (AWD, snow tyres)',1600,0,0,1,2007,9999],['tow','Tow package',900,0,0,0,2007,9999]
];

const MODS=[ // id, label, price (2026 dollars), happiness, social, insurance increase
 ['tint','Window tint',350,0,1,0],['led','LED underglow and lights',600,0,1,0],['audio','Custom sound system',1800,1,1,0],['wheels','Sport wheels and tyres',2200,1,1,.05],
 ['tune','Performance tune (ECU)',1800,1,1,.15],['exh','Performance exhaust',1500,1,1,.08],['susp','Lowered sport suspension',2400,1,2,.1],['kit','Body kit and spoiler',3500,0,3,.1],
 ['lift','Lift kit and off-road tyres',3200,1,2,.05],['wrapr','Satin red vinyl wrap',3000,0,2,0],['wrapb','Chrome blue vinyl wrap',3000,0,2,0],['wrapk','Matte black vinyl wrap',3000,0,2,0]
];

const WRAP={wrapr:[4,'Satin red'],wrapb:[5,'Chrome blue'],wrapk:[9,'Matte black']};

const RENTALS={econ:['Economy car (Yaris-class)',5400,0,32],std:['Standard sedan',7800,1,29],suv:['SUV',10200,1,24],lux:['Luxury sedan',16800,2,24]};

const DEP=[1,.80,.71,.64,.58,.52,.47,.43,.39,.36,.33,.30,.28,.26,.24,.22];

const FUELN={g:'Gasoline',h:'Hybrid',e:'Electric'};

const ALLOW=[0,600,1800,3600];

const PETS={dog:{n:'Dog',adopt:400,keep:1400,hap:4,hp:1,soc:1,life:13},cat:{n:'Cat',adopt:150,keep:700,hap:3,hp:0,soc:0,life:16}};

const ECON={normal:'Stable',boom:'Boom',recession:'Recession'};

const COUNTRIES={
  egy:{n:'Egypt',f:'🇪🇬',cur:'EGP',sym:'E£',rate:50,p:.28,w:.10,h:.55,r:2,imp:.9,mr:.12,dev:.14,tier:3,eng:25,ssm:0,hist:y=>y<=2015?6.8:y===2016?10:y<=2021?16.5:y===2022?19:y===2023?31:y===2024?48:50,
    d:'Low wages, high living costs, a weak currency and mortgages near 17%. Owning a home is a dream; most people live with family for years.'},
  ind:{n:'India',f:'🇮🇳',cur:'INR',sym:'₹',rate:83,p:.30,w:.12,h:.45,r:1.6,imp:.9,mr:.04,dev:.04,tier:3,eng:55,ssm:0,d:'Huge job market, low wages, cheap local costs, expensive imports.'},
  nga:{n:'Nigeria',f:'🇳🇬',cur:'NGN',sym:'₦',rate:1500,p:.32,w:.07,h:.5,r:2,imp:1,mr:.15,dev:.15,tier:3,eng:70,ssm:0,d:'Very low wages, high inflation, a volatile currency.'},
  bra:{n:'Brazil',f:'🇧🇷',cur:'BRL',sym:'R$',rate:5.2,p:.5,w:.2,h:.5,r:1.3,imp:1,mr:.06,dev:.06,tier:2,eng:20,ssm:1,d:'Middle-income. Good cities, high interest rates and inequality.'},
  tur:{n:'Türkiye',f:'🇹🇷',cur:'TRY',sym:'₺',rate:38,p:.45,w:.18,h:.5,r:1.5,imp:1.1,mr:.12,dev:.12,tier:2,eng:20,ssm:0,d:'Middle-income with heavy inflation and a falling lira.'},
  usa:{n:'United States',f:'🇺🇸',cur:'USD',sym:'$',rate:1,p:1,w:1,h:1,r:1,imp:1,mr:0,dev:0,tier:1,eng:100,ssm:1,d:'High wages and high costs. The baseline of the game.',
    ms:{t:38000,y:2,i:6.5},v:.30,jh:.22,win:1,gc:1,nat:5},
  gbr:{n:'United Kingdom',f:'🇬🇧',cur:'GBP',sym:'£',rate:.79,p:1,w:.85,h:1.1,r:1.1,imp:1.1,mr:0,dev:0,tier:1,eng:100,ssm:1,d:'High costs, strong public services.',
    ms:{t:30000,y:1,i:6.5},v:.6,jh:.18,win:2,gc:0,nat:5},
  can:{n:'Canada',f:'🇨🇦',cur:'CAD',sym:'C$',rate:1.37,p:.95,w:.85,h:1,r:1,imp:1,mr:0,dev:0,tier:1,eng:100,ssm:1,d:'Welcoming to immigrants, expensive housing.',
    ms:{t:24000,y:2,i:6.5},v:.65,jh:.12,win:3,gc:0,nat:3},
  deu:{n:'Germany',f:'🇩🇪',cur:'EUR',sym:'€',rate:.92,p:.95,w:.9,h:.8,r:.9,imp:1,mr:0,dev:0,tier:1,eng:50,ssm:1,d:'Strong economy, almost free public universities.',
    ms:{t:1500,y:2,i:6.0},v:.7,jh:.12,win:2,gc:0,nat:6}
};

const MS_KEYS=['usa','gbr','can','deu'];

const ENG=[['Self-study (apps and videos)',0,2],['Online course',250,5],['Language institute',900,9],['Intensive course + speaking club',2200,14]];

const REMOTE=[
  {id:'cold',t:'Cold caller for a US company',eng:40,usd:7000,deg:null,st:3},
  {id:'supp',t:'Remote customer support (US)',eng:55,usd:11000,deg:null,st:3},
  {id:'dev', t:'Remote / freelance developer',eng:60,usd:24000,deg:'cs',st:4},
  {id:'ana', t:'Remote analyst / account manager',eng:72,usd:32000,deg:'any',st:4}];

const TRACK_OF={cs:'tech',business:'finance',biology:'bio',law:'entry',medicine:'entry'};

const HARD=[['Visa processing delay: the paperwork sat for months',0,-3],['Request for evidence from the immigration office',300,-2],['Immigration lawyer fees',1200,-1],['Embassy appointment backlog, you could not visit family',0,-4],['Fingerprint and medical exam fees',450,0],['An interview left you anxious for weeks',0,-3]];

const TRAITS=['Kind','Ambitious','Funny','Artistic','Adventurous','Bookish','Calm','Romantic'];

const LIKES=[['jewelry','jewelry'],['fashion','fashion'],['tech','gadgets'],['sweets','flowers and sweets'],['trips','experiences']];

const HANG=[['Walk in the park',0,5],['Coffee date',15,7],['Cinema',25,8],['Dinner at a restaurant',70,10],['Day trip / amusement park',130,12],['Fine dining',250,15],['Weekend getaway',750,20]];

const GIFT=[['Flowers',20,'sweets',4,0],['Chocolates and cake',18,'sweets',4,0],['Perfume / cologne',120,'fashion',8,1],['Clothes shopping trip',300,'fashion',9,0],['Designer outfit',1100,'fashion',13,1],['Phone or tablet',700,'tech',11,1],['Watch',1800,'jewelry',14,1],['Jewelry',3000,'jewelry',17,1],['Designer bag',4200,'fashion',19,1],['Luxury shopping spree',9000,'fashion',25,1]];

const RINGS=[['Simple band',300,0],['Classic solitaire',1500,1],['Designer diamond ring',6000,2],['Luxury heirloom diamond',22000,3]];

const SHABKA=['Shabka (gold set, Egyptian tradition)',2800,1.5];

const WED={
  venue:['Venue',['Family home or garden',400],['Community banquet hall',3500],['Hotel ballroom',12000],['Luxury palace / 5-star resort',45000]],
  dress:['Wedding dress',['Rent a dress',250],['Off-the-rack gown',1200],['Designer gown',6000],['Couture gown',20000]],
  suit:['Wedding suit',['Rent a suit',150],['Tailored suit',800],['Designer tuxedo',3000],['Bespoke luxury tuxedo',9000]],
  food:['Catering, per guest',['Simple buffet',12],['Full dinner',35],['Premium dinner',80],['Gourmet and open bar',200]],
  guests:['Guest list',['30 close guests',30],['80 guests',80],['150 guests',150],['300 guests',300]],
  photo:['Photo and video',['None',0],['Photographer',600],['Photo and video team',3000],['Cinematic crew',9000]],
  music:['Music',['None',0],['Playlist and speakers',150],['Live band or DJ',2500],['Orchestra and stars',9000]],
  decor:['Flowers and decor',['None',0],['Simple flowers',400],['Full decor',3000],['Luxury floral design',12000]],
  honey:['Honeymoon',['None',0],['Staycation',300],['Beach trip',3000],['Luxury world trip',15000]]
};

const EGY_SHOCK={2016:.6,2022:.82,2023:.72,2024:.78};

const REAL_WAGE_INDEX_EGY={2007:.07,2008:.075,2009:.08,2010:.085,2011:.09,2012:.095,2013:.10,2014:.11,2015:.12,2016:.17,2017:.18,2018:.22,2019:.25,2020:.26,2021:.29,2022:.34,2023:.43,2024:.78,2025:.90,2026:1};

const EGY_SCHOOL_LOCAL={private:75000,international:280000};

const EGY_UNI_LOCAL={national:8000,private:200000};

const EGY_SALARY_2026={
 entry:[84000,108000,144000,216000,360000],
 tech:[144000,240000,420000,720000,1200000],
 finance:[108000,180000,300000,540000,900000],
 law:[84000,132000,240000,480000,840000],
 medical:[84000,180000,360000,600000,1000000],
 bio:[84000,144000,240000,420000,720000],
  bpo:[160000,228000,312000,450000,720000]
};

const BASE_US_SALARIES={entry:[14000,19000,26000,36000,52000],bpo:[16000,22000,31000,45000,72000],tech:[48000,72000,105000,145000,210000],finance:[42000,64000,98000,140000,225000],law:[55000,82000,120000,185000,260000],medical:[72000,125000,190000,250000,340000],bio:[36000,58000,88000,130000,195000]};

const CAREER_TITLES={
 entry:['Entry-level service worker','Retail / operations associate','Customer support specialist','Shift supervisor','Operations manager'],
 tech:['Junior developer / IT analyst','Software engineer','Senior engineer / tech lead','Engineering manager','Technology director / CTO'],
 finance:['Junior accountant / finance assistant','Accountant / financial analyst','Senior accountant / finance manager','Finance director','Chief financial officer'],
 law:['Junior legal assistant','Legal associate','Senior legal associate','Legal partner / team lead','Managing partner'],
 medical:['Junior clinical role / resident','Experienced clinician','Specialist clinician','Department head','Chief medical officer'],
 bio:['Laboratory technician','Research analyst','Senior scientist','R&D manager','Chief scientist']
};

const REAL_NAMES={
 egy:{f:['Mariam','Salma','Nour','Farida','Malak','Aya','Yasmin','Habiba','Nadine','Hana'],m:['Omar','Youssef','Ahmed','Karim','Mostafa','Mina','Ziad','Adam','Ali','Hassan'],n:['Nour','Malak','Mariam','Omar','Youssef','Ali']},
 ind:{f:['Aarushi','Priya','Ananya','Isha','Meera','Kavya'],m:['Aarav','Arjun','Rohan','Kabir','Aditya','Vikram'],n:['Ari','Kiran','Aadi']},nga:{f:['Adaeze','Amara','Chiamaka','Zainab','Ngozi'],m:['Chinedu','Tunde','Emeka','Ibrahim','Kelechi'],n:['Amari','Zuri']},bra:{f:['Ana','Beatriz','Camila','Mariana','Sofia'],m:['Gabriel','Lucas','Rafael','Pedro','Mateus'],n:['Alex','Dani']},tur:{f:['Zeynep','Elif','Defne','Ece','Aylin'],m:['Emre','Kerem','Mehmet','Arda','Can'],n:['Deniz','Eren']},usa:{f:['Olivia','Emma','Ava','Sophia','Mia'],m:['Liam','Noah','Oliver','James','Ethan'],n:['Alex','Riley','Jordan']},gbr:{f:['Olivia','Amelia','Isla','Emily','Freya'],m:['Oliver','George','Harry','Arthur','Oscar'],n:['Alex','Riley','Jamie']},can:{f:['Olivia','Charlotte','Amelia','Ava','Maya'],m:['Noah','Liam','Lucas','Benjamin','Ethan'],n:['Alex','Riley','Jordan']},deu:{f:['Mia','Emilia','Hannah','Lena','Lea'],m:['Noah','Leon','Paul','Lukas','Finn'],n:['Alex','Robin','Kim']},uae:{f:['Mariam','Aisha','Noora','Fatima','Lina'],m:['Omar','Rashid','Ahmed','Khalid','Zayed'],n:['Noor','Rayan']},sau:{f:['Noura','Layan','Hala','Sara','Reem'],m:['Fahad','Omar','Abdullah','Saud','Khalid'],n:['Noor','Rayan']},pak:{f:['Ayesha','Fatima','Sana','Zara','Hira'],m:['Ahmed','Ali','Hamza','Bilal','Usman'],n:['Noor','Ari']},aus:{f:['Charlotte','Olivia','Isla','Matilda','Ruby'],m:['Oliver','Noah','Jack','Henry','Leo'],n:['Alex','Charlie']},fra:{f:['Emma','Jade','Louise','Camille','Chloé'],m:['Gabriel','Louis','Raphaël','Jules','Lucas'],n:['Camille','Alex']},ita:{f:['Giulia','Sofia','Aurora','Chiara','Alice'],m:['Leonardo','Francesco','Lorenzo','Alessandro','Mattia'],n:['Andrea','Alex']},nld:{f:['Emma','Julia','Tess','Sophie','Mila'],m:['Noah','Daan','Sem','Lucas','Levi'],n:['Alex','Robin']},jpn:{f:['Yui','Hina','Sakura','Aoi','Mei'],m:['Haruto','Sota','Ren','Yuto','Minato'],n:['Aoi','Haru']},kor:{f:['Seo-yeon','Ji-woo','Ha-eun','Min-seo','Soo-jin'],m:['Min-jun','Seo-jun','Do-yun','Ji-ho','Hyun-woo'],n:['Ji-woo','Jin']},sgp:{f:['Aisha','Mei Lin','Alicia','Chloe','Jia Yi'],m:['Ryan','Ethan','Wei Ming','Daniel','Arjun'],n:['Ari','Kai']},nzl:{f:['Isla','Charlotte','Amelia','Harper','Mila'],m:['Oliver','Noah','Leo','Jack','Lachlan'],n:['Alex','Riley']}
};

const MASTER_FIELDS=[
  {id:'finance',name:'MSc Accounting & Finance',related:['business'],years:2,baseUsd:18000},
  {id:'mba',name:'MBA / Management',related:['business'],years:2,baseUsd:24000},
  {id:'analytics',name:'MSc Data Analytics / Business Intelligence',related:['business','cs'],years:2,baseUsd:20000},
  {id:'cs',name:'MSc Computer Science',related:['cs'],years:2,baseUsd:22000},
  {id:'law',name:'LLM / Master of Laws',related:['law'],years:1,baseUsd:18000},
  {id:'health',name:'Master of Public Health',related:['medicine','biology'],years:2,baseUsd:20000}
];

const EGY_MASTERS_LOCAL={finance:{public:25000,private:85000},mba:{public:70000,private:180000},analytics:{public:35000,private:105000},cs:{public:40000,private:125000},law:{public:25000,private:90000},health:{public:35000,private:110000}};

const DEST_LANG={usa:65,gbr:65,can:65,deu:45,aus:65,nzl:65,fra:45,nld:60,uae:40,sau:35,sgp:65,jpn:35,kor:35,ita:35,ind:30,bra:25,tur:25,pak:35,nga:40};

const P12_ROLE_PROFILES = [
  {id:'arap',trackId:'finance',roleTitle:'Accounts Receivable / Payable Accountant',titles:['Accounts Assistant','AR/AP Accountant','Senior AR/AP Accountant','Receivables Manager','Finance Operations Lead'],degree:'business',smarts:36,eng:25,minExp:0,factor:.84,medical:false,social:true,bonus:.01,leave:14,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent or 1-year contract',desc:'Customer balances, invoices, payment allocation, reconciliation and overdue follow-up.'},
  {id:'audit',trackId:'finance',roleTitle:'Audit Associate',titles:['Audit Trainee','Audit Associate','Senior Auditor','Audit Manager','Audit Partner'],degree:'business',smarts:48,eng:38,minExp:0,factor:.94,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid in busy season',hours:48,stress:6,contract:'Permanent; busy-season overtime',desc:'Audit testing, workpapers, client evidence and month-end / year-end deadlines.'},
  {id:'financial',trackId:'finance',roleTitle:'Financial Analyst',titles:['Junior Financial Analyst','Financial Analyst','Senior Financial Analyst','Finance Manager','Finance Director'],degree:'business',smarts:55,eng:45,minExp:1,factor:1.12,medical:true,social:true,bonus:.08,leave:21,remote:'Hybrid',hours:43,stress:5,contract:'Permanent',desc:'Budgeting, variance analysis, forecasts and management reporting.'},
  {id:'data',trackId:'tech',roleTitle:'Data / BI Analyst',titles:['Junior Data Analyst','Data Analyst','Senior BI Analyst','Analytics Manager','Head of Analytics'],degree:null,smarts:56,eng:48,minExp:1,factor:1.12,medical:true,social:true,bonus:.06,leave:21,remote:'Hybrid; remote by team',hours:40,stress:4,contract:'Permanent',desc:'Clean data, build reports, explain trends and work with stakeholders.'},
  {id:'accounting',trackId:'finance',roleTitle:'Junior Accountant',titles:['Junior Accountant','Accountant','Senior Accountant','Accounting Manager','Financial Controller'],degree:'business',smarts:34,eng:20,minExp:0,factor:.87,medical:false,social:true,bonus:.02,leave:14,remote:'On-site',hours:42,stress:4,contract:'Permanent',desc:'General ledger, invoices, journal entries, reconciliations and closing.'},
  {id:'bankops',trackId:'finance',roleTitle:'Banking Operations Officer',titles:['Operations Assistant','Banking Operations Officer','Senior Operations Officer','Operations Manager','Branch Operations Head'],degree:'business',smarts:42,eng:35,minExp:0,factor:1.02,medical:true,social:true,bonus:.07,leave:21,remote:'On-site / hybrid',hours:40,stress:4,contract:'Permanent',desc:'Account servicing, documentation, transaction controls and operational risk.'},
  {id:'customer',trackId:'entry',roleTitle:'Customer Support Specialist',titles:['Support Representative','Customer Support Specialist','Senior Support Specialist','Team Supervisor','Operations Manager'],degree:null,smarts:30,eng:40,minExp:0,factor:.83,medical:false,social:true,bonus:.03,leave:14,remote:'On-site or remote, depending on employer',hours:45,stress:6,contract:'Permanent or outsourced contract',desc:'Chat, email or voice support; targets and shifts vary. Non-voice roles are not guaranteed.'},
  {id:'hr',trackId:'entry',roleTitle:'HR / Administration Coordinator',titles:['HR Assistant','HR Coordinator','Senior HR Coordinator','HR Manager','People Operations Director'],degree:null,smarts:38,eng:35,minExp:0,factor:.88,medical:false,social:true,bonus:.02,leave:14,remote:'Mostly on-site',hours:40,stress:3,contract:'Permanent',desc:'Employee records, onboarding, attendance, recruitment scheduling and office operations.'},
  {id:'supply',trackId:'entry',roleTitle:'Supply Chain / Logistics Officer',titles:['Logistics Assistant','Supply Chain Officer','Senior Planner','Logistics Manager','Supply Chain Director'],degree:null,smarts:40,eng:30,minExp:0,factor:.94,medical:true,social:true,bonus:.04,leave:18,remote:'On-site / hybrid',hours:45,stress:5,contract:'Permanent',desc:'Purchase orders, deliveries, inventory, suppliers and shipment exceptions.'},
  {id:'sales',trackId:'entry',roleTitle:'Sales Executive',titles:['Sales Representative','Sales Executive','Senior Account Executive','Sales Manager','Commercial Director'],degree:null,smarts:32,eng:25,minExp:0,factor:.82,medical:false,social:true,bonus:.12,leave:14,remote:'Field / hybrid',hours:45,stress:6,contract:'Base salary plus variable commission',desc:'Customer accounts, targets, negotiations and commissions that are not guaranteed.'},
  {id:'developer',trackId:'tech',roleTitle:'Software Developer',titles:['Junior Developer','Software Developer','Senior Engineer','Engineering Manager','Technology Director'],degree:'cs',smarts:58,eng:50,minExp:0,factor:1.10,medical:true,social:true,bonus:.08,leave:24,remote:'Hybrid / remote by team',hours:40,stress:5,contract:'Permanent',desc:'Software development, testing, code review and delivery.'},
  {id:'productops',trackId:'tech',roleTitle:'Product Operations Analyst',titles:['Product Operations Assistant','Product Operations Analyst','Senior Product Analyst','Product Operations Manager','Head of Product Operations'],degree:null,smarts:54,eng:50,minExp:1,factor:1.04,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Product metrics, issue triage, customer insight and coordination with product teams.'},
  {id:'marketing',trackId:'entry',roleTitle:'Marketing Coordinator',titles:['Marketing Assistant','Marketing Coordinator','Marketing Specialist','Marketing Manager','Marketing Director'],degree:null,smarts:38,eng:40,minExp:0,factor:.90,medical:false,social:true,bonus:.03,leave:14,remote:'Hybrid',hours:40,stress:4,contract:'Permanent or agency contract',desc:'Campaign operations, content calendars, reporting and coordination.'},
  {id:'compliance',trackId:'law',roleTitle:'Compliance / Legal Associate',titles:['Compliance Assistant','Compliance Associate','Senior Compliance Officer','Compliance Manager','Head of Compliance'],degree:'law',smarts:56,eng:42,minExp:0,factor:1.06,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid by employer',hours:43,stress:5,contract:'Permanent',desc:'Policy controls, regulatory documentation, due diligence and legal support.'},
  {id:'medicaladmin',trackId:'entry',roleTitle:'Clinic Administration Officer',titles:['Clinic Assistant','Medical Admin Officer','Senior Clinic Coordinator','Clinic Operations Manager','Regional Operations Lead'],degree:null,smarts:36,eng:25,minExp:0,factor:.86,medical:true,social:true,bonus:.02,leave:18,remote:'On-site',hours:44,stress:5,contract:'Permanent / shift-based',desc:'Appointments, billing coordination, insurance paperwork and clinic workflow.'},
  {id:'lab',trackId:'bio',roleTitle:'Laboratory Technician',titles:['Lab Assistant','Laboratory Technician','Senior Lab Technician','Lab Manager','Research Operations Director'],degree:'biology',smarts:50,eng:35,minExp:0,factor:.92,medical:true,social:true,bonus:.03,leave:21,remote:'On-site',hours:40,stress:4,contract:'Permanent or research grant',desc:'Sample handling, safety records, tests and laboratory quality procedures.'},
  {id:'clinical',trackId:'medical',roleTitle:'Clinical / Healthcare Professional',titles:['Junior Clinical Role','Qualified Clinician','Senior Specialist','Department Lead','Clinical Director'],degree:'medicine',smarts:68,eng:35,minExp:0,factor:1.00,medical:true,social:true,bonus:.04,leave:21,remote:'On-site',hours:48,stress:8,contract:'Hospital or clinic contract',desc:'Patient care with licensing, training and local qualification requirements.'},
  {id:'auditdata',trackId:'finance',roleTitle:'Finance Data / Reporting Officer',titles:['Reporting Assistant','Finance Reporting Analyst','Senior Reporting Analyst','Reporting Manager','Head of Reporting'],degree:'business',smarts:50,eng:40,minExp:1,factor:1.02,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:42,stress:4,contract:'Permanent',desc:'Excel / BI reporting, reconciliations, finance data quality and recurring dashboards.'},
  {id:'procurement',trackId:'entry',roleTitle:'Procurement Officer',titles:['Procurement Assistant','Procurement Officer','Senior Buyer','Procurement Manager','Head of Procurement'],degree:null,smarts:40,eng:32,minExp:0,factor:.93,medical:true,social:true,bonus:.03,leave:18,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent',desc:'Supplier quotations, purchase approvals, stock availability and price negotiations.'},
  {id:'sutherland_agent',trackId:'bpo',roleTitle:'Customer Support Rep (Sutherland)',titles:['Junior Agent','Customer Support Rep','Senior Account Specialist','Team Leader','Account Manager'],degree:null,smarts:25,eng:40,minExp:0,factor:1.15,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:40,stress:3,contract:'Permanent BPO Contract',desc:'Handle customer support and account inquiries for international accounts in English with Sutherland.'},
  {id:'vodafone_uk_spec',trackId:'bpo',roleTitle:'Vodafone UK Billing Specialist',titles:['Support Specialist','Billing Advisor','Tier-2 Escalations Lead','Operations Lead','Account Manager'],degree:null,smarts:35,eng:55,minExp:0,factor:1.45,medical:true,social:true,bonus:.08,leave:21,remote:'On-site / Door-to-door transport',hours:40,stress:3,contract:'Permanent UK Account',desc:'Provide English technical and billing assistance for UK mobile and broadband customers.'},
  {id:'concentrix_sr_adv',trackId:'bpo',roleTitle:'Senior Advisor (Concentrix)',titles:['Technical Advisor','Senior Technical Advisor','Subject Matter Expert','Team Leader','Operations Manager'],degree:null,smarts:45,eng:65,minExp:1,factor:1.85,medical:true,social:true,bonus:.10,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent Escalations Role',desc:'Solve complex tier-2 technical escalations for high-tier enterprise clients in English.'},
  {id:'bpo_team_lead',trackId:'bpo',roleTitle:'BPO Team Leader',titles:['Shift Supervisor','Operations Team Leader hostilities','Senior Operations Manager','Site Operations Director'],degree:null,smarts:60,eng:75,minExp:2,factor:2.50,medical:true,social:true,bonus:.15,leave:24,remote:'Hybrid',hours:45,stress:5,contract:'Management Contract',desc:'Lead a squad of 15–20 customer experience agents, managing SLA compliance and quality assurance.'}
];

const P12_EGY_BRANDS=['Nile Crest Packaging','Alexandria Commercial Bank','Fawry Digital Services','Sphinx FMCG Distribution','Mediterranean Pharma','Canal Business Services','Delta Audit & Tax','Pyramid Data Solutions','Red Sea Logistics','Cairo Business Process Services','Aman Retail Group','Blue Harbor Insurance','FirstGate Capital','NileCare Medical Network','Mansoura Industrial Group','Arabian Gulf Shared Services','Beacon Consumer Goods','Eastline Outsourcing','Atlas Business Systems','Harbour Medical Group','Pioneer Retail Egypt','Meridian Supply Chain'];

const P12_GLOBAL_BRANDS=['Northstar','Harbour','Meridian','Atlas','Evergreen','Crescent','Pioneer','Summit','BrightPath','Beacon','Vertex','Silverline','Union','Horizon','BluePeak','Redwood','Cedar','BridgePoint','Oakstone','FirstGate','Willow','Clearpath'];

const P12_PROPERTY_TYPES=[
 {id:'studio',name:'Older studio apartment',base:58000,kind:'buy',features:['Compact layout','Older plumbing','Walk-up building'],rent:.0030},
 {id:'oldflat',name:'Older 2-bedroom apartment',base:105000,kind:'buy',features:['Street-facing balcony','Older kitchen','Walk-up building'],rent:.0033},
 {id:'modernflat',name:'Modern 2-bedroom apartment',base:155000,kind:'buy',features:['Elevator','Balcony','Modern bathroom'],rent:.0031},
 {id:'condo',name:'Condo with shared facilities',base:235000,kind:'buy',features:['Security','Elevator','Shared garden'],rent:.0030},
 {id:'townhouse',name:'Townhouse',base:330000,kind:'buy',features:['Private entrance','Small garden','Parking'],rent:.0028},
 {id:'villa',name:'Family villa',base:520000,kind:'buy',features:['Private garden','Parking','Terrace'],rent:.0025},
 {id:'penthouse',name:'Landmark-view penthouse',base:410000,kind:'buy',features:['Landmark or sea view','Large terrace','Elevator'],rent:.0025},
 {id:'mansion',name:'Luxury mansion / estate',base:1850000,kind:'buy',features:['Landscaped gardens','Staff annex','Private pool'],rent:.0018}
];

const P12_LOCATIONS={egy:['Smouha, Alexandria','Sidi Gaber, Alexandria','Miami, Alexandria','Agami, Alexandria','Nasr City, Cairo','Maadi, Cairo','New Cairo','6th of October','New Administrative Capital','North Coast resort area'],usa:['Older suburb','City fringe','Downtown district','Transit-connected suburb'],gbr:['Outer London zone','Regional city centre','Commuter town'],can:['Suburban neighbourhood','Transit-connected district','City core'],deu:['Regional city','Outer-city district','Central neighbourhood'],gulf:['Residential district','New development','Central business district']};

const P12_EXTRA_APPLIANCES={
 kettle:['Bosch Styline variable-temperature kettle',95,'1.7L, variable temperature and boil-dry protection',2014],toaster:['Smeg premium 4-slice toaster',330,'4 slots, bagel and defrost functions',2012],microwave:['Samsung premium inverter microwave',380,'42L, inverter heating and grill',2018],oven:['Miele premium built-in oven',2800,'Large capacity, self-cleaning programmes and precise temperature control',2017],coffee:['Jura premium automatic coffee machine',2600,'Bean-to-cup, automatic milk system and cleaning programme',2016],blender:['Vitamix professional blender',900,'Commercial-grade motor and variable speed',2010],airfryer:['Ninja dual-drawer premium air fryer',520,'Large dual-zone cooking capacity',2022],fridge:['LG premium French-door refrigerator',4200,'Large capacity, dual cooling and premium finish',2018],dishwasher:['Miele premium dishwasher',2300,'Quiet operation, efficient cycles and premium racks',2015],washer:['Miele premium 9kg washer',2500,'Efficient motor, automatic dosing and low vibration',2017],dryer:['Miele heat-pump dryer',2400,'Heat-pump drying and fabric-care settings',2016],iron:['Laurastar premium steam station',800,'High-pressure steam station and garment-care board',2015],vacuum:['Dyson premium cordless vacuum',950,'High suction, filtration and multiple attachments',2018],robovac:['Roborock premium self-emptying robot vacuum',1500,'Mapping, mop-lift and auto-empty dock',2022],airpure:['Blueair premium whole-room purifier',1200,'High-capacity particle filtration',2018],water:['Premium under-sink reverse-osmosis system',1100,'Multi-stage filtration with replacement cartridges',2019]
};

const P14_EGP_USD_HISTORY = {
  2007:5.635, 2008:5.433, 2009:5.545, 2010:5.605, 2011:5.939,
  2012:6.068, 2013:6.872, 2014:7.079, 2015:7.690, 2016:10.03,
  2017:17.78, 2018:17.75, 2019:16.77, 2020:15.76, 2021:15.70,
  2022:19.16, 2023:30.90, 2024:49.50, 2025:50.60, 2026:52.70
};

const P14_EGY_INFLATION = {
  2007:10.9,2008:11.7,2009:16.2,2010:11.7,2011:11.1,2012:8.7,2013:6.9,
  2014:10.1,2015:11.0,2016:10.2,2017:23.5,2018:20.9,2019:13.9,2020:5.7,
  2021:4.5,2022:8.5,2023:24.4,2024:33.3,2025:20.4,2026:11.8,
  2027:9.6,2028:6.7,2029:5.5,2030:5.3
};

const P14_EGY_PRICE_INDEX = {
  2007:.0873,2008:.0975,2009:.1133,2010:.1265,2011:.1405,2012:.1527,
  2013:.1633,2014:.1798,2015:.1995,2016:.2199,2017:.2716,2018:.3283,
  2019:.3738,2020:.3951,2021:.4129,2022:.4480,2023:.5573,2024:.7428,
  2025:.8945,2026:1.0
};

const P14_informalJobs={
  dish:{name:'Dishwashing / kitchen porter',base:14500,stress:4,desc:'Low-paid shifts, often unstable hours and limited protection.'},
  clean:{name:'Cleaning / warehouse shifts',base:15500,stress:4,desc:'Physically tiring shifts; pay and hours can vary.'},
  build:{name:'Construction labourer',base:18500,stress:6,desc:'Higher possible cash earnings but physical injury and wage-theft risks.'}
};

const P15_EGY_EMPLOYERS = [
  'Vodafone Egypt Shared Services','Commercial International Bank','National Bank of Egypt',
  'Dar Al-Handasah Project Services','Cleopatra Healthcare Network','Mansour Retail & Automotive',
  'Bosta Logistics Technology','Eva Pharma Operations','Orascom Project Services',
  'Delta Contracts & Compliance','NileBridge Legal Research','Sphinx Legal Partners',
  'Fawry Digital Services','Pyramid Data Solutions','Canal Audit & Tax Services'
];

const P15_GLOBAL_PREFIX={usa:'Northstar',gbr:'Westbridge',can:'Maple',deu:'Rhein',fra:'Lumière',ita:'Milano',nld:'Canal',aus:'Southern Cross',nzl:'Koru',uae:'Gulf Crescent',sau:'Riyadh',ind:'Deccan',pak:'Indus',nga:'Atlantic',bra:'Verde',tur:'Anatolia',jpn:'Sakura',kor:'Han River',sgp:'Lion City',egy:'NileBridge'};

const P15_DEGREE_JOBS={
 law:[
  {id:'law-trainee',trackId:'law',group:'legal',roleTitle:'Graduate Legal Trainee',titles:['Graduate Legal Trainee','Junior Legal Associate','Legal Associate','Senior Legal Associate','Legal Team Lead'],factor:.66,degree:'law',smarts:38,eng:22,minExp:0,medical:false,social:true,bonus:0,leave:14,remote:'On-site',hours:44,stress:4,contract:'Paid trainee / entry-level contract',desc:'Research, document preparation, case files and supervised legal work. Newly qualified graduates normally start with supervised tasks.',sponsorChance:.15},
  {id:'law-assistant',trackId:'law',group:'legal',roleTitle:'Legal Assistant / Paralegal',titles:['Legal Assistant','Paralegal','Senior Paralegal','Paralegal Team Lead','Legal Operations Manager'],factor:.72,degree:'law',smarts:38,eng:25,minExp:0,medical:false,social:true,bonus:.01,leave:14,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent or 1-year contract',desc:'File preparation, court schedules, document checks, client follow-up and research support.',sponsorChance:.16},
  {id:'law-litigation',trackId:'law',group:'legal',roleTitle:'Litigation & Disputes Assistant',titles:['Disputes Assistant','Junior Litigation Associate','Litigation Associate','Senior Disputes Associate','Disputes Team Lead'],factor:.78,degree:'law',smarts:42,eng:28,minExp:0,medical:false,social:true,bonus:.02,leave:15,remote:'On-site / hybrid by team',hours:45,stress:5,contract:'Permanent; court deadlines can require overtime',desc:'Prepare case bundles, track hearings, organise evidence and assist lawyers with litigation deadlines.',sponsorChance:.15},
  {id:'law-research',trackId:'law',group:'legal',roleTitle:'Legal Researcher',titles:['Junior Legal Researcher','Legal Researcher','Senior Legal Researcher','Research Lead','Legal Knowledge Manager'],factor:.81,degree:'law',smarts:48,eng:35,minExp:0,medical:false,social:true,bonus:.02,leave:18,remote:'Hybrid where available',hours:40,stress:4,contract:'Permanent or project-funded',desc:'Research statutes, regulations and case law; summarise findings for lawyers and business teams.',sponsorChance:.20},
  {id:'law-contracts',trackId:'law',group:'legal',roleTitle:'Contracts Administrator',titles:['Contracts Assistant','Contracts Administrator','Senior Contracts Specialist','Contracts Manager','Head of Commercial Contracts'],factor:.90,degree:'law',degrees:['law','business'],smarts:44,eng:34,minExp:0,medical:true,social:true,bonus:.03,leave:18,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Review standard clauses, manage renewals, track signatures and flag issues for legal review. Law or business graduates may qualify.',sponsorChance:.24},
  {id:'law-compliance',trackId:'finance',group:'finance',roleTitle:'Compliance Analyst',titles:['Compliance Assistant','Compliance Analyst','Senior Compliance Analyst','Compliance Manager','Head of Compliance'],factor:.88,degree:'law',degrees:['law','business'],smarts:48,eng:38,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent; regulated-sector controls',desc:'Support policy controls, regulatory checks, audit evidence and compliance reporting. A law degree is relevant, but employers also hire suitable business graduates.',sponsorChance:.30},
  {id:'law-aml',trackId:'finance',group:'finance',roleTitle:'KYC / AML Analyst',titles:['KYC Associate','AML / KYC Analyst','Senior AML Analyst','Financial Crime Team Lead','Financial Crime Manager'],factor:.91,degree:'law',degrees:['law','business'],smarts:46,eng:40,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid by employer',hours:42,stress:5,contract:'Bank / fintech employment',desc:'Review customer files, identify missing documents, escalate suspicious patterns and maintain regulatory records.',sponsorChance:.34},
  {id:'law-insurance',trackId:'law',group:'legal',roleTitle:'Insurance Claims & Policy Specialist',titles:['Claims Assistant','Claims & Policy Specialist','Senior Claims Specialist','Claims Team Lead','Claims Operations Manager'],factor:.86,degree:'law',degrees:['law','business'],smarts:40,eng:30,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'Hybrid / office',hours:42,stress:4,contract:'Permanent',desc:'Interpret policy wording, organise claim evidence and coordinate disputes with customers and insurers.',sponsorChance:.20},
  {id:'law-inhouse',trackId:'law',group:'legal',roleTitle:'Junior In-house Legal Associate',titles:['Junior Legal Associate','Corporate Legal Associate','Senior Corporate Counsel','Legal Manager','General Counsel'],factor:1.05,degree:'law',smarts:58,eng:48,minExp:1,medical:true,social:true,bonus:.07,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent corporate role',desc:'Support commercial contracts, legal risk registers, internal advice and business stakeholders. Usually more competitive than trainee positions.',sponsorChance:.30},
  {id:'law-public',trackId:'law',group:'legal',roleTitle:'Public-Sector Legal Research Clerk',titles:['Legal Administration Clerk','Legal Research Clerk','Senior Legal Research Officer','Legal Section Supervisor','Legal Administration Manager'],factor:.70,degree:'law',smarts:40,eng:18,minExp:0,medical:false,social:true,bonus:0,leave:21,remote:'On-site',hours:40,stress:3,contract:'Public-sector exam / fixed recruitment cycle',desc:'Administrative legal support and records. Recruitment may require a public examination, local eligibility or a long hiring cycle.',sponsorChance:.01},
  {id:'law-legalops',trackId:'law',group:'legal',roleTitle:'Legal Operations & Document Review Analyst',titles:['Document Review Assistant','Legal Operations Analyst','Senior Document Review Analyst','Legal Operations Lead','Legal Operations Manager'],factor:.93,degree:'law',smarts:48,eng:52,minExp:0,medical:true,social:true,bonus:.04,leave:20,remote:'Hybrid; remote by project',hours:40,stress:4,contract:'Permanent or project contract',desc:'Organise contract repositories, review document sets, maintain legal trackers and support process improvement.',sponsorChance:.28},
  {id:'law-ip',trackId:'law',group:'legal',roleTitle:'Intellectual Property Assistant',titles:['IP Assistant','Trademark / IP Associate','Senior IP Associate','IP Portfolio Manager','IP Practice Lead'],factor:.95,degree:'law',smarts:50,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent; specialist training helpful',desc:'Support trademark filings, brand protection, licensing and intellectual-property documentation.',sponsorChance:.23}
 ],
 business:[
  {id:'biz-junior-accountant',trackId:'finance',group:'finance',roleTitle:'Junior Accountant',titles:['Junior Accountant','Accountant','Senior Accountant','Accounting Supervisor','Accounting Manager'],factor:.82,degree:'business',smarts:34,eng:20,minExp:0,medical:false,social:true,bonus:.02,leave:14,remote:'On-site',hours:42,stress:4,contract:'Permanent / probation period',desc:'Invoices, journal entries, account reconciliations, receivables and month-end support.',sponsorChance:.12},
  {id:'biz-audit',trackId:'finance',group:'finance',roleTitle:'Audit Associate',titles:['Audit Trainee','Audit Associate','Senior Auditor','Audit Manager','Audit Partner'],factor:.93,degree:'business',smarts:48,eng:38,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Office / client site',hours:48,stress:6,contract:'Permanent; busy-season overtime',desc:'Testing, workpapers, financial statements and client evidence. Busy season can mean long days.',sponsorChance:.22},
  {id:'biz-ap-ar',trackId:'finance',group:'finance',roleTitle:'Accounts Payable / Receivable Specialist',titles:['AR/AP Assistant','AR/AP Accountant','Senior AR/AP Accountant','Receivables Manager','Finance Operations Lead'],factor:.86,degree:'business',smarts:36,eng:24,minExp:0,medical:false,social:true,bonus:.02,leave:14,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent or 1-year contract',desc:'Customer/vendor balances, invoice matching, payment allocation and overdue follow-up.',sponsorChance:.14},
  {id:'biz-banking',trackId:'finance',group:'finance',roleTitle:'Banking Operations Officer',titles:['Operations Assistant','Banking Operations Officer','Senior Operations Officer','Operations Manager','Branch Operations Head'],factor:1.00,degree:'business',smarts:42,eng:35,minExp:0,medical:true,social:true,bonus:.07,leave:21,remote:'On-site',hours:40,stress:4,contract:'Permanent; screening and references',desc:'Account servicing, documents, transaction controls and operational-risk checks.',sponsorChance:.24},
  {id:'biz-tax',trackId:'finance',group:'finance',roleTitle:'Tax & Payroll Assistant',titles:['Tax Assistant','Tax / Payroll Accountant','Senior Tax Analyst','Tax Manager','Head of Tax'],factor:.88,degree:'business',smarts:44,eng:32,minExp:0,medical:false,social:true,bonus:.03,leave:15,remote:'Hybrid by employer',hours:42,stress:5,contract:'Permanent; deadlines around filings',desc:'Payroll records, tax workpapers, supporting schedules and returns under supervision.',sponsorChance:.18},
  {id:'biz-finops',trackId:'finance',group:'finance',roleTitle:'Finance Operations Analyst',titles:['Finance Operations Assistant','Finance Operations Analyst','Senior Finance Analyst','Finance Operations Manager','Finance Director'],factor:.94,degree:'business',smarts:45,eng:35,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'Hybrid',hours:42,stress:4,contract:'Permanent',desc:'Reconciliations, payment exceptions, expense reviews, monthly reporting and control checks.',sponsorChance:.22},
  {id:'biz-fpa',trackId:'finance',group:'finance',roleTitle:'FP&A / Budget Analyst',titles:['Budget Assistant','FP&A Analyst','Senior FP&A Analyst','FP&A Manager','Head of Planning'],factor:1.13,degree:'business',smarts:57,eng:48,minExp:1,medical:true,social:true,bonus:.08,leave:21,remote:'Hybrid',hours:43,stress:5,contract:'Permanent; forecast cycles',desc:'Budgeting, variance analysis, forecasts and management reporting. Usually expects strong Excel and some experience.',sponsorChance:.28},
  {id:'biz-risk',trackId:'finance',group:'finance',roleTitle:'Risk / Internal Controls Analyst',titles:['Controls Assistant','Risk & Controls Analyst','Senior Risk Analyst','Risk Manager','Head of Risk'],factor:1.02,degree:'business',smarts:52,eng:42,minExp:0,medical:true,social:true,bonus:.06,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent; control-heavy work',desc:'Test controls, investigate exceptions, update risk registers and prepare evidence for audit.',sponsorChance:.28},
  {id:'biz-procurement',trackId:'entry',group:'finance',roleTitle:'Procurement & Vendor Analyst',titles:['Procurement Assistant','Vendor Analyst','Senior Procurement Analyst','Procurement Manager','Supply Chain Director'],factor:.91,degree:'business',smarts:40,eng:30,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'On-site / hybrid',hours:42,stress:4,contract:'Permanent',desc:'Compare vendor quotations, verify purchase orders and track delivery and payment terms.',sponsorChance:.20}
 ],
 cs:[
  {id:'cs-it-support',trackId:'tech',group:'tech',roleTitle:'IT Support Analyst',titles:['IT Support Technician','IT Support Analyst','Senior IT Analyst','IT Service Desk Lead','IT Operations Manager'],factor:.82,degree:'cs',smarts:42,eng:40,minExp:0,medical:true,social:true,bonus:.03,leave:18,remote:'Hybrid / on-site',hours:40,stress:4,contract:'Permanent; shift support may apply',desc:'Troubleshooting devices, accounts, networks and internal user issues; practical skills may matter as much as grades.',sponsorChance:.20},
  {id:'cs-qa',trackId:'tech',group:'tech',roleTitle:'Junior QA / Software Tester',titles:['QA Trainee','QA Engineer','Senior QA Engineer','QA Lead','Quality Engineering Manager'],factor:.90,degree:'cs',smarts:50,eng:40,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Write test cases, reproduce bugs, validate fixes and document release quality.',sponsorChance:.28},
  {id:'cs-data',trackId:'tech',group:'tech',roleTitle:'Junior Data / BI Analyst',titles:['Data Analyst Intern','Junior Data Analyst','Data Analyst','Senior BI Analyst','Analytics Manager'],factor:.94,degree:'cs',degrees:['cs','business'],smarts:54,eng:42,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid / remote by team',hours:40,stress:4,contract:'Permanent; portfolio may be requested',desc:'Clean data, use SQL and spreadsheets, build dashboards and explain trends to non-technical users.',sponsorChance:.31},
  {id:'cs-dev',trackId:'tech',group:'tech',roleTitle:'Junior Software Developer',titles:['Graduate Developer','Junior Developer','Software Engineer','Senior Engineer','Engineering Lead'],factor:1.02,degree:'cs',smarts:58,eng:48,minExp:0,medical:true,social:true,bonus:.06,leave:22,remote:'Hybrid / remote by employer',hours:40,stress:5,contract:'Permanent; technical interview',desc:'Build, test and maintain software. Hiring depends on portfolio, coding interviews and current team demand.',sponsorChance:.38},
  {id:'cs-erp',trackId:'tech',group:'tech',roleTitle:'ERP / Business Systems Analyst',titles:['ERP Support Assistant','Business Systems Analyst','Senior Systems Analyst','ERP Product Owner','Enterprise Systems Manager'],factor:1.00,degree:'cs',degrees:['cs','business'],smarts:52,eng:45,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Support ERP modules, investigate process issues and connect finance, operations and technical teams.',sponsorChance:.32},
  {id:'cs-security',trackId:'tech',group:'tech',roleTitle:'Junior Security Operations Analyst',titles:['Security Operations Trainee','SOC Analyst','Senior SOC Analyst','Security Team Lead','Security Manager'],factor:1.08,degree:'cs',smarts:61,eng:50,minExp:1,medical:true,social:true,bonus:.06,leave:22,remote:'Shift-based / hybrid',hours:42,stress:6,contract:'Permanent; shift rotation possible',desc:'Monitor alerts, document incidents and follow response procedures. Some roles require certifications or shift work.',sponsorChance:.35}
 ],
 medicine:[
  {id:'med-resident',trackId:'medical',group:'medical',roleTitle:'Junior Doctor / Resident',titles:['Intern / Junior Doctor','Resident Doctor','Specialist Physician','Consultant / Department Lead','Clinical Director'],factor:.82,degree:'medicine',smarts:68,eng:30,minExp:0,medical:true,social:true,bonus:.01,leave:21,remote:'On-site',hours:60,stress:8,contract:'Hospital training / residency; local licensing required',desc:'Clinical work under supervision. Graduation alone may not authorise independent practice; local registration and internship requirements apply.',sponsorChance:.18},
  {id:'med-clinical-research',trackId:'medical',group:'medical',roleTitle:'Clinical Research Coordinator',titles:['Clinical Research Assistant','Clinical Research Coordinator','Senior Research Coordinator','Clinical Research Manager','Research Operations Director'],factor:.91,degree:'medicine',degrees:['medicine','biology'],smarts:58,eng:50,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site / hybrid admin',hours:40,stress:4,contract:'Hospital / research centre contract',desc:'Coordinate study documents, visits, data entry and protocol compliance. Research roles still require relevant training.',sponsorChance:.26},
  {id:'med-quality',trackId:'medical',group:'medical',roleTitle:'Healthcare Quality & Patient Safety Officer',titles:['Quality Assistant','Quality Officer','Senior Quality Officer','Patient Safety Manager','Quality Director'],factor:.94,degree:'medicine',smarts:56,eng:40,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'On-site / hybrid reporting',hours:42,stress:5,contract:'Permanent',desc:'Audit patient pathways, investigate incidents and maintain quality documentation.',sponsorChance:.23},
  {id:'med-public-health',trackId:'medical',group:'medical',roleTitle:'Public Health Programme Officer',titles:['Programme Assistant','Public Health Officer','Senior Programme Officer','Programme Manager','Public Health Director'],factor:.90,degree:'medicine',degrees:['medicine','biology'],smarts:55,eng:48,minExp:0,medical:true,social:true,bonus:.02,leave:21,remote:'Hybrid / field work',hours:40,stress:4,contract:'Permanent or grant-funded',desc:'Support prevention programmes, health reporting, community projects and outcome monitoring.',sponsorChance:.23}
 ],
 biology:[
  {id:'bio-lab',trackId:'bio',group:'bio',roleTitle:'Laboratory Assistant / Technician',titles:['Lab Assistant','Laboratory Technician','Senior Lab Technician','Lab Supervisor','Laboratory Manager'],factor:.82,degree:'biology',smarts:48,eng:30,minExp:0,medical:true,social:true,bonus:.02,leave:18,remote:'On-site',hours:40,stress:4,contract:'Permanent or research grant',desc:'Handle samples, maintain safety logs, perform routine tests and follow standard operating procedures.',sponsorChance:.22},
  {id:'bio-qc',trackId:'bio',group:'bio',roleTitle:'Pharmaceutical QA / QC Analyst',titles:['QC Trainee','QA / QC Analyst','Senior QC Analyst','QC Supervisor','Quality Manager'],factor:.91,degree:'biology',smarts:52,eng:34,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site',hours:42,stress:5,contract:'Permanent; quality procedures and shift work may apply',desc:'Sample testing, batch records and quality documentation in a pharmaceutical or manufacturing environment.',sponsorChance:.25},
  {id:'bio-clinical',trackId:'bio',group:'bio',roleTitle:'Clinical Trial Assistant',titles:['Clinical Trial Assistant','Clinical Research Associate','Senior CRA','Clinical Trial Manager','Clinical Operations Lead'],factor:.96,degree:'biology',smarts:54,eng:48,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'Hybrid / site visits',hours:40,stress:4,contract:'Research / pharma contract',desc:'Coordinate trial documentation, site communication and monitoring records.',sponsorChance:.28},
  {id:'bio-food',trackId:'bio',group:'bio',roleTitle:'Food / Environmental Laboratory Analyst',titles:['Lab Trainee','Laboratory Analyst','Senior Analyst','Lab Supervisor','Technical Manager'],factor:.86,degree:'biology',smarts:46,eng:28,minExp:0,medical:false,social:true,bonus:.02,leave:18,remote:'On-site',hours:40,stress:3,contract:'Permanent or fixed-term',desc:'Test food, water or environmental samples, record results and keep equipment calibrated.',sponsorChance:.18},
  {id:'bio-regulatory',trackId:'bio',group:'bio',roleTitle:'Regulatory Affairs Associate',titles:['Regulatory Assistant','Regulatory Affairs Associate','Senior Regulatory Specialist','Regulatory Manager','Regulatory Affairs Director'],factor:.98,degree:'biology',degrees:['biology','medicine'],smarts:55,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid paperwork / on-site',hours:40,stress:4,contract:'Permanent',desc:'Prepare product registrations, maintain technical files and respond to regulator requests.',sponsorChance:.26}
 ]
};

const P15_oldRequirementText="${(post.degrees&&post.degrees.length)?`degree in ${post.degrees.map(k=>MAJORS[k]?.name||k).join(' or ')}; `:(post.degree?`degree in ${MAJORS[post.degree]?.name||post.degree}; `:'')}English ${post.eng||0}%+, Smarts ${post.smarts||0}%+${post.minExp?`, ${post.minExp}+ relevant years`:''}. Hiring also depends on interviews, competition and budget.";

const P15_newRequirementText="${(post.degrees&&post.degrees.length)?`degree in ${post.degrees.map(k=>MAJORS[k]?.name||k).join(' or ')}; `:(post.degree?`degree in ${MAJORS[post.degree]?.name||post.degree}; `:'')}English ${post.eng||0}%+, Smarts ${post.smarts||0}%+${post.minExp?`, ${post.minExp}+ relevant years`:''}. Hiring also depends on interviews, competition and budget.";

const P17_NEED_TYPES = {
  phone:{label:'Phone / phone replacement',egy:18000,usd:350},
  clothes:{label:'New clothes / work wardrobe',egy:9000,usd:180},
  laptop:{label:'Laptop / work equipment',egy:45000,usd:850},
  visit:{label:'Visit family / airfare and gifts',egy:65000,usd:1200},
  holiday:{label:'Holiday / trip with friends',egy:22000,usd:450},
  medical:{label:'Medical treatment / emergency fund',egy:18000,usd:500},
  course:{label:'English course / certification',egy:12000,usd:250},
  rent:{label:'Rent deposit / moving out',egy:90000,usd:1800},
  home:{label:'Home / property down payment',egy:650000,usd:25000}
};

const P18_CITY_DESTINATIONS = [
  ['trip-manchester','Manchester','gbr'],['trip-edinburgh','Edinburgh','gbr'],
  ['trip-nice','Nice / French Riviera','fra'],['trip-berlin','Berlin','deu'],['trip-munich','Munich','deu'],
  ['trip-rome','Rome','ita'],['trip-milan','Milan','ita'],['trip-amsterdam','Amsterdam','nld'],
  ['trip-new-york','New York','usa'],['trip-los-angeles','Los Angeles','usa'],['trip-chicago','Chicago','usa'],
  ['trip-vancouver','Vancouver','can'],['trip-montreal','Montreal','can'],
  ['trip-dubai-city','Dubai','uae'],['trip-abu-dhabi','Abu Dhabi','uae'],
  ['trip-riyadh','Riyadh','sau'],['trip-jeddah','Jeddah','sau'],
  ['trip-sydney','Sydney','aus'],['trip-melbourne','Melbourne','aus'],
  ['trip-auckland','Auckland','nzl'],['trip-queenstown','Queenstown','nzl'],
  ['trip-istanbul-city','Istanbul','tur'],['trip-cappadocia','Cappadocia','tur'],
  ['trip-mumbai','Mumbai','ind'],['trip-delhi','Delhi','ind'],['trip-lahore','Lahore','pak'],
  ['trip-lagos','Lagos','nga'],['trip-sao-paulo','São Paulo','bra'],
  ['trip-tokyo','Tokyo','jpn'],['trip-osaka','Osaka','jpn'],
  ['trip-seoul','Seoul','kor'],['trip-busan','Busan','kor'],['trip-singapore','Singapore','sgp']
];

const P20_CITY_MARKETS = {
  egy:[['Alexandria · Smouha','alex-smouha',0.95],['Alexandria · central / waterfront','alex-central',1.08],['Cairo · Nasr City','cairo-nasr',1.12],['Cairo · Maadi','cairo-maadi',1.35],['Cairo · New Cairo','cairo-new',1.65],['Giza · Dokki','giza-dokki',1.08],['10th of Ramadan City','ramadan',0.82],['North Coast (seasonal)','north-coast',1.85]],
  usa:[['New York City','nyc',1.75],['Los Angeles, California','la',1.55],['San Francisco, California','sf',1.85],['Chicago, Illinois','chicago',1.12],['Houston, Texas','houston',0.98],['Atlanta, Georgia','atlanta',1.02],['Columbus, Ohio','columbus',0.82]],
  gbr:[['London','london',1.65],['Manchester','manchester',1.05],['Birmingham','birmingham',0.95],['Leeds','leeds',0.92],['Glasgow','glasgow',0.90]],
  can:[['Toronto','toronto',1.45],['Vancouver','vancouver',1.55],['Montreal','montreal',1.05],['Calgary','calgary',1.05],['Ottawa','ottawa',1.10]],
  deu:[['Munich','munich',1.35],['Berlin','berlin',1.12],['Hamburg','hamburg',1.18],['Leipzig','leipzig',0.90],['Frankfurt','frankfurt',1.25]],
  fra:[['Paris','paris',1.55],['Lyon','lyon',1.12],['Marseille','marseille',1.02],['Toulouse','toulouse',0.98]],
  aus:[['Sydney','sydney',1.55],['Melbourne','melbourne',1.35],['Brisbane','brisbane',1.12],['Perth','perth',1.10]],
  uae:[['Dubai','dubai',1.45],['Abu Dhabi','abudhabi',1.32],['Sharjah','sharjah',0.92]],
  sau:[['Riyadh','riyadh',1.18],['Jeddah','jeddah',1.08],['Dammam','dammam',0.98]],
  ind:[['Mumbai','mumbai',1.45],['Bengaluru','bengaluru',1.20],['Delhi','delhi',1.12],['Pune','pune',1.02]],
  nld:[['Amsterdam','amsterdam',1.55],['Rotterdam','rotterdam',1.12],['Eindhoven','eindhoven',1.08]],
  ita:[['Milan','milan',1.42],['Rome','rome',1.20],['Naples','naples',0.92]],
  jpn:[['Tokyo','tokyo',1.45],['Osaka','osaka',1.12],['Fukuoka','fukuoka',0.92]],
  sgp:[['Singapore · central','sg-central',1.35],['Singapore · outer district','sg-outer',1.05]],
  nzl:[['Auckland','auckland',1.35],['Wellington','wellington',1.22],['Christchurch','christchurch',1.00]],
  bra:[['São Paulo','saopaulo',1.30],['Rio de Janeiro','rio',1.22],['Curitiba','curitiba',1.00]],
  tur:[['Istanbul','istanbul',1.35],['Ankara','ankara',1.00],['Izmir','izmir',1.08]],
  pak:[['Karachi','karachi',1.18],['Lahore','lahore',1.08],['Islamabad','islamabad',1.28]],
  nga:[['Lagos','lagos',1.40],['Abuja','abuja',1.28],['Ibadan','ibadan',0.88]]
};

const P20_AGE_STORIES={
  6:{title:'First day of primary school',text:'Your school bag feels enormous. A classmate smiles at you, the teacher asks a simple maths question, and you wonder whether you will fit in.',choices:[['Sit beside a friendly classmate',()=>({social:5,happiness:4,msg:'You made your first school friend. They saved you a seat the next morning.'})],['Try hard on the maths question',()=>({smarts:4,happiness:2,msg:'Your teacher praised your effort. You felt proud, even though you were nervous.'})],['Stay quiet and observe',()=>({happiness:1,msg:'You watched how the class worked. It took time, but you began to feel safer.'})]]},
  7:{title:'Bicycle training wheels come off',text:'A parent holds the back of your bicycle as you prepare to try riding without training wheels.',choices:[['Practise patiently',()=>({health:3,smarts:1,happiness:4,msg:'You wobbled, fell onto the grass, then managed a few metres on your own.'})],['Ask to keep practising with support',()=>({happiness:3,social:2,msg:'You chose not to rush. Your family encouraged you to try again another day.'})]]},
  8:{title:'Your eighth birthday',text:'Your family asks what birthday gift you would love. Their budget depends on what they can realistically afford.',choices:[['Ask for a handheld game console',()=>p20GiftChoice('console')],['Ask for a sports bicycle',()=>p20GiftChoice('bike')],['Ask for a science discovery kit',()=>p20GiftChoice('science')],['Choose a small celebration instead',()=>({happiness:5,social:3,msg:'You had cake and a simple family celebration. It felt warm, even without an expensive gift.'})]]},
  9:{title:'School science fair and athletics',text:'The science fair and the school athletics team tournament are happening in the same week.',choices:[['Build a volcano model with classmates',()=>({smarts:4,social:3,happiness:3,msg:'Your model was messy but memorable. Your classmates helped you finish it.'})],['Train for the athletics tournament',()=>({health:4,happiness:4,msg:'You trained hard and learned that practice matters more than winning every race.'})]]},
  10:{title:'Double digits',text:'Your neighbourhood friends have two plans: build a secret fort or spend the afternoon at a video-game tournament.',choices:[['Build the neighbourhood fort',()=>({social:5,smarts:1,happiness:4,msg:'You made a hideout from old sheets and cardboard and created a summer memory.'})],['Join the game tournament',()=>({smarts:2,social:4,happiness:3,msg:'You had fun competing and learned to handle losing without falling out with friends.'})]]},
  11:{title:'Middle school and a first phone',text:'School is getting bigger. You ask your parents whether it is time for your first mobile phone.',choices:[['Ask for an affordable phone',()=>p20ParentTechAsk('phone')],['Wait and focus on school',()=>({smarts:3,happiness:1,msg:'You agreed to wait. It was disappointing, but you understood money was tight.'})]]},
  12:{title:'A note from a classmate',text:'You receive a kind note from someone you have a small crush on. A few classmates begin gossiping.',choices:[['Keep it private and be kind',()=>({social:4,happiness:3,msg:'You kept the note private and treated your classmate kindly. The gossip soon faded.'})],['Talk to a trusted friend',()=>({social:3,smarts:1,msg:'Your friend helped you avoid turning a small crush into unnecessary drama.'})],['Show off the note',()=>({happiness:1,social:-3,msg:'The attention felt exciting briefly, but your classmate felt embarrassed and trust was damaged.'})]]},
  13:{title:'Your teenage interests',text:'You want to commit to something outside school. Your choices can shape skills and friendships.',choices:[['Join a music group',()=>({smarts:1,social:3,happiness:3,msg:'You practised with other beginners. Progress was slow, but you found your people.'})],['Join a sports league',()=>({health:4,social:4,happiness:3,msg:'Training improved your stamina and gave your week a routine.'})],['Learn coding or game modding',()=>({smarts:5,social:1,msg:'You broke things, searched for answers and gradually learned how to make your own project.'})]]},
  14:{title:'Your first chance to earn money',text:'You are old enough for some age-appropriate part-time work in this game. It may teach responsibility, but it can compete with study time.',choices:[['Look for babysitting work',()=>p20StartTeenJob('babysitter')],['Offer private tutoring to younger pupils',()=>p20StartTeenJob('tutor')],['Try a café or shop assistant shift',()=>p20StartTeenJob('cafe')],['Prioritise school this year',()=>({smarts:3,happiness:1,msg:'You focused on school and kept your schedule manageable.'})]]},
  15:{title:'An invitation for the weekend',text:'Three plans land at once: a house party, a study group and a cinema night with friends.',choices:[['Go to the study group',()=>({smarts:4,social:2,msg:'You studied together and still found time to laugh. Your exam confidence improved.'})],['Go to the cinema with friends',()=>({social:4,happiness:4,wealth:-p20LocalCost(12),msg:'You enjoyed a film and snacks. The outing cost money, but gave you a good memory.'}),()=>p20LocalCost(12)],['Attend the party with clear boundaries',()=>({social:4,happiness:3,msg:'You had fun, stayed within your boundaries and got home safely.'})]]},
  16:{title:'Driving test and first date invitation',text:'You can begin the process of learning to drive where local rules allow, and someone you like asks whether you want to go to the cinema.',choices:[['Prepare for the driving theory test',()=>({smarts:3,msg:'You started studying road signs. A licence still requires meeting local age and legal requirements.'})],['Go on a simple group cinema outing',()=>({social:4,happiness:4,wealth:-p20LocalCost(18),msg:'You enjoyed a low-pressure outing with friends. It felt good to get out of the house.'}),()=>p20LocalCost(18)],['Save the money and focus on exams',()=>({smarts:3,wealth:0,msg:'You chose to save money and keep your exam plans on track.'})]]},
  17:{title:'Senior-year exam pressure',text:'Entrance exams are getting close. Friends are stressed, and everyone has a different idea about how to prepare.',choices:[['Make a study plan and follow it',()=>({smarts:6,happiness:-1,msg:'You followed a realistic revision plan. You still felt pressure, but the material became more manageable.'})],['Join a study group',()=>({smarts:4,social:3,msg:'Explaining topics to each other helped the group spot gaps and stay motivated.'})],['Take a rest day before returning to study',()=>({health:2,happiness:4,smarts:1,msg:'You rested before burnout set in, then returned with a clearer head.'})]]},
  18:{title:'High-school graduation',text:'You have reached a major milestone. Your family wants to celebrate, but money and plans differ from household to household.',choices:[['Plan a modest family celebration',()=>({happiness:6,social:4,msg:'You celebrated with the people who supported you. It was meaningful without being extravagant.'})],['Ask about university and career plans',()=>({smarts:3,happiness:2,msg:'You discussed tuition, scholarships, work and the choices ahead with your family.'})],['Take a quiet day to reflect',()=>({happiness:3,msg:'You gave yourself a moment to recognise how much had changed since primary school.'})]]}
};

const P24_TEEN_JOB_RULES = {
  babysitter: { title: 'Babysitter', basePay: 500, minSmarts: 20, chanceStat: 'social', chanceThreshold: 60, chanceLow: 0.58, chanceHigh: 0.72 },
  tutor: { title: 'Private Tutor', basePay: 850, minSmarts: 40, chanceStat: 'smarts', chanceThreshold: 65, chanceLow: 0.48, chanceHigh: 0.74 },
  cafe: { title: 'Café Assistant', basePay: 650, minSmarts: 15, chanceStat: 'social', chanceThreshold: 55, chanceLow: 0.52, chanceHigh: 0.66 }
};
