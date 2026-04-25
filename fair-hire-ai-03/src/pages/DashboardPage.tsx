import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Users, Briefcase, FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const { user } = useAuth();
  const { jobs, candidates, auditLogs, overrides } = useData();

  const stats = [
    { label: "Total Candidates", value: candidates.length, icon: <Users className="w-5 h-5 text-primary" />, glowClass: "glow-primary" },
    { label: "Active Jobs", value: jobs.length, icon: <Briefcase className="w-5 h-5 text-accent" />, glowClass: "glow-accent" },
    { label: "Audit Events", value: auditLogs.length, icon: <FileText className="w-5 h-5 text-success" />, glowClass: "glow-success" },
    { label: "Overrides", value: overrides.length, icon: <AlertTriangle className="w-5 h-5 text-destructive" /> },
  ];

  const recentLogs = auditLogs.slice(0, 5);
  const topCandidates = candidates.slice(0, 5);

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${user?.name}`}
        description="Here's an overview of your bias-free screening pipeline."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Top Candidates</h2>
          <div className="space-y-3">
            {topCandidates.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    #{i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.anonymizedId}</p>
                    <p className="text-xs text-muted-foreground">{c.skillsMatch.slice(0, 3).join(", ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{c.score}%</p>
                  <p className="text-xs text-muted-foreground">{c.experience}y exp</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Recent Activity</h2>
          <div className="space-y-3">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className={`mt-0.5 p-1.5 rounded-md ${
                  log.category === "anonymization" ? "bg-primary/10 text-primary" :
                  log.category === "reveal" ? "bg-destructive/10 text-destructive" :
                  log.category === "override" ? "bg-accent/10 text-accent" :
                  "bg-success/10 text-success"
                }`}>
                  {log.category === "anonymization" ? <Shield className="w-3.5 h-3.5" /> :
                   log.category === "reveal" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                   <CheckCircle className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
