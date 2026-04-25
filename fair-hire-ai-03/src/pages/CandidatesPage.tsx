import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { CheckCircle, Tag, ChevronDown, ChevronUp, AlertTriangle, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CandidatesPage = () => {
  const { user } = useAuth();
  const { jobs, candidates, addOverride } = useData();
  const [selectedJob, setSelectedJob] = useState(jobs[0]?.id || "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [overrideModal, setOverrideModal] = useState<{ candidateId: string; currentRank: number } | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideNewRank, setOverrideNewRank] = useState(1);

  const jobCandidates = candidates
    .filter(c => c.jobId === selectedJob)
    .sort((a, b) => b.score - a.score);

  const handleOverrideSubmit = () => {
    if (!overrideModal || !overrideReason.trim()) return;
    addOverride({
      candidateId: overrideModal.candidateId,
      previousRank: overrideModal.currentRank,
      newRank: overrideNewRank,
      reason: overrideReason,
      recruiterId: user?.id || "",
    });
    setOverrideModal(null);
    setOverrideReason("");
  };

  return (
    <AppLayout>
      <PageHeader title="Candidate Rankings" description="Review anonymized candidates ranked by job fit. Human decision is always final.">
        <select
          value={selectedJob}
          onChange={e => setSelectedJob(e.target.value)}
          className="px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </PageHeader>

      <div className="space-y-3">
        {jobCandidates.map((c, rank) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.03 }}
            className="glass-card overflow-hidden"
          >
            <div
              className="flex items-center gap-4 p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
            >
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                rank === 0 ? "bg-accent text-accent-foreground" :
                rank === 1 ? "bg-primary/20 text-primary" :
                rank === 2 ? "bg-success/20 text-success" :
                "bg-muted text-muted-foreground"
              }`}>
                #{rank + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-foreground">{c.anonymizedId}</h3>
                  {c.identityRevealed && <Eye className="w-4 h-4 text-destructive" />}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {c.skillsMatch.slice(0, 4).map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />{skill}
                    </span>
                  ))}
                  {c.skillsMatch.length > 4 && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">+{c.skillsMatch.length - 4}</span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xl font-display font-bold text-primary">{c.score}%</p>
                <p className="text-xs text-muted-foreground">{c.experience}y experience</p>
              </div>

              {expandedId === c.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </div>

            <AnimatePresence>
              {expandedId === c.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-border/50 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Explainability</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Ranked #{rank + 1} because: {c.skillsMatch.slice(0, 3).map(s => `${s} ✓`).join(", ")}, {c.experience} years exp ✓
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs">
                              <Tag className="w-3 h-3" />{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Anonymized Profile</h4>
                        <p className="text-sm text-muted-foreground">{c.anonymizedText}</p>
                      </div>
                    </div>

                    {user?.role === "recruiter" && (
                      <div className="mt-4 pt-4 border-t border-border/30 flex gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOverrideModal({ candidateId: c.id, currentRank: rank + 1 }); }}
                          className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4" />Override Ranking
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {jobCandidates.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No candidates found for this job. Upload resumes to get started.</p>
          </div>
        )}
      </div>

      {/* Override Modal */}
      <AnimatePresence>
        {overrideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOverrideModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">Override Ranking</h3>
              <p className="text-sm text-muted-foreground mb-4">You must provide a reason. This action will be permanently logged.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">New Rank</label>
                  <input
                    type="number"
                    min={1}
                    max={jobCandidates.length}
                    value={overrideNewRank}
                    onChange={e => setOverrideNewRank(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Reason (required)</label>
                  <textarea
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Explain why you're changing this ranking..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleOverrideSubmit}
                    disabled={!overrideReason.trim()}
                    className="flex-1 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Submit Override
                  </button>
                  <button onClick={() => setOverrideModal(null)} className="px-6 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-border">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default CandidatesPage;
