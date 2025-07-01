// SEO configuration for Script AI
// This file centralizes all metadata for better maintainability

// Default metadata that can be shared across pages
const defaultMeta = {
  title: "Script AI",
  description: "A outreach tool built for students to find research and general opportunities.",
  baseURL: "https://scriptoutreach.com",
  type: "website",
  image: "/og/home.jpg",
  author: {
    name: "Script AI Team",
    url: "https://scriptoutreach.com"
  }
};

// Page-specific metadata
const pages = {
  home: {
    ...defaultMeta,
    path: "/",
    canonical: "https://scriptoutreach.com",
    robots: "index,follow",
    alternates: [
      { href: "https://scriptoutreach.com", hrefLang: "en" },
    ],
  },
  
  pricing: {
    ...defaultMeta,
    path: "/pricing",
    title: "Pricing - Script AI",
    description: "Choose the perfect plan for your research outreach needs. Get started with our free tier or upgrade to Pro for unlimited campaigns.",
    image: "/og/pricing.jpg",
    canonical: "https://scriptoutreach.com/pricing",
    robots: "index,follow",
  },
  
  dashboard: {
    ...defaultMeta,
    path: "/student/dashboard",
    title: "Dashboard - Script AI",
    description: "Your personalized dashboard to manage research opportunities and track your outreach campaigns.",
    image: "/og/dashboard.jpg",
    canonical: "https://scriptoutreach.com/student/dashboard",
    robots: "noindex,nofollow", // Private pages should not be indexed
  },
  
  campaigns: {
    ...defaultMeta,
    path: "/student/campaigns",
    title: "Campaigns - Script AI",
    description: "Create and manage your research outreach campaigns. Connect with professors and find opportunities.",
    image: "/og/campaigns.jpg",
    canonical: "https://scriptoutreach.com/student/campaigns",
    robots: "noindex,nofollow",
  },
  
  privacy: {
    ...defaultMeta,
    path: "/privacy",
    title: "Privacy Policy - Script AI",
    description: "Learn how Script AI protects your privacy and handles your data securely.",
    image: "/og/privacy.jpg",
    canonical: "https://scriptoutreach.com/privacy",
    robots: "index,follow",
  },
  
  terms: {
    ...defaultMeta,
    path: "/terms",
    title: "Terms of Service - Script AI",
    description: "Read our terms of service and understand your rights and responsibilities when using Script AI.",
    image: "/og/terms.jpg",
    canonical: "https://scriptoutreach.com/terms",
    robots: "index,follow",
  },
  
  articles: {
    ...defaultMeta,
    path: "/articles",
    title: "Articles - Script AI",
    description: "Read our latest articles about research opportunities, outreach strategies, and academic success.",
    image: "/og/articles.jpg",
    canonical: "https://scriptoutreach.com/articles",
    robots: "index,follow",
  },
  
  // Add more pages as needed
};

export { defaultMeta, pages };
