import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Plus, Briefcase, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const JobsPage = () => {
  const { user } = useAuth();
  const { jobs, addJob } = useData();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords(prev => [...prev, kw]);
      setKeywordInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addJob({ title, description, keywords, createdBy: user?.id || "" });
    setTitle(""); setDescription(""); setKeywords([]);
    setShowForm(false);
  };

  return (
    <AppLayout>
      <PageHeader title="Job Descriptions" description="Create and manage positions for bias-free screening.">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Job
        </button>
      </PageHeader>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Job Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Senior Software Engineer" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Describe the role, requirements, and qualifications..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Keywords / Skills</label>
                <div className="flex gap-2">
                  <input value={keywordInput} onChange={e => setKeywordInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())} className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Type a skill and press Enter" />
                  <button type="button" onClick={handleAddKeyword} className="px-4 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-border transition-colors">Add</button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {keywords.map(kw => (
                      <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        <Tag className="w-3 h-3" />{kw}
                        <button type="button" onClick={() => setKeywords(prev => prev.filter(k => k !== kw))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Create Job</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-border">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job, i) => (
          <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-accent/10">
                <Briefcase className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{job.title}</h3>
                <p className="text-xs text-muted-foreground">Created {new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {job.keywords.map(kw => (
                <span key={kw} className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{kw}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
};

export default JobsPage;
