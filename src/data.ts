import { StoreLocation, Review } from "./types";

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: "west-chester",
    name: "Stop N Go West Chester",
    address: "9655 Cincinnati Dayton Rd, West Chester Township, OH 45069",
    phone: "(513) 777-6231",
    hours: "5:00 AM - Midnight / 7 Days",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3080.3235773663045!2d-84.4239851!3d39.3491417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x884050dcf3f63901%3A0xe24fa3f4469733cc!2s9655%20Cincinnati%20Dayton%20Rd%2C%20West%20Chester%20Township%2C%20OH%2045069!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=9655+Cincinnati+Dayton+Rd,+West+Chester+Township,+OH+45069",
    lat: 39.3491417,
    lng: -84.4239851,
    amenities: ["Quality Shell Fuel", "Diesel Fuel", "Beer Cave", "Fresh Coffee", "Fresh Food", "Lottery Station", "ATM Access", "Clean Restrooms"],
    photo: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mason",
    name: "Stop N Go Mason",
    address: "6391 Reading Rd, Mason, OH 45040",
    phone: "(513) 398-4444",
    hours: "5:00 AM - Midnight / 7 Days",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3082.3551025530932!2d-84.341113!3d39.3592182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88405908204bca57%3A0x7d00f7236e788bc5!2s6391%20Reading%20Rd%2C%20Mason%2C%20OH%2045040!5e0!3m2!1sen!2sus!4v1700000000001!5m2!1sen!2sus",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=6391+Reading+Rd,+Mason,+OH+45040",
    lat: 39.3592182,
    lng: -84.341113,
    amenities: ["Quality Shell Fuel", "Diesel Fuel", "Fresh Coffee", "Fountain Drinks", "Snack Center", "Lottery Station", "ATM Access", "Clean Restrooms"],
    photo: "https://images.unsplash.com/photo-1622321481414-99dca26de162?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "oxford",
    name: "Stop N Go Oxford",
    address: "3604 Southpointe Pkwy, Oxford, OH 45056",
    phone: "(513) 523-8888",
    hours: "6:00 AM - Midnight / 7 Days",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3080.1254336045517!2d-84.721245!3d39.492151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88403d159a2f26dd%3A0x5d9b688d0fe53a99!2s3604%20Southpointe%20Pkwy%2C%20Oxford%2C%20OH%2045056!5e0!3m2!1sen!2sus!4v1700000000002!5m2!1sen!2sus",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=3604+Southpointe+Pkwy,+Oxford,+OH+45056",
    lat: 39.492151,
    lng: -84.721245,
    amenities: ["Quality Shell Fuel", "Fresh Hot Coffee", "Energy Zone", "Student Discounts", "Beer Cave", "Fountain Drinks", "Lottery Station", "ATM Access"],
    photo: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "clifton",
    name: "Stop N Go Clifton",
    address: "141 W McMillan St, Cincinnati, OH 45219",
    phone: "(513) 421-2342",
    hours: "5:00 AM - Midnight / 7 Days",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3095.67912235!2d-84.517392!3d39.127814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8841b3fa1b1111a1%3A0x1c3fa11122ab!2s141%20W%20McMillan%20St%2C%20Cincinnati%2C%20OH%2045219!5e0!3m2!1sen!2sus!4v1700000000003!5m2!1sen!2sus",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=141+W+McMillan+St,+Cincinnati,+OH+45219",
    lat: 39.127814,
    lng: -84.517392,
    amenities: ["Quality Shell Fuel", "Hot Pizza & Food", "Vape & Cigar Room", "Cold Beverages", "Fountain Drinks", "ATM Access", "Walking Distance to UC"],
    photo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "loveland",
    name: "Stop N Go Loveland",
    address: "10629 Loveland Madeira Rd, Loveland, OH 45140",
    phone: "(513) 683-1060",
    hours: "5:00 AM - 11:00 PM / 7 Days",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3089.418423604!2d-84.288224!3d39.255883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88405ea2cf6f7c75%3A0x93df45ded6b8f3e5!2s10629%20Loveland%20Madeira%20Rd%2C%20Loveland%2C%20OH%2045140!5e0!3m2!1sen!2sus!4v1700000000004!5m2!1sen!2sus",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=10629+Loveland+Madeira+Rd,+Loveland,+OH+45140",
    lat: 39.255883,
    lng: -84.288224,
    amenities: ["Quality Shell Fuel", "Propane Exchange", "Fresh Coffee", "Groceries", "Beer Cave", "Candy & Ice Cream", "Lottery Station", "ATM Access", "Clean Facility"],
    photo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "cincinnati",
    name: "Stop N Go Cincinnati",
    address: "55 Kibby Ln, Cincinnati, OH 45223",
    phone: "(513) 681-3000",
    hours: "5:00 AM - Midnight / 7 Days",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3093.59311221!2d-84.536922!3d39.168924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8841b52a65a2d6db%3A0xe7a50892c90c7bfd!2s55%20Kibby%20Ln%2C%20Cincinnati%2C%20OH%2045223!5e0!3m2!1sen!2sus!4v1700000000005!5m2!1sen!2sus",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=55+Kibby+Ln,+Cincinnati,+OH+45223",
    lat: 39.168924,
    lng: -84.536922,
    amenities: ["Quality Shell Fuel", "Diesel Fuel", "Quick Snacks", "Cold Beer Cave", "Tobacco Outlets", "ATM Access", "Substantial Parking"],
    photo: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "deer-park",
    name: "Stop N Go Deer Park",
    address: "4375 E Galbraith Rd, Cincinnati, OH 45236",
    phone: "(513) 791-3211",
    hours: "6:00 AM - Midnight / 7 Days",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3090.569112224!2d-84.398511!3d39.218903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8841adc45a1fcfd5%3A0xb3de45facdca1a11!2s4375%20E%20Galbraith%20Rd%2C%20Cincinnati%2C%20OH%2045236!5e0!3m2!1sen!2sus!4v1700000000006!5m2!1sen!2sus",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=4375+E+Galbraith+Rd,+Cincinnati,+OH+45236",
    lat: 39.218903,
    lng: -84.398511,
    amenities: ["Quality Shell Fuel", "Coffee & Espresso Bar", "Fine Tobaccos", "Premium Wine Selection", "Craft Beer Cave", "Deli Sandwiches", "ATM Access", "Lottery Station"],
    photo: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=800"
  }
];

export const CONVENIENCE_STORE_ITEMS = [
  {
    title: "Fresh Coffee",
    iconName: "Coffee",
    description: "Premium bean-to-cup brewing, ground fresh daily. Hot, rich, and customizable with premium creamers.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Fountain Drinks",
    iconName: "Sparkles",
    description: "Ice-cold soda mixers and custom hydration mixes. Featuring classic favorites with crushed ice option.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Energy Zone",
    iconName: "Zap",
    description: "Massive selection of chilled Monster, Red Bull, Celsius, and pre-workout recovery drinks.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Chips & Snacks",
    iconName: "Cookie",
    description: "From potato chips and beef jerky to protein bars. Quick fuel to keep your energy high on the road.",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527ec0cf?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Beer Cave",
    iconName: "Beer",
    description: "Super-chilled beer caves loaded with local Cincinnati crafts, seltzers, imports, and domestics.",
    image: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Ice Cream & Treats",
    iconName: "IceCream",
    description: "Satisfy your sweet tooth with a vast array of candy bars, premium ice cream tubs, and popsicles.",
    image: "https://images.unsplash.com/photo-1501443712940-27f325b1b402?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Ohio Lottery",
    iconName: "Ticket",
    description: "Try your luck! We carry Ohio Lottery draw games, Powerball, Mega Millions, and instant scratch-offs.",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Hot Food Bar",
    iconName: "Flame",
    description: "A wide selection of hot, fresh-cooked pizza, corn dogs, breakfast sandwiches, and roller grill items.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Tobacco & Vapor",
    iconName: "Cigarette",
    description: "Fully stocked premium cigarettes, quality cigars, chewing tobaccos, and popular disposable vape devices.",
    image: "https://images.unsplash.com/photo-1527181154391-55ac91a01263?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Everyday Groceries",
    iconName: "ShoppingCart",
    description: "Ran out of milk, eggs, bread, or household essentials? Grab them quickly without the supermarket line.",
    image: "https://images.unsplash.com/photo-1542838132-92cb53300491?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "ATM Access",
    iconName: "CreditCard",
    description: "Safe, well-lit, fully secure ATMs located inside every storefront. Fast cash withdrawal on the go.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=70"
  },
  {
    title: "Travel Needs",
    iconName: "MapPin",
    description: "Car phone chargers, high-quality motor oils, wiper fluids, pain relievers, sunglasses, and toiletries.",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=70"
  }
];

export const REVIEWS: Review[] = [
  {
    author: "Bradley S.",
    rating: 5,
    date: "1 week ago",
    relativeTime: "1 week ago",
    text: "Stop N Go has the cleanest restrooms and the friendliest morning staff. The bean-to-cup coffee is also way better than other gas stations. Always fill up my tank with Shell V-Power here!",
    avatarColor: "bg-red-600"
  },
  {
    author: "Kelly M.",
    rating: 5,
    date: "2 weeks ago",
    relativeTime: "2 weeks ago",
    text: "The Oxford Stop N Go is an absolute lifesaver. It is super convenient and clean. Staff are friendly and they keep an amazing stock of energy drinks and study snacks! Highly recommend.",
    avatarColor: "bg-yellow-500"
  },
  {
    author: "Donald J.",
    rating: 5,
    date: "3 weeks ago",
    relativeTime: "3 weeks ago",
    text: "Excellent service. Stopped by late last night for some groceries and gas. The store was spotless and the attendant was extremely polite. Clean facilities make all the difference.",
    avatarColor: "bg-neutral-800"
  },
  {
    author: "Sarah L.",
    rating: 5,
    date: "1 month ago",
    relativeTime: "1 month ago",
    text: "I go out of my way to buy fuel at the Mason location. Their fuel prices are always fair, pumps are clean, and printing receipts always works (unlike competitor stations where you always have to go inside).",
    avatarColor: "bg-brand-red"
  }
];
