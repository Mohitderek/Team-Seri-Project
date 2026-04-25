import { createContext, useContext, useState, ReactNode } from "react";

export interface Job {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  createdBy: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  anonymizedId: string;
  jobId: string;
  anonymizedText: string;
  score: number;
  skillsMatch: string[];
  experience: number;
  tags: string[];
  identityRevealed: boolean;
  realName?: string;
  realEmail?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  userName: string;
  timestamp: string;
  category: "anonymization" | "ranking" | "override" | "reveal" | "upload" | "login";
}

export interface Override {
  id: string;
  candidateId: string;
  previousRank: number;
  newRank: number;
  reason: string;
  recruiterId: string;
  timestamp: string;
  flagged: boolean;
}

export interface Interview {
  id: string;
  candidateId: string;
  anonymizedId: string;
  jobId: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
}

interface DataContextType {
  jobs: Job[];
  candidates: Candidate[];
  auditLogs: AuditLog[];
  overrides: Override[];
  interviews: Interview[];
  addJob: (job: Omit<Job, "id" | "createdAt">) => void;
  addCandidates: (jobId: string, files: File[]) => Promise<void>;
  revealIdentity: (candidateId: string, userId: string, userName: string) => void;
  addOverride: (override: Omit<Override, "id" | "timestamp" | "flagged">) => void;
  scheduleInterview: (interview: Omit<Interview, "id" | "status">) => void;
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

const MOCK_SKILLS = [
  ["Python", "Machine Learning", "TensorFlow", "Data Analysis", "SQL"],
  ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
  ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
  ["Product Management", "Agile", "SQL", "Analytics", "Leadership"],
  ["Python", "Django", "PostgreSQL", "Redis", "CI/CD"],
  ["JavaScript", "Vue.js", "MongoDB", "Express", "Testing"],
  ["Go", "gRPC", "Kafka", "AWS", "Terraform"],
  ["Swift", "iOS", "UIKit", "Core Data", "SwiftUI"],
];

const MOCK_TAGS = [
  "Strong technical background",
  "Leadership experience",
  "Cross-functional collaboration",
  "Open source contributor",
  "Startup experience",
  "Enterprise background",
  "Research publications",
  "Mentorship experience",
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "job-1",
      title: "Senior Software Engineer",
      description: "Looking for an experienced engineer with Python, ML, and cloud expertise. 5+ years experience required.",
      keywords: ["Python", "Machine Learning", "AWS", "Docker", "SQL"],
      createdBy: "admin",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "job-2",
      title: "Frontend Developer",
      description: "React/TypeScript expert needed for our product team. Experience with design systems preferred.",
      keywords: ["React", "TypeScript", "CSS", "Testing", "GraphQL"],
      createdBy: "admin",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const items: Candidate[] = [];
    for (let i = 0; i < 8; i++) {
      items.push({
        id: `cand-${i}`,
        anonymizedId: `Candidate ${LETTERS[i]}`,
        jobId: i < 5 ? "job-1" : "job-2",
        anonymizedText: `Professional with ${3 + Math.floor(Math.random() * 8)} years of experience in software development. Proficient in ${MOCK_SKILLS[i].join(", ")}. Has worked on large-scale distributed systems. University ${LETTERS[Math.floor(Math.random() * 5)]} graduate.`,
        score: Math.round((95 - i * 7 + Math.random() * 5) * 10) / 10,
        skillsMatch: MOCK_SKILLS[i],
        experience: 3 + Math.floor(Math.random() * 8),
        tags: [MOCK_TAGS[i % MOCK_TAGS.length], MOCK_TAGS[(i + 3) % MOCK_TAGS.length]],
        identityRevealed: false,
        realName: `[REDACTED - ${LETTERS[i]}]`,
        realEmail: `[REDACTED]@example.com`,
      });
    }
    return items.sort((a, b) => b.score - a.score);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "log-1", action: "PII Removed", details: "Name, email, LinkedIn URL removed from resume", userId: "sys", userName: "System", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), category: "anonymization" },
    { id: "log-2", action: "Ranking Generated", details: "8 candidates ranked for 'Senior Software Engineer' role using TF-IDF scoring", userId: "sys", userName: "System", timestamp: new Date(Date.now() - 86400000).toISOString(), category: "ranking" },
    { id: "log-3", action: "Resume Upload", details: "5 resumes uploaded for job 'Senior Software Engineer'", userId: "admin-1", userName: "Admin", timestamp: new Date(Date.now() - 86400000 * 2.5).toISOString(), category: "upload" },
  ]);

  const [overrides, setOverrides] = useState<Override[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  const addAuditLog = (log: Omit<AuditLog, "id" | "timestamp">) => {
    setAuditLogs(prev => [{ ...log, id: crypto.randomUUID(), timestamp: new Date().toISOString() }, ...prev]);
  };

  const addJob = (job: Omit<Job, "id" | "createdAt">) => {
    const newJob: Job = { ...job, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setJobs(prev => [newJob, ...prev]);
    addAuditLog({ action: "Job Created", details: `Job "${job.title}" created`, userId: job.createdBy, userName: "Admin", category: "ranking" });
  };

  const addCandidates = async (jobId: string, files: File[]) => {
    const newCandidates: Candidate[] = files.map((_, i) => {
      const idx = candidates.length + i;
      const skills = MOCK_SKILLS[idx % MOCK_SKILLS.length];
      return {
        id: crypto.randomUUID(),
        anonymizedId: `Candidate ${LETTERS[idx % 26]}${idx >= 26 ? Math.floor(idx / 26) : ""}`,
        jobId,
        anonymizedText: `Professional with ${3 + Math.floor(Math.random() * 8)} years of experience. Proficient in ${skills.join(", ")}. University ${LETTERS[Math.floor(Math.random() * 5)]} graduate.`,
        score: Math.round((90 - Math.random() * 30) * 10) / 10,
        skillsMatch: skills,
        experience: 3 + Math.floor(Math.random() * 8),
        tags: [MOCK_TAGS[idx % MOCK_TAGS.length], MOCK_TAGS[(idx + 2) % MOCK_TAGS.length]],
        identityRevealed: false,
      };
    });
    setCandidates(prev => [...prev, ...newCandidates].sort((a, b) => b.score - a.score));
    files.forEach(f => {
      addAuditLog({ action: "PII Removed", details: `Name, email, address, social links removed from "${f.name}"`, userId: "sys", userName: "System", category: "anonymization" });
    });
    addAuditLog({ action: "Resume Upload", details: `${files.length} resume(s) uploaded and anonymized`, userId: "sys", userName: "System", category: "upload" });
  };

  const revealIdentity = (candidateId: string, userId: string, userName: string) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, identityRevealed: true } : c));
    const cand = candidates.find(c => c.id === candidateId);
    addAuditLog({ action: "Identity Revealed", details: `Identity of ${cand?.anonymizedId || "unknown"} revealed by ${userName}`, userId, userName, category: "reveal" });
  };

  const addOverride = (override: Omit<Override, "id" | "timestamp" | "flagged">) => {
    const newOverride: Override = { ...override, id: crypto.randomUUID(), timestamp: new Date().toISOString(), flagged: Math.abs(override.previousRank - override.newRank) > 3 };
    setOverrides(prev => [newOverride, ...prev]);
    addAuditLog({ action: "Ranking Override", details: `Candidate rank changed from #${override.previousRank} to #${override.newRank}. Reason: ${override.reason}`, userId: override.recruiterId, userName: "Recruiter", category: "override" });
  };

  const scheduleInterview = (interview: Omit<Interview, "id" | "status">) => {
    setInterviews(prev => [...prev, { ...interview, id: crypto.randomUUID(), status: "scheduled" }]);
    addAuditLog({ action: "Interview Scheduled", details: `Interview scheduled for ${interview.anonymizedId}`, userId: "sys", userName: "System", category: "ranking" });
  };

  return (
    <DataContext.Provider value={{ jobs, candidates, auditLogs, overrides, interviews, addJob, addCandidates, revealIdentity, addOverride, scheduleInterview, addAuditLog }}>
      {children}
    </DataContext.Provider>
  );
};
