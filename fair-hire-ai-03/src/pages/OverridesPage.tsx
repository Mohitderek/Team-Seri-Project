import { useData } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { AlertTriangle, Flag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const OverridesPage = () => {
  const { overrides, candidates } = useData();

  return (
    <AppLayout>
      <PageHeader title="Bias Override Flags" description="All ranking overrides with flagged suspicious patterns." />

      <div className="space-y-3">
        {overrides.map((o, i) => {
          const cand = candidates.find(c => c.id === o.candidateId);
          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card p-5 ${o.flagged ? "border-destructive/30" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${o.flagged ? "bg-destructive/10" : "bg-accent/10"}`}>
                    {o.flagged ? <Flag className="w-5 h-5 text-destructive" /> : <AlertTriangle className="w-5 h-5 text-accent" />}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{cand?.anonymizedId || "Unknown"}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>Rank #{o.previousRank}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-foreground font-medium">Rank #{o.newRank}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Reason: {o.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(o.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                {o.flagged && (
                  <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">⚠️ Flagged</span>
                )}
              </div>
            </motion.div>
          );
        })}

        {overrides.length === 0 && (
          <div className="glass-card p-12 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No ranking overrides recorded yet.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default OverridesPage;
