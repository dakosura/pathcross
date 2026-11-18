import type { Series } from "./recurring";

/**
 * Hand-checked recurring events. Add a Series here and it appears on the
 * Weekly page, in the event list (as its next date) and on the calendar.
 *
 * Details come from each organizer's page, or from the local guides named in
 * `source_url`, as of November 2026. Schedules change, so every listing links
 * back to its source. Map positions come from street addresses; entries with
 * no address or an unconfirmed one have no pin.
 */

const HFBF = "https://www.hfbf.org/farmers-markets/";
const HM_MARKETS = "https://www.honolulumagazine.com/?p=687663";
const HM_RUN = "https://www.honolulumagazine.com/?p=751711";
const FOODBANK = "https://hawaiifoodbank.org/volunteer/";
const MARKET_NOTE = "Hours as listed in October 2026. Check the market's own page before a special trip.";
const MARKET_PRICE = "Free to browse; vendors set their own prices";
const RUN_NOTE = "Listed by Honolulu Magazine in January 2025. Check the club's Instagram for current meeting details.";

export const series: Series[] = [
  // ------------------------------------------------------------ Farmers markets
  {
    id: "kcc-farmers-market", title: "KCC Farmers Market", category: "Community",
    description: "Oʻahu's best-known farmers market, in the Kapiʻolani Community College parking lot below Diamond Head. Local produce, plants and prepared food. It gets crowded, so arrive early.",
    organizer: "Hawaiʻi Farm Bureau", source_url: HFBF, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Kapiʻolani Community College", address: "4303 Diamond Head Rd., Honolulu, HI 96816", lat: 21.27082, lng: -157.80008,
    start: "07:30", end: "11:00", days: [6],
  },
  {
    id: "honolulu-farmers-market-blaisdell", title: "Honolulu Farmers Market at Blaisdell", category: "Community",
    description: "A weekday-evening market in the Neal S. Blaisdell Center lot in Kakaʻako, handy after work. Free parking in the Blaisdell lot.",
    organizer: "Hawaiʻi Farm Bureau", source_url: HFBF, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Neal S. Blaisdell Center", address: "777 Ward Ave., Honolulu, HI 96814", lat: 21.30109, lng: -157.84982,
    start: "16:00", end: "19:00", days: [3],
  },
  {
    id: "kailua-town-farmers-market", title: "Kailua Town Center Farmers Market", category: "Community",
    description: "A Thursday-evening market in the Kailua Town Center lot, with free parking.",
    organizer: "Hawaiʻi Farm Bureau", source_url: HFBF, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Kailua Town Center", city: "Kailua", address: "609 Kailua Rd., Kailua, HI 96734", lat: 21.39356, lng: -157.74204,
    start: "16:00", end: "19:00", days: [4],
  },
  {
    id: "mililani-farmers-market", title: "Mililani Farmers Market", category: "Community",
    description: "A Sunday-morning market at Mililani High School in Central Oʻahu, with free parking at the school.",
    organizer: "Hawaiʻi Farm Bureau", source_url: HFBF, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Mililani High School", city: "Mililani", address: "95-1200 Meheʻula Pkwy., Mililani, HI 96789",
    start: "08:00", end: "11:00", days: [0],
  },
  {
    id: "kakaako-farmers-market", title: "Kakaʻako Farmers Market", category: "Community",
    description: "A Saturday market in Kakaʻako with more than 110 booths of produce, prepared food and local goods.",
    organizer: "Kakaʻako Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Kakaʻako, Ala Moana Blvd.", address: "919 and 1011 Ala Moana Blvd., Honolulu, HI 96814", lat: 21.29502, lng: -157.85888,
    start: "08:00", end: "12:00", days: [6],
  },
  {
    id: "makiki-farmers-market", title: "Makiki Farmers Market", category: "Community",
    description: "A Thursday-evening market at St. Clement's Episcopal Church with produce, food vendors and live music. Tables and chairs are provided.",
    organizer: "Makiki Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "St. Clement's Episcopal Church", address: "1515 Wilder Ave., Honolulu, HI 96822", lat: 21.30333, lng: -157.83474,
    start: "16:30", end: "19:00", days: [4],
  },
  {
    id: "manoa-farmers-market", title: "Mānoa Farmers Market", category: "Community",
    description: "A market in the Mānoa Marketplace courtyard three days a week, with free parking in the lot.",
    organizer: "Mānoa Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Mānoa Marketplace", address: "2752 Woodlawn Dr., Honolulu, HI 96822", lat: 21.30864, lng: -157.8105,
    start: "07:00", end: "14:00", days: [2, 4, 0],
  },
  {
    id: "fort-street-farmers-market", title: "Fort Street Mall Farmers Market", category: "Community",
    description: "A downtown market on Fort Street Mall, convenient for office workers. Street and municipal-lot parking only.",
    organizer: "Fort Street Mall Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Fort Street Mall", address: "Fort Street Mall, Honolulu, HI 96813", lat: 21.31028, lng: -157.86068,
    start: "07:00", end: "13:30", days: [2, 5],
  },
  {
    id: "waimanalo-farmers-market", title: "Waimānalo Farmers Market", category: "Community",
    description: "A Wednesday-afternoon market at Waimānalo Elementary and Intermediate School with seasonal produce and prepared foods.",
    organizer: "Waimānalo Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Waimānalo Elementary and Intermediate School", city: "Waimānalo", address: "41-1330 Kalanianaʻole Hwy., Waimānalo, HI 96795",
    start: "14:00", end: "17:15", days: [3],
  },
  {
    id: "windward-mall-farmers-market-sun", title: "Windward Mall Farmers Market (Sunday)", category: "Community",
    description: "An indoor, air-conditioned market at Windward Mall in Kāneʻohe.",
    organizer: "Windward Mall Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Windward Mall", city: "Kāneʻohe", address: "46-056 Kamehameha Hwy., Kāneʻohe, HI 96744", lat: 21.41991, lng: -157.80458,
    start: "10:00", end: "14:00", days: [0],
  },
  {
    id: "windward-mall-farmers-market-wed", title: "Windward Mall Farmers Market (Wednesday)", category: "Community",
    description: "An indoor, air-conditioned market at Windward Mall in Kāneʻohe.",
    organizer: "Windward Mall Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Windward Mall", city: "Kāneʻohe", address: "46-056 Kamehameha Hwy., Kāneʻohe, HI 96744", lat: 21.41991, lng: -157.80458,
    start: "14:00", end: "18:00", days: [3],
  },
  {
    id: "hyatt-waikiki-market", title: "Hyatt Regency Waikīkī Market", category: "Community",
    description: "An evening market on the ground floor of the Hyatt Regency Waikīkī with crafts, fresh fruit, malasadas and cakes. It leans toward visitors.",
    organizer: "Hyatt Regency Waikīkī", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Hyatt Regency Waikīkī Beach Resort and Spa", address: "2424 Kalākaua Ave., Honolulu, HI 96815", lat: 21.27607, lng: -157.82509,
    start: "16:00", end: "20:00", days: [1, 3],
  },
  {
    id: "pearlridge-farmers-market", title: "Pearlridge Farmers Market", category: "Community",
    description: "A casual Saturday market with produce, mushrooms, bread and pastries, in the old Sears parking lot at Pearlridge Wai Makai.",
    organizer: "Pearlridge Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Pearlridge Mall, Wai Makai", city: "ʻAiea", address: "98-180 Kamehameha Hwy., ʻAiea, HI 96701",
    start: "08:00", end: "12:00", days: [6],
  },
  {
    id: "waialua-farmers-market", title: "Waialua Farmers Market", category: "Community",
    description: "A Saturday market at the historic Waialua Sugar Mill on the North Shore, with produce, juices, baked goods and bread.",
    organizer: "Waialua Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Waialua Sugar Mill", city: "Waialua", address: "67-106 Kealohanui St., Waialua, HI 96791", lat: 21.57384, lng: -158.12447,
    start: "08:30", end: "13:00", days: [6],
  },
  {
    id: "kailua-farmers-market-castle", title: "Kailua Farmers Market", category: "Community",
    description: "A Sunday-morning market next to Adventist Health Castle, with overflow parking at Christ Church United.",
    organizer: "Kailua Farmers Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Next to Adventist Health Castle", city: "Kailua", address: "640 Ulukahiki St., Kailua, HI 96734", lat: 21.38097, lng: -157.75833,
    start: "08:00", end: "12:00", days: [0],
  },
  {
    id: "lokahi-kailua-market", title: "Lōkahi Kailua Market", category: "Community",
    description: "A covered Sunday market in Kailua with live music and keiki crafts. A few dates are held at alternate venues.",
    organizer: "Lōkahi Kailua Market", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Lōkahi Kailua Market", city: "Kailua", address: "354 Uluniu St. #301, Kailua, HI 96734", lat: 21.39674, lng: -157.74318,
    start: "09:00", end: "13:00", days: [0],
  },
  {
    id: "wahiawa-market-day", title: "Wahiawā Market Day", category: "Community",
    description: "A monthly market of locally made food products at the Wahiawā Value-Added Product Development Center, with cooking demos, tastings, music and tours.",
    organizer: "Wahiawā Value-Added Product Development Center", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Wahiawā Value-Added Product Development Center", city: "Wahiawā", address: "1001 California Ave., Wahiawā, HI 96786", lat: 21.49845, lng: -158.02332,
    start: "09:00", end: "13:00", days: [6], weeks: [3],
  },
  {
    id: "kunia-loa-farmers-market", title: "Kunia Loa Farmers Market", category: "Community",
    description: "A twice-monthly market at Kunia Loa Ridge Farmlands with local farmers' produce plus food, plant and craft vendors.",
    organizer: "Kunia Loa Ridge Farmlands", source_url: HM_MARKETS, price: MARKET_PRICE, note: MARKET_NOTE,
    venue: "Kunia Loa Ridge Farmlands", city: "Kunia", address: "94-1100 Kunia Rd., Kunia, HI 96759",
    start: "09:00", end: "13:00", days: [6], weeks: [1, 3],
  },

  // ----------------------------------------------------------------- Other weekly
  {
    id: "waikiki-friday-fireworks", title: "Friday Night Fireworks at Hilton Hawaiian Village", category: "Community",
    description: "The Hilton Hawaiian Village's weekly fireworks over Waikīkī. Weather or other circumstances can cancel a show. Popular viewing spots are the beach and the Village Green, where a Huli Huli Chicken dinner runs 4:30 to 8 PM.",
    organizer: "Hilton Hawaiian Village", source_url: "https://hiltonhawaiianvillage.com/friday-night-fireworks/", price: "Free to watch from the beach, per local guides",
    venue: "Hilton Hawaiian Village", address: "2005 Kalia Rd., Honolulu, HI 96815", lat: 21.28318, lng: -157.83572,
    start: "19:45", days: [5],
  },

  // -------------------------------------------------------------------- Run clubs
  {
    id: "run-drink-repeat", title: "Run. Drink. Repeat.", category: "Fitness", club_id: "run-drink-repeat",
    description: "A free Thursday run of about three miles that starts and ends at Howzit Brewing in Kakaʻako, with a drink afterward. Show up; no sign-up needed.",
    organizer: "Run. Drink. Repeat.", source_url: HM_RUN, price: "Free", note: RUN_NOTE,
    venue: "Howzit Brewing", city: "Honolulu", lat: 21.29727, lng: -157.85671,
    start: "18:15", days: [4],
  },
  {
    id: "kakaako-run-club", title: "Kakaʻako Run Club", category: "Fitness", club_id: "kakaako-run-club",
    description: "A free Tuesday-evening group run from Kakaʻako Waterfront Park, at Cooke and Ilalo streets. The after-run stops include Village Bottle Shop, Aloha Beer and Howzit Brewing.",
    organizer: "Kakaʻako Run Club", source_url: HM_RUN, price: "Free", note: RUN_NOTE,
    venue: "Kakaʻako Waterfront Park", city: "Honolulu", lat: 21.29311, lng: -157.86349,
    start: "17:30", days: [2],
  },
  {
    id: "doho-run-club", title: "DoHo Run Club", category: "Fitness", club_id: "doho-run-club",
    description: "A free Thursday-evening run from the Robert William Kalanihiapo Wilcox statue downtown, with a get-together afterward at Black Shamrock Tavern.",
    organizer: "DoHo Run Club", source_url: HM_RUN, price: "Free", note: RUN_NOTE,
    venue: "Robert William Kalanihiapo Wilcox Statue", address: "102 S. King St., Honolulu, HI 96813", lat: 21.30903, lng: -157.8621,
    start: "17:30", days: [4],
  },
  {
    id: "honolulu-runners-tuesday", title: "Honolulu Runners", category: "Fitness", club_id: "honolulu-runners",
    description: "A free Tuesday-evening group run from the Runners Route store on Kapiʻolani Blvd. Routes of 4 to 7 miles go through Waikīkī, Ala Moana Beach Park and downtown.",
    organizer: "Runners Route", source_url: HM_RUN, price: "Free", note: RUN_NOTE,
    venue: "Runners Route, Kapiʻolani", city: "Honolulu",
    start: "17:30", days: [2],
  },
  {
    id: "north-shore-run-club", title: "North Shore Run Club", category: "Fitness", club_id: "north-shore-run-club",
    description: "A free Wednesday-evening run from ʻĀweoweo Beach Park in Haleʻiwa, with food and drinks afterward in town.",
    organizer: "North Shore Run Club", source_url: HM_RUN, price: "Free", note: RUN_NOTE,
    venue: "ʻĀweoweo Beach Park", city: "Haleʻiwa",
    start: "17:15", days: [3],
  },
  {
    id: "honolulu-marathon-clinic", title: "Honolulu Marathon Clinic", category: "Fitness", club_id: "honolulu-marathon-clinic",
    description: "Free Sunday-morning group training for anyone who runs or walks, with groups for all paces. Runs from March until the week before the Honolulu Marathon.",
    organizer: "Mid-Pacific Road Runners Club", source_url: "https://runsignup.com/MemberOrg/MidPacificRoadRunnersClub/Page/TrainingtoRun", registration_url: "https://runsignup.com/Club/Join/2243",
    price: "Free", note: "The meeting place is on the club's registration page.",
    venue: "See event listing", city: "Honolulu",
    start: "07:30", days: [0], until: "2026-12-06",
  },

  // ------------------------------------------------------------------ Volunteering
  {
    id: "foodbank-lighthouse-produce", title: "Volunteer: ʻOhana Produce Plus at Lighthouse Outreach Center", category: "Volunteer", club_id: "hawaii-foodbank",
    description: "Help hand out fresh produce each Thursday at the Lighthouse Outreach Center in Waipahu. About 10 volunteers are needed. Ages 13 and up; ages 13 to 15 volunteer with an adult. Apply with the Hawaiʻi Foodbank first.",
    organizer: "Hawaiʻi Foodbank", source_url: FOODBANK, registration_url: FOODBANK, price: "Free",
    venue: "Lighthouse Outreach Center", city: "Waipahu", address: "94-230 Leokane St., Waipahu, HI 96797", lat: 21.38058, lng: -158.02075,
    start: "08:00", end: "11:00", days: [4],
  },
  {
    id: "foodbank-angel-network", title: "Volunteer: ʻOhana Produce Plus at Angel Network Charities", category: "Volunteer", club_id: "hawaii-foodbank",
    description: "Help with a produce distribution on the first and third Thursday of each month. Ages 14 and up; ages 14 and 15 volunteer with an adult, and 16 and older may come on their own. Apply with the Hawaiʻi Foodbank first.",
    organizer: "Hawaiʻi Foodbank", source_url: FOODBANK, registration_url: FOODBANK, price: "Free",
    venue: "Angel Network Charities", address: "5339 Kalanianaʻole Hwy., Honolulu, HI 96821",
    start: "11:00", end: "15:00", days: [4], weeks: [1, 3],
  },
  {
    id: "foodbank-kings-chapel", title: "Volunteer: ʻOhana Produce Plus at King's Chapel", category: "Volunteer", club_id: "hawaii-foodbank",
    description: "Help with a produce distribution on the second and fourth Thursday of each month. About 10 to 15 volunteers are needed. Ages 13 and up; ages 13 to 15 volunteer with an adult. Apply with the Hawaiʻi Foodbank first.",
    organizer: "Hawaiʻi Foodbank", source_url: FOODBANK, registration_url: FOODBANK, price: "Free",
    venue: "King's Chapel", address: "549 Halemaumau St., Honolulu, HI 96821", lat: 21.28455, lng: -157.73549,
    start: "09:30", end: "13:00", days: [4], weeks: [2, 4],
  },
  {
    id: "foodbank-senior-food-box", title: "Volunteer: Pack Senior Food Boxes", category: "Volunteer", club_id: "hawaii-foodbank",
    description: "Pack Commodity Supplemental Food Program boxes for seniors at the Hawaiʻi Foodbank warehouse in Mapunapuna. Space is limited, so reserve early. Ages 8 and up; under 16 needs an adult.",
    organizer: "Hawaiʻi Foodbank", source_url: FOODBANK, registration_url: FOODBANK, price: "Free",
    venue: "Hawaiʻi Foodbank warehouse", address: "2611 Kilihau St., Honolulu, HI 96819", lat: 21.33608, lng: -157.89445,
    start: "08:00", end: "12:00", dates: ["2026-11-21", "2026-12-19"], label: "Select Saturdays",
  },
  {
    id: "sch-small-kine-cleanup", title: "Small Kine Cleanup at James Campbell Wildlife Refuge", category: "Volunteer", club_id: "sustainable-coastlines-hawaii",
    description: "A monthly beach cleanup in Kahuku with Sustainable Coastlines Hawaiʻi at the James Campbell National Wildlife Refuge. Registration is free and online.",
    organizer: "Sustainable Coastlines Hawaiʻi", source_url: "https://www.sustainablecoastlineshawaii.org/schedule", registration_url: "https://www.sustainablecoastlineshawaii.org/schedule", price: "Free",
    note: "Dates as listed on the organizer's schedule page. Registration for December opens in November.",
    venue: "James Campbell National Wildlife Refuge", city: "Kahuku",
    start: "09:00", end: "12:00", dates: ["2026-11-19", "2026-12-10"], label: "Monthly",
  },
];
