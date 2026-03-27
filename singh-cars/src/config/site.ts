export const siteConfig = {
  businessName: "Singh Car Bazar",
  tagline: "Buying and Selling Pre-Owned Cars",
  phone: "+91 7277131313",
  phoneHref: "tel:+917277131313",
  email: "singhcarbazar1993@gmail.com",
  address:
    "B.M.C. Chowk, Shop No. 3-4, Near Desh Bhagat Hall, 10 G.T. Road, Jalandhar",
  whatsappNumber: "917277131313",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
  ],
  navigation: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Socials", href: "/socials" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
    { label: "Inventory", href: "/inventory" },
  ],
  services: [
    {
      title: "Finance Facility",
      description:
        "Fast finance coordination to help buyers move from shortlist to delivery with less paperwork stress.",
    },
    {
      title: "Insurance Facility",
      description:
        "Insurance assistance for smoother delivery and peace of mind from day one.",
    },
    {
      title: "Live Video Call Inspection",
      description:
        "Remote walkarounds for out-of-station buyers who want to inspect the car before visiting.",
    },
    {
      title: "Complete Documentation",
      description:
        "Support for RC transfer, seller paperwork, buyer documentation, and closure formalities.",
    },
  ],
  whyChooseUs: [
    {
      title: "Trusted Market Experience",
      description:
        "Serving customers since 1993 with a practical understanding of genuine used-car buying and selling.",
    },
    {
      title: "Inventory That Updates Live",
      description:
        "Featured vehicles, availability, and booking status come directly from the dealer management system.",
    },
    {
      title: "Support Beyond Listing",
      description:
        "Finance, insurance, video inspections, and post-sale paperwork all stay within one workflow.",
    },
  ],
  testimonials: [
    {
      name: "Aman Khanna",
      role: "Buyer",
      quote:
        "The car details were clear, the team was responsive, and the paperwork was handled without confusion.",
    },
    {
      name: "Jaspreet Kaur",
      role: "Seller",
      quote:
        "They guided me through pricing, documents, and closing the deal. The process felt reliable from start to finish.",
    },
    {
      name: "Rohit Verma",
      role: "Customer",
      quote:
        "I liked that the stock looked live and updated, not just social media posts. It made shortlisting much easier.",
    },
  ],
  gallery: [
    "Recent Delivery",
    "Showroom Display",
    "Customer Handover",
    "SUV Spotlight",
    "Sedan Collection",
    "Premium Picks",
  ],
} as const;
