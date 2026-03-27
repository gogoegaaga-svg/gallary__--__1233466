import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingSocial from "@/components/FloatingSocial";
import AuthGate from "@/components/AuthGate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DbFabric {
  id: string;
  name: string;
  name_en: string | null;
  type: string;
  category: string;
  brand: string;
  image_url: string | null;
  colors: string[] | null;
  gsm: number | null;
  origin: string | null;
  composition: string | null;
  features: string[] | null;
  usage_suggestions: string[] | null;
  price: string | null;
  is_featured: boolean | null;
  is_new: boolean | null;
  is_popular: boolean | null;
  coming_soon: boolean | null;
}

const categoryTabs = [
  { value: "", label: "المعرض" },
  { value: "curtains", label: "أقمشة ستائر" },
  { value: "upholstery", label: "أقمشة تنجيد" },
];

const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const { user, loading: authLoading } = useAuth();

  const [fabrics, setFabrics] = useState<DbFabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchFabrics = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("fabrics_db").select("*");
      if (!error && data) setFabrics(data);
      setLoading(false);
    };
    fetchFabrics();
  }, [user]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  const brands = useMemo(() => {
    const set = new Set(fabrics.map((f) => f.brand));
    return Array.from(set);
  }, [fabrics]);

  const filtered = useMemo(() => {
    return fabrics.filter((f) => {
      if (search && !f.name.includes(search) && !(f.name_en || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory && f.category !== selectedCategory) return false;
      if (selectedBrand && f.brand !== selectedBrand) return false;
      return true;
    });
  }, [fabrics, search, selectedCategory, selectedBrand]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSearchParams({});
  };

  const hasFilters = search || selectedCategory || selectedBrand;

  // Show auth gate if not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <SectionHeader title="معرض الأقمشة" subtitle="تصفح مجموعتنا الكاملة من أقمشة التنجيد والستائر" />
          {/* Blurred preview behind */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 blur-md pointer-events-none select-none opacity-50">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-lg bg-card shadow-fabric aspect-square animate-pulse" />
              ))}
            </div>
            <AuthGate />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <SectionHeader title="معرض الأقمشة" subtitle="تصفح مجموعتنا الكاملة من أقمشة التنجيد والستائر" />

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleCategoryChange(tab.value)}
              className={`px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-200 ${
                selectedCategory === tab.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن قماش..."
              className="w-full bg-card border border-border rounded-lg py-2.5 pr-10 pl-4 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-lg border transition-colors ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
          >
            <SlidersHorizontal size={18} />
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="grid grid-cols-2 gap-4 bg-card rounded-lg p-4 border border-border">
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">الماركة</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">الكل</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p className="text-sm text-muted-foreground font-body mb-6">{filtered.length} قماش</p>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <p className="font-body text-muted-foreground">جاري التحميل...</p>
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((f) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <DbFabricCard fabric={f} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground mb-2">لم يتم العثور على نتائج</p>
            <p className="font-body text-sm text-muted-foreground">جرب تغيير معايير البحث</p>
          </div>
        )}
      </div>

      <Footer />
      <FloatingSocial />
    </div>
  );
};

const DbFabricCard = ({ fabric }: { fabric: DbFabric }) => {
  return (
    <Link to={`/fabric/${fabric.id}`}>
      <motion.div
        className="group relative rounded-lg overflow-hidden shadow-fabric hover:shadow-fabric-hover transition-shadow duration-300 bg-card"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative overflow-hidden aspect-square">
          {fabric.image_url ? (
            <img
              src={fabric.image_url}
              alt={fabric.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">لا توجد صورة</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {fabric.is_featured && (
              <span className="bg-gold text-gold-foreground text-xs px-2 py-1 rounded font-body font-semibold">مميز</span>
            )}
            {fabric.is_new && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-body font-semibold">جديد</span>
            )}
            {fabric.coming_soon && (
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded font-body font-semibold">قريباً</span>
            )}
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded font-body">
              {fabric.category === "upholstery" ? "تنجيد" : "ستائر"}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display text-lg text-foreground mb-1">{fabric.name}</h3>
          <p className="text-xs text-muted-foreground font-body mb-2">{fabric.brand}{fabric.origin ? ` • ${fabric.origin}` : ""}</p>
          {fabric.colors && fabric.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              {fabric.colors.slice(0, 5).map((color, i) => (
                <span
                  key={i}
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            {fabric.gsm && <span className="text-xs text-muted-foreground font-body">GSM: {fabric.gsm}</span>}
            <span className="text-sm font-semibold text-primary font-body">{fabric.price || "اطلب السعر"}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default Gallery;
