'use client';
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EducationCardProps {
  icon: string;
  title: string;
  color: "red" | "green" | "blue";
  children: ReactNode;
  index: number;
}

const colorMap = {
  red: "border-eat-red/30 bg-eat-red/5",
  green: "border-eat-green/30 bg-eat-green/5",
  blue: "border-eat-blue/30 bg-eat-blue/5",
};

const iconBgMap = {
  red: "gradient-warm",
  green: "gradient-nature",
  blue: "gradient-cool",
};

const EducationCard = ({ icon, title, color, children, index }: EducationCardProps) => {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={`rounded-2xl border-2 ${colorMap[color]} p-6 shadow-card`}
    >
      <div className={`w-14 h-14 rounded-xl ${iconBgMap[color]} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <h3 className="font-display font-bold text-xl mb-3 text-foreground">{title}</h3>
      <div className="text-muted-foreground leading-relaxed text-sm space-y-3">
        {children}
      </div>
    </motion.div>
  );
};

export default EducationCard;