import type { Category, Difficulty } from "@/engine/types";

/**
 * Practice bank: problems learners solve independently (Practice Arena, AI Interviewer).
 * Reference ranges come from GuessLab's own rough models and are deliberately wide.
 * They are illustrative, not verified statistics.
 */
export interface PracticeProblem {
  id: string;
  title: string;
  prompt: string;
  categories: Category[];
  difficulty: Difficulty;
  answerUnitLabel: string;
  /** Unit string for unit checks, e.g. "order/day". */
  answerUnit: string;
  reference: [number, number];
  referenceNote: string;
  /** Each inner array is a set of synonyms for one driver a good structure should include. */
  drivers: { label: string; words: string[] }[];
  clarifications: string[];
  concepts: string[];
  guidedId?: string;
  /** Topic overlap with the RCS Guesstimate Book, for attribution (no content reproduced). */
  rcsTopic?: string;
}

const pop = { label: "Population base", words: ["population", "people", "households", "residents", "users", "crore"] };

export const PRACTICE: PracticeProblem[] = [
  {
    id: "chai-cups-india", guidedId: "chai-cups-india", title: "Cups of chai sold in India every day", prompt: "Estimate the number of cups of chai sold in India every day.",
    categories: ["consumption", "demand-side", "population"], difficulty: "beginner", answerUnitLabel: "cups per day", answerUnit: "cup/day", reference: [1.3e9, 3e9],
    referenceNote: "GuessLab model: ~1.5–2.2 billion cups/day depending on approach.",
    drivers: [pop, { label: "Share who drink tea", words: ["share", "drink", "drinker", "%"] }, { label: "Cups per person", words: ["cups per", "cup per", "cups a day", "per person", "per drinker"] }, { label: "Home vs outside", words: ["home", "outside", "office", "stall", "tapri"] }],
    clarifications: ["sold vs consumed", "what counts as chai", "typical day"], concepts: ["Consumption estimates", "MECE"],
  },
  {
    id: "momo-stall-revenue", guidedId: "momo-stall-revenue", title: "Daily revenue of a momo stall", prompt: "Estimate the daily revenue of a busy momo stall in a Delhi market.",
    categories: ["revenue", "supply-side", "capacity"], difficulty: "beginner", answerUnitLabel: "rupees per day", answerUnit: "INR/day", reference: [8000, 30000],
    referenceNote: "GuessLab model: ~₹16,000–17,000 a day.",
    drivers: [{ label: "Operating hours", words: ["hour", "hours", "peak", "lunch", "dinner"] }, { label: "Capacity", words: ["capacity", "plates per hour", "steamer", "per hour"] }, { label: "Utilisation", words: ["utilisation", "utilization", "busy", "occupancy", "%"] }, { label: "Price", words: ["price", "₹", "rupees", "per plate"] }],
    clarifications: ["revenue vs profit", "operating hours", "location"], concepts: ["Revenue = volume × price", "Capacity"], rcsTopic: "Food stall revenue",
  },
  {
    id: "bengaluru-food-orders", guidedId: "bengaluru-food-orders", title: "Daily food delivery orders in Bengaluru", prompt: "Estimate the number of food delivery orders placed in Bengaluru on a typical day.",
    categories: ["marketplace", "demand-side", "digital-product"], difficulty: "intermediate", answerUnitLabel: "orders per day", answerUnit: "order/day", reference: [2.5e5, 9e5],
    referenceNote: "GuessLab model: ~4.5–5 lakh orders/day across apps.",
    drivers: [pop, { label: "Online-capable share", words: ["smartphone", "online", "internet", "upi", "digital"] }, { label: "Share who order", words: ["order", "orderers", "use the app", "%"] }, { label: "Frequency", words: ["frequency", "per month", "per week", "times"] }],
    clarifications: ["all apps or one", "food only vs grocery", "average day"], concepts: ["User funnels", "Frequency"],
  },
  {
    id: "movie-tickets-online", guidedId: "movie-tickets-online", title: "Movie tickets booked online in India on a weekend", prompt: "Estimate the number of movie tickets booked online in India over a typical weekend.",
    categories: ["digital-product", "infrastructure", "supply-side"], difficulty: "intermediate", answerUnitLabel: "tickets per weekend", answerUnit: "ticket/weekend", reference: [2e6, 8e6],
    referenceNote: "GuessLab model: ~40–50 lakh tickets/weekend.",
    drivers: [{ label: "Screens", words: ["screen", "screens", "theatre", "cinema"] }, { label: "Shows", words: ["show", "shows"] }, { label: "Seats", words: ["seat", "seats", "capacity"] }, { label: "Occupancy", words: ["occupancy", "full", "%"] }, { label: "Online share", words: ["online", "app", "booked"] }],
    clarifications: ["weekend days", "online channels", "normal vs release weekend"], concepts: ["Occupancy", "Triangulation"], rcsTopic: "Cinema revenue",
  },
  {
    id: "dark-store-peak", guidedId: "dark-store-peak", title: "Peak-hour orders a dark store can fulfil", prompt: "Estimate how many orders a quick-commerce dark store in Gurugram can fulfil in its busiest hour.",
    categories: ["capacity", "operations", "marketplace"], difficulty: "advanced", answerUnitLabel: "orders in the peak hour", answerUnit: "order/hour", reference: [40, 200],
    referenceNote: "GuessLab model: ~70/hour, rider-limited; demand ~120/hour.",
    drivers: [{ label: "Demand", words: ["households", "demand", "adoption", "orders per week"] }, { label: "Picking capacity", words: ["picker", "pick", "pack"] }, { label: "Rider capacity", words: ["rider", "delivery", "trip"] }, { label: "Bottleneck", words: ["min", "minimum", "bottleneck", "smallest", "constraint"] }],
    clarifications: ["staff at peak", "radius and promise", "which hour"], concepts: ["Bottlenecks", "Throughput"], rcsTopic: "Capacity and queues",
  },
  {
    id: "pizzas-india", title: "Pizzas delivered in India per day", prompt: "Estimate how many pizzas are delivered to homes in India on a typical day.",
    categories: ["consumption", "marketplace"], difficulty: "intermediate", answerUnitLabel: "pizzas per day", answerUnit: "pizza/day", reference: [4e5, 3e6],
    referenceNote: "Illustrative: urban households × pizza-ordering share × frequency; or outlets × deliveries per outlet.",
    drivers: [{ label: "Urban households", words: ["urban", "households", "cities"] }, { label: "Share who order pizza", words: ["share", "order pizza", "%"] }, { label: "Frequency", words: ["per month", "frequency", "per week"] }, { label: "Pizzas per order", words: ["per order", "pizzas per"] }],
    clarifications: ["delivery only or dine-in", "all brands", "typical day"], concepts: ["Demand funnel", "Supply check from outlets"], rcsTopic: "Pizzas sold per day",
  },
  {
    id: "smartphone-users", title: "Smartphone users in India", prompt: "Estimate the number of smartphone users in India.",
    categories: ["population", "digital-product"], difficulty: "beginner", answerUnitLabel: "users", answerUnit: "person", reference: [5.5e8, 8.5e8],
    referenceNote: "Illustrative. Public estimates typically fall around 65–75 crore; verify a current source.",
    drivers: [pop, { label: "Age filter", words: ["age", "children", "adults", "above"] }, { label: "Urban/rural split", words: ["urban", "rural"] }, { label: "Penetration", words: ["penetration", "own", "share", "%"] }],
    clarifications: ["users vs devices", "active users"], concepts: ["Population segmentation"],
  },
  {
    id: "metro-riders", title: "Daily riders on the Delhi Metro", prompt: "Estimate the number of passenger journeys on the Delhi Metro in a day.",
    categories: ["infrastructure", "capacity"], difficulty: "intermediate", answerUnitLabel: "journeys per day", answerUnit: "journey/day", reference: [4e6, 9e6],
    referenceNote: "Illustrative: lines × trains per hour × capacity × load, by peak and off-peak.",
    drivers: [{ label: "Lines and trains", words: ["line", "lines", "trains", "frequency"] }, { label: "Capacity per train", words: ["coach", "capacity", "passengers per"] }, { label: "Load factor", words: ["load", "occupancy", "full", "%"] }, { label: "Peak vs off-peak", words: ["peak", "off-peak", "rush"] }],
    clarifications: ["journeys vs unique riders", "weekday"], concepts: ["Capacity × utilisation"], rcsTopic: "Metro ridership",
  },
  {
    id: "upi-daily", title: "UPI transactions per day", prompt: "Estimate the number of UPI transactions in India on a typical day.",
    categories: ["digital-product", "population"], difficulty: "intermediate", answerUnitLabel: "transactions per day", answerUnit: "transaction/day", reference: [4e8, 9e8],
    referenceNote: "Illustrative. NPCI publishes monthly volumes; recent public figures are in the tens of billions a month. Verify before quoting.",
    drivers: [pop, { label: "UPI users", words: ["upi users", "users", "active"] }, { label: "Transactions per user", words: ["per user", "per day", "per month", "frequency"] }, { label: "P2P vs merchant", words: ["merchant", "p2p", "shop", "person to person"] }],
    clarifications: ["P2P and merchant", "successful only"], concepts: ["Digital adoption funnel"],
  },
  {
    id: "riders-gurugram", title: "Food delivery riders needed in Gurugram at Friday 8 pm", prompt: "Estimate how many food delivery riders need to be on the road in Gurugram at 8 pm on a Friday.",
    categories: ["operations", "capacity", "marketplace"], difficulty: "advanced", answerUnitLabel: "riders", answerUnit: "rider", reference: [2500, 15000],
    referenceNote: "Illustrative: peak-hour orders ÷ deliveries per rider per hour, plus buffer.",
    drivers: [{ label: "Daily orders", words: ["orders per day", "daily orders", "orders"] }, { label: "Peak-hour share", words: ["peak", "8 pm", "share", "dinner"] }, { label: "Deliveries per rider-hour", words: ["per rider", "trip", "round trip", "deliveries per"] }, { label: "Buffer", words: ["buffer", "idle", "surge", "rain"] }],
    clarifications: ["all apps or one", "what counts as on the road"], concepts: ["Throughput", "Peak sizing"],
  },
  {
    id: "multiplex-weekly", title: "Weekly revenue of a five-screen multiplex", prompt: "Estimate the weekly revenue of a five-screen multiplex in Delhi.",
    categories: ["revenue", "supply-side"], difficulty: "intermediate", answerUnitLabel: "rupees per week", answerUnit: "INR/week", reference: [1e6, 6e6],
    referenceNote: "Illustrative: tickets + food & beverage + ads.",
    drivers: [{ label: "Seats and shows", words: ["seats", "shows", "screens"] }, { label: "Occupancy", words: ["occupancy", "%", "weekday", "weekend"] }, { label: "Ticket price", words: ["ticket price", "price", "₹"] }, { label: "Food and beverage", words: ["food", "f&b", "popcorn", "snacks"] }],
    clarifications: ["revenue vs profit", "which revenue streams"], concepts: ["Multiple revenue streams"], rcsTopic: "Multiplex revenue",
  },
  {
    id: "roses-valentines", title: "Roses sold in Delhi on Valentine's Day", prompt: "Estimate the number of roses sold in Delhi on 14 February.",
    categories: ["consumption", "demand-side"], difficulty: "beginner", answerUnitLabel: "roses", answerUnit: "rose", reference: [5e5, 6e6],
    referenceNote: "Illustrative: couples celebrating × roses per gift, plus decoration demand.",
    drivers: [pop, { label: "People celebrating", words: ["couples", "celebrate", "partner", "relationship"] }, { label: "Roses per gift", words: ["per gift", "roses per", "bouquet"] }, { label: "Decoration demand", words: ["decoration", "shops", "restaurants", "events"] }],
    clarifications: ["sold vs given", "Delhi NCT or NCR"], concepts: ["Event-day spikes"], rcsTopic: "Roses on 14 February",
  },
  {
    id: "coffee-bengaluru", title: "Cups of coffee sold by cafés in Bengaluru per day", prompt: "Estimate how many cups of coffee cafés in Bengaluru sell in a day.",
    categories: ["consumption", "supply-side"], difficulty: "intermediate", answerUnitLabel: "cups per day", answerUnit: "cup/day", reference: [3e5, 2e6],
    referenceNote: "Illustrative: cafés × cups per café per day (chains, darshinis, independents).",
    drivers: [{ label: "Number of cafés", words: ["cafés", "cafes", "outlets", "darshini"] }, { label: "Cups per café", words: ["cups per", "per outlet", "per cafe", "per café"] }, { label: "Café types", words: ["chain", "independent", "darshini", "type"] }],
    clarifications: ["cafés only or all outlets", "filter coffee included"], concepts: ["Supply-side counting"],
  },
  {
    id: "atms-delhi", title: "ATMs in Delhi", prompt: "Estimate the number of ATMs in Delhi.",
    categories: ["infrastructure", "supply-side"], difficulty: "intermediate", answerUnitLabel: "ATMs", answerUnit: "atm", reference: [4000, 15000],
    referenceNote: "Illustrative: population ÷ people served per ATM, adjusted for commercial areas.",
    drivers: [pop, { label: "People per ATM", words: ["per atm", "served", "density"] }, { label: "Branch vs standalone", words: ["branch", "standalone", "off-site", "independent"] }],
    clarifications: ["Delhi NCT", "working ATMs only"], concepts: ["Density-based estimation"], rcsTopic: "ATMs in a city",
  },
  {
    id: "two-wheelers", title: "Two-wheelers sold in India per year", prompt: "Estimate the number of new two-wheelers sold in India in a year.",
    categories: ["consumption", "population"], difficulty: "intermediate", answerUnitLabel: "two-wheelers per year", answerUnit: "vehicle/year", reference: [1.2e7, 2.6e7],
    referenceNote: "Illustrative: households × ownership × replacement cycle + first-time buyers.",
    drivers: [{ label: "Households", words: ["households", "families"] }, { label: "Ownership", words: ["own", "ownership", "penetration"] }, { label: "Replacement cycle", words: ["replace", "years", "life"] }, { label: "First-time buyers", words: ["first-time", "new buyers", "growth"] }],
    clarifications: ["new only", "include EVs"], concepts: ["Replacement-cycle demand"],
  },
  {
    id: "golgappa-delhi", title: "Golgappa plates sold in Delhi per day", prompt: "Estimate the number of golgappa plates sold in Delhi in a day.",
    categories: ["consumption", "supply-side"], difficulty: "beginner", answerUnitLabel: "plates per day", answerUnit: "plate/day", reference: [5e5, 6e6],
    referenceNote: "Illustrative: vendors × plates per vendor, cross-checked with eaters per day.",
    drivers: [{ label: "Vendors", words: ["vendors", "stalls", "carts", "shops"] }, { label: "Plates per vendor", words: ["per vendor", "per stall", "plates per"] }, { label: "Demand check", words: ["people", "eat", "population"] }],
    clarifications: ["plates vs pieces", "stalls only"], concepts: ["Supply side with demand check"], rcsTopic: "Golgappas sold per day",
  },
  {
    id: "kirana-revenue", title: "Daily revenue of a neighbourhood kirana store", prompt: "Estimate the daily revenue of a neighbourhood kirana store in Pune.",
    categories: ["revenue", "demand-side"], difficulty: "beginner", answerUnitLabel: "rupees per day", answerUnit: "INR/day", reference: [8000, 50000],
    referenceNote: "Illustrative: households served × visits × basket value.",
    drivers: [{ label: "Households served", words: ["households", "catchment", "customers"] }, { label: "Visits", words: ["visits", "per day", "per week", "frequency"] }, { label: "Basket value", words: ["basket", "₹", "spend", "bill"] }],
    clarifications: ["store size", "revenue vs profit"], concepts: ["Catchment-based demand"],
  },
  {
    id: "weddings-india", title: "Weddings in India per year", prompt: "Estimate the number of weddings in India in a year.",
    categories: ["population"], difficulty: "beginner", answerUnitLabel: "weddings per year", answerUnit: "wedding/year", reference: [7e6, 1.5e7],
    referenceNote: "Illustrative: people reaching marriage age per year × share who marry ÷ 2 people per wedding.",
    drivers: [pop, { label: "Age cohort", words: ["age", "cohort", "turn", "per year", "life expectancy"] }, { label: "Share who marry", words: ["marry", "married", "%"] }, { label: "Two people per wedding", words: ["divide by 2", "÷ 2", "two people", "couple", "/2"] }],
    clarifications: ["weddings vs people marrying", "registered only"], concepts: ["Cohort-based estimation"],
  },
  {
    id: "cybercity-lunch", title: "Lunch delivery orders in Gurugram's Cyber City", prompt: "Estimate the number of lunch delivery orders placed by people working in Gurugram's Cyber City on a weekday.",
    categories: ["demand-side", "marketplace"], difficulty: "intermediate", answerUnitLabel: "orders per weekday", answerUnit: "order/day", reference: [1e4, 8e4],
    referenceNote: "Illustrative: office workers present × share ordering lunch × orders per orderer.",
    drivers: [{ label: "Office workers", words: ["employees", "workers", "office", "buildings"] }, { label: "Attendance", words: ["attendance", "hybrid", "present", "in office"] }, { label: "Share ordering", words: ["order lunch", "share", "%", "cafeteria"] }, { label: "Group orders", words: ["group", "per order", "shared"] }],
    clarifications: ["weekday", "lunch window", "group orders count once"], concepts: ["Workplace demand"],
  },
  {
    id: "restaurants-delhi-apps", title: "Restaurants active on food apps in Delhi NCR", prompt: "Estimate the number of restaurants active on food delivery apps in Delhi NCR.",
    categories: ["supply-side", "marketplace"], difficulty: "intermediate", answerUnitLabel: "restaurants", answerUnit: "restaurant", reference: [3e4, 1e5],
    referenceNote: "Illustrative: population ÷ people per restaurant × share listed on apps (including cloud kitchens).",
    drivers: [pop, { label: "Restaurant density", words: ["per restaurant", "density", "per 1000", "per lakh"] }, { label: "Share on apps", words: ["listed", "on apps", "online", "%"] }, { label: "Cloud kitchens", words: ["cloud kitchen", "dark kitchen", "delivery-only"] }],
    clarifications: ["active definition", "NCR boundary"], concepts: ["Supply density"],
  },
  {
    id: "food-app-mtu", title: "Monthly transacting users of a food delivery app in India", prompt: "Estimate the monthly transacting users of a leading food delivery app in India.",
    categories: ["digital-product", "population", "marketplace"], difficulty: "advanced", answerUnitLabel: "users per month", answerUnit: "person", reference: [2.5e7, 1.2e8],
    referenceNote: "Illustrative: urban online population × share ordering monthly × app share.",
    drivers: [pop, { label: "Urban / city tiers", words: ["urban", "tier", "cities"] }, { label: "Online and payment-ready", words: ["smartphone", "online", "upi", "internet"] }, { label: "Monthly ordering share", words: ["order", "monthly", "transact", "%"] }, { label: "App share", words: ["market share", "share of", "app share"] }],
    clarifications: ["transacting vs active", "one app"], concepts: ["User funnel", "Market share"],
  },
  {
    id: "ambulances-city", title: "Ambulances for a 10-minute response in a city", prompt: "Estimate how many ambulances a city of 1 crore people needs so anyone can be reached within 10 minutes.",
    categories: ["infrastructure", "capacity", "operations"], difficulty: "advanced", answerUnitLabel: "ambulances", answerUnit: "ambulance", reference: [300, 3000],
    referenceNote: "Illustrative: coverage (area ÷ area one ambulance covers in 10 min) and load (emergencies per hour × time per call).",
    drivers: [{ label: "City area", words: ["area", "sq km", "km"] }, { label: "Coverage per ambulance", words: ["radius", "coverage", "covers", "speed"] }, { label: "Call volume", words: ["emergencies", "calls", "per hour", "per day"] }, { label: "Time per call", words: ["time per call", "busy", "turnaround"] }],
    clarifications: ["urban only", "average or peak"], concepts: ["Coverage vs load"], rcsTopic: "Ambulances needed",
  },
  {
    id: "laptops-india", title: "Laptops sold in India per year", prompt: "Estimate the number of laptops sold in India in a year.",
    categories: ["consumption"], difficulty: "intermediate", answerUnitLabel: "laptops per year", answerUnit: "laptop/year", reference: [7e6, 2e7],
    referenceNote: "Illustrative: students + working professionals + businesses, with replacement cycles.",
    drivers: [{ label: "Students", words: ["students", "college"] }, { label: "Professionals", words: ["professionals", "employees", "office"] }, { label: "Businesses / enterprise", words: ["business", "enterprise", "company"] }, { label: "Replacement cycle", words: ["replace", "years", "life"] }],
    clarifications: ["new only", "include Chromebooks"], concepts: ["Installed base ÷ life"],
  },
  {
    id: "blinkit-gurugram", title: "Quick-commerce orders in Gurugram per day", prompt: "Estimate the number of quick-commerce orders placed in Gurugram on a typical day.",
    categories: ["marketplace", "demand-side"], difficulty: "intermediate", answerUnitLabel: "orders per day", answerUnit: "order/day", reference: [5e4, 3.5e5],
    referenceNote: "Illustrative: households × adoption × orders per week ÷ 7; or dark stores × orders per store.",
    drivers: [{ label: "Households", words: ["households", "population"] }, { label: "Adoption", words: ["adoption", "use", "app", "%"] }, { label: "Frequency", words: ["per week", "frequency", "per month"] }, { label: "Dark stores (supply check)", words: ["dark store", "stores", "per store"] }],
    clarifications: ["all apps", "groceries only"], concepts: ["Demand vs supply triangulation"],
  },
];

export function getPractice(id: string): PracticeProblem | undefined {
  return PRACTICE.find((p) => p.id === id);
}
