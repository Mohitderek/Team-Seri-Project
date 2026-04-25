import { useState } from "react";
import { useData, AuditLog } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Shield, Upload, AlertTriangle, Eye, CheckCircle, Layers } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_CONFIG: Record<AuditLog["category"], { icon: React.ElementType; color: string; bg: string }> = {
  anonymization: { icon: Shield, color: "text-primary", bg: "bg-primary/10" },
  ranking: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  override: { icon: AlertTriangle, color: "text-accent", bg: "bg-accent/10" },
  reveal: { icon: Eye, color: "text-destructive", bg: "bg-destructive/10" },
  upload: { icon: Upload, color: "text-primary", bg: "bg-primary/10" },
  login: { icon: Layers, color: "text-muted-foreground", bg: "bg-muted" },
};

const AuditLogPage = () => {
  const { auditLogs } = useData();
  const [filter, setFilter] = useState<AuditLog["category"] | "all">("all");

  const filtered = filter === "all" ? auditLogs : auditLogs.filter(l => l.category === filter);
  const categories: (AuditLog["category"] | "all")[] = ["all", "anonymization", "ranking", "override", "reveal", "upload"];

  return (
    <AppLayout>
      <PageHeader title="Audit Log" description="Complete trail of all actions for compliance and transparency." />

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((log, i) => {
          const config = CATEGORY_CONFIG[log.category];
          const Icon = config.icon;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{log.action}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>{log.category}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{log.details}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground">{log.userName}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default AuditLogPage;
