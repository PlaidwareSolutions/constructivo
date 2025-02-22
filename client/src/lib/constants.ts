export const COMPANY_NAME = "Constructivo";
export const COMPANY_TAGLINE = "Build Right And Better";

export const SERVICES = [
  {
    id: "residential",
    title: "Residential Construction",
    description: "New constructions and renovations for homes and multiplexes",
    icon: "Home",
  },
  {
    id: "commercial",
    title: "Commercial Construction",
    description: "New constructions and renovations for business spaces",
    icon: "Building2",
  },
  {
    id: "tenant",
    title: "Tenant Customization",
    description: "Custom modifications for commercial space tenants",
    icon: "Pencil",
  },
  {
    id: "investment",
    title: "Investment Opportunities",
    description: "Real estate based investment partnerships",
    icon: "TrendingUp",
  },
];

export const STOCK_PHOTOS = {
  modern: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
  ],
  luxury: [
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3d7",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc",
    "https://images.unsplash.com/photo-1600566753151-384129cf4e3e",
  ],
  commercial: [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4",
  ],
  construction: [
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
};

export const COLOR_PALETTES = [
  {
    name: "Modern Professional",
    primary: "hsl(215 28% 17%)",
    colors: ["#1f2937", "#4b5563", "#9ca3af", "#e5e7eb"],
  },
  {
    name: "Warm Luxury",
    primary: "hsl(24 10% 10%)",
    colors: ["#292524", "#78716c", "#d6d3d1", "#fafaf9"],
  },
  {
    name: "Urban Industrial",
    primary: "hsl(240 5% 12%)",
    colors: ["#18181b", "#52525b", "#a1a1aa", "#f4f4f5"],
  },
  {
    name: "Natural Elements",
    primary: "hsl(20 14% 12%)",
    colors: ["#1c1917", "#57534e", "#a8a29e", "#f5f5f4"],
  },
];

export const NAVIGATION = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
];

export const META_DEFAULTS = {
  title: `${COMPANY_NAME} - ${COMPANY_TAGLINE}`,
  description: "Leading construction company specializing in residential and commercial buildings. Expert builders creating modern, sustainable spaces.",
  keywords: "construction, residential construction, commercial construction, luxury homes, modern architecture, building construction",
  og: {
    type: "website",
    image: STOCK_PHOTOS.modern[0],
    siteName: COMPANY_NAME,
  }
};

export const PAGE_META = {
  services: {
    title: `Services - ${COMPANY_NAME}`,
    description: "Expert construction services including residential, commercial, tenant improvements, and real estate investment opportunities.",
    keywords: "construction services, residential construction, commercial construction, tenant improvements, real estate investment",
  },
  projects: {
    title: `Projects - ${COMPANY_NAME}`,
    description: "Explore our portfolio of successful construction projects, from luxury homes to commercial buildings.",
    keywords: "construction portfolio, building projects, completed constructions, luxury homes, commercial buildings",
  },
  admin: {
    title: `Admin Dashboard - ${COMPANY_NAME}`,
    description: "Secure administrative interface for managing construction projects and website content.",
  }
};