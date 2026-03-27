import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import mascot from "@/assets/mascot-happy-transparent.png";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="mb-4 w-72 rounded-lg border border-border bg-card p-4 shadow-fabric-hover"
        >
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="إغلاق">
              <X size={18} />
            </button>
            <h4 className="font-display text-sm text-foreground">مرحباً! كيف أساعدك؟</h4>
          </div>
          <div className="mb-3 rounded-lg bg-muted p-3">
            <p className="font-body text-xs text-muted-foreground">
              أهلاً بك في آدم للأقمشة! أنا هنا لمساعدتك في اختيار أفضل الأقمشة. تواصل معنا عبر واتساب للاستفسار عن الأسعار والتوفر.
            </p>
          </div>
          <a
            href="https://wa.me/201016694946"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-teal block w-full rounded-lg py-2 text-center font-body text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            تواصل عبر واتساب
          </a>
        </motion.div>
      )}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-background shadow-fabric-hover transition-transform hover:scale-110"
        whileTap={{ scale: 0.95 }}
        aria-label="فتح المساعدة"
      >
        <img src={mascot} alt="مساعد آدم" className="h-full w-full object-contain" />
      </motion.button>
    </div>
  );
};

export default FloatingChat;
