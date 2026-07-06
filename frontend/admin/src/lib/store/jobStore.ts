import { create } from "zustand";

export interface Job {
  id: string;
  name: string;
  description?: string;
  cronExpression: string;
  isActive: boolean;
  lastStatus?: string | null;
  lastRunAt?: string | null;
  lastSuccessAt?: string | null;
  lastErrorMessage?: string | null;
  totalRuns: number;
  totalSuccessfulRuns: number;
  averageExecutionTime?: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

type JobState = {
  jobs: Job[];
  setJobs: (items: Job[]) => void;
  addJob: (item: Job) => void;
  removeJob: (id: string) => void;
  updateJob: (id: string, item: Partial<Job>) => void;
  clear: () => void;
};

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  setJobs: (items) => set({ jobs: items }),
  addJob: (item) => set((state) => ({ jobs: [item, ...state.jobs] })),
  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
    })),
  updateJob: (id, item) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, ...item } : job
      ),
    })),
  clear: () => set({ jobs: [] }),
}));
