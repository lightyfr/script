// IMPORTANT: Replace with your own domain address - it's used for SEO in meta tags and schema
const baseURL = "https://scriptoutreach.com";

// Import and set font for each variant
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const primaryFont = Geist({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
});

const monoFont = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const font = {
  primary: primaryFont,
  secondary: primaryFont,
  tertiary: primaryFont,
  code: monoFont,
};

// default customization applied to the HTML in the main layout.tsx
const style = {
  theme: "dark", // dark | light - not needed when using ThemeProvider
  neutral: "gray", // sand | gray | slate
  brand: "indigo", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "red", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  solid: "contrast", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "translucent", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

const effects = {
  mask: {
    cursor: false,
    x: 100,
    y: 0,
    radius: 100,
  },
  gradient: {
    display: true,
    opacity: 90,
    x: 100,
    y: 60,
    width: 70,
    height: 50,
    tilt: -40,
    colorStart: "accent-background-strong",
    colorEnd: "page-background",
  },
  dots: {
    display: true,
    opacity: 20,
    size: "2",
    color: "brand-on-background-weak",
  },
  grid: {
    display: true,
    opacity: 100,
    color: "accent-alpha-weak",
    width: "0.25rem",
    height: "0.25rem",
  },
  lines: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-weak",
    size: "16",
    thickness: 1,
    angle: 45,
  },
};

// metadata for pages
const meta = {
  home: {
    path: "/",
    title: "Script AI",
    description: "A outreach tool built for students to find research and general opportunities.",
    image: "/og/home.jpg",
    canonical: "https://scriptoutreach.com",
    robots: "index,follow",
    alternates: [
      { href: "https://scriptoutreach.com", hrefLang: "en" },
    ],
  },
  pricing: {
    path: "/pricing",
    title: "Pricing - Script AI",
    description: "Choose the perfect plan for your research outreach needs. Get started with our free tier or upgrade to Pro for unlimited campaigns.",
    image: "/og/pricing.jpg",
    canonical: "https://scriptoutreach.com/pricing",
    robots: "index,follow",
  },
  dashboard: {
    path: "/student/dashboard",
    title: "Dashboard - Script AI",
    description: "Your personalized dashboard to manage research opportunities and track your outreach campaigns.",
    image: "/og/dashboard.jpg",
    canonical: "https://scriptoutreach.com/student/dashboard",
    robots: "noindex,nofollow", // Private pages should not be indexed
  },
  campaigns: {
    path: "/student/campaigns",
    title: "Campaigns - Script AI",
    description: "Create and manage your research outreach campaigns. Connect with professors and find opportunities.",
    image: "/og/campaigns.jpg",
    canonical: "https://scriptoutreach.com/student/campaigns",
    robots: "noindex,nofollow",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy - Script AI",
    description: "Learn how Script AI protects your privacy and handles your data securely.",
    image: "/og/privacy.jpg",
    canonical: "https://scriptoutreach.com/privacy",
    robots: "index,follow",
  },
  terms: {
    path: "/terms",
    title: "Terms of Service - Script AI",
    description: "Read our terms of service and understand your rights and responsibilities when using Script AI.",
    image: "/og/terms.jpg",
    canonical: "https://scriptoutreach.com/terms",
    robots: "index,follow",
  },
  // add more routes and reference them in page.tsx
};

// default schema data
const schema = {
  logo: "",
  type: "Organization",
  name: "Script AI",
  description: meta.home.description,
  email: "lorant@once-ui.com",
};

// social links
const social = {
  twitter: "https://www.twitter.com/_onceui",
  linkedin: "https://www.linkedin.com/company/scriptoutreach/",
  discord: "https://discord.com/invite/5EyAQ4eNdS",
};

const socials = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: 'GitHub',
    icon: 'github',
    link: 'https://github.com/selene-yu',
  },
  {
    name: 'LinkedIn',
    icon: 'linkedin',
    link: 'https://www.linkedin.com/in/selene-yu',
  },
  {
    name: 'Threads',
    icon: 'threads',
    link: 'https://www.threads.com/@selene.yu',
  },
]

export { baseURL, font, style, meta, schema, social, socials, effects };
