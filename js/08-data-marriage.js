/* ============================================================
   WORLD LIFE — EXPANDED MARRIAGE & RELATIONSHIPS DATA
   ============================================================
   DATA ONLY — no functions, DOM access, or game logic.

   Countries supported:
   egy, usa, sau, uae, gbr, deu, can, aus, nld, fra,
   jpn, ita, sgp, bra, ind

   Notes:
   - IDs from the original data are preserved where possible.
   - Costs use EGP as the base where the original system expects EGP.
   - Country profiles are fictionalized game-balancing details.
   - Legal profiles are simplified simulation settings, not legal advice.
   - Existing game logic must read a data option before it can use it.
   ============================================================ */


/* ============================================================
   1. DATING SOURCES
   ============================================================ */

const MARRIAGE_DATING_SOURCES = [
  {
    id: 'school',
    label: 'School / University',
    minAge: 16,
    maxAge: 25,
    requiresEducation: true,
    matchChance: 0.55,
    familyApproval: 0.85,
    romantic: 0.85,
    cost: 0,
    desc: 'A classmate catches your eye.'
  },
  {
    id: 'work',
    label: 'Workplace',
    minAge: 20,
    maxAge: 60,
    requiresJob: true,
    matchChance: 0.40,
    familyApproval: 0.75,
    romantic: 0.70,
    cost: 0,
    desc: 'A coworker you keep thinking about.'
  },
  {
    id: 'app',
    label: 'Dating App',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.50,
    familyApproval: 0.40,
    romantic: 0.70,
    cost: 200,
    desc: 'You match with someone who shares your interests.'
  },
  {
    id: 'mutual',
    label: 'Mutual Friends',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.60,
    familyApproval: 0.85,
    romantic: 0.75,
    cost: 0,
    desc: 'A friend introduces you to someone.'
  },
  {
    id: 'salonat',
    label: 'Salonat / Family Introduction',
    minAge: 20,
    maxAge: 60,
    matchChance: 0.80,
    familyApproval: 1.00,
    romantic: 0.35,
    cost: 3000,
    desc: 'A traditional family introduction. Compatibility still matters.'
  },
  {
    id: 'neighbor',
    label: 'Neighborhood',
    minAge: 18,
    maxAge: 40,
    matchChance: 0.40,
    familyApproval: 0.80,
    romantic: 0.70,
    cost: 0,
    desc: 'You keep seeing the same person around your neighborhood.'
  },
  {
    id: 'hobby',
    label: 'Hobby / Sports Club',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.58,
    familyApproval: 0.65,
    romantic: 0.82,
    cost: 500,
    desc: 'You meet someone who enjoys the same activities.'
  },
  {
    id: 'volunteering',
    label: 'Volunteering',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.52,
    familyApproval: 0.78,
    romantic: 0.68,
    cost: 0,
    desc: 'Working toward a shared cause brings you closer.'
  },
  {
    id: 'travel',
    label: 'While Travelling',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.48,
    familyApproval: 0.50,
    romantic: 0.88,
    cost: 2500,
    desc: 'A memorable conversation during a trip becomes something more.'
  },
  {
    id: 'online_community',
    label: 'Online Community',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.50,
    familyApproval: 0.48,
    romantic: 0.72,
    cost: 100,
    desc: 'You connect through a shared online interest.'
  },
  {
    id: 'family_friend',
    label: 'Family Friend',
    minAge: 20,
    maxAge: 60,
    matchChance: 0.68,
    familyApproval: 0.94,
    romantic: 0.50,
    cost: 500,
    desc: 'Your families already know one another.'
  },
  {
    id: 'professional_event',
    label: 'Professional Event',
    minAge: 21,
    maxAge: 60,
    requiresJob: true,
    matchChance: 0.46,
    familyApproval: 0.70,
    romantic: 0.58,
    cost: 1200,
    desc: 'A conference or networking event leads to a conversation.'
  },
  {
    id: 'language_class',
    label: 'Language Course',
    minAge: 18,
    maxAge: 60,
    requiresEducation: true,
    matchChance: 0.55,
    familyApproval: 0.68,
    romantic: 0.72,
    cost: 1500,
    desc: 'You meet someone while learning a language.'
  },
  {
    id: 'gym',
    label: 'Gym / Fitness Class',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.42,
    familyApproval: 0.60,
    romantic: 0.65,
    cost: 1000,
    desc: 'A familiar face at the gym starts a conversation.'
  },
  {
    id: 'wedding_guest',
    label: 'At a Wedding',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.62,
    familyApproval: 0.86,
    romantic: 0.78,
    cost: 1500,
    desc: 'You meet someone at a relative or friend’s wedding.'
  },
  {
    id: 'social_event',
    label: 'Social Event',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.52,
    familyApproval: 0.65,
    romantic: 0.75,
    cost: 800,
    desc: 'A party, festival, or community event introduces you to someone.'
  },
  {
    id: 'matchmaker',
    label: 'Professional Matchmaker',
    minAge: 21,
    maxAge: 60,
    matchChance: 0.78,
    familyApproval: 0.88,
    romantic: 0.45,
    cost: 12000,
    desc: 'A professional matchmaker searches for compatible people.'
  },
  {
    id: 'long_distance',
    label: 'Long-Distance Connection',
    minAge: 18,
    maxAge: 60,
    matchChance: 0.45,
    familyApproval: 0.45,
    romantic: 0.82,
    cost: 2500,
    desc: 'You become close to someone who lives in another city or country.'
  }
];


/* ============================================================
   2. PARTNER PERSONALITY TRAITS
   ============================================================ */

const MARRIAGE_PARTNER_TRAITS = {
  kind: {
    label: 'Kind',
    bondPerYear: 2,
    happinessMod: 2,
    desc: 'Thoughtful, warm, and considerate.'
  },
  ambitious: {
    label: 'Ambitious',
    bondPerYear: 0,
    incomeMult: 1.25,
    desc: 'Career-driven and focused on long-term goals.'
  },
  funny: {
    label: 'Funny',
    bondPerYear: 1,
    happinessMod: 3,
    desc: 'Makes you laugh, even during difficult times.'
  },
  romantic: {
    label: 'Romantic',
    bondPerYear: 2,
    happinessMod: 2,
    desc: 'Enjoys affection, gestures, and surprises.'
  },
  calm: {
    label: 'Calm',
    bondPerYear: 1,
    happinessMod: 1,
    desc: 'Usually steady and patient during conflict.'
  },
  grumpy: {
    label: 'Grumpy',
    bondPerYear: -2,
    happinessMod: -2,
    desc: 'Gets irritated easily and may need time to cool down.'
  },
  moody: {
    label: 'Moody',
    bondPerYear: -1,
    happinessMod: -1,
    desc: 'Their mood can change quickly.'
  },
  pessimistic: {
    label: 'Pessimistic',
    bondPerYear: -1,
    happinessMod: -2,
    desc: 'Often expects things to go wrong.'
  },
  traditional: {
    label: 'Traditional',
    bondPerYear: 0,
    arrangeBias: true,
    desc: 'Values family customs and familiar household roles.'
  },
  modern: {
    label: 'Modern',
    bondPerYear: 0,
    arrangeBias: false,
    desc: 'Values independence, flexibility, and shared decisions.'
  },
  religious: {
    label: 'Faith-Oriented',
    bondPerYear: 1,
    happinessMod: 1,
    desc: 'Faith and personal values influence their decisions.'
  },
  generous: {
    label: 'Generous',
    bondPerYear: 1,
    sharesIncome: true,
    desc: 'Willing to share money, time, and resources.'
  },
  greedy: {
    label: 'Materialistic',
    bondPerYear: -1,
    wantsMore: true,
    desc: 'Places a high value on money, gifts, and possessions.'
  },
  jealous: {
    label: 'Jealous',
    bondPerYear: -1,
    cheatingRisk: 1.5,
    desc: 'Can become suspicious without clear communication.'
  },
  loyal: {
    label: 'Loyal',
    bondPerYear: 2,
    cheatingRisk: 0.5,
    desc: 'Values commitment and tries to protect the relationship.'
  },
  independent: {
    label: 'Independent',
    bondPerYear: 0,
    happinessMod: 1,
    desc: 'Needs personal space and enjoys having separate interests.'
  },
  family_oriented: {
    label: 'Family-Oriented',
    bondPerYear: 2,
    happinessMod: 1,
    desc: 'Enjoys family gatherings and staying connected with relatives.'
  },
  career_focused: {
    label: 'Career-Focused',
    bondPerYear: 0,
    incomeMult: 1.20,
    desc: 'May work long hours to advance professionally.'
  },
  patient: {
    label: 'Patient',
    bondPerYear: 2,
    happinessMod: 1,
    desc: 'Listens carefully and avoids rushing important decisions.'
  },
  impulsive: {
    label: 'Impulsive',
    bondPerYear: -1,
    happinessMod: 0,
    desc: 'Makes quick decisions that can create unexpected problems.'
  },
  frugal: {
    label: 'Frugal',
    bondPerYear: 0,
    savingsMult: 1.15,
    desc: 'Prefers saving money over unnecessary spending.'
  },
  extravagant: {
    label: 'Extravagant',
    bondPerYear: -1,
    spendingMult: 1.20,
    desc: 'Enjoys luxury, shopping, and expensive experiences.'
  },
  supportive: {
    label: 'Supportive',
    bondPerYear: 2,
    happinessMod: 2,
    desc: 'Encourages your goals and helps when life gets difficult.'
  },
  avoidant: {
    label: 'Avoids Conflict',
    bondPerYear: -1,
    happinessMod: 0,
    desc: 'May withdraw instead of discussing difficult issues.'
  },
  communicative: {
    label: 'Good Communicator',
    bondPerYear: 2,
    happinessMod: 1,
    desc: 'Prefers honest conversations and resolving disagreements.'
  },
  stubborn: {
    label: 'Stubborn',
    bondPerYear: -1,
    happinessMod: -1,
    desc: 'Finds it difficult to admit mistakes or compromise.'
  },
  adventurous: {
    label: 'Adventurous',
    bondPerYear: 1,
    happinessMod: 2,
    desc: 'Enjoys trying new things and travelling together.'
  },
  homebody: {
    label: 'Homebody',
    bondPerYear: 1,
    happinessMod: 1,
    desc: 'Prefers quiet evenings and a comfortable home.'
  },
  insecure: {
    label: 'Insecure',
    bondPerYear: -1,
    happinessMod: -1,
    desc: 'Needs reassurance and may worry about the relationship.'
  },
  mature: {
    label: 'Emotionally Mature',
    bondPerYear: 2,
    happinessMod: 2,
    desc: 'Can discuss difficult subjects without turning everything into a fight.'
  }
};


/* ============================================================
   3. PARTNER NAME POOLS BY COUNTRY
   ============================================================ */

const MARRIAGE_PARTNER_NAMES = {
  egy: {
    m: ['Omar', 'Youssef', 'Karim', 'Ahmed', 'Hassan', 'Mostafa', 'Tarek', 'Amr', 'Bassem', 'Sherif', 'Ziad', 'Adam', 'Mazen', 'Khaled', 'Seif'],
    f: ['Sarah', 'Layla', 'Noor', 'Mariam', 'Hana', 'Salma', 'Yasmin', 'Aya', 'Rana', 'Dina', 'Farida', 'Malak', 'Jana', 'Nourhan', 'Habiba']
  },
  usa: {
    m: ['Michael', 'David', 'James', 'Daniel', 'Ryan', 'Ethan', 'Noah', 'Liam', 'Jacob', 'Matthew', 'Alexander', 'Benjamin', 'Lucas', 'Henry', 'Jack'],
    f: ['Emily', 'Sarah', 'Jessica', 'Ashley', 'Olivia', 'Emma', 'Sophia', 'Ava', 'Mia', 'Isabella', 'Amelia', 'Grace', 'Chloe', 'Lily', 'Hannah']
  },
  sau: {
    m: ['Mohammed', 'Abdullah', 'Faisal', 'Khalid', 'Fahad', 'Saud', 'Turki', 'Nasser', 'Omar', 'Salman', 'Yousef', 'Majed'],
    f: ['Noura', 'Hessa', 'Reem', 'Layan', 'Sara', 'Maha', 'Abeer', 'Jawaher', 'Lama', 'Ghada', 'Amal', 'Dana']
  },
  uae: {
    m: ['Rashid', 'Hamdan', 'Saeed', 'Khalifa', 'Zayed', 'Ahmed', 'Omar', 'Mohammed', 'Majid', 'Mansoor', 'Faisal'],
    f: ['Maryam', 'Latifa', 'Shamma', 'Mariam', 'Aisha', 'Hind', 'Fatima', 'Reem', 'Mouza', 'Noora', 'Salama']
  },
  gbr: {
    m: ['Oliver', 'George', 'Harry', 'Jack', 'Charlie', 'Thomas', 'Oscar', 'William', 'Arthur', 'Leo', 'Alfie', 'Theodore'],
    f: ['Olivia', 'Amelia', 'Isla', 'Ava', 'Lily', 'Freya', 'Emily', 'Grace', 'Ella', 'Poppy', 'Sophie', 'Charlotte']
  },
  deu: {
    m: ['Lukas', 'Leon', 'Paul', 'Felix', 'Jonas', 'Finn', 'Noah', 'Ben', 'Elias', 'Maximilian', 'Niklas', 'Moritz'],
    f: ['Mia', 'Emma', 'Hannah', 'Emilia', 'Lina', 'Sophia', 'Lea', 'Clara', 'Lena', 'Anna', 'Marie', 'Johanna']
  },
  can: {
    m: ['Liam', 'Noah', 'Benjamin', 'Lucas', 'William', 'Jack', 'Logan', 'Owen', 'Nathan', 'Ethan', 'Gabriel', 'Jacob'],
    f: ['Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Chloe', 'Avery', 'Mila', 'Abigail', 'Ella', 'Maya', 'Zoe']
  },
  aus: {
    m: ['Oliver', 'Noah', 'Jack', 'William', 'Henry', 'Charlie', 'Thomas', 'Lucas', 'James', 'Leo', 'Hudson', 'Lachlan'],
    f: ['Charlotte', 'Olivia', 'Amelia', 'Isla', 'Mia', 'Ava', 'Grace', 'Harper', 'Willow', 'Matilda', 'Ella', 'Ruby']
  },
  nld: {
    m: ['Daan', 'Sem', 'Lucas', 'Milan', 'Levi', 'Finn', 'Luuk', 'Mees', 'Bram', 'Jesse', 'Thijs', 'Lars'],
    f: ['Emma', 'Julia', 'Mila', 'Tess', 'Sophie', 'Sara', 'Nora', 'Yara', 'Lotte', 'Eva', 'Evi', 'Liv']
  },
  fra: {
    m: ['Gabriel', 'Raphaël', 'Louis', 'Jules', 'Arthur', 'Adam', 'Lucas', 'Hugo', 'Léo', 'Nathan', 'Paul', 'Mathis'],
    f: ['Jade', 'Louise', 'Ambre', 'Emma', 'Alice', 'Rose', 'Anna', 'Mia', 'Lina', 'Chloé', 'Léa', 'Manon']
  },
  jpn: {
    m: ['Haruto', 'Yuto', 'Sota', 'Haruki', 'Ren', 'Yuki', 'Kaito', 'Riku', 'Takumi', 'Daiki', 'Hiroto', 'Itsuki'],
    f: ['Hina', 'Yui', 'Sakura', 'Aoi', 'Rin', 'Mei', 'Akari', 'Yuna', 'Himari', 'Mio', 'Koharu', 'Nanami']
  },
  ita: {
    m: ['Leonardo', 'Francesco', 'Alessandro', 'Lorenzo', 'Mattia', 'Andrea', 'Gabriele', 'Riccardo', 'Tommaso', 'Edoardo', 'Marco', 'Luca'],
    f: ['Sofia', 'Giulia', 'Aurora', 'Ginevra', 'Alice', 'Beatrice', 'Emma', 'Vittoria', 'Greta', 'Chiara', 'Martina', 'Francesca']
  },
  sgp: {
    m: ['Wei Ming', 'Jun Wei', 'Jia Hao', 'Daniel', 'Ryan', 'Ethan', 'Arjun', 'Aarav', 'Muhammad', 'Rizwan', 'Kai', 'Darren'],
    f: ['Jia Yi', 'Xin Yi', 'Nur Aisyah', 'Siti', 'Priya', 'Ananya', 'Chloe', 'Alyssa', 'Grace', 'Rachel', 'Mei', 'Hui Min']
  },
  bra: {
    m: ['Miguel', 'Arthur', 'Heitor', 'Bernardo', 'Davi', 'Gabriel', 'Pedro', 'Lucas', 'Matheus', 'Rafael', 'Enzo', 'Guilherme'],
    f: ['Helena', 'Alice', 'Laura', 'Maria', 'Valentina', 'Sophia', 'Isabella', 'Manuela', 'Júlia', 'Luiza', 'Beatriz', 'Camila']
  },
  ind: {
    m: ['Aarav', 'Arjun', 'Vihaan', 'Aditya', 'Ishaan', 'Rohan', 'Rahul', 'Dev', 'Karan', 'Ayaan', 'Kabir', 'Krishna'],
    f: ['Aanya', 'Aadhya', 'Ananya', 'Diya', 'Isha', 'Priya', 'Kavya', 'Meera', 'Saanvi', 'Riya', 'Anika', 'Pooja']
  }
};


/* ============================================================
   4. COUNTRY-SPECIFIC RELATIONSHIP SETTINGS
   ============================================================
   These are game flavor and balancing profiles, not rules
   that every person in a country follows.
   ============================================================ */

const MARRIAGE_COUNTRY_PROFILES = {
  egy: {
    label: 'Egypt',
    currency: 'EGP',
    datingStyle: ['Family Introduction', 'Mutual Friends', 'University', 'Dating Apps'],
    engagementStyle: ['Family Gathering', 'Engagement Hall', 'Hotel Celebration'],
    weddingStyle: ['Family Wedding', 'Wedding Hall', 'Hotel Ballroom', 'Beach Resort'],
    familyInfluence: 0.85,
    weddingPressure: 0.85,
    housingPressure: 0.90,
    familyVisitFrequency: 0.85,
    typicalConcerns: ['Shabka', 'Mahr', 'Apartment', 'Furniture', 'Wedding Costs', 'Family Expectations'],
    activities: ['Nile Dinner', 'Alexandria Corniche Walk', 'Family Lunch', 'Café Date', 'Red Sea Trip'],
    notes: 'Family involvement and housing costs may strongly influence the relationship.'
  },
  usa: {
    label: 'United States',
    currency: 'USD',
    datingStyle: ['Dating Apps', 'Friends', 'Work', 'Social Events'],
    engagementStyle: ['Private Proposal', 'Engagement Party', 'Destination Celebration'],
    weddingStyle: ['Courthouse', 'Garden Wedding', 'Hotel Venue', 'Destination Wedding'],
    familyInfluence: 0.45,
    weddingPressure: 0.55,
    housingPressure: 0.85,
    familyVisitFrequency: 0.45,
    typicalConcerns: ['Rent', 'Student Loans', 'Health Insurance', 'Career Moves', 'Wedding Budget'],
    activities: ['Road Trip', 'Coffee Date', 'Concert', 'Camping Weekend', 'City Break'],
    notes: 'Housing, healthcare expenses, debt, and work-life balance can affect household plans.'
  },
  sau: {
    label: 'Saudi Arabia',
    currency: 'SAR',
    datingStyle: ['Family Introduction', 'Family Friends', 'Community Events'],
    engagementStyle: ['Family Gathering', 'Engagement Hall', 'Large Celebration'],
    weddingStyle: ['Family Celebration', 'Wedding Hall', 'Luxury Ballroom'],
    familyInfluence: 0.90,
    weddingPressure: 0.85,
    housingPressure: 0.75,
    familyVisitFrequency: 0.90,
    typicalConcerns: ['Family Approval', 'Housing', 'Wedding Budget', 'Work Location', 'Family Commitments'],
    activities: ['Restaurant Dinner', 'Desert Weekend', 'Shopping Trip', 'Family Gathering', 'Coastal Holiday'],
    notes: 'Family expectations, location, and personal values can shape relationship decisions.'
  },
  uae: {
    label: 'United Arab Emirates',
    currency: 'AED',
    datingStyle: ['Friends', 'Professional Events', 'Dating Apps', 'Family Introduction'],
    engagementStyle: ['Family Gathering', 'Hotel Celebration', 'Private Event'],
    weddingStyle: ['Hotel Ballroom', 'Resort Wedding', 'Family Celebration'],
    familyInfluence: 0.70,
    weddingPressure: 0.75,
    housingPressure: 0.95,
    familyVisitFrequency: 0.60,
    typicalConcerns: ['Rent', 'Living in Different Emirates', 'Career Ambition', 'Family Travel', 'Wedding Costs'],
    activities: ['Dubai Marina Dinner', 'Beach Day', 'Desert Safari', 'Abu Dhabi Weekend', 'Staycation'],
    notes: 'High housing costs and long commutes can become major relationship challenges.'
  },
  gbr: {
    label: 'United Kingdom',
    currency: 'GBP',
    datingStyle: ['Dating Apps', 'Friends', 'University', 'Work'],
    engagementStyle: ['Private Proposal', 'Pub Celebration', 'Family Party'],
    weddingStyle: ['Registry Office', 'Garden Wedding', 'Country House', 'Hotel Wedding'],
    familyInfluence: 0.50,
    weddingPressure: 0.55,
    housingPressure: 0.90,
    familyVisitFrequency: 0.50,
    typicalConcerns: ['Rent', 'Energy Bills', 'Commuting', 'Career Changes', 'Wedding Budget'],
    activities: ['Pub Dinner', 'Countryside Weekend', 'Museum Date', 'Football Match', 'Coastal Trip'],
    notes: 'Housing costs, commuting, and work demands may affect time together.'
  },
  deu: {
    label: 'Germany',
    currency: 'EUR',
    datingStyle: ['Friends', 'Dating Apps', 'Work', 'Hobby Clubs'],
    engagementStyle: ['Private Proposal', 'Family Gathering', 'Small Celebration'],
    weddingStyle: ['Registry Office', 'Garden Wedding', 'Restaurant Reception', 'Castle Venue'],
    familyInfluence: 0.45,
    weddingPressure: 0.45,
    housingPressure: 0.75,
    familyVisitFrequency: 0.45,
    typicalConcerns: ['Apartment Search', 'Work-Life Balance', 'Relocation', 'Savings', 'Family Planning'],
    activities: ['Cycling Trip', 'Christmas Market', 'Hiking', 'Café Date', 'Weekend Train Trip'],
    notes: 'Relocation, apartment searches, and balancing work with personal life may matter.'
  },
  can: {
    label: 'Canada',
    currency: 'CAD',
    datingStyle: ['Dating Apps', 'Friends', 'University', 'Work'],
    engagementStyle: ['Private Proposal', 'Family Dinner', 'Engagement Party'],
    weddingStyle: ['Garden Wedding', 'Small Ceremony', 'Hotel Venue', 'Destination Wedding'],
    familyInfluence: 0.50,
    weddingPressure: 0.50,
    housingPressure: 0.95,
    familyVisitFrequency: 0.50,
    typicalConcerns: ['Housing', 'Winter Expenses', 'Immigration Paperwork', 'Long-Distance Family', 'Childcare'],
    activities: ['Lake Weekend', 'Hiking', 'Ice Skating', 'Café Date', 'Road Trip'],
    notes: 'Housing affordability, winter costs, and distance from relatives can create pressure.'
  },
  aus: {
    label: 'Australia',
    currency: 'AUD',
    datingStyle: ['Dating Apps', 'Friends', 'Work', 'Sports Clubs'],
    engagementStyle: ['Beach Proposal', 'Family Party', 'Private Dinner'],
    weddingStyle: ['Beach Wedding', 'Garden Venue', 'City Venue', 'Country Wedding'],
    familyInfluence: 0.45,
    weddingPressure: 0.50,
    housingPressure: 0.90,
    familyVisitFrequency: 0.45,
    typicalConcerns: ['Rent', 'Mortgage', 'Long Commutes', 'Career Relocation', 'Family Distance'],
    activities: ['Beach Day', 'Barbecue', 'National Park Trip', 'Brunch', 'Coastal Road Trip'],
    notes: 'Housing, distance, and work schedules can affect relationship stability.'
  },
  nld: {
    label: 'Netherlands',
    currency: 'EUR',
    datingStyle: ['Dating Apps', 'Friends', 'Work', 'Hobby Clubs'],
    engagementStyle: ['Private Proposal', 'Dinner with Friends', 'Family Gathering'],
    weddingStyle: ['Town Hall', 'Garden Wedding', 'Restaurant Reception', 'Country Venue'],
    familyInfluence: 0.40,
    weddingPressure: 0.40,
    housingPressure: 0.90,
    familyVisitFrequency: 0.40,
    typicalConcerns: ['Housing', 'Cycling Commute', 'Work-Life Balance', 'Savings', 'Childcare'],
    activities: ['Canal Walk', 'Cycling Date', 'Museum Visit', 'Weekend Train Trip', 'Coffee Date'],
    notes: 'Housing availability, shared responsibilities, and personal independence may matter.'
  },
  fra: {
    label: 'France',
    currency: 'EUR',
    datingStyle: ['Friends', 'Dating Apps', 'Work', 'Social Events'],
    engagementStyle: ['Private Dinner', 'Family Gathering', 'Engagement Party'],
    weddingStyle: ['Town Hall', 'Garden Reception', 'Château Venue', 'Restaurant Wedding'],
    familyInfluence: 0.50,
    weddingPressure: 0.55,
    housingPressure: 0.80,
    familyVisitFrequency: 0.50,
    typicalConcerns: ['Housing', 'Work Schedules', 'Family Time', 'Wedding Costs', 'Relocation'],
    activities: ['Bakery Breakfast', 'Museum Date', 'Picnic', 'Coastal Weekend', 'Restaurant Dinner'],
    notes: 'Lifestyle preferences, work schedules, and family expectations can influence plans.'
  },
  jpn: {
    label: 'Japan',
    currency: 'JPY',
    datingStyle: ['Friends', 'Dating Apps', 'University', 'Work'],
    engagementStyle: ['Private Proposal', 'Family Meeting', 'Small Celebration'],
    weddingStyle: ['Hotel Wedding', 'Traditional Ceremony', 'Restaurant Reception', 'Small Wedding'],
    familyInfluence: 0.65,
    weddingPressure: 0.60,
    housingPressure: 0.70,
    familyVisitFrequency: 0.55,
    typicalConcerns: ['Work Hours', 'Commuting', 'Housing Size', 'Family Planning', 'Career Timing'],
    activities: ['Ramen Date', 'Karaoke', 'Cherry Blossom Walk', 'Hot Spring Trip', 'Train Journey'],
    notes: 'Long work hours, commuting, and balancing career and family life can become challenges.'
  },
  ita: {
    label: 'Italy',
    currency: 'EUR',
    datingStyle: ['Friends', 'Family Friends', 'Dating Apps', 'Social Events'],
    engagementStyle: ['Family Dinner', 'Private Proposal', 'Engagement Party'],
    weddingStyle: ['Church or Civil Ceremony', 'Villa Wedding', 'Restaurant Reception', 'Coastal Venue'],
    familyInfluence: 0.70,
    weddingPressure: 0.70,
    housingPressure: 0.65,
    familyVisitFrequency: 0.75,
    typicalConcerns: ['Family Expectations', 'Housing', 'Career Stability', 'Wedding Budget', 'Living Near Relatives'],
    activities: ['Pasta Dinner', 'Seaside Walk', 'Village Weekend', 'Coffee Date', 'Food Festival'],
    notes: 'Family relationships, regional differences, and career stability can influence decisions.'
  },
  sgp: {
    label: 'Singapore',
    currency: 'SGD',
    datingStyle: ['Dating Apps', 'Friends', 'Work', 'University'],
    engagementStyle: ['Family Dinner', 'Private Proposal', 'Hotel Celebration'],
    weddingStyle: ['Civil Ceremony', 'Hotel Ballroom', 'Restaurant Reception', 'Small Family Wedding'],
    familyInfluence: 0.65,
    weddingPressure: 0.60,
    housingPressure: 0.90,
    familyVisitFrequency: 0.65,
    typicalConcerns: ['Housing Eligibility', 'Cost of Living', 'Career Competition', 'Family Duties', 'Childcare'],
    activities: ['Hawker Centre Dinner', 'Gardens Walk', 'Sentosa Day', 'Night Safari', 'City Staycation'],
    notes: 'Housing, work pressure, and family obligations may affect future plans.'
  },
  bra: {
    label: 'Brazil',
    currency: 'BRL',
    datingStyle: ['Friends', 'Dating Apps', 'Social Events', 'Work'],
    engagementStyle: ['Family Party', 'Restaurant Dinner', 'Engagement Celebration'],
    weddingStyle: ['Beach Wedding', 'Garden Wedding', 'Church or Civil Ceremony', 'Large Reception'],
    familyInfluence: 0.65,
    weddingPressure: 0.65,
    housingPressure: 0.70,
    familyVisitFrequency: 0.70,
    typicalConcerns: ['Family Support', 'Income Stability', 'Housing', 'Travel Safety', 'Wedding Budget'],
    activities: ['Beach Day', 'Barbecue', 'Music Festival', 'Football Match', 'Weekend Trip'],
    notes: 'Family support, finances, and lifestyle preferences may affect relationship decisions.'
  },
  ind: {
    label: 'India',
    currency: 'INR',
    datingStyle: ['Family Introduction', 'Friends', 'University', 'Dating Apps'],
    engagementStyle: ['Family Gathering', 'Engagement Ceremony', 'Large Celebration'],
    weddingStyle: ['Traditional Ceremony', 'Hotel Wedding', 'Garden Venue', 'Small Civil Wedding'],
    familyInfluence: 0.90,
    weddingPressure: 0.90,
    housingPressure: 0.65,
    familyVisitFrequency: 0.90,
    typicalConcerns: ['Family Approval', 'Wedding Budget', 'Career Plans', 'Living Arrangements', 'Family Responsibilities'],
    activities: ['Street Food Date', 'Festival Visit', 'Restaurant Dinner', 'Family Celebration', 'Weekend Trip'],
    notes: 'Family involvement, regional traditions, and personal preferences vary widely between households.'
  }
};


/* ============================================================
   5. SHABKA — BRIDE'S GOLD / JEWELLERY
   Base amounts are EGP game-balancing values.
   ============================================================ */

const MARRIAGE_SHABKA_TIERS = [
  {
    id: 'budget',
    label: 'Simple Gold Ring',
    grams: 8,
    costEGP: 40000,
    desc: 'A simple 21K gold ring.'
  },
  {
    id: 'standard',
    label: 'Standard Gold Set',
    grams: 25,
    costEGP: 120000,
    desc: 'A gold set with a necklace, bracelet, and ring.'
  },
  {
    id: 'elite',
    label: 'Full Gold Set',
    grams: 45,
    costEGP: 220000,
    desc: 'A larger gold set and a more elaborate ring.'
  },
  {
    id: 'luxury',
    label: 'Luxury Gold and Diamond Set',
    grams: 80,
    costEGP: 450000,
    desc: 'A luxury jewellery set.'
  },
  {
    id: 'heirloom',
    label: 'Family Heirloom',
    grams: 20,
    costEGP: 60000,
    desc: 'A family-owned piece with sentimental value.'
  },
  {
    id: 'custom',
    label: 'Custom Jewellery',
    grams: 35,
    costEGP: 180000,
    desc: 'Jewellery designed to suit your partner’s taste.'
  }
];

window.MARRIAGE_COUNTRY_MULT = {
  egy: 1.0, sau: 2.0, uae: 2.0,
  usa: 15.0, gbr: 10.0, deu: 8.0, can: 12.0, aus: 12.0, nld: 8.0, fra: 8.0, jpn: 8.0, ita: 6.0
};
/* ============================================================
   6. MAHR / DEFERRED DOWRY
   ============================================================ */

const MARRIAGE_MAHR_TIERS = [
  {
    id: 'budget',
    label: 'Symbolic Mahr',
    costEGP: 30000,
    desc: 'A modest agreed amount.'
  },
  {
    id: 'standard',
    label: 'Standard Mahr',
    costEGP: 100000,
    desc: 'A moderate agreed amount.'
  },
  {
    id: 'elite',
    label: 'Substantial Mahr',
    costEGP: 300000,
    desc: 'A larger financial commitment.'
  },
  {
    id: 'luxury',
    label: 'High Mahr',
    costEGP: 800000,
    desc: 'A high-value agreement.'
  },
  {
    id: 'negotiated',
    label: 'Negotiated Mahr',
    costEGP: 0,
    desc: 'The amount is negotiated with your partner and family.'
  },
  {
    id: 'assets',
    label: 'Mahr with an Asset',
    costEGP: 250000,
    desc: 'A monetary amount combined with an agreed asset.'
  }
];


/* ============================================================
   7. ENGAGEMENT CELEBRATION
   ============================================================ */

const MARRIAGE_ENGAGEMENT_PARTY_TIERS = [
  {
    id: 'family_home',
    label: 'Family Home Gathering',
    costEGP: 30000,
    social: 2,
    guests: 20
  },
  {
    id: 'small_hall',
    label: 'Small Hall',
    costEGP: 80000,
    social: 5,
    guests: 50
  },
  {
    id: 'nice_hall',
    label: 'Celebration Hall',
    costEGP: 180000,
    social: 10,
    guests: 150
  },
  {
    id: 'hotel',
    label: 'Hotel Ballroom',
    costEGP: 400000,
    social: 18,
    guests: 300
  },
  {
    id: 'private_dinner',
    label: 'Private Engagement Dinner',
    costEGP: 50000,
    social: 4,
    guests: 15
  },
  {
    id: 'destination',
    label: 'Destination Engagement',
    costEGP: 650000,
    social: 20,
    guests: 80
  },
  {
    id: 'none',
    label: 'No Engagement Party',
    costEGP: 0,
    social: 0,
    guests: 0
  }
];


/* ============================================================
   8. PROPOSAL OPTIONS
   ============================================================ */

const MARRIAGE_PROPOSAL_OPTIONS = [
  {
    id: 'simple',
    label: 'Simple Private Proposal',
    costEGP: 1000,
    romance: 4,
    social: 0,
    desc: 'A quiet, personal moment.'
  },
  {
    id: 'restaurant',
    label: 'Restaurant Proposal',
    costEGP: 6000,
    romance: 6,
    social: 2,
    desc: 'A planned dinner at a favourite restaurant.'
  },
  {
    id: 'family',
    label: 'Family-Attended Proposal',
    costEGP: 10000,
    romance: 3,
    social: 5,
    desc: 'A formal proposal with family present.'
  },
  {
    id: 'trip',
    label: 'Proposal During a Trip',
    costEGP: 35000,
    romance: 10,
    social: 3,
    desc: 'A memorable proposal during a short holiday.'
  },
  {
    id: 'luxury',
    label: 'Luxury Proposal',
    costEGP: 120000,
    romance: 12,
    social: 8,
    desc: 'A highly planned proposal with premium details.'
  },
  {
    id: 'personal',
    label: 'Personalised Proposal',
    costEGP: 8000,
    romance: 9,
    social: 1,
    desc: 'A proposal built around your partner’s interests.'
  }
];


/* ============================================================
   9. WEDDING VENUES
   ============================================================ */

const MARRIAGE_WEDDING_VENUES = [
  {
    id: 'family_home',
    label: 'Family Home / Small Courtyard',
    baseCostEGP: 300000,
    social: 3,
    stress: 2
  },
  {
    id: 'local_hall',
    label: 'Local Wedding Hall',
    baseCostEGP: 700000,
    social: 8,
    stress: 4
  },
  {
    id: 'hotel_4star',
    label: 'Four-Star Hotel Ballroom',
    baseCostEGP: 1500000,
    social: 15,
    stress: 5
  },
  {
    id: 'hotel_5star',
    label: 'Five-Star Hotel Ballroom',
    baseCostEGP: 3500000,
    social: 25,
    stress: 7
  },
  {
    id: 'resort',
    label: 'Beach Resort Wedding',
    baseCostEGP: 6000000,
    social: 30,
    stress: 8
  },
  {
    id: 'garden',
    label: 'Garden Wedding',
    baseCostEGP: 1100000,
    social: 10,
    stress: 4
  },
  {
    id: 'destination',
    label: 'Destination Wedding Abroad',
    baseCostEGP: 9000000,
    social: 35,
    stress: 9
  },
  {
    id: 'registry',
    label: 'Small Civil Ceremony',
    baseCostEGP: 80000,
    social: 1,
    stress: 1
  },
  {
    id: 'restaurant',
    label: 'Restaurant Reception',
    baseCostEGP: 450000,
    social: 5,
    stress: 3
  },
  {
    id: 'traditional',
    label: 'Traditional Cultural Ceremony',
    baseCostEGP: 1200000,
    social: 12,
    stress: 6
  },
  {
    id: 'elopement',
    label: 'Private Elopement',
    baseCostEGP: 50000,
    social: 0,
    stress: 1
  }
];


/* ============================================================
   10. GUEST COUNT
   ============================================================ */

const MARRIAGE_GUEST_COUNTS = [
  { id: 'tiny', label: '20 guests', guests: 20 },
  { id: 'small', label: '100 guests', guests: 100 },
  { id: 'medium', label: '200 guests', guests: 200 },
  { id: 'large', label: '350 guests', guests: 350 },
  { id: 'huge', label: '500 guests', guests: 500 },
  { id: 'massive', label: '800 guests', guests: 800 }
];


/* ============================================================
   11. CATERING
   ============================================================ */

const MARRIAGE_CATERING_TIERS = [
  {
    id: 'basic',
    label: 'Basic Buffet',
    perGuestEGP: 250,
    social: 0
  },
  {
    id: 'standard',
    label: 'Standard Dinner',
    perGuestEGP: 500,
    social: 2
  },
  {
    id: 'premium',
    label: 'Premium Dining',
    perGuestEGP: 900,
    social: 5
  },
  {
    id: 'luxury',
    label: 'Luxury Open Buffet',
    perGuestEGP: 1500,
    social: 8
  },
  {
    id: 'family',
    label: 'Family-Style Meal',
    perGuestEGP: 350,
    social: 2
  },
  {
    id: 'cocktail',
    label: 'Light Reception',
    perGuestEGP: 180,
    social: 1
  },
  {
    id: 'custom',
    label: 'Custom Menu',
    perGuestEGP: 1100,
    social: 6
  }
];


/* ============================================================
   12. PHOTOGRAPHY AND VIDEOGRAPHY
   ============================================================ */

const MARRIAGE_PHOTOGRAPHY_TIERS = [
  {
    id: 'basic',
    label: 'Basic Photo Package',
    costEGP: 25000,
    social: 1
  },
  {
    id: 'professional',
    label: 'Professional Photography Team',
    costEGP: 90000,
    social: 4
  },
  {
    id: 'cinematic',
    label: 'Cinematic Video and Drone',
    costEGP: 250000,
    social: 7
  },
  {
    id: 'documentary',
    label: 'Documentary-Style Coverage',
    costEGP: 120000,
    social: 4
  },
  {
    id: 'premium_album',
    label: 'Premium Album and Video',
    costEGP: 170000,
    social: 5
  },
  {
    id: 'none',
    label: 'No Professional Photography',
    costEGP: 0,
    social: 0
  }
];


/* ============================================================
   13. BRIDAL DRESS / WEDDING ATTIRE
   ============================================================ */

const MARRIAGE_DRESS_TIERS = [
  {
    id: 'rent',
    label: 'Rented Dress / Suit',
    costEGP: 15000,
    social: 1
  },
  {
    id: 'offrack',
    label: 'Off-the-Rack Designer',
    costEGP: 45000,
    social: 3
  },
  {
    id: 'designer',
    label: 'Made-to-Order Designer',
    costEGP: 120000,
    social: 6
  },
  {
    id: 'couture',
    label: 'Couture / Custom Attire',
    costEGP: 350000,
    social: 10
  },
  {
    id: 'traditional',
    label: 'Traditional Attire',
    costEGP: 50000,
    social: 4
  },
  {
    id: 'simple',
    label: 'Simple Ceremony Outfit',
    costEGP: 8000,
    social: 1
  },
  {
    id: 'multiple',
    label: 'Multiple Outfit Changes',
    costEGP: 180000,
    social: 8
  }
];


/* ============================================================
   14. FLOWERS, DECORATION, AND MUSIC
   ============================================================ */

const MARRIAGE_DECORATION_TIERS = [
  {
    id: 'minimal',
    label: 'Minimal Decoration',
    costEGP: 10000,
    social: 1
  },
  {
    id: 'flowers',
    label: 'Flowers and Table Decor',
    costEGP: 45000,
    social: 3
  },
  {
    id: 'themed',
    label: 'Themed Wedding Design',
    costEGP: 120000,
    social: 6
  },
  {
    id: 'luxury',
    label: 'Luxury Floral Installation',
    costEGP: 350000,
    social: 10
  }
];

const MARRIAGE_MUSIC_OPTIONS = [
  {
    id: 'playlist',
    label: 'Personal Playlist',
    costEGP: 0,
    social: 0
  },
  {
    id: 'dj',
    label: 'DJ',
    costEGP: 18000,
    social: 2
  },
  {
    id: 'live_band',
    label: 'Live Band',
    costEGP: 80000,
    social: 5
  },
  {
    id: 'traditional_band',
    label: 'Traditional Music Group',
    costEGP: 50000,
    social: 5
  },
  {
    id: 'celebrity',
    label: 'Celebrity Performer',
    costEGP: 500000,
    social: 12
  }
];


/* ============================================================
   15. HONEYMOON
   ============================================================ */

const MARRIAGE_HONEYMOON_TIERS = [
  {
    id: 'none',
    label: 'No Honeymoon',
    costEGP: 0,
    happiness: 0
  },
  {
    id: 'staycation',
    label: 'Staycation in Your City',
    costEGP: 25000,
    happiness: 3
  },
  {
    id: 'egypt_beach',
    label: 'Beach Honeymoon in Egypt',
    costEGP: 90000,
    happiness: 6
  },
  {
    id: 'egypt_culture',
    label: 'Cultural Trip in Egypt',
    costEGP: 60000,
    happiness: 5
  },
  {
    id: 'regional',
    label: 'Regional International Trip',
    costEGP: 180000,
    happiness: 8
  },
  {
    id: 'europe',
    label: 'European Honeymoon',
    costEGP: 350000,
    happiness: 12
  },
  {
    id: 'asia',
    label: 'Asian Honeymoon',
    costEGP: 420000,
    happiness: 13
  },
  {
    id: 'luxury',
    label: 'Luxury World Tour',
    costEGP: 1200000,
    happiness: 20
  },
  {
    id: 'adventure',
    label: 'Adventure Honeymoon',
    costEGP: 280000,
    happiness: 12
  },
  {
    id: 'road_trip',
    label: 'Road Trip',
    costEGP: 70000,
    happiness: 7
  }
];


/* ============================================================
   16. WEDDING PLANNING SUPPORT
   ============================================================ */

const MARRIAGE_PLANNER_OPTIONS = [
  {
    id: 'self',
    label: 'Plan Everything Yourself',
    costEGP: 0,
    stress: 8,
    desc: 'Saves money but requires time and organisation.'
  },
  {
    id: 'day_of',
    label: 'Day-of Coordinator',
    costEGP: 35000,
    stress: 4,
    desc: 'Someone coordinates the wedding day.'
  },
  {
    id: 'partial',
    label: 'Partial Wedding Planner',
    costEGP: 90000,
    stress: 3,
    desc: 'Professional help with selected arrangements.'
  },
  {
    id: 'full',
    label: 'Full-Service Wedding Planner',
    costEGP: 220000,
    stress: 1,
    desc: 'A planner manages most arrangements.'
  },
  {
    id: 'luxury',
    label: 'Luxury Wedding Planning Team',
    costEGP: 500000,
    stress: 0,
    desc: 'Premium planning with extensive coordination.'
  }
];


/* ============================================================
   17. HOUSEHOLD FINANCE MODELS
   ============================================================ */

const MARRIAGE_FINANCE_MODELS = [
  {
    id: 'male_provider',
    label: 'One Partner Pays the Bills',
    desc: 'One partner covers the main household expenses.'
  },
  {
    id: 'egalitarian',
    label: '50/50 Split',
    desc: 'Both partners contribute equally to shared expenses.'
  },
  {
    id: 'proportional',
    label: 'Income-Proportional Split',
    desc: 'Each partner contributes according to their income.'
  },
  {
    id: 'princess',
    label: 'One Partner Covers Everything Plus Allowance',
    desc: 'One partner pays the bills and gives the other a personal allowance.'
  },
  {
    id: 'traditional_wife',
    label: 'Reverse Provider Arrangement',
    desc: 'One partner earns most of the money while the other manages the home.'
  },
  {
    id: 'joint_account',
    label: 'Joint Account',
    desc: 'Both incomes go into a shared account for household expenses.'
  },
  {
    id: 'separate_accounts',
    label: 'Separate Accounts',
    desc: 'Each partner manages personal money and contributes to agreed expenses.'
  },
  {
    id: 'shared_savings',
    label: 'Shared Savings Goal',
    desc: 'Both contribute toward a home, business, or future family goal.'
  },
  {
    id: 'one_earner',
    label: 'Single-Income Household',
    desc: 'One partner earns while the other focuses on home or family responsibilities.'
  },
  {
    id: 'custom',
    label: 'Custom Arrangement',
    desc: 'Partners negotiate their own mix of shared and individual expenses.'
  }
];


/* ============================================================
   18. PRENUP AND PROPERTY AGREEMENTS
   ============================================================ */

const MARRIAGE_PRENUP_OPTIONS = [
  {
    id: 'none',
    label: 'No Separate Agreement',
    legalCostEGP: 0,
    desc: 'Financial outcomes follow the applicable legal framework.'
  },
  {
    id: 'partial',
    label: 'Partial Financial Agreement',
    legalCostEGP: 15000,
    desc: 'Records selected assets, debts, or financial expectations.'
  },
  {
    id: 'full',
    label: 'Comprehensive Financial Agreement',
    legalCostEGP: 40000,
    desc: 'Attempts to clarify how specified assets and debts should be handled.'
  },
  {
    id: 'property',
    label: 'Property Ownership Agreement',
    legalCostEGP: 25000,
    desc: 'Documents who owns a property and how contributions are recorded.'
  },
  {
    id: 'business',
    label: 'Business Ownership Agreement',
    legalCostEGP: 50000,
    desc: 'Clarifies the intended treatment of a business owned by either partner.'
  },
  {
    id: 'financial_counselling',
    label: 'Financial Counselling Before Marriage',
    legalCostEGP: 8000,
    desc: 'Partners discuss debts, budgets, savings, and financial expectations.'
  }
];


/* ============================================================
   19. HOME SETUP AFTER MARRIAGE
   ============================================================ */

const MARRIAGE_HOME_OPTIONS = [
  {
    id: 'family_home',
    label: 'Live with Family',
    setupCostEGP: 15000,
    monthlyCostEGP: 2500,
    privacy: 1,
    familySupport: 9,
    desc: 'Lower expenses, but less privacy and more family involvement.'
  },
  {
    id: 'small_rent',
    label: 'Small Rented Apartment',
    setupCostEGP: 60000,
    monthlyCostEGP: 12000,
    privacy: 7,
    familySupport: 4,
    desc: 'An independent home with manageable space and expenses.'
  },
  {
    id: 'large_rent',
    label: 'Large Rented Apartment',
    setupCostEGP: 120000,
    monthlyCostEGP: 22000,
    privacy: 8,
    familySupport: 4,
    desc: 'More space, but higher recurring expenses.'
  },
  {
    id: 'owned_apartment',
    label: 'Owned Apartment',
    setupCostEGP: 1500000,
    monthlyCostEGP: 5000,
    privacy: 8,
    familySupport: 5,
    desc: 'A major upfront purchase with ongoing maintenance costs.'
  },
  {
    id: 'mortgage',
    label: 'Mortgage / Home Financing',
    setupCostEGP: 250000,
    monthlyCostEGP: 25000,
    privacy: 8,
    familySupport: 4,
    desc: 'A down payment followed by long-term monthly payments.'
  },
  {
    id: 'compound',
    label: 'Gated Compound',
    setupCostEGP: 300000,
    monthlyCostEGP: 30000,
    privacy: 9,
    familySupport: 3,
    desc: 'More amenities and privacy, with higher housing expenses.'
  },
  {
    id: 'relocate',
    label: 'Move to Another City',
    setupCostEGP: 100000,
    monthlyCostEGP: 18000,
    privacy: 8,
    familySupport: 2,
    desc: 'A fresh start that may increase distance from family and friends.'
  },
  {
    id: 'abroad',
    label: 'Move Abroad Together',
    setupCostEGP: 350000,
    monthlyCostEGP: 45000,
    privacy: 8,
    familySupport: 1,
    desc: 'A new country, new opportunities, and relocation challenges.'
  }
];


/* ============================================================
   20. FAMILY-PLANNING OPTIONS
   ============================================================ */

const MARRIAGE_FAMILY_PLANNING_OPTIONS = [
  {
    id: 'wait',
    label: 'Wait Before Having Children',
    costEGP: 0,
    relationship: 1,
    desc: 'Focus on the relationship, career, savings, and housing first.'
  },
  {
    id: 'one_child',
    label: 'Plan for One Child',
    costEGP: 0,
    relationship: 1,
    desc: 'Discuss timing, childcare, and finances before starting a family.'
  },
  {
    id: 'two_children',
    label: 'Plan for Two Children',
    costEGP: 0,
    relationship: 1,
    desc: 'Plan for a larger household and longer-term expenses.'
  },
  {
    id: 'large_family',
    label: 'Plan for a Larger Family',
    costEGP: 0,
    relationship: 0,
    desc: 'A larger family may require more space, time, and income.'
  },
  {
    id: 'career_first',
    label: 'Prioritise Career First',
    costEGP: 0,
    relationship: 0,
    desc: 'Delay major family decisions while one or both partners advance their careers.'
  },
  {
    id: 'financial_goal',
    label: 'Wait Until a Savings Goal',
    costEGP: 0,
    relationship: 1,
    desc: 'Agree on a savings target before expanding the family.'
  },
  {
    id: 'undecided',
    label: 'Discuss Again Later',
    costEGP: 0,
    relationship: 0,
    desc: 'Neither partner has to make an immediate decision.'
  }
];


/* ============================================================
   21. CHILDCARE OPTIONS
   ============================================================ */

const MARRIAGE_CHILDCARE_OPTIONS = [
  {
    id: 'family_help',
    label: 'Help from Relatives',
    monthlyCostEGP: 1500,
    convenience: 5,
    familyInvolvement: 9
  },
  {
    id: 'public_nursery',
    label: 'Public / Lower-Cost Nursery',
    monthlyCostEGP: 4000,
    convenience: 5,
    familyInvolvement: 2
  },
  {
    id: 'private_nursery',
    label: 'Private Nursery',
    monthlyCostEGP: 10000,
    convenience: 7,
    familyInvolvement: 1
  },
  {
    id: 'nanny',
    label: 'Nanny at Home',
    monthlyCostEGP: 18000,
    convenience: 8,
    familyInvolvement: 1
  },
  {
    id: 'stay_home_parent',
    label: 'One Parent Stays Home',
    monthlyCostEGP: 3000,
    convenience: 5,
    familyInvolvement: 3
  },
  {
    id: 'shared_care',
    label: 'Parents Share Childcare',
    monthlyCostEGP: 2500,
    convenience: 6,
    familyInvolvement: 1
  }
];


/* ============================================================
   22. RELATIONSHIP ACTIVITIES
   ============================================================ */

const MARRIAGE_RELATIONSHIP_ACTIVITIES = [
  {
    id: 'home_cooked_dinner',
    label: 'Cook Dinner Together',
    costEGP: 400,
    bond: 3,
    happiness: 2,
    time: 'evening'
  },
  {
    id: 'cafe',
    label: 'Go to a Café',
    costEGP: 600,
    bond: 2,
    happiness: 2,
    time: 'short'
  },
  {
    id: 'restaurant',
    label: 'Restaurant Date',
    costEGP: 1800,
    bond: 4,
    happiness: 4,
    time: 'evening'
  },
  {
    id: 'movie',
    label: 'Movie Night',
    costEGP: 900,
    bond: 2,
    happiness: 3,
    time: 'evening'
  },
  {
    id: 'walk',
    label: 'Long Walk and Conversation',
    costEGP: 0,
    bond: 3,
    happiness: 2,
    time: 'short'
  },
  {
    id: 'gift',
    label: 'Buy a Thoughtful Gift',
    costEGP: 2500,
    bond: 3,
    happiness: 4,
    time: 'short'
  },
  {
    id: 'weekend',
    label: 'Weekend Away',
    costEGP: 12000,
    bond: 6,
    happiness: 7,
    time: 'weekend'
  },
  {
    id: 'family_visit',
    label: 'Visit Family Together',
    costEGP: 1000,
    bond: 1,
    happiness: 1,
    time: 'half_day'
  },
  {
    id: 'shared_hobby',
    label: 'Try a Shared Hobby',
    costEGP: 1500,
    bond: 4,
    happiness: 3,
    time: 'half_day'
  },
  {
    id: 'financial_talk',
    label: 'Discuss Your Financial Goals',
    costEGP: 0,
    bond: 2,
    happiness: 0,
    time: 'evening'
  },
  {
    id: 'technology_free',
    label: 'Evening Without Phones',
    costEGP: 0,
    bond: 3,
    happiness: 2,
    time: 'evening'
  },
  {
    id: 'counselling',
    label: 'Couples Counselling',
    costEGP: 5000,
    bond: 4,
    happiness: 1,
    time: 'appointment'
  }
];


/* ============================================================
   23. CONFLICT TOPICS
   ============================================================ */

const MARRIAGE_CONFLICT_TOPICS = [
  {
    id: 'money',
    label: 'Money and Spending',
    severity: 4,
    resolution: 'Create a shared budget and agree on personal spending.'
  },
  {
    id: 'inlaws',
    label: 'In-Law Boundaries',
    severity: 4,
    resolution: 'Agree on boundaries and how visits and requests are handled.'
  },
  {
    id: 'career',
    label: 'Career Versus Family Time',
    severity: 3,
    resolution: 'Discuss schedules and protect time together.'
  },
  {
    id: 'children',
    label: 'Whether to Have Children',
    severity: 5,
    resolution: 'Discuss values, timing, and concerns without pressuring either partner.'
  },
  {
    id: 'chores',
    label: 'Household Responsibilities',
    severity: 3,
    resolution: 'Divide tasks according to time, ability, and mutual agreement.'
  },
  {
    id: 'jealousy',
    label: 'Trust and Jealousy',
    severity: 4,
    resolution: 'Discuss specific concerns and establish reasonable boundaries.'
  },
  {
    id: 'relocation',
    label: 'Moving to Another City or Country',
    severity: 5,
    resolution: 'Compare work opportunities, finances, family ties, and personal goals.'
  },
  {
    id: 'privacy',
    label: 'Personal Space and Privacy',
    severity: 3,
    resolution: 'Agree on time alone, friendships, and privacy expectations.'
  },
  {
    id: 'religion',
    label: 'Religious or Personal Values',
    severity: 4,
    resolution: 'Discuss which differences can be respected and which require a decision.'
  },
  {
    id: 'social_life',
    label: 'Friends and Social Life',
    severity: 2,
    resolution: 'Find a balance between shared activities and independent friendships.'
  },
  {
    id: 'communication',
    label: 'Communication Problems',
    severity: 4,
    resolution: 'Set aside time to listen, clarify misunderstandings, and agree on next steps.'
  },
  {
    id: 'intimacy',
    label: 'Affection and Intimacy',
    severity: 4,
    resolution: 'Discuss needs and boundaries respectfully, without pressure.'
  }
];


/* ============================================================
   24. DIVORCE CAUSES
   ============================================================ */

const MARRIAGE_DIVORCE_CAUSES = [
  {
    id: 'cheating',
    label: 'Cheating / Affair',
    bondHit: 60,
    socialHit: 10
  },
  {
    id: 'financial',
    label: 'Financial Problems',
    bondHit: 30,
    socialHit: 3
  },
  {
    id: 'boredom',
    label: 'Grew Apart / Boredom',
    bondHit: 20,
    socialHit: 0
  },
  {
    id: 'inlaws',
    label: 'In-Law Interference',
    bondHit: 25,
    socialHit: 2
  },
  {
    id: 'abuse',
    label: 'Abuse',
    bondHit: 80,
    socialHit: 15
  },
  {
    id: 'mutual',
    label: 'Mutual Decision',
    bondHit: 15,
    socialHit: 0
  },
  {
    id: 'relocation',
    label: 'Long-Distance Separation',
    bondHit: 35,
    socialHit: 2
  },
  {
    id: 'career',
    label: 'Conflicting Career Goals',
    bondHit: 28,
    socialHit: 1
  },
  {
    id: 'trust',
    label: 'Broken Trust',
    bondHit: 45,
    socialHit: 5
  },
  {
    id: 'values',
    label: 'Incompatible Long-Term Values',
    bondHit: 40,
    socialHit: 2
  },
  {
    id: 'parenting',
    label: 'Parenting Disagreements',
    bondHit: 32,
    socialHit: 2
  },
  {
    id: 'neglect',
    label: 'Emotional Neglect',
    bondHit: 38,
    socialHit: 1
  }
];


/* ============================================================
   25. DIVORCE AND FAMILY-LAW GAME PROFILES
   ============================================================
   SIMPLIFIED GAME SETTINGS ONLY.
   Actual legal outcomes depend on jurisdiction and circumstances.
   ============================================================ */

const MARRIAGE_DIVORCE_LAWS = {
  egy: {
    label: 'Egyptian Law Simulation',
    courtFeeEGP: 50000,
    assetSplit: 'separate',
    alimonyYears: 1,
    childSupportPct: 0.30,
    motherCustodyUntil: 15,
    fatherPaysChildSupport: true,
    khulRequiresMahrReturn: true
  },
  usa: {
    label: 'United States Law Simulation',
    courtFeeEGP: 200000,
    assetSplit: '50_50',
    alimonyYears: 'duration',
    childSupportPct: 0.22,
    custody: 'joint',
    fatherPaysChildSupport: true
  },
  sau: {
    label: 'Saudi Arabia Law Simulation',
    courtFeeEGP: 30000,
    assetSplit: 'separate',
    alimonyYears: 0.5,
    childSupportPct: 0.25,
    motherCustodyUntil: 7,
    fatherPaysChildSupport: true
  },
  uae: {
    label: 'UAE Law Simulation',
    courtFeeEGP: 60000,
    assetSplit: 'separate',
    alimonyYears: 'duration',
    childSupportPct: 0.25,
    custody: 'court_determined',
    fatherPaysChildSupport: true
  },
  gbr: {
    label: 'United Kingdom Law Simulation',
    courtFeeEGP: 90000,
    assetSplit: 'court_determined',
    alimonyYears: 'duration',
    childSupportPct: 0.20,
    custody: 'child_welfare',
    fatherPaysChildSupport: true
  },
  deu: {
    label: 'Germany Law Simulation',
    courtFeeEGP: 100000,
    assetSplit: 'court_determined',
    alimonyYears: 'duration',
    childSupportPct: 0.20,
    custody: 'shared_parental_responsibility',
    fatherPaysChildSupport: true
  },
  can: {
    label: 'Canada Law Simulation',
    courtFeeEGP: 90000,
    assetSplit: 'court_determined',
    alimonyYears: 'duration',
    childSupportPct: 0.22,
    custody: 'child_welfare',
    fatherPaysChildSupport: true
  },
  aus: {
    label: 'Australia Law Simulation',
    courtFeeEGP: 95000,
    assetSplit: 'court_determined',
    alimonyYears: 'duration',
    childSupportPct: 0.20,
    custody: 'child_welfare',
    fatherPaysChildSupport: true
  },
  nld: {
    label: 'Netherlands Law Simulation',
    courtFeeEGP: 85000,
    assetSplit: 'community_or_agreement',
    alimonyYears: 'duration',
    childSupportPct: 0.20,
    custody: 'shared_parental_responsibility',
    fatherPaysChildSupport: true
  },
  fra: {
    label: 'France Law Simulation',
    courtFeeEGP: 85000,
    assetSplit: 'regime_or_agreement',
    alimonyYears: 'duration',
    childSupportPct: 0.20,
    custody: 'child_welfare',
    fatherPaysChildSupport: true
  },
  jpn: {
    label: 'Japan Law Simulation',
    courtFeeEGP: 70000,
    assetSplit: 'marital_property_rules',
    alimonyYears: 'duration',
    childSupportPct: 0.20,
    custody: 'court_or_agreement',
    fatherPaysChildSupport: true
  },
  ita: {
    label: 'Italy Law Simulation',
    courtFeeEGP: 80000,
    assetSplit: 'regime_or_agreement',
    alimonyYears: 'duration',
    childSupportPct: 0.20,
    custody: 'child_welfare',
    fatherPaysChildSupport: true
  },
  sgp: {
    label: 'Singapore Law Simulation',
    courtFeeEGP: 85000,
    assetSplit: 'court_determined',
    alimonyYears: 'duration',
    childSupportPct: 0.20,
    custody: 'child_welfare',
    fatherPaysChildSupport: true
  },
  bra: {
    label: 'Brazil Law Simulation',
    courtFeeEGP: 65000,
    assetSplit: 'regime_or_agreement',
    alimonyYears: 'duration',
    childSupportPct: 0.25,
    custody: 'child_welfare',
    fatherPaysChildSupport: true
  },
  ind: {
    label: 'India Law Simulation',
    courtFeeEGP: 50000,
    assetSplit: 'personal_law_or_agreement',
    alimonyYears: 'duration',
    childSupportPct: 0.25,
    custody: 'child_welfare',
    fatherPaysChildSupport: true
  }
};


/* ============================================================
   26. SEPARATION OPTIONS
   ============================================================ */

const MARRIAGE_SEPARATION_OPTIONS = [
  {
    id: 'talk',
    label: 'Have a Serious Conversation',
    costEGP: 0,
    bondEffect: 3,
    desc: 'Discuss the problem before making a major decision.'
  },
  {
    id: 'temporary',
    label: 'Take Temporary Space',
    costEGP: 5000,
    bondEffect: 0,
    desc: 'Spend some time apart and agree on what the break means.'
  },
  {
    id: 'counselling',
    label: 'Try Couples Counselling',
    costEGP: 15000,
    bondEffect: 5,
    desc: 'Seek help with communication and recurring conflict.'
  },
  {
    id: 'legal_advice',
    label: 'Seek Independent Legal Advice',
    costEGP: 25000,
    bondEffect: 0,
    desc: 'Understand rights, responsibilities, and possible next steps.'
  },
  {
    id: 'separate_home',
    label: 'Live Separately for a While',
    costEGP: 50000,
    bondEffect: 0,
    desc: 'Create physical space while deciding what happens next.'
  },
  {
    id: 'divorce',
    label: 'Begin Divorce Process',
    costEGP: 50000,
    bondEffect: -20,
    desc: 'Start the formal process of ending the marriage.'
  }
];


/* ============================================================
   27. YEARLY MARRIAGE EVENTS
   ============================================================ */

const MARRIAGE_YEAR_EVENTS = [
  {
    id: 'partner_wants_gift',
    weight: 15,
    title: 'Your Partner Hints at a Gift',
    text: 'Your partner keeps mentioning something they saw at the mall.',
    choice: true
  },
  {
    id: 'partner_wants_trip',
    weight: 10,
    title: 'Your Partner Wants a Vacation',
    text: 'Your partner says you both need a break and suggests a trip.',
    choice: true
  },
  {
    id: 'inlaws_visit',
    weight: 12,
    title: 'Family Is Visiting',
    text: 'A relative wants to stay with you for a week.',
    choice: true
  },
  {
    id: 'anniversary',
    weight: 10,
    title: 'Wedding Anniversary',
    text: 'Your anniversary is approaching. You need to decide how to celebrate.',
    choice: true
  },
  {
    id: 'partner_promotion',
    weight: 6,
    title: 'Your Partner Got Promoted',
    text: 'Your partner was promoted at work. Household income may improve.',
    choice: false
  },
  {
    id: 'partner_lost_job',
    weight: 4,
    title: 'Your Partner Lost Their Job',
    text: 'Your partner was laid off. You need to review your household budget.',
    choice: false
  },
  {
    id: 'partner_bond_warning',
    weight: 8,
    title: 'Your Partner Seems Distant',
    text: 'Conversations are getting shorter. Something may be bothering your partner.',
    choice: true
  },
  {
    id: 'partner_wants_child',
    weight: 8,
    title: 'Your Partner Wants a Child',
    text: 'Your partner brings up having a baby again.',
    choice: true,
    requiresNoChildren: true
  },
  {
    id: 'unexpected_bill',
    weight: 8,
    title: 'Unexpected Household Bill',
    text: 'A major repair or bill arrives at the worst possible time.',
    choice: true
  },
  {
    id: 'home_upgrade',
    weight: 5,
    title: 'Time for More Space?',
    text: 'You are running out of room and discuss moving to a larger home.',
    choice: true
  },
  {
    id: 'career_move',
    weight: 5,
    title: 'A Career Opportunity in Another City',
    text: 'Your partner receives an attractive offer in another city or country.',
    choice: true
  },
  {
    id: 'family_pressure',
    weight: 8,
    title: 'Family Expectations',
    text: 'Relatives are asking questions about your private plans.',
    choice: true
  },
  {
    id: 'forgotten_anniversary',
    weight: 4,
    title: 'You Forgot an Important Date',
    text: 'Your partner remembers an anniversary or meaningful date that you forgot.',
    choice: true
  },
  {
    id: 'shared_goal',
    weight: 6,
    title: 'A Shared Dream',
    text: 'Your partner wants to work toward a shared goal, such as buying a home.',
    choice: true
  },
  {
    id: 'partner_study',
    weight: 4,
    title: 'Your Partner Wants to Study',
    text: 'Your partner wants to return to education or take a professional course.',
    choice: true
  },
  {
    id: 'holiday_planning',
    weight: 7,
    title: 'Holiday Plans',
    text: 'You need to decide whether to spend the holiday with family or travel together.',
    choice: true
  },
  {
    id: 'household_chores',
    weight: 6,
    title: 'Household Responsibilities',
    text: 'One of you feels that the division of chores has become unfair.',
    choice: true
  },
  {
    id: 'old_friend',
    weight: 4,
    title: 'An Old Friend Reappears',
    text: 'An old friend contacts your partner, bringing up memories and questions.',
    choice: true
  },
  {
    id: 'financial_review',
    weight: 6,
    title: 'Annual Financial Review',
    text: 'You review savings, debt, spending, and your plans for the next year.',
    choice: true
  },
  {
    id: 'relationship_milestone',
    weight: 5,
    title: 'A Relationship Milestone',
    text: 'You realise how much has changed since you first met.',
    choice: true
  }
];


/* ============================================================
   28. ENGAGEMENT EVENTS
   ============================================================ */

const MARRIAGE_ENGAGEMENT_EVENTS = [
  {
    id: 'family_approves',
    weight: 10,
    title: 'Families Give Their Approval',
    text: 'Both families seem happy with the engagement.',
    choice: false
  },
  {
    id: 'family_disagreement',
    weight: 8,
    title: 'A Family Disagreement',
    text: 'Relatives disagree about the wedding arrangements.',
    choice: true
  },
  {
    id: 'budget_overrun',
    weight: 8,
    title: 'The Wedding Budget Is Growing',
    text: 'Several small upgrades have pushed the wedding costs higher.',
    choice: true
  },
  {
    id: 'venue_unavailable',
    weight: 5,
    title: 'Your Preferred Venue Is Unavailable',
    text: 'Your first-choice venue is already booked.',
    choice: true
  },
  {
    id: 'partner_nervous',
    weight: 7,
    title: 'Your Partner Feels Nervous',
    text: 'Your partner is excited but overwhelmed by the upcoming changes.',
    choice: true
  },
  {
    id: 'guest_list_dispute',
    weight: 6,
    title: 'The Guest List Debate',
    text: 'Your families want to invite more people than you planned.',
    choice: true
  },
  {
    id: 'job_change',
    weight: 4,
    title: 'A Job Change Before the Wedding',
    text: 'One of you may change jobs just as wedding expenses are due.',
    choice: true
  },
  {
    id: 'housing_decision',
    weight: 8,
    title: 'Where Will You Live?',
    text: 'You need to finalise your living arrangements before the wedding.',
    choice: true
  }
];


/* ============================================================
   29. WEDDING-DAY EVENTS
   ============================================================ */

const MARRIAGE_WEDDING_EVENTS = [
  {
    id: 'vendor_late',
    weight: 5,
    title: 'A Vendor Is Running Late',
    text: 'One of the wedding vendors has not arrived on time.',
    choice: true
  },
  {
    id: 'weather_change',
    weight: 5,
    title: 'Unexpected Weather',
    text: 'The weather is not what you expected for the celebration.',
    choice: true
  },
  {
    id: 'guest_conflict',
    weight: 4,
    title: 'Guests Start Arguing',
    text: 'Two guests have a disagreement during the celebration.',
    choice: true
  },
  {
    id: 'beautiful_moment',
    weight: 8,
    title: 'A Beautiful Moment',
    text: 'A small, unexpected moment becomes the highlight of your wedding.',
    choice: false
  },
  {
    id: 'budget_surprise',
    weight: 5,
    title: 'An Unexpected Extra Charge',
    text: 'A vendor requests payment for an extra service.',
    choice: true
  },
  {
    id: 'family_speech',
    weight: 6,
    title: 'A Heartfelt Speech',
    text: 'A relative gives a speech that means a lot to both of you.',
    choice: false
  }
];


/* ============================================================
   30. MARRIAGE ACHIEVEMENTS
   ============================================================ */

const MARRIAGE_ACHIEVEMENTS = [
  {
    id: 'first_relationship',
    label: 'First Serious Relationship',
    desc: 'Build your first serious relationship.'
  },
  {
    id: 'engaged',
    label: 'Engaged',
    desc: 'Get engaged to your partner.'
  },
  {
    id: 'married',
    label: 'Just Married',
    desc: 'Get married.'
  },
  {
    id: 'budget_wedding',
    label: 'Wedding on a Budget',
    desc: 'Arrange a wedding without overspending.'
  },
  {
    id: 'dream_wedding',
    label: 'Dream Wedding',
    desc: 'Plan a high-quality wedding celebration.'
  },
  {
    id: 'financial_planners',
    label: 'Financial Teamwork',
    desc: 'Agree on a household finance plan.'
  },
  {
    id: 'homeowners',
    label: 'A Place of Your Own',
    desc: 'Establish an independent household.'
  },
  {
    id: 'anniversary_5',
    label: 'Five Years Together',
    desc: 'Remain married for five years.'
  },
  {
    id: 'anniversary_10',
    label: 'A Decade Together',
    desc: 'Remain married for ten years.'
  },
  {
    id: 'anniversary_25',
    label: 'Silver Anniversary',
    desc: 'Remain married for twenty-five years.'
  },
  {
    id: 'family_planner',
    label: 'Planning the Future',
    desc: 'Discuss and record a family-planning decision.'
  },
  {
    id: 'conflict_resolved',
    label: 'Stronger Together',
    desc: 'Resolve a major relationship conflict.'
  },
  {
    id: 'international_couple',
    label: 'Two Worlds, One Home',
    desc: 'Build a relationship across countries or cultures.'
  },
  {
    id: 'shared_savings',
    label: 'Shared Financial Goal',
    desc: 'Reach a shared savings or housing milestone.'
  }
];


/* ============================================================
   31. OPTIONAL COUNTRY-SPECIFIC DATING ACTIVITIES
   ============================================================ */

const MARRIAGE_COUNTRY_DATE_IDEAS = {
  egy: [
    'Nile-side dinner',
    'Alexandria Corniche walk',
    'Coffee and dessert',
    'Family lunch',
    'Red Sea weekend'
  ],
  usa: [
    'Coffee shop date',
    'Road trip',
    'Baseball game',
    'Concert',
    'National park weekend'
  ],
  sau: [
    'Restaurant dinner',
    'Shopping trip',
    'Desert weekend',
    'Coastal holiday',
    'Family gathering'
  ],
  uae: [
    'Dubai Marina dinner',
    'Beach day',
    'Desert safari',
    'Museum visit',
    'Staycation'
  ],
  gbr: [
    'Pub dinner',
    'Museum visit',
    'Countryside weekend',
    'Football match',
    'Coastal walk'
  ],
  deu: [
    'Christmas market',
    'Cycling trip',
    'Hiking',
    'Café date',
    'Weekend train trip'
  ],
  can: [
    'Lake weekend',
    'Hiking',
    'Ice skating',
    'Café date',
    'Road trip'
  ],
  aus: [
    'Beach day',
    'Barbecue',
    'National park trip',
    'Brunch',
    'Coastal road trip'
  ],
  nld: [
    'Canal walk',
    'Cycling date',
    'Museum visit',
    'Coffee date',
    'Weekend train trip'
  ],
  fra: [
    'Bakery breakfast',
    'Museum date',
    'Picnic',
    'Coastal weekend',
    'Restaurant dinner'
  ],
  jpn: [
    'Ramen date',
    'Karaoke',
    'Cherry blossom walk',
    'Hot spring trip',
    'Train journey'
  ],
  ita: [
    'Pasta dinner',
    'Seaside walk',
    'Village weekend',
    'Coffee date',
    'Food festival'
  ],
  sgp: [
    'Hawker centre dinner',
    'Gardens walk',
    'Sentosa day',
    'Night Safari',
    'City staycation'
  ],
  bra: [
    'Beach day',
    'Barbecue',
    'Music festival',
    'Football match',
    'Weekend trip'
  ],
  ind: [
    'Street food date',
    'Festival visit',
    'Restaurant dinner',
    'Family celebration',
    'Weekend trip'
  ]
};


/* ============================================================
   32. OPTIONAL MARRIAGE MILESTONES
   ============================================================ */

const MARRIAGE_MILESTONES = [
  {
    id: 'first_date',
    label: 'First Date',
    years: 0,
    desc: 'You have your first date together.'
  },
  {
    id: 'exclusive',
    label: 'Exclusive Relationship',
    years: 0,
    desc: 'You agree to be in a committed relationship.'
  },
  {
    id: 'meet_family',
    label: 'Meet the Family',
    years: 0,
    desc: 'You introduce your partner to important family members.'
  },
  {
    id: 'proposal',
    label: 'Proposal',
    years: 0,
    desc: 'You ask your partner to marry you.'
  },
  {
    id: 'engagement',
    label: 'Engagement',
    years: 0,
    desc: 'You formally become engaged.'
  },
  {
    id: 'marriage',
    label: 'Wedding Day',
    years: 0,
    desc: 'You get married and begin a shared household.'
  },
  {
    id: 'first_anniversary',
    label: 'First Anniversary',
    years: 1,
    desc: 'You celebrate one year of marriage.'
  },
  {
    id: 'five_years',
    label: 'Five Years Married',
    years: 5,
    desc: 'You look back on five years together.'
  },
  {
    id: 'ten_years',
    label: 'Ten Years Married',
    years: 10,
    desc: 'Your relationship reaches a decade.'
  },
  {
    id: 'twenty_five_years',
    label: 'Twenty-Five Years Married',
    years: 25,
    desc: 'You celebrate a major long-term milestone.'
  }
];

/* ============================================================
   MARRIAGE SYSTEM V3 — Social Classes, Negotiation, & Gender
   ============================================================ */

/* Father's Negotiation Demands (Based on social class gap) */
const MARRIAGE_NEGOTIATION_DEMANDS = [
  { id: 'apartment',   label: 'A fully furnished apartment',        costEGP: 0,     tierReq: 'middle', desc: '"My daughter cannot live in a rental or with your parents. You must provide a home."' },
  { id: 'furniture',   label: 'Furnish the apartment (50/50)',      costEGP: 40000, tierReq: 'middle', desc: '"I will pay for half the furniture, but you must cover the rest."' },
  { id: 'gold_upgrade',label: 'Upgrade the Shabka to a heavier set',costEGP: 50000, tierReq: 'upper-mid', desc: '"This gold is too light. She deserves a heavier set for her wedding day."' },
  { id: 'mahr_upgrade',label: 'Increase the Mahr',                  costEGP: 80000, tierReq: 'upper-mid', desc: '"The Mahr is a symbol of your commitment. It must reflect her worth."' },
  { id: 'wedding_size',label: 'A bigger wedding venue',             costEGP: 150000,tierReq: 'wealthy', desc: '"Our family has a reputation. A small hall is not acceptable."' }
];

/* Cost Sharing Models for Engagement & Wedding */
const MARRIAGE_COST_SHARING = [
  { id: 'groom_pays',  label: 'Groom & his family pay for everything', mult: 1.0,    desc: 'Traditional Arab expectation.' },
  { id: 'bride_pays',  label: 'Bride & her family pay for everything', mult: 1.0,    desc: 'Rare, but happens if the bride is wealthier.' },
  { id: 'split_50',    label: 'Split 50/50',                          mult: 0.5,    desc: 'Modern, egalitarian approach.' },
  { id: 'proportional',label: 'Split by income/wealth',               mult: 0.6,    desc: 'Whoever earns more pays more.' }
];

/* New Culturally Aware Proposal Options */
const MARRIAGE_CULTURAL_PROPOSALS = {
  western: [
    { id: 'w_ring', label: 'Buy an Engagement Ring', costEGP: 30000, romance: 8, desc: 'Standard Western tradition. You propose with a diamond ring.' },
    { id: 'w_dinner', label: 'Fancy Dinner Proposal', costEGP: 5000, romance: 6, desc: 'A classic romantic setup.' },
    { id: 'w_casual', label: 'Casual Intimate Proposal', costEGP: 0, romance: 5, desc: 'Just the two of you at home.' }
  ],
  arab: [
    { id: 'a_family', label: 'Family-Attended Proposal', costEGP: 10000, romance: 3, social: 8, desc: 'Formal proposal with your parents present.' },
    { id: 'a_private', label: 'Private Proposal', costEGP: 2000, romance: 6, social: 1, desc: 'A quiet moment before the family meeting.' },
    { id: 'a_trip', label: 'Proposal During a Trip', costEGP: 40000, romance: 10, social: 3, desc: 'A modern, memorable proposal.' }
  ]
};
/* ============================================================
   END OF EXPANDED MARRIAGE DATA
   ============================================================ */
