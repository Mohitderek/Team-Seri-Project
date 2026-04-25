import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Calendar, Eye, EyeOff, Plus, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InterviewsPage = () => {
  const { user } = useAuth();
  const { jobs, candidates, interviews, scheduleInterview, revealIdentity } = useData();
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [revealConfirm, setRevealConfirm] = useState<string | null>(null);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === selectedCandidate);
    if (!cand) return;
    scheduleInterview({
      candidateId: selectedCandidate,
      anonymizedId: cand.anonymizedId,
      jobId: cand.jobId,
      scheduledAt: selectedDate,
      notes,
    });
    setShowSchedule(false);
    setSelectedCandidate("");
    setSelectedDate("");
    setNotes("");
  };

  const handleReveal = (candidateId: string) => {
    revealIdentity(candidateId, user?.id || "", user?.name || "");
    setRevealConfirm(null);
  };

  return (
    <AppLayout>
      <PageHeader title="Blind Interviews" description="Schedule interviews with anonymized candidates. Reveal identity only when ready.">
        <button
          onClick={() => setShowSchedule(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />Schedule Interview
        </button>
      </PageHeader>

      <AnimatePresence>
        {showSchedule && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <form onSubmit={handleSchedule} className="glass-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Candidate</label>
                <select value={selectedCandidate} onChange={e => setSelectedCandidate(e.target.value)} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required>
                  <option value="">Select a candidate</option>
                  {candidates.map(c => <option key={c.id} value={c.id}>{c.anonymizedId} — Score: {c.score}%</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date & Time</label>
                <input type="datetime-local" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Interview notes..." />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Schedule</button>
                <button type="button" onClick={() => setShowSchedule(false)} className="px-6 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {interviews.map((iv, i) => {
          const cand = candidates.find(c => c.id === iv.candidateId);
          return (
            <motion.div key={iv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{iv.anonymizedId}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(iv.scheduledAt).toLocaleString()}</p>
                    {iv.notes && <p className="text-xs text-muted-foreground mt-1">{iv.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    iv.status === "scheduled" ? "bg-primary/10 text-primary" :
                    iv.status === "completed" ? "bg-success/10 text-success" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {iv.status}
                  </span>
                  {cand && !cand.identityRevealed ? (
                    <button
                      onClick={() => setRevealConfirm(cand.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
                    >
                      <EyeOff className="w-4 h-4" />Reveal Identity
                    </button>
                  ) : cand?.identityRevealed ? (
                    <span className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm">
                      <Eye className="w-4 h-4" />Revealed
                    </span>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );
        })}

        {interviews.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No interviews scheduled yet.</p>
          </div>
        )}
      </div>

      {/* Reveal Confirmation */}
      <AnimatePresence>
        {revealConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRevealConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-sm text-center">
              <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">Reveal Identity?</h3>
              <p className="text-sm text-muted-foreground mb-6">This action is permanent and will be logged in the audit trail. It cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => handleReveal(revealConfirm)} className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium">Reveal</button>
                <button onClick={() => setRevealConfirm(null)} className="flex-1 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default InterviewsPage;
