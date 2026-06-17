/**
 * Canonical list of Israeli cities for checkout validation.
 *
 * A locked selection prevents typo'd / mis-spelled city names that would fail
 * downstream courier dispatch (HFD, Cheetah, Boxit). This is a practical subset
 * of the major localities; for full coverage replace it with the official
 * government "ישובים" dataset (and add Hebrew names if a courier API requires
 * them for dispatch). The list is intentionally English-only to match the store.
 */
export const ISRAELI_CITIES: readonly string[] = [
  'Afula',
  'Akko',
  'Arad',
  'Ariel',
  'Ashdod',
  'Ashkelon',
  'Bat Yam',
  'Beersheba',
  'Beit Shean',
  'Beit Shemesh',
  'Bnei Brak',
  'Dimona',
  'Eilat',
  'Givatayim',
  'Hadera',
  'Haifa',
  'Herzliya',
  'Hod HaSharon',
  'Holon',
  'Jerusalem',
  'Karmiel',
  'Kfar Saba',
  'Kiryat Ata',
  'Kiryat Bialik',
  'Kiryat Gat',
  'Kiryat Malakhi',
  'Kiryat Motzkin',
  'Kiryat Ono',
  'Kiryat Shmona',
  'Kiryat Yam',
  'Lod',
  'Maale Adumim',
  'Maalot-Tarshiha',
  'Modiin',
  'Nahariya',
  'Nazareth',
  'Nesher',
  'Ness Ziona',
  'Netanya',
  'Netivot',
  'Nof HaGalil',
  'Ofakim',
  'Or Akiva',
  'Or Yehuda',
  'Petah Tikva',
  'Raanana',
  'Rahat',
  'Ramat Gan',
  'Ramat HaSharon',
  'Ramla',
  'Rehovot',
  'Rishon LeZion',
  'Rosh HaAyin',
  'Sderot',
  'Safed',
  'Tayibe',
  'Tel Aviv-Yafo',
  'Tiberias',
  'Tira',
  'Tirat Carmel',
  'Umm al-Fahm',
  'Yavne',
  'Yehud-Monosson',
  'Yokneam',
] as const;

const CITY_SET = new Set<string>(ISRAELI_CITIES);

/** True if `value` is one of the canonical Israeli cities. */
export function isValidCity(value: string): boolean {
  return CITY_SET.has(value);
}
