// Fictional regional templates, not a survey of any real address.
const GULF = new Set(['sau', 'uae', 'qat', 'kwt']);
export function regionalRoomName(room, country = '', shape = '') {
  if (shape === 'commercial' || shape === 'land') return room.name;
  const countryCode = String(country || '').toLowerCase();
  const jp = countryCode === 'jpn';
  const names = {
    foyer: jp ? 'Genkan entrance and shoe storage' : 'Entrance hall',
    wc: jp ? 'Separate toilet' : 'Guest toilet',
    corridor: /landing|upper/i.test(room.name) ? 'Upstairs landing' : 'Hallway',
    void: 'Open space above living room',
    living: jp ? 'Living and dining room' : countryCode === 'egy' ? 'Reception and dining room' : 'Living and dining room',
    kitchen: jp ? 'Kitchen and pantry' : 'Kitchen',
    bedroom: 'Main bedroom and wardrobe',
    bathroom: jp ? 'Bath, washroom and laundry' : 'Bathroom and laundry',
    kids: 'Family bedrooms',
    office: jp ? 'Flexible guest room / study' : GULF.has(countryCode) ? 'Guest majlis / study' : 'Guest room / study'
  };
  if (shape === 'studio') {
    if (room.key === 'bedroom') return 'Sleeping area';
    if (room.key === 'living') return 'Living and dining area';
    if (room.key === 'kitchen') return 'Kitchenette';
  }
  if (String(room.no).startsWith('3') && room.key === 'office') return 'Upper-floor hobby room';
  if (String(room.no).startsWith('2') && room.key === 'office') return 'Study / extra bedroom';
  return names[room.key] || room.name;
}
export function homeStyleNote(country = '') {
  if (country === 'jpn') return 'Japan-inspired layout with a genkan entrance and separate washroom spaces.';
  if (GULF.has(country)) return 'Gulf-inspired family layout with space for receiving guests.';
  if (country === 'egy') return 'Egypt-inspired family layout with a separate reception area.';
  return 'Contemporary home layout. Local architectural detail is still being expanded.';
}
