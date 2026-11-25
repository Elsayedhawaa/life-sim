/* A banner that shows a recognisable place must belong to the country the player lives in.
   Only pictures of an identifiable place are tagged; interiors, objects and generic scenes carry no tag and fit everywhere.
   When a banner does not fit the country, the country's own scene replaces it, else a neutral picture for that section. No new art is introduced. */
export const BANNER_PLACES = {
  'era_vintage_street_ink.jpg': ['gbr', 'fra', 'ita', 'deu', 'che', 'nld', 'swe'],
  'city_europe_west.jpg': ['gbr'],
  'autumn_park_boulevard_ink.jpg': ['fra'],
  'europe_old_town_ink.jpg': ['ita', 'fra'],
  'mediterranean_coast_ink.jpg': ['ita', 'fra', 'egy', 'tur'],
  'coastal_summer_chalet_ink.jpg': ['egy', 'ita', 'fra', 'tur'],
  'uni_campus_courtyard_ink.jpg': ['egy', 'ita', 'fra', 'tur'],
  'winter_city_ink.jpg': ['deu', 'fra', 'che', 'swe', 'nld', 'gbr', 'can'],
  'city_mena_cairo.jpg': ['egy'],
  'cairo_nile_felucca_ink.jpg': ['egy'],
  'ramadan_lantern_courtyard_ink.jpg': ['egy', 'sau', 'uae', 'qat', 'kwt', 'tur', 'mys'],
  'city_gulf_skyline.jpg': ['sau', 'uae', 'qat', 'kwt'],
  'red_sea_beach_vacation_ink.jpg': ['egy', 'sau'],
  'desert_oasis_ink.jpg': ['egy', 'sau', 'uae'],
  'desert_road_trip_ink.jpg': ['egy', 'sau', 'uae'],
  'east_asia_skyline_ink.jpg': ['jpn', 'sgp', 'mys'],
  'switzerland_alps_lake_ink.jpg': ['che'],
  'sweden_stockholm_archipelago_ink.jpg': ['swe'],
  'turkey_istanbul_bosphorus_ink.jpg': ['tur'],
  'north_america_skyline_ink.jpg': ['usa', 'can'],
  'home_villa_compound.jpg': ['egy', 'sau', 'uae', 'qat', 'kwt', 'ita', 'fra', 'tur']
};
const NEUTRAL = { work: ['business_office_ink.jpg', 'career_enterprise_ink.jpg'], finance: ['finance_vault_ink.jpg'], realestate: ['architecture_studio_ink.jpg'], world: ['passport_world_ink.jpg', 'airport_departure_terminal_ink.jpg'], lifestyle: ['finance_vault_ink.jpg'], life: ['era_modern_city_ink.jpg'], people: ['era_modern_city_ink.jpg'] };
export function bannerFitsCountry(file, country) {
  const places = BANNER_PLACES[file];
  return !places || places.includes(String(country || '').toLowerCase());
}
export function fitBannerToCountry(file, country, section, ownScene, rot = 0, opts = {}) {
  if (file === 'pilgrimage_travel.jpg' && !opts.muslim) return 'airport_departure_terminal_ink.jpg';
  if (bannerFitsCountry(file, country)) return file;
  if (file === 'era_vintage_street_ink.jpg') return opts.anyEraScene || 'career_enterprise_ink.jpg';
  if (ownScene && bannerFitsCountry(ownScene, country)) return ownScene;
  const pool = NEUTRAL[section] || NEUTRAL.life;
  return pool[Math.abs(rot) % pool.length];
}
