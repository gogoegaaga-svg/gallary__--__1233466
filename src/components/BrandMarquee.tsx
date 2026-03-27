import lindexLogo from "@/assets/brand-lindex.png";
import keringLogo from "@/assets/brand-kering.png";
import whlLogo from "@/assets/brand-whl.png";
import greenfibresLogo from "@/assets/brand-greenfibres.png";
import asosLogo from "@/assets/brand-asos.png";

const partnerLogos = [
  { name: "LINDEX", src: lindexLogo },
  { name: "KERING", src: keringLogo },
  { name: "WHL", src: whlLogo },
  { name: "greenfibres", src: greenfibresLogo },
  { name: "ASOS", src: asosLogo },
];

const marqueeItems = [...partnerLogos, ...partnerLogos];

const BrandMarquee = () => {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card py-8 shadow-fabric">
      <div className="mb-6 px-6 text-center md:px-8">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-muted-foreground">Trusted by brands</p>
        <h2 className="mt-2 font-display text-3xl text-foreground">العلامات التي نعمل معها</h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-card to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-card to-transparent" />

        <div className="marquee-track flex w-max items-center gap-5 px-5">
          {marqueeItems.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex h-24 min-w-[180px] items-center justify-center rounded-2xl border border-border bg-background px-8 shadow-fabric"
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="h-10 w-auto max-w-[140px] object-contain mix-blend-multiply opacity-85"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
