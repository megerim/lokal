export interface MenuItem {
  id: string
  title: string
  description: string
  price: number
  category: string
  image?: string
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isSpicy?: boolean
  isNew?: boolean
  isPopular?: boolean
}

export const categories = [
  { id: "all", name: "Tüm Menü", icon: "☕" },
  { id: "coffees", name: "Kahveler", icon: "☕" },
  { id: "special", name: "Düşün - Tat - Sorgula", icon: "✨" },
  { id: "summer", name: "Yaz İçecekleri", icon: "🧊" },
  { id: "teas", name: "Çaylar", icon: "🍵" },
  { id: "cold", name: "Soğuk İçecekler", icon: "🥤" },
  { id: "food", name: "Lokal Lezzetler", icon: "🥪" },
  { id: "experiences", name: "Deneyimler", icon: "🎨" },
]

export const menuData: MenuItem[] = [
  // KAHVELER
  {
    id: "1",
    title: "Espresso",
    description: "Yoğun ve aromatik tek shot espresso",
    price: 100,
    category: "coffees",
  },
  {
    id: "2",
    title: "Double Espresso",
    description: "Çift shot espresso, daha yoğun kahve deneyimi",
    price: 120,
    category: "coffees",
  },
  {
    id: "3",
    title: "Americano",
    description: "Espresso ve sıcak su ile hazırlanan klasik kahve",
    price: 100,
    category: "coffees",
  },
  {
    id: "4",
    title: "Filtre Kahve",
    description: "Özel demleme yöntemi ile hazırlanan günlük taze filtre kahve",
    price: 100,
    category: "coffees",
  },
  {
    id: "5",
    title: "Latte",
    description: "Espresso ve kadifemsi süt köpüğü",
    price: 120,
    category: "coffees",

  },
  {
    id: "6",
    title: "Latte (Bitkisel Sütlü)",
    description: "Badem, soya veya yulaf sütü ile hazırlanan latte",
    price: 150,
    category: "coffees",
    isVegan: true,
  },
  {
    id: "7",
    title: "Latte (Aromalı)",
    description: "Vanilya, karamel veya fındık aroması ile zenginleştirilmiş latte",
    price: 160,
    category: "coffees",

  },
  {
    id: "8",
    title: "Matcha Latte",
    description: "Japon yeşil çay tozu ve süt ile hazırlanan özel içecek",
    price: 155,
    category: "coffees",

  },
  {
    id: "9",
    title: "Pumpkin Spice Latte",
    description: "Balkabağı baharatları ile tatlandırılmış sonbahar klasiği",
    price: 150,
    category: "coffees",

  },
  {
    id: "10",
    title: "Cappuccino",
    description: "Espresso, buharlanmış süt ve yoğun süt köpüğü",
    price: 150,
    category: "coffees",

  },
  {
    id: "11",
    title: "Mocha",
    description: "Espresso, çikolata ve süt karışımı",
    price: 150,
    category: "coffees",

  },
  {
    id: "12",
    title: "White Choc. Mocha",
    description: "Beyaz çikolata ile hazırlanan özel mocha",
    price: 150,
    category: "coffees",

  },
  {
    id: "13",
    title: "Flat White",
    description: "Güçlü espresso ve mikro köpüklü süt",
    price: 150,
    category: "coffees",

  },
  {
    id: "14",
    title: "Macchiato",
    description: "Espresso üzerine bir tutam süt köpüğü",
    price: 150,
    category: "coffees",

  },
  {
    id: "15",
    title: "Türk Kahvesi",
    description: "Geleneksel yöntemle pişirilen Türk kahvesi",
    price: 100,
    category: "coffees",
  },
  {
    id: "16",
    title: "Tahinli Kahve",
    description: "Tahin ile zenginleştirilmiş özel kahve",
    price: 200,
    category: "coffees",
  },
  {
    id: "17",
    title: "Salep",
    description: "Sıcak süt ve salep tozu ile hazırlanan geleneksel içecek",
    price: 150,
    category: "coffees",

  },
  {
    id: "18",
    title: "Sıcak Çikolata",
    description: "Gerçek çikolata ile hazırlanan yoğun sıcak içecek",
    price: 150,
    category: "coffees",

  },
  {
    id: "19",
    title: "Babyccino",
    description: "Bal, süt ve kakao ile hazırlanan çocuklar için özel içecek",
    price: 150,
    category: "coffees",

  },
  {
    id: "20",
    title: "Miniccino",
    description: "Kafeinsiz kahve ve süt ile hazırlanan hafif içecek",
    price: 150,
    category: "coffees",

  },
  {
    id: "21",
    title: "Ballı Süt",
    description: "Sıcak süt ve doğal bal karışımı",
    price: 100,
    category: "coffees",

  },

  // DÜŞÜN - TAT - SORGULA
  {
    id: "22",
    title: "Farabi'nin Rüyası",
    description: "Dut, çilek özü ile çekilmiş espresso bazlı, Lokal'e özgü pamuksu bir tat",
    price: 200,
    category: "special",
  },
  {
    id: "23",
    title: "Socrates'in Kahvesi",
    description: "Tahin, tarçın ve ballı espresso ile muhteşem uyumu ile midenize de iyi gelecek bu kahve. 'Yalnızca düşünülmüş bir hayat yaşamaya değerdir' diyorsan denemelisin",
    price: 200,
    category: "special",
  },
  {
    id: "24",
    title: "Plotinos'un Mavisi",
    description: "Doğal bitki çayları ile hazırlanmış soğuk bir şölen. Sağlıklı bir deneyim çünkü renk değiştiriyor. 'Ruh, güzelliğe özlem duyar' diyenlerin içeceği",
    price: 200,
    category: "special",

  },

  // YAZ AYLARINDA
  {
    id: "25",
    title: "Iced Americano",
    description: "Buzlu espresso ve soğuk su ile hazırlanan ferahlatıcı kahve",
    price: 140,
    category: "summer",
  },
  {
    id: "26",
    title: "Cold Brew",
    description: "12 saat soğuk demleme yöntemi ile hazırlanan özel kahve",
    price: 140,
    category: "summer",
  },
  {
    id: "27",
    title: "Iced Latte",
    description: "Buzlu espresso ve soğuk süt karışımı",
    price: 150,
    category: "summer",

  },
  {
    id: "28",
    title: "Affogato",
    description: "Vanilyalı dondurma üzerine sıcak espresso",
    price: 150,
    category: "summer",

  },
  {
    id: "29",
    title: "Soğuk Filtre Kahve",
    description: "Buzlu filtre kahve",
    price: 140,
    category: "summer",
  },

  // ÇAYLAR
  {
    id: "30",
    title: "Çay",
    description: "Klasik demlik çay",
    price: 50,
    category: "teas",

  },
  {
    id: "31",
    title: "Yeşil Çay",
    description: "Antioksidan açısından zengin yeşil çay",
    price: 100,
    category: "teas",

  },
  {
    id: "32",
    title: "Bitki Çayı",
    description: "Çeşitli şifalı bitkilerden hazırlanan çay",
    price: 100,
    category: "teas",

  },
  {
    id: "33",
    title: "Ihlamur",
    description: "Rahatlatıcı ıhlamur çayı",
    price: 100,
    category: "teas",

  },
  {
    id: "34",
    title: "Berry Hibiskus",
    description: "Orman meyveleri ve hibiskus karışımı soğuk çay",
    price: 150,
    category: "teas",

  },

  // SOĞUK İÇECEKLER
  {
    id: "35",
    title: "Lokal Limonata",
    description: "Ev yapımı taze limonata",
    price: 150,
    category: "cold",

  },
  {
    id: "36",
    title: "Portakal Suyu",
    description: "Taze sıkılmış portakal suyu",
    price: 150,
    category: "cold",

  },
  {
    id: "37",
    title: "Churchill",
    description: "Özel karışım soğuk içecek",
    price: 100,
    category: "cold",
  },
  {
    id: "38",
    title: "Maden Suyu",
    description: "Doğal mineralli su",
    price: 80,
    category: "cold",

  },
  {
    id: "39",
    title: "Meyve Suyu",
    description: "Çeşitli meyve suları",
    price: 100,
    category: "cold",

  },
  {
    id: "40",
    title: "Ayran",
    description: "Ev yapımı taze ayran",
    price: 50,
    category: "cold",

  },
  {
    id: "41",
    title: "Su",
    description: "Şişe su",
    price: 30,
    category: "cold",

  },

  // LOKAL LEZZETLER
  {
    id: "42",
    title: "Kantin Tost",
    description: "Klasik kaşarlı tost",
    price: 90,
    category: "food",
    isVegetarian: true,
  },
  {
    id: "43",
    title: "Karışık Kantin Tost",
    description: "Kaşar, sucuk ve domates ile hazırlanan tost",
    price: 100,
    category: "food",
  },
  {
    id: "44",
    title: "Bazlama Tost",
    description: "Ev yapımı bazlama ekmeği ile hazırlanan özel tost",
    price: 150,
    category: "food",
    isVegetarian: true,
  },
  {
    id: "45",
    title: "Karışık Bazlama Tost",
    description: "Bazlama ekmeği ile hazırlanan karışık tost",
    price: 200,
    category: "food",
  },
  {
    id: "46",
    title: "Et Döner Wrap",
    description: "Taze et döner ile hazırlanan wrap",
    price: 200,
    category: "food",
  },
  {
    id: "47",
    title: "Sosisli",
    description: "Sosisli sandviç",
    price: 150,
    category: "food",
  },
  {
    id: "48",
    title: "Mantı",
    description: "Ev yapımı mantı",
    price: 200,
    category: "food",
  },
  {
    id: "49",
    title: "Mini Pide",
    description: "Küçük boy karışık pide",
    price: 100,
    category: "food",
  },
  {
    id: "50",
    title: "Ev Yapımı Granola",
    description: "Yaban mersini/çikolata, mevsim meyveleri, laktozsuz süt ile hazırlanan sağlıklı kahvaltı",
    price: 250,
    category: "food",
    isVegetarian: true,
  },
  {
    id: "51",
    title: "Diyetisyen Ebru Güner'in Özel Tarifi",
    description: "Rafine şekersiz, yulaf unlu, ceviz, yoğurt, yumurta ile hazırlanan tok tutan sandviç",
    price: 350,
    category: "food",
    isVegetarian: true,
  },

  // KAHVEYLE GELEN DENEYİMLER
  {
    id: "52",
    title: "Kahve + Suluboya (Küçük Canvas)",
    description: "Küçük canvas üzerine suluboya deneyimi, kahveniz eşliğinde",
    price: 300,
    category: "experiences",
  },
  {
    id: "53",
    title: "Kahve + Suluboya (Kare Canvas)",
    description: "Kare canvas üzerine suluboya deneyimi, kahveniz eşliğinde",
    price: 400,
    category: "experiences",
  },
  {
    id: "54",
    title: "Kahve + Suluboya (Yuvarlak Canvas)",
    description: "Yuvarlak canvas üzerine suluboya deneyimi, kahveniz eşliğinde",
    price: 500,
    category: "experiences",
  },
  {
    id: "55",
    title: "Kahve + Alçı Figür (Büyük)",
    description: "Büyük alçı figür boyama deneyimi, kahveniz eşliğinde",
    price: 500,
    category: "experiences",
  },
  {
    id: "56",
    title: "Kahve + Alçı Figür (Küçük)",
    description: "Küçük alçı figür boyama deneyimi, kahveniz eşliğinde",
    price: 300,
    category: "experiences",
  },
  {
    id: "57",
    title: "Kahve + Punch Seti",
    description: "Punch needle nakış seti ile el işi deneyimi, kahveniz eşliğinde",
    price: 500,
    category: "experiences",
  },
  {
    id: "58",
    title: "Kahve + Boyama",
    description: "Yetişkinler için boyama kitabı deneyimi, kahveniz eşliğinde",
    price: 200,
    category: "experiences",
  },
  {
    id: "59",
    title: "Kahve + Mum Yapımı",
    description: "Kendi mumunuzu yapma deneyimi, kahveniz eşliğinde",
    price: 500,
    category: "experiences",
  },
  {
    id: "60",
    title: "Kahve + Mektup",
    description: "Kendinize mektup yazın, 1 yıl sonra size postalanacak",
    price: 300,
    category: "experiences",
  },
  {
    id: "61",
    title: "Kahve + Hikaye Seti",
    description: "Yaratıcı hikayenizi yazın, editör geri bildirim sağlayacak",
    price: 500,
    category: "experiences",
  },
  {
    id: "62",
    title: "Kahve + Mini Masa Oyunları",
    description: "Mini masa oyunları ile eğlenceli vakit, kahveniz eşliğinde",
    price: 300,
    category: "experiences",
  },
  {
    id: "63",
    title: "Kahve + Masa Üstü Puzzle",
    description: "Rahatlatıcı puzzle deneyimi, kahveniz eşliğinde",
    price: 300,
    category: "experiences",
  },
]