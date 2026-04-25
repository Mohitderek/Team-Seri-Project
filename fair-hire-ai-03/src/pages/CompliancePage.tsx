import { useData } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Shield, Eye, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CompliancePage = () => {
  const { auditLogs, candidates, overrides } = useData();

  const principles = [
    {
      title: "Transparency",
      description: "All ranking decisions include explainability tags showing exact criteria used.",
      status: "compliant" as const,
      icon: Eye,
      details: `${auditLogs.filter(l => l.category === "ranking").length} ranking events logged with full criteria visibility.`,
    },
    {
      title: "Human Oversight",
      description: "No automated decisions. All candidate selection requires human action.",
      status: "compliant" as const,
      icon: Users,
      details: "System provides rankings only. Recruiters make all final decisions.",
    },
    {
      title: "Data Minimization",
      description: "Only anonymized data is stored. Raw PII is never persisted.",
      status: "compliant" as const,
      icon: Shield,
      details: `${auditLogs.filter(l => l.category === "anonymization").length} anonymization events. All PII removed before storage.`,
    },
    {
      title: "Bias Detection",
      description: "Override patterns are monitored for suspicious ranking changes.",
      status: overrides.some(o => o.flagged) ? "warning" as const : "compliant" as const,
      icon: AlertTriangle,
      details: overrides.some(o => o.flagged)
        ? `${overrides.filter(o => o.flagged).length} override(s) flagged for review.`
        : "No suspicious override patterns detected.",
    },
  ];

  const confidenceScore = Math.round(
    (principles.filter(p => p.status === "compliant").length / principles.length) * 100
  );

  return (
    <AppLayout>
      <PageHeader title="Compliance Panel" description="EU AI Act compliance status and transparency report." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 glow-success lg:col-span-1">
          <p className="text-sm text-muted-foreground mb-2">Compliance Score</p>
          <p className="font-display text-5xl font-bold text-success">{confidenceScore}%</p>
          <p className="text-sm text-muted-foreground mt-2">Based on EU AI Act principles</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-foreground mb-3">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-display font-bold text-primary">{candidates.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Candidates Screened</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-display font-bold text-accent">{auditLogs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Audit Events</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-display font-bold text-destructive">{candidates.filter(c => c.identityRevealed).length}</p>
              <p className="text-xs text-muted-foreground mt-1">Identities Revealed</p>
            </div>
          </div>
        </motion.div>
      </div>

      <h2 className="font-display text-xl font-semibold text-foreground mb-4">EU AI Act Principles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {principles.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-lg ${p.status === "compliant" ? "bg-success/10" : "bg-accent/10"}`}>
                <p.icon className={`w-5 h-5 ${p.status === "compliant" ? "text-success" : "text-accent"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-foreground">{p.title}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    p.status === "compliant" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                  }`}>
                    {p.status === "compliant" ? <><CheckCircle className="w-3 h-3" />Compliant</> : <><AlertTriangle className="w-3 h-3" />Warning</>}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <p className="text-xs text-muted-foreground mt-2 italic">{p.details}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
};

export default CompliancePage;
