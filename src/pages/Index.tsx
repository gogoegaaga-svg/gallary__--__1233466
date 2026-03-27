import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";
import logo from "@/assets/adam-logo.svg";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/AuthGate";
import mascotThinking from "@/assets/mascot-thinking.png";
import mascotFabric from "@/assets/mascot-fabric.png";
import categoryUpholstery from "@/assets/category-upholstery.jpg";
import categoryCurtains from "@/assets/category-curtains.jpg";
import { fabrics } from "@/data/fabrics";
import FabricCard from "@/components/FabricCard";
import SectionHeader from "@/components/SectionHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingSocial from "@/components/FloatingSocial";
import IntroLoader from "@/components/IntroLoader";
import BrandMarquee from "@/components/BrandMarquee";

const categoryCards = [
  { label: "قماش تنجيد", desc: "أقمشة أنتريهات بألوان وخامات متنوعة", path: "/gallery?category=upholstery", image: categoryUpholstery },
  { label: "مقاس ستائر", desc: "ستائر فاخرة بمقاسات وتصاميم مختلفة", path: "/gallery?category=curtains", image: categoryCurtains },
];

const Index = () => {
  const { user, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(() => {
    if (sessionStorage.getItem("intro_shown")) return false;
    return true;
  });

  const featured = fabrics.filter((f) => f.isFeatured);
  const newArrivals = fabrics.filter((f) => f.isNew);
  const popular = fabrics.filter((f) => f.isPopular);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem("intro_shown", "1");
    setShowIntro(false);
  }, []);

  if (showIntro) {
    return <IntroLoader onComplete={handleIntroComplete} />;
  }

  if (!loading && !user) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[70vh] overflow-hidden md:h-[80vh]">
        <img src={heroBanner} alt="معرض الأقمشة" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/40" />
        <img src={logo} alt="" className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.h1
            className="mb-4 font-display text-4xl text-primary-foreground md:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            آدم للأقمشة الفاخرة
          </motion.h1>
          <motion.p
            className="mb-8 max-w-lg font-body text-lg text-primary-foreground/80 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            اكتشف أرقى أقمشة التنجيد والستائر بأعلى جودة
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <Link to="/gallery" className="gradient-teal inline-block rounded-lg px-8 py-3 font-body text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              تصفح المعرض
            </Link>
          </motion.div>
        </div>
        <motion.img
          src={mascotFabric}
          alt="مرحباً"
          className="absolute bottom-4 right-8 hidden w-28 object-contain mix-blend-multiply md:block md:w-36"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        />
      </section>

      {/* Category Cards with Images */}
      <section className="relative z-20 -mt-16 container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categoryCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * i }}>
              <Link to={card.path} className="group block relative rounded-xl overflow-hidden h-48 md:h-56">
                <img src={card.image} alt={card.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-foreground/50 group-hover:bg-foreground/40 transition-colors" />
                <div className="relative z-10 flex flex-col justify-end h-full p-6">
                  <h3 className="mb-1 font-display text-2xl text-primary-foreground">{card.label}</h3>
                  <p className="font-body text-sm text-primary-foreground/80">{card.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link to="/gallery" className="inline-block bg-foreground text-background rounded-lg px-8 py-3 font-body text-sm font-semibold hover:opacity-90 transition-opacity">
            تصفح الكل
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <SectionHeader title="أقمشة مميزة" subtitle="اختيارات منتقاة بعناية لك" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((f) => (
            <FabricCard key={f.id} fabric={f} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <motion.div className="flex flex-row-reverse items-center gap-6 rounded-xl bg-muted p-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <img src={mascotThinking} alt="نصيحة" className="h-24 w-24 flex-shrink-0 object-contain mix-blend-multiply" />
          <div className="text-right">
            <h3 className="mb-2 font-display text-xl text-foreground">💡 نصيحة من آدم</h3>
            <p className="font-body text-sm text-muted-foreground">
              هل تعلم أن القطن المصري يُعتبر من أفخر أنواع القطن في العالم؟ يتميز بأليافه الطويلة التي تمنحه نعومة ومتانة استثنائية. جرّب مجموعتنا من أقمشة التنجيد القطنية!
            </p>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <BrandMarquee />
      </section>

      <section className="container mx-auto px-4 py-16">
        <SectionHeader title="وصل حديثاً" subtitle="أحدث الأقمشة في مجموعتنا" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newArrivals.map((f) => (
            <FabricCard key={f.id} fabric={f} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <SectionHeader title="الأكثر طلباً" subtitle="الأقمشة المفضلة لدى عملائنا" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((f) => (
            <FabricCard key={f.id} fabric={f} />
          ))}
        </div>
      </section>

      <Footer />
      <FloatingSocial />
    </div>
  );
};

export default Index;
