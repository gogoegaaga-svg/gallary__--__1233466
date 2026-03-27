import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingSocial from "@/components/FloatingSocial";
import { useToast } from "@/hooks/use-toast";

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

const FabricDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [fabric, setFabric] = useState<DbFabric | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedFabrics, setRelatedFabrics] = useState<DbFabric[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchFabric = async () => {
      setLoading(true);
      const { data } = await supabase.from("fabrics_db").select("*").eq("id", id).single();
      if (data) {
        setFabric(data);
        // Fetch related by same category or brand
        const { data: related } = await supabase
          .from("fabrics_db")
          .select("*")
          .or(`category.eq.${data.category},brand.eq.${data.brand}`)
          .neq("id", id)
          .limit(4);
        setRelatedFabrics(related || []);
      }
      setLoading(false);
    };
    fetchFabric();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      supabase.from("favorites").select("id").eq("user_id", user.id).eq("fabric_id", id).then(({ data }) => {
        setIsFav(!!(data && data.length > 0));
      });
    }
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({ title: "سجّل دخولك أولاً", description: "لإضافة الأقمشة للمفضلة", variant: "destructive" });
      return;
    }
    setFavLoading(true);
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("fabric_id", id!);
      setIsFav(false);
      toast({ title: "تمت الإزالة من المفضلة" });
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, fabric_id: id! });
      setIsFav(true);
      toast({ title: "تمت الإضافة للمفضلة ❤️" });
    }
    setFavLoading(false);
  };

  // Build images array from image_url and colors
  const images = useMemo(() => {
    if (!fabric) return [];
    const imgs: string[] = [];
    if (fabric.image_url) imgs.push(fabric.image_url);
    return imgs.length > 0 ? imgs : [];
  }, [fabric]);

  const whatsappMessage = fabric
    ? encodeURIComponent(`مرحباً، أريد الاستفسار عن قماش: ${fabric.name}${fabric.name_en ? ` (${fabric.name_en})` : ""}`)
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="font-body text-muted-foreground">جاري التحميل...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!fabric) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">القماش غير موجود</h1>
          <Link to="/gallery" className="text-primary font-body text-sm hover:underline">العودة للمعرض</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryLabel = fabric.category === "upholstery" ? "قماش تنجيد" : "قماش ستائر";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-body text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ArrowRight size={14} className="rotate-180" />
          <Link to="/gallery" className="hover:text-primary">المعرض</Link>
          <ArrowRight size={14} className="rotate-180" />
          <span className="text-foreground">{fabric.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Slider */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="rounded-xl overflow-hidden shadow-fabric aspect-square relative group">
              {images.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={images[currentImageIndex]}
                      alt={fabric.name}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      loading="lazy"
                    />
                  </AnimatePresence>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-body">لا توجد صورة</span>
                </div>
              )}
            </div>

            {/* Thumbnail dots */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentImageIndex === i ? "bg-primary scale-110" : "bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Color swatches */}
            {fabric.colors && fabric.colors.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-xs text-muted-foreground font-body">الألوان المتاحة:</span>
                <div className="flex items-center gap-3 flex-wrap">
                  {fabric.colors.map((color, i) => (
                    <span
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-3 mb-4">
              {fabric.is_featured && (
                <span className="bg-gold text-gold-foreground text-xs px-3 py-1 rounded-full font-body font-semibold">مميز</span>
              )}
              {fabric.is_new && (
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-body font-semibold">جديد</span>
              )}
              {fabric.coming_soon && (
                <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full font-body font-semibold">قريباً</span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">{fabric.name}</h1>
            {fabric.name_en && <p className="text-muted-foreground font-body text-sm mb-6">{fabric.name_en}</p>}

            {/* Specs */}
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
              <h3 className="font-display text-lg text-foreground mb-4">المواصفات</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm font-body">
                <span className="text-muted-foreground">النوع</span>
                <span className="text-foreground font-medium">{fabric.type}</span>
                <span className="text-muted-foreground">الماركة</span>
                <span className="text-foreground font-medium">{fabric.brand}</span>
                <span className="text-muted-foreground">التصنيف</span>
                <span className="text-foreground font-medium">{categoryLabel}</span>
                {fabric.origin && (
                  <>
                    <span className="text-muted-foreground">المنشأ</span>
                    <span className="text-foreground font-medium">{fabric.origin}</span>
                  </>
                )}
                {fabric.composition && (
                  <>
                    <span className="text-muted-foreground">التركيب</span>
                    <span className="text-foreground font-medium">{fabric.composition}</span>
                  </>
                )}
                {fabric.gsm && (
                  <>
                    <span className="text-muted-foreground">GSM</span>
                    <span className="text-foreground font-medium">{fabric.gsm}</span>
                  </>
                )}
                {fabric.price && (
                  <>
                    <span className="text-muted-foreground">السعر</span>
                    <span className="text-foreground font-medium text-primary">{fabric.price}</span>
                  </>
                )}
              </div>
            </div>

            {/* Features */}
            {fabric.features && fabric.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display text-lg text-foreground mb-3">المميزات</h3>
                <div className="flex flex-wrap gap-2">
                  {fabric.features.map((f, i) => (
                    <span key={i} className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full font-body">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Usage */}
            {fabric.usage_suggestions && fabric.usage_suggestions.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display text-lg text-foreground mb-3">الاستخدامات</h3>
                <div className="flex flex-wrap gap-2">
                  {fabric.usage_suggestions.map((u, i) => (
                    <span key={i} className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full font-body">{u}</span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3">
              <a
                href={`https://wa.me/201016694946?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 gradient-teal text-primary-foreground py-3 rounded-lg font-body font-semibold text-center text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                اطلب الآن عبر واتساب
              </a>
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`px-4 py-3 rounded-lg border font-body text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isFav
                    ? "bg-destructive/10 border-destructive text-destructive"
                    : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                {isFav ? "في المفضلة" : "أضف للمفضلة"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related Items */}
        {relatedFabrics.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl text-foreground mb-6 text-center">أقمشة مشابهة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedFabrics.map((rf) => (
                <Link key={rf.id} to={`/fabric/${rf.id}`}>
                  <motion.div
                    className="group rounded-lg overflow-hidden shadow-fabric hover:shadow-fabric-hover transition-shadow bg-card"
                    whileHover={{ y: -4 }}
                  >
                    <div className="aspect-square overflow-hidden">
                      {rf.image_url ? (
                        <img src={rf.image_url} alt={rf.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">لا توجد صورة</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-display text-base text-foreground mb-1">{rf.name}</h3>
                      <p className="text-xs text-muted-foreground font-body">{rf.brand}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
      <FloatingSocial />
    </div>
  );
};

export default FabricDetail;
