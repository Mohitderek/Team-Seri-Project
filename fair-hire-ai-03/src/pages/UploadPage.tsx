import { useState, useCallback } from "react";
import { useData } from "@/contexts/DataContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUpload {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "done" | "error";
  error?: string;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const UploadPage = () => {
  const { jobs, addCandidates } = useData();
  const [selectedJob, setSelectedJob] = useState(jobs[0]?.id || "");
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!VALID_TYPES.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx"))
      return "Unsupported file type. Only PDF and DOCX are allowed.";
    if (file.size > MAX_SIZE) return "File exceeds 10MB limit.";
    return null;
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const uploads: FileUpload[] = newFiles.map(file => {
      const error = validateFile(file);
      return { file, progress: 0, status: error ? "error" : "pending", error: error || undefined };
    });
    setFiles(prev => [...prev, ...uploads]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleProcess = async () => {
    const validFiles = files.filter(f => f.status === "pending");
    if (validFiles.length === 0 || !selectedJob) return;
    setIsProcessing(true);

    // Simulate upload + processing
    for (let i = 0; i < validFiles.length; i++) {
      setFiles(prev => prev.map((f, idx) => {
        if (f.file === validFiles[i].file) return { ...f, status: "uploading", progress: 0 };
        return f;
      }));

      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 100));
        setFiles(prev => prev.map(f => f.file === validFiles[i].file ? { ...f, progress: p } : f));
      }

      setFiles(prev => prev.map(f => f.file === validFiles[i].file ? { ...f, status: "processing", progress: 100 } : f));
      await new Promise(r => setTimeout(r, 500));
      setFiles(prev => prev.map(f => f.file === validFiles[i].file ? { ...f, status: "done" } : f));
    }

    await addCandidates(selectedJob, validFiles.map(f => f.file));
    setIsProcessing(false);
  };

  const removeFile = (file: File) => setFiles(prev => prev.filter(f => f.file !== file));
  const validCount = files.filter(f => f.status !== "error").length;

  return (
    <AppLayout>
      <PageHeader title="Upload Resumes" description="Upload PDF or DOCX resumes for bias-free anonymization and scoring." />

      <div className="max-w-3xl">
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">Target Job</label>
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`glass-card p-12 text-center transition-all cursor-pointer ${isDragging ? "border-primary bg-primary/5 glow-primary" : ""}`}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = ".pdf,.docx";
            input.onchange = e => {
              const target = e.target as HTMLInputElement;
              if (target.files) addFiles(Array.from(target.files));
            };
            input.click();
          }}
        >
          <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-foreground font-medium">Drop files here or click to browse</p>
          <p className="text-sm text-muted-foreground mt-1">PDF & DOCX only • Max 10MB per file</p>
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
              {files.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <FileText className={`w-5 h-5 ${f.status === "error" ? "text-destructive" : f.status === "done" ? "text-success" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(f.file.size / 1024).toFixed(0)} KB</p>
                    {f.error && <p className="text-xs text-destructive">{f.error}</p>}
                    {(f.status === "uploading" || f.status === "processing") && (
                      <div className="mt-1.5 w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {f.status === "done" && <CheckCircle className="w-4 h-4 text-success" />}
                    {f.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                    {f.status === "uploading" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                    {f.status === "processing" && <span className="text-xs text-accent font-medium">Anonymizing...</span>}
                    {(f.status === "pending" || f.status === "error") && (
                      <button onClick={() => removeFile(f.file)} className="p-1 hover:bg-border rounded"><X className="w-4 h-4 text-muted-foreground" /></button>
                    )}
                  </div>
                </motion.div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">{validCount} valid file{validCount !== 1 ? "s" : ""} ready</p>
                <button
                  onClick={handleProcess}
                  disabled={validCount === 0 || isProcessing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <>Upload & Anonymize</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default UploadPage;
