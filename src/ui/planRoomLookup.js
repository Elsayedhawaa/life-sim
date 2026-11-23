import {regionalRoomName} from './homeRegionalStyle.js';
/* ============================================================================
   Plan-room lookup — which room number is which room, for every home shape.
   ----------------------------------------------------------------------------
   The room lists themselves live in A101_SCHEMATICS (src/ui/visualEngine3d.js)
   and that file is owned by the dossier worker, so this table MIRRORS it:
   same room numbers, same keys, same names (in plain words). If a plan
   changes there, this table must change with it — the node check in
   /tmp (gen_lookup) re-derives it from A101_SCHEMATICS to catch drift.
   Furnished state is keyed by room NUMBER now (old saves that stored the
   generic key — living/kitchen/... — still read through the key fallback).
   ========================================================================== */

export const FURNISHABLE_KEYS = ['living', 'kitchen', 'bedroom', 'bathroom', 'kids', 'office'];

/* shape -> rooms in plan order: { no, key, name } */
export const PLAN_ROOMS = {
  studio: [
    { no: '101', key: 'foyer', name: 'Entry Vestibule' },
    { no: '102', key: 'bathroom', name: 'Full Bath & Laundry' },
    { no: '103', key: 'kitchen', name: 'Galley Kitchenette' },
    { no: '104', key: 'living', name: 'Living & Dining Salon' },
    { no: '105', key: 'bedroom', name: 'Sleeping Alcove + Wardrobe' }
  ],
  apartment: [
    { no: '101', key: 'foyer', name: 'Foyer & Lobby' },
    { no: '102', key: 'wc', name: 'Guest WC' },
    { no: '103', key: 'corridor', name: 'Private Gallery Corridor' },
    { no: '104', key: 'living', name: 'Formal Reception & Dining' },
    { no: '105', key: 'kitchen', name: 'Chef Kitchen & Pantry' },
    { no: '106', key: 'bedroom', name: 'Master Suite + W.I.C.' },
    { no: '107', key: 'bathroom', name: 'Master Ensuite' },
    { no: '108', key: 'kids', name: 'Bedroom 02 (Kids)' },
    { no: '109', key: 'office', name: 'Study / Bedroom 03' }
  ],
  duplex: [
    { no: '101', key: 'foyer', name: 'Grand Entry Hall' },
    { no: '102', key: 'living', name: '2-STORY Double-Height Salon' },
    { no: '103', key: 'office', name: 'Guest Majlis / Study' },
    { no: '104', key: 'kitchen', name: 'Island Chef Kitchen' },
    { no: '105', key: 'bathroom', name: 'Powder WC & Utility' },
    { no: '106', key: 'corridor', name: 'Lower Stair Hall' },
    { no: '201', key: 'void', name: 'Open Void Over Salon (below)' },
    { no: '202', key: 'bedroom', name: 'Master Royal Suite + W.I.C.' },
    { no: '203', key: 'bathroom', name: 'Master Spa Ensuite' },
    { no: '204', key: 'kids', name: 'Kids Bedroom Suites (×2)' },
    { no: '205', key: 'corridor', name: 'Mezzanine Gallery Bridge' },
    { no: '206', key: 'corridor', name: 'Upper Landing' }
  ],
  penthouse: [
    { no: '101', key: 'living', name: 'Panoramic Great Salon & Bar' },
    { no: '102', key: 'kitchen', name: 'Show Kitchen & Wine Cellar' },
    { no: '103', key: 'bedroom', name: 'Master Penthouse Wing + W.I.C.' },
    { no: '104', key: 'bathroom', name: 'Marble Hammam & Spa Bath' },
    { no: '105', key: 'kids', name: 'VIP Guest Suite 02' }
  ],
  townhouse: [
    { no: '101', key: 'foyer', name: 'Entry Hall & Garage Vestibule' },
    { no: '102', key: 'living', name: 'Garden Salon & Dining' },
    { no: '103', key: 'kitchen', name: 'Closed Chef Kitchen' },
    { no: '104', key: 'office', name: 'Study / Maid Suite' },
    { no: '105', key: 'bathroom', name: 'Powder WC' },
    { no: '201', key: 'bedroom', name: 'Master Suite + Dressing' },
    { no: '202', key: 'bathroom', name: 'Master & Family Baths' },
    { no: '203', key: 'kids', name: 'Bedroom 02 & Bedroom 03' }
  ],
  twin_house: [
    { no: '101', key: 'foyer', name: 'Side Garden Entrance Lobby' },
    { no: '102', key: 'living', name: 'Salon & 8-SEAT Dining Hall' },
    { no: '103', key: 'kitchen', name: 'Chef Kitchen & Laundry' },
    { no: '104', key: 'office', name: 'Guest Majlis / Office' },
    { no: '105', key: 'bathroom', name: 'Guest WC & Nanny Bath' },
    { no: '201', key: 'bedroom', name: 'Master Suite + W.I.C.' },
    { no: '202', key: 'bathroom', name: 'Master Jacuzzi Ensuite' },
    { no: '203', key: 'kids', name: 'Suites 02 & 03 + Living' },
    { no: '204', key: 'corridor', name: 'Upper Family Hall' }
  ],
  villa: [
    { no: '101', key: 'foyer', name: 'Portico Foyer' },
    { no: '102', key: 'office', name: 'External Guest Majlis' },
    { no: '103', key: 'wc', name: 'Guest Wash & WC' },
    { no: '104', key: 'corridor', name: 'Central Gallery Axis' },
    { no: '105', key: 'living', name: 'Grand Reception & 10P Dining' },
    { no: '106', key: 'kitchen', name: 'Chef Island & Grease Kitchen' },
    { no: '107', key: 'bathroom', name: 'Maid + Laundry + Driver' },
    { no: '201', key: 'bedroom', name: 'Royal Master Wing + W.I.C.' },
    { no: '202', key: 'bathroom', name: 'His/Hers Spa Bath + Sauna' },
    { no: '203', key: 'corridor', name: 'Family Pyjama Lounge' },
    { no: '204', key: 'kids', name: 'Bedroom Suites 02 & 03' },
    { no: '205', key: 'office', name: 'Private Library / Suite 04' },
    { no: '206', key: 'corridor', name: 'Upper Landing' },
    { no: '301', key: 'bathroom', name: 'Laundry, Ironing & Roof WC' },
    { no: '302', key: 'office', name: 'Roof Penthouse / Gym Lounge' }
  ],
  chalet: [
    { no: '101', key: 'living', name: 'Open Breeze Salon & Dining' },
    { no: '102', key: 'kitchen', name: 'Open Island Bar Kitchen' },
    { no: '103', key: 'bedroom', name: 'Sea-View Master Bedroom' },
    { no: '104', key: 'bathroom', name: 'Sand-Wash Bath & WC' },
    { no: '105', key: 'kids', name: 'Bunk & Twin Guest Cabin' }
  ],
  mansion: [
    { no: '101', key: 'foyer', name: 'Imperial Rotunda Dome Hall' },
    { no: '102', key: 'office', name: 'West Wing Diwan & Library' },
    { no: '103', key: 'living', name: 'East Banquet & Ballroom' },
    { no: '104', key: 'wc', name: 'VIP Cloakroom & Ablution' },
    { no: '105', key: 'kitchen', name: 'Commercial Catering & Cold' },
    { no: '106', key: 'bathroom', name: 'Staff Quarters (4 Rooms)' },
    { no: '201', key: 'bedroom', name: 'Sovereign Master Wing + Vault' },
    { no: '202', key: 'bathroom', name: 'Turkish Hammam & Indoor Spa' },
    { no: '203', key: 'kids', name: '4 Royal Family Suites (West)' },
    { no: '204', key: 'office', name: 'Private 12-SEAT Cinema & Gym' },
    { no: '205', key: 'corridor', name: 'Rotunda Gallery Mezzanine' },
    { no: '301', key: 'office', name: 'Sky Observatory & Winter Garden' },
    { no: '302', key: 'bathroom', name: 'Roof Catering Pantry & WC' }
  ],
  commercial: [
    { no: '101', key: 'living', name: 'Public Showroom & Reception' },
    { no: '102', key: 'office', name: 'Executive Director Suite' },
    { no: '103', key: 'kids', name: 'Boardroom / Consulting Room' },
    { no: '104', key: 'kitchen', name: 'Staff Pantry & Server Rack' },
    { no: '105', key: 'bathroom', name: 'ADA Restrooms (M / F)' }
  ],
  land: []
};

/* All rooms of a shape's plan (every floor), in plan order. Unknown shape -> []. */
export function planRoomsForShape(shape) {
  return PLAN_ROOMS[shape] || [];
}

/* Only the rooms that can be furnished on a shape's plan. */
export function furnishablePlanRooms(shape, country = '') {
  return planRoomsForShape(shape).filter(r => FURNISHABLE_KEYS.includes(r.key)).map(r => ({...r, name:regionalRoomName(r, country, shape)}));
}

/* Room number -> room ({ no, key, name }) on that shape's plan, or null. */
export function findPlanRoom(shape, roomNo) {
  const no = String(roomNo ?? '').trim();
  if (!no) return null;
  return planRoomsForShape(shape).find(r => r.no === no) || null;
}

/* Is this room furnished? Numbers first; the old generic key only counts
   when a save stores no room numbers at all (mirrors the dossier reader). */
export function isPlanRoomFurnished(furnishedRooms, room) {
  const fr = furnishedRooms || {};
  if (!room) return false;
  const hasNumberKeys = Object.keys(fr).some(k => /^\d+$/.test(k));
  return hasNumberKeys ? !!fr[room.no] : !!fr[room.key];
}

/* The label stored for a furnished room (number first, key as fallback). */
export function furnishedLabelFor(furnishedRooms, room) {
  const fr = furnishedRooms || {};
  if (!room) return '';
  return fr[room.no] || fr[room.key] || '';
}

/* Re-key a furnished-rooms map by room number. An old generic-key entry maps
   to the first room of that kind on the plan that has no number yet, so a
   player never loses a room they already paid for. Entries that match no
   room on this plan are kept untouched (they were paid for; the count of
   furnished rooms must not silently shrink). Returns a NEW map. */
export function migrateFurnishedRoomsToNumbers(furnishedRooms, shape) {
  const fr = furnishedRooms || {};
  const rooms = planRoomsForShape(shape);
  const out = {};
  const usedNos = new Set();
  for (const [k, v] of Object.entries(fr)) {
    if (/^\d+$/.test(k)) { out[k] = v; usedNos.add(k); }
  }
  for (const [k, v] of Object.entries(fr)) {
    if (/^\d+$/.test(k)) continue;
    const rm = rooms.find(r => r.key === k && !usedNos.has(r.no));
    if (rm) { out[rm.no] = v; usedNos.add(rm.no); }
    else out[k] = v;
  }
  return out;
}

/* Same as migrate, but ALSO adds the generic key alongside each number, so
   readers that only know the keys (the 3D canvas interior) keep working.
   The dossier reads numbers when any are present, so the keys never
   override the numbers there. Returns a NEW map. */
export function furnishedRoomsWithKeys(furnishedRooms, shape) {
  const numbered = migrateFurnishedRoomsToNumbers(furnishedRooms, shape);
  const out = { ...numbered };
  for (const rm of planRoomsForShape(shape)) {
    if (numbered[rm.no] && !out[rm.key]) out[rm.key] = numbered[rm.no];
  }
  return out;
}

/* Plain words for a space that cannot be furnished (hallway, stairwell,
   lift, entrance hall, guest toilet, open void). key = room key, no = room
   number as shown on the plan. No charge, no state change — just the words. */
export function roomInfoMessage(key, no) {
  const n = String(no ?? '').trim();
  const where = n ? `Room ${n}` : 'This space';
  if (key === 'foyer') return `${where} is the entrance hall — part of the home's layout, not a room you furnish.`;
  if (key === 'wc') return `${where} is a guest toilet — not a room you furnish.`;
  if (key === 'corridor') return `${where} is a hallway — it connects the rooms, it isn't a room you furnish.`;
  if (key === 'void') return `${where} is open space above the room below — nothing to furnish there.`;
  if (FURNISHABLE_KEYS.includes(key)) return `${where} can be furnished using the room controls below the floor plan.`;
  return `${where} is part of the home's layout, not a room you furnish.`;
}

/* Resolve a furnish click (dossier room or Std/Lux button) to a real room.
   Never furnishes a property the player did not pick and never falls back
   to another property: a pid that matches no owned property, or a pictured
   shape that is only a preview of a different shape, is refused with plain
   words and nothing is charged. Returns { ok, prop, room } or { ok:false, msg }. */
export function resolveFurnishTarget(properties, pid, picturedShape, roomNo) {
  const props = Array.isArray(properties) ? properties : [];
  const prop = props.find(p => p && p.id === pid);
  if (!prop) {
    return { ok: false, msg: props.length
      ? 'This is a preview — furnish rooms in a home you own.'
      : 'Own a home first to furnish rooms permanently.' };
  }
  if (picturedShape && picturedShape !== prop.shape) {
    return { ok: false, msg: 'This is a preview — furnish rooms in a home you own.' };
  }
  const room = findPlanRoom(prop.shape, roomNo);
  if (!room) {
    return { ok: false, msg: `There is no room ${roomNo} in ${prop.name} — nothing was furnished and nothing was charged.` };
  }
  if (!FURNISHABLE_KEYS.includes(room.key)) {
    return { ok: false, msg: roomInfoMessage(room.key, room.no) };
  }
  const migrated = migrateFurnishedRoomsToNumbers(prop.furnishedRooms || {}, prop.shape);
  if (migrated[room.no]) {
    return { ok: false, msg: `Room ${room.no} (${room.name}) in ${prop.name} is already furnished.` };
  }
  return { ok: true, prop, room };
}
