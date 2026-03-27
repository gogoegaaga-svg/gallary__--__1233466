import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/adam-logo.svg";

interface IntroLoaderProps {
  onComplete: () => void;
}

const IntroLoader = ({ onComplete }: IntroLoaderProps) => {
  const [phase, setPhase] = useState<"video" | "fadeout">("video");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("fadeout");
      setTimeout(onComplete, 800);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "fadeout" ? null : null}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "fadeout" ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onEnded={() => {
              setPhase("fadeout");
              setTimeout(onComplete, 800);
            }}
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <img src={logo} alt="ADAM Fabrics" className="w-40 h-40 shadow-fabric opacity-80" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroLoader;
