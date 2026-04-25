import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  glowClass?: string;
}

const StatCard = ({ label, value, icon, trend, glowClass = "" }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-5 ${glowClass}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
        {trend && <p className="mt-1 text-xs text-success">{trend}</p>}
      </div>
      <div className="p-2.5 rounded-lg bg-secondary">{icon}</div>
    </div>
  </motion.div>
);

export default StatCard;
