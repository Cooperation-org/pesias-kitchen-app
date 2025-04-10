
export const APP_NAME = "Pesia's Kitchen EAT Initiative"

// Routes
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  IMPACT: "/impact",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  EVENTS: "/dashboard/events",
  REWARDS: "/dashboard/rewards",
  SCAN: "/dashboard/scan",
  PROFILE: "/dashboard/profile",
}

// Event types
export const EVENT_TYPES = {
  FOOD_SORTING: "food_sorting",
  FOOD_DISTRIBUTION: "food_distribution",
  FOOD_DELIVERY: "food_delivery",
  FOOD_COLLECTION: "food_collection",
}

// Reward amounts in G$ tokens
export const REWARD_AMOUNTS = {
  [EVENT_TYPES.FOOD_SORTING]: 20,
  [EVENT_TYPES.FOOD_DISTRIBUTION]: 25,
  [EVENT_TYPES.FOOD_DELIVERY]: 30,
  [EVENT_TYPES.FOOD_COLLECTION]: 15,
}

// Social media links
export const SOCIAL_LINKS = {
  TWITTER: "https://x.com/eatfoodrescue",
  WEBSITE: "https://www.pesiaskitchen.org",
}

// Dashboard navigation items
export const DASHBOARD_NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "dashboard" },
  { label: "Events", href: ROUTES.EVENTS, icon: "calendar" },
  { label: "Rewards", href: ROUTES.REWARDS, icon: "money" },
  { label: "Scan QR", href: ROUTES.SCAN, icon: "qrcode" },
  { label: "Profile", href: ROUTES.PROFILE, icon: "user" },
]