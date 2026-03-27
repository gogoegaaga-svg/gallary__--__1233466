import fabricSilk from "@/assets/fabric-silk.jpg";
import fabricCotton from "@/assets/fabric-cotton.jpg";
import fabricVelvet from "@/assets/fabric-velvet.jpg";
import fabricLinen from "@/assets/fabric-linen.jpg";
import fabricSatin from "@/assets/fabric-satin.jpg";
import fabricDenim from "@/assets/fabric-denim.jpg";
import fabricPolyester from "@/assets/fabric-polyester.jpg";

export interface FabricColorVariant {
  name: string;
  color: string;
  image?: string; // optional per-color image
}

export interface Fabric {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  category: "upholstery" | "curtains";
  brand: string;
  image: string;
  colorVariants: FabricColorVariant[];
  colors: string[]; // kept for backward compat
  gsm: number;
  origin: string;
  composition: string;
  features: string[];
  usage: string[];
  price: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  comingSoon?: boolean;
}

export const fabricTypes = [
  { id: "cotton", name: "قطن", nameEn: "Cotton" },
  { id: "linen", name: "كتان", nameEn: "Linen" },
  { id: "polyester", name: "بوليستر", nameEn: "Polyester" },
  { id: "silk", name: "حرير", nameEn: "Silk" },
  { id: "velvet", name: "مخمل", nameEn: "Velvet" },
  { id: "satin", name: "ساتان", nameEn: "Satin" },
  { id: "chiffon", name: "شيفون", nameEn: "Chiffon" },
  { id: "denim", name: "دنيم", nameEn: "Denim" },
];

export const brands = [
  { id: "adam-premium", name: "آدم بريميوم" },
  { id: "silk-road", name: "طريق الحرير" },
  { id: "cotton-club", name: "نادي القطن" },
  { id: "royal-textiles", name: "رويال تكستايل" },
  { id: "orient-fabrics", name: "أقمشة الشرق" },
];

export const origins = [
  "مصر", "الهند", "الصين", "تركيا", "إيطاليا", "اليابان", "المغرب"
];

export const fabrics: Fabric[] = [
  {
    id: "1",
    name: "مخمل ملكي للتنجيد",
    nameEn: "Royal Velvet Upholstery",
    type: "velvet",
    category: "upholstery",
    brand: "royal-textiles",
    image: fabricVelvet,
    colorVariants: [
      { name: "بورغندي", color: "#800020", image: fabricVelvet },
      { name: "أزرق داكن", color: "#1a1a2e" },
      { name: "أخضر زيتي", color: "#556B2F" },
      { name: "ذهبي", color: "#D4AF37" },
    ],
    colors: ["#800020", "#1a1a2e", "#556B2F", "#D4AF37"],
    gsm: 320,
    origin: "إيطاليا",
    composition: "80% قطن، 20% حرير",
    features: ["فخم", "ناعم جداً", "غني اللون", "ثقيل ومتين"],
    usage: ["أنتريهات", "كنب", "كراسي صالون"],
    price: "اطلب السعر",
    isFeatured: true,
    isPopular: true,
  },
  {
    id: "2",
    name: "قطن مصري للتنجيد",
    nameEn: "Egyptian Cotton Upholstery",
    type: "cotton",
    category: "upholstery",
    brand: "cotton-club",
    image: fabricCotton,
    colorVariants: [
      { name: "بيج فاتح", color: "#FDFBF7", image: fabricCotton },
      { name: "بيج غامق", color: "#C4A882" },
      { name: "رمادي", color: "#808080" },
      { name: "كريمي", color: "#F5E6D3" },
    ],
    colors: ["#FDFBF7", "#C4A882", "#808080", "#F5E6D3"],
    gsm: 250,
    origin: "مصر",
    composition: "100% قطن مصري",
    features: ["متين", "سهل التنظيف", "مريح", "يتحمل الاستخدام اليومي"],
    usage: ["أنتريهات", "كنب يومي", "كراسي طعام"],
    price: "اطلب السعر",
    isFeatured: true,
    isNew: true,
  },
  {
    id: "3",
    name: "حرير ستائر فاخر",
    nameEn: "Luxury Silk Curtains",
    type: "silk",
    category: "curtains",
    brand: "silk-road",
    image: fabricSilk,
    colorVariants: [
      { name: "ذهبي", color: "#D4AF37", image: fabricSilk },
      { name: "بورغندي", color: "#800020" },
      { name: "كحلي", color: "#000080" },
      { name: "أبيض لؤلؤي", color: "#F0EAD6" },
    ],
    colors: ["#D4AF37", "#800020", "#000080", "#F0EAD6"],
    gsm: 90,
    origin: "الصين",
    composition: "100% حرير طبيعي",
    features: ["لامع", "انسيابي", "خفيف الوزن", "أنيق"],
    usage: ["ستائر صالون", "ستائر غرف نوم", "ستائر مداخل"],
    price: "اطلب السعر",
    isPopular: true,
  },
  {
    id: "4",
    name: "كتان طبيعي للتنجيد",
    nameEn: "Natural Linen Upholstery",
    type: "linen",
    category: "upholstery",
    brand: "orient-fabrics",
    image: fabricLinen,
    colorVariants: [
      { name: "طبيعي", color: "#D4C5A9", image: fabricLinen },
      { name: "بني فاتح", color: "#A89776" },
      { name: "أخضر نعناعي", color: "#98D4BB" },
      { name: "أزرق سماوي", color: "#87CEEB" },
    ],
    colors: ["#D4C5A9", "#A89776", "#98D4BB", "#87CEEB"],
    gsm: 200,
    origin: "مصر",
    composition: "100% كتان طبيعي",
    features: ["صديق للبيئة", "متين", "يزداد نعومة مع الاستخدام", "عصري"],
    usage: ["أنتريهات مودرن", "كنب", "وسائد ديكور"],
    price: "اطلب السعر",
    isNew: true,
  },
  {
    id: "5",
    name: "ساتان ستائر ملكي",
    nameEn: "Royal Satin Curtains",
    type: "satin",
    category: "curtains",
    brand: "adam-premium",
    image: fabricSatin,
    colorVariants: [
      { name: "أزرق ملكي", color: "#00008B", image: fabricSatin },
      { name: "ذهبي", color: "#DAA520" },
      { name: "فضي", color: "#C0C0C0" },
      { name: "نبيذي", color: "#722F37" },
    ],
    colors: ["#00008B", "#DAA520", "#C0C0C0", "#722F37"],
    gsm: 120,
    origin: "اليابان",
    composition: "100% بوليستر ساتان",
    features: ["لامع", "ناعم", "مقاوم للتجاعيد", "يحجب الضوء"],
    usage: ["ستائر صالون فاخر", "ستائر غرف نوم", "ستائر بلاك أوت"],
    price: "اطلب السعر",
    isFeatured: true,
  },
  {
    id: "6",
    name: "دنيم تنجيد عملي",
    nameEn: "Denim Upholstery",
    type: "denim",
    category: "upholstery",
    brand: "cotton-club",
    image: fabricDenim,
    colorVariants: [
      { name: "أزرق كلاسيكي", color: "#1560BD", image: fabricDenim },
      { name: "كحلي", color: "#00308F" },
      { name: "رمادي أزرق", color: "#6082B6" },
      { name: "أزرق فاتح", color: "#4682B4" },
    ],
    colors: ["#1560BD", "#00308F", "#6082B6", "#4682B4"],
    gsm: 350,
    origin: "تركيا",
    composition: "98% قطن، 2% إيلاستين",
    features: ["متين جداً", "مرن", "عملي", "سهل التنظيف"],
    usage: ["كنب عائلي", "كراسي مكتب", "بينز باج"],
    price: "اطلب السعر",
    isPopular: true,
  },
  {
    id: "7",
    name: "بوليستر ستائر خفيف",
    nameEn: "Light Polyester Curtains",
    type: "polyester",
    category: "curtains",
    brand: "orient-fabrics",
    image: fabricPolyester,
    colorVariants: [
      { name: "أخضر", color: "#228B22", image: fabricPolyester },
      { name: "أبيض", color: "#FFFFFF" },
      { name: "بيج", color: "#F5F5DC" },
      { name: "وردي", color: "#FFB6C1" },
    ],
    colors: ["#228B22", "#FFFFFF", "#F5F5DC", "#FFB6C1"],
    gsm: 130,
    origin: "مصر",
    composition: "100% بوليستر",
    features: ["خفيف", "سريع الجفاف", "مقاوم للتجاعيد", "اقتصادي"],
    usage: ["ستائر مطبخ", "ستائر شرفة", "فوال"],
    price: "اطلب السعر",
    isNew: true,
  },
];
