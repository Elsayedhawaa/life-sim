/* ============================================================================
   World Life 2.0 — Culturally Authentic Name & Identity Pools (18 Countries)
   Includes Arabic patronymic / family surname inheritance for Egypt, Saudi, UAE.
   ========================================================================== */

export const NAME_POOLS = {
  egy: {
    male: [
      'Karim', 'Mostafa', 'Omar', 'Youssef', 'Ahmed', 'Mahmoud', 'Tarek', 'Hassan',
      'Khaled', 'Ziad', 'Sherif', 'Amr', 'Marwan', 'Adham', 'Seif', 'hazem',
      'Ibrahim', 'Ramy', 'Hossam', 'Nader', 'Fady', 'Mina', 'Ali', 'Yehia'
    ].map(s => s[0].toUpperCase() + s.slice(1)),
    female: [
      'Nour', 'Salma', 'Yasmin', 'Mariam', 'Laila', 'Hana', 'Farida', 'Dina',
      'Malak', 'Nada', 'Reem', 'Sara', 'Amina', 'Zeina', 'Rania', 'Noha',
      'Heba', 'Mona', 'Aya', 'Habiba', 'Jana', 'Sandra', 'Dalida', 'Menna'
    ],
    family: [
      'El-Masry', 'Mahmoud', 'Abdelrahman', 'Mansour', 'El-Shafei', 'Hassan',
      'Soliman', 'Kamel', 'Nassar', 'El-Gendy', 'Zaki', 'Farouk', 'Badawy',
      'Ibrahim', 'Khalil', 'Radwan', 'Amer', 'Shawky', 'Salem', 'Fawzy'
    ]
  },
  sau: {
    male: [
      'Faisal', 'Abdullah', 'Fahad', 'Sultan', 'Mohammed', 'Salman', 'Khalid',
      'Turki', 'Saud', 'Nawaf', 'Bandar', 'Mishal', 'Badr', 'Yazeed', 'Ziad', 'Nasser'
    ],
    female: [
      'Noura', 'Maha', 'Reema', 'Lama', 'Sarah', 'Hessa', 'Aljohara', 'Jawaher',
      'Dana', 'Abeer', 'Najla', 'Latifa', 'Raghad', 'Deema', 'Munira', 'Asma'
    ],
    family: [
      'Al-Qahtani', 'Al-Otaibi', 'Al-Ghamdi', 'Al-Harbi', 'Al-Zahrani', 'Al-Dosari',
      'Al-Mutairi', 'Al-Shammari', 'Al-Subaie', 'Al-Anazi', 'Al-Shehri', 'Al-Rajhi'
    ]
  },
  uae: {
    male: [
      'Rashid', 'Hamdan', 'Zayed', 'Saeed', 'Majid', 'Khalifa', 'Mansoor',
      'Sultan', 'Obaid', 'Saif', 'Tariq', 'Marwan', 'Humaid', 'Nasser'
    ],
    female: [
      'Fatima', 'Mariam', 'Shamma', 'Maitha', 'Aisha', 'Hessa', 'Meera',
      'Amna', 'Alia', 'Salama', 'Mouza', 'Latifa', 'Noora', 'Khawla'
    ],
    family: [
      'Al-Maktoum', 'Al-Suwaidi', 'Al-Shamsi', 'Al-Nuaimi', 'Al-Mazrouei',
      'Al-Kaabi', 'Al-Ketbi', 'Al-Dhaheri', 'Al-Muhairi', 'Al-Falasi', 'Al-Marri'
    ]
  },
  gbr: {
    male: ['Oliver', 'Harry', 'George', 'Arthur', 'James', 'William', 'Thomas', 'Edward', 'Jack', 'Callum', 'Liam', 'Daniel'],
    female: ['Olivia', 'Amelia', 'Charlotte', 'Isla', 'Sophie', 'Emily', 'Grace', 'Freya', 'Eleanor', 'Hannah', 'Lucy', 'Clara'],
    family: ['Smith', 'Taylor', 'Bennett', 'Clarke', 'Wright', 'Walker', 'Robinson', 'Hall', 'Hughes', 'Ward', 'Turner', 'Fletcher']
  },
  usa: {
    male: ['Ethan', 'Lucas', 'Noah', 'Mason', 'Caleb', 'Nathan', 'Ryan', 'Marcus', 'Daniel', 'Cole', 'Evan', 'Julian'],
    female: ['Emma', 'Sophia', 'Maya', 'Claire', 'Ava', 'Natalie', 'Elena', 'Lauren', 'Rachel', 'Zoe', 'Audrey', 'Sadie'],
    family: ['Miller', 'Davis', 'Brooks', 'Carter', 'Mitchell', 'Parker', 'Collins', 'Morgan', 'Hayes', 'Reed', 'Foster', 'Bennett']
  },
  deu: {
    male: ['Lukas', 'Jonas', 'Maximilian', 'Felix', 'Leon', 'Paul', 'Moritz', 'Niklas', 'Tobias', 'Florian', 'Jan', 'Matthias'],
    female: ['Hannah', 'Lena', 'Anna', 'Laura', 'Clara', 'Marie', 'Johanna', 'Katharina', 'Sophie', 'Julia', 'Maja', 'Frida'],
    family: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Richter', 'Klein', 'Bauer']
  },
  can: {
    male: ['Liam', 'Noah', 'Owen', 'Lucas', 'logan', 'Ethan', 'Gabriel', 'Felix', 'Connor', 'Aiden', 'Julien', 'Matteo'].map(s => s[0].toUpperCase() + s.slice(1)),
    female: ['Charlotte', 'Olivia', 'Emma', 'Chloe', 'Maya', 'Nora', 'Claire', 'Camille', 'isla', 'Ella', 'Zoe', 'Hannah'].map(s => s[0].toUpperCase() + s.slice(1)),
    family: ['Tremblay', 'Campbell', 'MacDonald', 'Roy', 'Fraser', 'Stewart', 'Morrison', 'Bouchard', 'Reid', 'pelletier', 'Ross', 'Scott'].map(s => s[0].toUpperCase() + s.slice(1))
  },
  aus: {
    male: ['Lachlan', 'Jack', 'Cooper', 'Liam', 'Oliver', 'Hamish', 'Flynn', 'Noah', 'Angus', 'Ethan'],
    female: ['Isla', 'Matilda', 'Ruby', 'Olivia', 'Chloe', 'Zoe', 'Mia', 'Sienna', 'Evie', 'Harper'],
    family: ['Kelly', 'O\'Connor', 'Mitchell', 'Murray', 'Anderson', 'king', 'Ryan', 'Walsh', 'byrne', 'Taylor'].map(s => s[0].toUpperCase() + s.slice(1))
  },
  nld: {
    male: ['Daan', 'Bram', 'Sem', 'Lars', 'Thijs', 'Luuk', 'Stijn', 'Ruben', 'Sven', 'Joost'],
    female: ['Emma', 'Julia', 'Tess', 'Sanne', 'Eva', 'Lotte', 'Fleur', 'Noa', 'Anne', 'Lieke'],
    family: ['De Jong', 'Jansen', 'De Vries', 'Van den Berg', 'Van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'De Boer']
  },
  fra: {
    male: ['Gabriel', 'Louis', 'Raphaël', 'Jules', 'Lucas', 'Hugo', 'Arthur', 'Maxime', 'Théo', 'Antoine'],
    female: ['Louise', 'Jade', 'Emma', 'Camille', 'Manon', 'Léa', 'Chloé', 'Inès', 'Juliette', 'Margaux'],
    family: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Moreau', 'Laurent', 'Simon', 'Lefebvre', 'Mercier', 'Fontaine']
  },
  jpn: {
    male: ['Haruto', 'Ren', 'Yuto', 'Sota', 'Kaito', 'Kenji', 'Daiki', 'Takumi', 'Riku', 'Hiroshi'],
    female: ['Yui', 'Hina', 'Aoi', 'Sakura', 'Mei', 'Rin', 'Mio', 'Haruka', 'Nanami', 'Ayaka'],
    family: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato']
  },
  ita: {
    male: ['Leonardo', 'Lorenzo', 'Alessandro', 'Matteo', 'Andrea', 'Marco', 'Luca', 'Tommaso', 'Davide', 'Riccardo'],
    female: ['Sofia', 'Giulia', 'Aurora', 'Chiara', 'Martina', 'Alice', 'Giorgia', 'Beatrice', 'Francesca', 'Elena'],
    family: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco']
  },
  sgp: {
    male: ['Wei Jie', 'Jun Hao', 'Zhi Wei', 'Ethan', 'Ryan', 'Arjun', 'Irfan', 'Darren', 'Marcus', 'Lucas'],
    female: ['Jia Yi', 'Xin Yi', 'Chloe', 'Rachel', 'Hui Min', 'Nurul', 'Ananya', 'Clarissa', 'Valerie', 'Mei Ling'],
    family: ['Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Goh', 'Chua', 'Chan', 'Koh']
  },
  bra: {
    male: ['Miguel', 'Rafael', 'Gabriel', 'Lucas', 'Mateus', 'Pedro', 'Guilherme', 'Bruno', 'Thiago', 'Caio'],
    female: ['Helena', 'Alice', 'Laura', 'Manuela', 'Beatriz', 'Camila', 'Júlia', 'Mariana', 'Luiza', 'Letícia'],
    family: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Costa']
  },
  ind: {
    male: ['Aarav', 'Rohan', 'Vikram', 'Aditya', 'Arjun', 'Kabir', 'Siddharth', 'Rahul', 'Nikhil', 'Pranav'],
    female: ['Ananya', 'Priya', 'Diya', 'Kavya', 'Meera', 'Ishita', 'Neha', 'Riya', 'Shreya', 'Aisha'],
    family: ['Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Gupta', 'Mehta', 'Joshi', 'Kulkarni', 'Iyer']
  },
  che: {
    male: ['Lukas', 'Jonas', 'Noah', 'Leon', 'Luca', 'Matteo', 'Elias', 'Jan', 'Simon', 'David', 'Fabian', 'Nico'],
    female: ['Mia', 'Emma', 'Sofia', 'Lena', 'Anna', 'Laura', 'Sara', 'Julia', 'Lea', 'Nina', 'Lara', 'Elena'],
    family: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Brunner', 'Keller', 'Steiner']
  },
  swe: {
    male: ['Erik', 'Lars', 'Anders', 'Johan', 'Karl', 'Per', 'Nils', 'Gustav', 'Henrik', 'Oskar', 'Emil', 'Alexander'],
    female: ['Anna', 'Maria', 'Karin', 'Sara', 'Emma', 'Elin', 'Ida', 'Johanna', 'Sofia', 'Hanna', 'Lisa', 'Alice'],
    family: ['Johansson', 'Andersson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson', 'Pettersson', 'Jonsson']
  },
  tur: {
    male: ['Mehmet', 'Mustafa', 'Ahmet', 'Ali', 'Emre', 'Burak', 'Deniz', 'Kerem', 'Mert', 'Onur', 'Serkan', 'Tolga'],
    female: ['Ayşe', 'Fatma', 'Zeynep', 'Elif', 'Merve', 'Selin', 'Deniz', 'Ece', 'Yasemin', 'Gamze', 'İrem', 'Derya'],
    family: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan']
  }
};

export function pickFirstName(countryId, gender, rngFn, exclude = []) {
  const poolObj = NAME_POOLS[countryId] || NAME_POOLS.egy;
  const list = gender === 'f' ? poolObj.female : poolObj.male;
  const filtered = list.filter(n => !exclude.includes(n));
  const src = filtered.length ? filtered : list;
  return src[Math.floor(rngFn() * src.length)];
}

export function pickFamilyName(countryId, rngFn) {
  const poolObj = NAME_POOLS[countryId] || NAME_POOLS.egy;
  return poolObj.family[Math.floor(rngFn() * poolObj.family.length)];
}
