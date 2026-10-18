/* ============================================================
   DATA: GLOBAL EVENTS
   ============================================================
   TO ADD AN EVENT: copy a { ... } block, change id, minAge, maxAge, title, text, choices.
   Events with `condition: s => ...` only fire if condition true.
   Events with `dynamic: 'school'` get their choices built by prepareEvent in engine.
   ============================================================ */

const GLOBAL_EVENTS = [
/* ============================================================
 
  { id: 'school_choice', minAge: 6, maxAge: 6,
    title: 'First day of school',
    text: 'Your family must choose a school for you.',
    dynamic: 'school'
  },
  { id: 'first_friend', minAge: 7, maxAge: 9,
    title: 'A new friend',
    text: 'A classmate asks if you want to play football after school.',
    choices: [
      { label: 'Play football', effect: s => { s.happiness += 5; s.social += 5; } },
      { label: 'Go home and study', effect: s => { s.smarts += 3; s.social -= 2; } },
    ]
  },
  { id: 'hobby', minAge: 10, maxAge: 12,
    title: 'A new hobby',
    text: 'You have some free time.',
    choices: [
      { label: 'Read books', effect: s => { s.smarts += 4; } },
      { label: 'Play video games', effect: s => { s.happiness += 4; } },
      { label: 'Play sports', effect: s => { s.health += 4; s.social += 3; } },
    ]
  },
  { id: 'study_choice', minAge: 13, maxAge: 15,
    title: 'Preparing for exams',
    text: 'Exams are coming up.',
    choices: [
      { label: 'Study hard', effect: s => { s.smarts += 5; s.happiness -= 3; } },
      { label: 'Coast', effect: s => { s.smarts += 1; } },
      { label: 'Skip studying', effect: s => { s.smarts -= 2; s.happiness += 4; } },
    ]
  },
  { id: 'gender_expectations', minAge: 22, maxAge: 28,
    title: 'Family expectations',
    text: s => s.gender === 'f' ? 'Your mother asks when you will marry. Your career matters less to her than your future husband.' : 'Your father asks when you will buy an apartment. He says a man with no property cannot marry.',
    choices: [
      { label: 'Push back', effect: s => { s.happiness += 2; s.social -= 2; } },
      { label: 'Stay quiet', effect: s => { s.happiness -= 3; } },
    ]
  },
  { id: 'marriage_opportunity', minAge: 24, maxAge: 35,
    condition: s => !s.spouse,
    title: 'Someone special',
    text: 'You meet someone you could see yourself with.',
    choices: [
      { label: 'Pursue it', effect: s => {
        const male = ['Omar','Youssef','Karim','Ahmed','Hassan','Mostafa'];
        const female = ['Sarah','Layla','Noor','Mariam','Hana','Salma'];
        const names = s.gender === 'm' ? female : male;
        const spouse = {
          id: 'sp_' + Math.random().toString(36).slice(2, 8),
          role: 'Spouse',
          name: names[Math.floor(Math.random() * names.length)],
          age: Math.max(20, s.age + Math.floor(Math.random() * 5) - 2),
          bond: 65,
          alive: true,
          works: Math.random() < 0.6,
          income: 0,
        };
        if (spouse.works) spouse.income = Math.round(s.age >= 22 ? 60000 + Math.random() * 60000 : 0);
        s.spouse = spouse;
        s.family.push(spouse);
        s.happiness += 8;
        s.social += 5;
      } },
      { label: 'Stay focused on career', effect: s => { s.happiness -= 2; s.smarts += 2; } },
    ]
  },
  { id: 'child_opportunity', minAge: 27, maxAge: 40,
    condition: s => !!s.spouse,
    title: 'Starting a family',
    text: 'You and your spouse talk about having a child.',
    choices: [
      { label: 'Have a child', effect: s => {
        s.children = (s.children || 0) + 1;
        s.happiness += 10;
        s.wealth -= 36000;
        if (s.spouse) s.spouse.bond = Math.min(100, s.spouse.bond + 5);
      } },
      { label: 'Not yet', effect: s => { s.happiness += 2; } },
    ]
  },
];

  /* 👇 ADD NEW EVENTS HERE 👇 */
];

window.GLOBAL_EVENTS = GLOBAL_EVENTS;
