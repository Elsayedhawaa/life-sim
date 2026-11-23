// Fictional regional templates, not a survey of any real address.
const GULF = new Set(['sau', 'uae', 'qat', 'kwt']);
export function regionalRoomName(room, country = '', shape = '') {
  if (shape === 'commercial' || shape === 'land') return room.name;
  const countryCode = String(country || '').toLowerCase();
  const jp = countryCode === 'jpn';
  if (countryCode === 'egy' && shape === 'villa') {
    const villaNames = {'101':'Entrance vestibule','102':'Guest reception / study','103':'Guest toilet','104':'Stair hall','105':'Family reception and dining','106':'Separate kitchen','107':'Laundry and washroom','201':'Main bedroom','202':'Family bathroom','203':'Upstairs family hall','204':'Family bedrooms','205':'Study / guest bedroom','206':'Stair landing','301':'Roof laundry and toilet','302':'Roof hobby room'};
    if (villaNames[room.no]) return villaNames[room.no];
  }
  if(countryCode==='gbr' && shape==='townhouse' && room.no==='102') return 'Sitting and dining room';
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
export function homeStyleNote(country = '', shape = '') {
  if (shape === 'studio') return 'Compact studio: living and sleeping zones share one small home.';
  if (shape === 'chalet') return 'Holiday chalet: shared living space and a compact sleeping area.';
  if (shape === 'penthouse') return 'Top-floor home with living and sleeping rooms on one level.';
  if (country === 'deu') return 'Germany-inspired flat layout with a separate kitchen, entrance hall and living space. Individual buildings vary.';
  if (country === 'usa') return 'US-inspired home layout with a shared living and dining area. Regional and property details vary.';
  if (country === 'gbr') return shape === 'townhouse' ? 'British terraced-home layout with front sitting space, stairs and a rear kitchen.' : 'British flat layout with a compact entrance, living room and separate sleeping spaces.';
  if (country === 'jpn') return 'Japan-inspired layout with a genkan entrance and separate washroom spaces.';
  if (country === 'uae') return 'UAE-inspired home layout. Apartment living and villa guest spaces use different plans.';
  if (country === 'sau') return 'Saudi-inspired family layout with a guest reception area and separate family spaces.';
  if (GULF.has(country)) return 'Gulf-inspired family layout with space for receiving guests.';
  if (country === 'egy') return 'Egypt-inspired family layout with a separate reception area.';
  return 'Contemporary home layout. Local architectural detail is still being expanded.';
}

// The catalog's room count includes the living room. Keep furnished extra rooms
// visible on old saves rather than discarding a room the player paid to equip.
export function roomBelongsToHome(room, shape, totalRooms, furnishedRooms = {}) {
  if (shape !== 'apartment' || !(Number(totalRooms) > 0)) return true;
  if (furnishedRooms[room.no] || furnishedRooms[room.key]) return true;
  const bedrooms = Math.max(1, Number(totalRooms) - 1);
  if (bedrooms < 2 && room.no === '108') return false;
  if (bedrooms < 3 && room.no === '109') return false;
  return true;
}
