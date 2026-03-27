import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <motion.div
    className="text-center mb-10"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <h2 className="font-display text-3xl md:text-4xl text-foreground mb-2">{title}</h2>
    {subtitle && <p className="text-muted-foreground font-body text-sm">{subtitle}</p>}
    <div className="w-20 h-0.5 gradient-gold mx-auto mt-4 rounded-full" />
  </motion.div>
);

export default SectionHeader;
