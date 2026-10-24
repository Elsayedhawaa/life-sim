/* ============================================================
   DATA: FRIENDSHIP SYSTEM
   ============================================================ */

const FRIEND_TRAITS = {
  loyal:      { label: 'Loyal',            bondDecay: 0.5, desc: 'Always there for you.' },
  funny:      { label: 'Funny',            bondDecay: 1.0, happinessBonus: 2, desc: 'Makes you laugh.' },
  moody:      { label: 'Moody',            bondDecay: 1.5, happinessBonus: -1, desc: 'Their mood shifts quickly.' },
  generous:   { label: 'Generous',         bondDecay: 0.7, desc: 'Always treats you.' },
  greedy:     { label: 'Greedy',           bondDecay: 1.2, desc: 'Expects you to pay.' },
  ambitious:  { label: 'Ambitious',        bondDecay: 1.0, desc: 'Career-focused.' },
  calm:       { label: 'Calm',             bondDecay: 0.8, desc: 'Never escalates.' },
  grumpy:     { label: 'Grumpy',           bondDecay: 1.3, desc: 'Easily irritated.' },
  smart:      { label: 'Smart',            bondDecay: 1.0, desc: 'Interesting conversations.' },
  athletic:   { label: 'Athletic',         bondDecay: 1.0, desc: 'Active lifestyle.' },
  religious:  { label: 'Religious',        bondDecay: 1.0, desc: 'Faith-focused.' },
  family_oriented: { label: 'Family-Oriented', bondDecay: 1.0, desc: 'Always with family.' },
  career_focused:  { label: 'Career-Focused',  bondDecay: 1.2, desc: 'May drift when work gets busy.' },
  independent:     { label: 'Independent',     bondDecay: 1.0, desc: 'Comfortable alone.' },
  supportive:      { label: 'Supportive',      bondDecay: 0.6, desc: 'Great listener.' },
  jealous:         { label: 'Jealous',         bondDecay: 1.3, desc: 'Can be possessive.' },
  insecure:        { label: 'Insecure',        bondDecay: 1.4, desc: 'Needs reassurance.' }
};

const FRIEND_SOURCES = [
  { id: 'childhood',  label: 'Childhood Neighbor',  minAge: 6,  maxAge: 20, matchChance: 0.50 },
  { id: 'school',     label: 'School Classmate',    minAge: 7,  maxAge: 18, matchChance: 0.60, requiresSchool: true },
  { id: 'university', label: 'University Friend',   minAge: 18, maxAge: 25, matchChance: 0.65, requiresUni: true },
  { id: 'work',       label: 'Work Colleague',      minAge: 20, maxAge: 60, matchChance: 0.40, requiresJob: true },
  { id: 'hobby',      label: 'Hobby Club',          minAge: 16, maxAge: 60, matchChance: 0.50 },
  { id: 'app',        label: 'Friend-making App',   minAge: 16, maxAge: 60, matchChance: 0.40 },
  { id: 'neighbor',   label: 'Neighbor',            minAge: 20, maxAge: 70, matchChance: 0.35 }
];

const FRIEND_ACTIVITIES = [
  { id: 'walk',     label: 'Walk and talk',    costEGP: 0,     bond: 2,  happy: 2,  time: 'hour' },
  { id: 'call',     label: 'Phone call',       costEGP: 0,     bond: 1,  happy: 1,  time: 'hour' },
  { id: 'facetime', label: 'Video call',       costEGP: 0,     bond: 1,  happy: 1,  time: 'hour' },
  { id: 'coffee',   label: 'Coffee together',  costEGP: 500,   bond: 3,  happy: 2,  time: 'hour' },
  { id: 'gaming',   label: 'Video games',      costEGP: 500,   bond: 3,  happy: 3,  time: 'evening' },
  { id: 'movie',    label: 'Watch a movie',    costEGP: 800,   bond: 3,  happy: 3,  time: 'evening' },
  { id: 'sports',   label: 'Sports / gym',     costEGP: 1200,  bond: 4,  happy: 3,  health: 3, time: 'half-day' },
  { id: 'dinner',   label: 'Dinner out',       costEGP: 2500,  bond: 5,  happy: 4,  time: 'evening' },
  { id: 'gift',     label: 'Buy a gift',       costEGP: 3000,  bond: 6,  happy: 3,  time: 'hour' },
  { id: 'weekend',  label: 'Weekend trip',     costEGP: 12000, bond: 12, happy: 10, time: 'weekend' }
];

const FRIEND_NAMES = {
  egy: { m: ['Ahmed','Omar','Karim','Youssef','Tarek','Hassan','Sherif','Amr','Mahmoud','Khaled'],
         f: ['Sara','Layla','Nour','Mariam','Hana','Salma','Yasmin','Aya','Nada','Rana'] },
  usa: { m: ['Michael','David','James','Ryan','Ethan','Noah','Jake','Tyler','Chris','Alex'],
         f: ['Emily','Sarah','Olivia','Emma','Sophia','Mia','Ava','Chloe','Lily','Hannah'] },
  gbr: { m: ['Oliver','Harry','Jack','Charlie','George','Jacob','Thomas','James','William','Henry'],
         f: ['Olivia','Amelia','Isla','Emily','Poppy','Ava','Isabella','Lily','Sophie','Grace'] },
  deu: { m: ['Lukas','Leon','Felix','Jonas','Noah','Paul','Finn','Elias','Ben','Tim'],
         f: ['Mia','Emma','Hannah','Emilia','Lina','Sophia','Lea','Clara','Lena','Anna'] },
  sau: { m: ['Abdullah','Faisal','Khalid','Sultan','Fahad','Turki','Saud','Nawaf','Bandar','Majed'],
         f: ['Noura','Reem','Hessa','Latifa','Maha','Aisha','Fatima','Sara','Lulwa','Dana'] },
  uae: { m: ['Rashid','Hamdan','Saeed','Ahmed','Khalifa','Majid','Saif','Ali','Omar','Yousef'],
         f: ['Fatima','Mariam','Shaikha','Latifa','Hind','Noura','Alia','Salama','Moza','Reem'] }
};

const FRIEND_EVENTS = [
  { id: 'asks_money',   weight: 8, title: '{name} needs money',              choice: true,  minBond: 30 },
  { id: 'gets_married', weight: 6, title: '{name} is getting married',       choice: true,  minBond: 50 },
  { id: 'moves_abroad', weight: 4, title: '{name} is moving abroad',         choice: false, minBond: 20 },
  { id: 'fight',        weight: 5, title: 'Fight with {name}',               choice: true,  maxBond: 40 },
  { id: 'confides',     weight: 7, title: '{name} confides in you',          choice: true,  minBond: 60 },
  { id: 'job_offer',    weight: 3, title: '{name} offers you a job lead',    choice: true,  minBond: 50 }
];

window.FRIEND_TRAITS = FRIEND_TRAITS;
window.FRIEND_SOURCES = FRIEND_SOURCES;
window.FRIEND_ACTIVITIES = FRIEND_ACTIVITIES;
window.FRIEND_NAMES = FRIEND_NAMES;
window.FRIEND_EVENTS = FRIEND_EVENTS;
