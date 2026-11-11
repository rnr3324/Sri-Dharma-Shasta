// 1. Define your Logo URL
export const LOGO_IMG = 'https://res.cloudinary.com/nemhlaod/image/upload/v1793177746/Gemini_Generated_Image_jlemghjlemghjlem.png';

// 2. Map Product IDs to their respective image URLs
export const IMAGES = {
  1: 'https://res.cloudinary.com/nemhlaod/image/upload/v1793177746/Gemini_Generated_Image_jlemghjlemghjlem.png', // Ayyappa Mala (Tulasi)
  2: '', // Irumudi Kit
  3: '', // Black Dhoti & Shawl Set
  4: '', // Padi Pooja Kit
  5: '', // Lord Ayyappa Idol (Brass)
  6: '', // Pure Cow Ghee (Nei Thengai)
  7: '', // Sandalwood Paste & Kumkum
  8: '', // Camphor & Incense Pack
  9: '', // Sabarimala Prasad Combo
  10: '', // Rudraksha Mala
  11: 'https://res.cloudinary.com/nemhlaod/image/upload/v1793180122/bb991362-cb2b-4051-80fa-32f5f1480bdc.png', // Pooja Brass Lamp (Deepam)
  12: '', // Ayyappa Photo Frame (Gold)
  13: '', // Complete 41-Day Deeksha Kit
};

export const CATEGORIES = {
  1: 'Mala',
  2: 'Kits',
  3: 'Attire',
  4: 'Kits',
  5: 'Idols',
  6: 'Pooja items',
  7: 'Pooja items',
  8: 'Pooja items',
  9: 'Prasad',
  10: 'Mala',
  11: 'Pooja items',
  12: 'Idols',
  13: 'Bundles',
};

export const INCLUDES = {
  13: [
    'Tulasi Ayyappa mala',
    'Irumudi kit',
    'Black dhoti and shawl set',
    'Sandalwood paste and kumkum',
    'Camphor and incense pack',
  ],
  2: [
    'Irumudi cloth bundle',
    'Coconut for ghee (nei thengai)',
    'Rice and offerings pouch',
    'Instruction card',
  ],
  4: [
    'Camphor and incense',
    'Flowers and kumkum',
    'Vibhuti',
    'Pooja guide for the 18 steps',
  ],
};

const RAW = [
  [
    1,
    'Ayyappa Mala (Tulasi)',
    150,
    '📿',
    'Tulasi bead mala worn through the 41-day deeksha. Blessed and sanctified before dispatch.',
  ],
  [
    2,
    'Irumudi Kit',
    899,
    '🎒',
    'Complete kit for the sacred two-compartment bundle: cloth, coconut, ghee pouch, rice and offerings.',
  ],
  [
    3,
    'Black Dhoti & Shawl Set',
    650,
    '👘',
    'Traditional black attire for the vratham. Soft cotton, colour-fast.',
  ],
  [
    4,
    'Padi Pooja Kit',
    1299,
    '🔔',
    'Everything for the 18-step Padi Pooja: camphor, flowers, incense, kumkum, vibhuti and more.',
  ],
  [
    5,
    'Lord Ayyappa Idol (Brass)',
    2499,
    '🕉️',
    'Hand-finished brass idol for home altars. Height about 8 inches.',
  ],
  [
    6,
    'Pure Cow Ghee (Nei Thengai)',
    399,
    '🥥',
    'Ghee-filled coconut for abhishekam at Sannidhanam.',
  ],
  [
    7,
    'Sandalwood Paste & Kumkum',
    199,
    '🟠',
    'Fragrant chandanam and kumkum for daily pooja and tilak.',
  ],
  [
    8,
    'Camphor & Incense Pack',
    249,
    '🪔',
    'Pure camphor tablets and agarbatti for aarti.',
  ],
  [
    9,
    'Sabarimala Prasad Combo',
    499,
    '🍯',
    'Vibhuti, kumkum, aravana-style sweet and blessed rice.',
  ],
  [
    10,
    'Rudraksha Mala',
    350,
    '🔮',
    'Five-mukhi rudraksha for japa. 108+1 beads.',
  ],
  [
    11,
    'Pooja Brass Lamp (Deepam)',
    799,
    '🪔',
    'Five-faced brass lamp with oil wicks.',
  ],
  [
    12,
    'Ayyappa Photo Frame (Gold)',
    699,
    '🖼️',
    'Framed devotional portrait with gold-tone border.',
  ],
  [
    13,
    'Complete 41-Day Deeksha Kit',
    1999,
    '🎁',
    'Everything for the vratham in one box. Bundle price is lower than buying the items separately.',
  ],
];

export const PRODUCTS = RAW.map(([id, name, price, icon, desc]) => ({
  id,
  name,
  price,
  icon,
  desc,
  cat: CATEGORIES[id],
  includes: INCLUDES[id] || [],
  img: IMAGES[id] || null,
}));