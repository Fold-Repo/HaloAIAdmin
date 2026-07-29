export type RenderingSection =
  | 'progress'
  | 'queue'
  | 'workers'
  | 'retry'
  | 'gpu'
  | 'ffmpeg'
  | 'history'
  | 'monitoring';

export type RenderJobStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'encoding'
  | 'completed'
  | 'failed'
  | 'retrying';

export type QueueHealth = 'healthy' | 'degraded' | 'critical';

export type WorkerStatus = 'online' | 'offline' | 'busy' | 'draining';

export type GpuStatus = 'available' | 'busy' | 'overheated' | 'offline';

export type RenderJob = {
  id: string;
  projectId: string;
  episodeId: string;
  episodeTitle: string;
  status: RenderJobStatus;
  progress: number;
  priority: number;
  outputFormat: string;
  resolution: string;
  durationSec: number;
  ffmpegCommand?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  workerId?: string;
  gpuId?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
};

export type RenderWorker = {
  id: string;
  name: string;
  status: WorkerStatus;
  currentJobId?: string;
  cpuUsage: number;
  memoryUsage: number;
  queueDepth: number;
  lastHeartbeat: string;
  region: string;
};

export type GpuNode = {
  id: string;
  name: string;
  model: string;
  status: GpuStatus;
  utilization: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  temperatureC: number;
  assignedJobId?: string;
};

export type RenderingOverview = {
  projectId: string;
  activeJobs: number;
  queuedJobs: number;
  completedToday: number;
  failedJobs: number;
  retryPending: number;
  overallProgress: number;
  avgRenderTimeSec: number;
  queueHealth: QueueHealth;
};

export type QueueMetrics = {
  projectId: string;
  queueDepth: number;
  throughputPerHour: number;
  avgWaitTimeSec: number;
  p95WaitTimeSec: number;
  activeWorkers: number;
  idleWorkers: number;
  failedLast24h: number;
  samples: Array<{ timestamp: string; depth: number; throughput: number }>;
};

export type FfmpegJobDetail = {
  jobId: string;
  episodeTitle: string;
  command: string;
  inputFiles: string[];
  outputFile: string;
  codec: string;
  bitrate: string;
  progress: number;
  currentFrame?: number;
  totalFrames?: number;
  fps?: number;
  speed?: string;
  logTail: string[];
  status: RenderJobStatus;
};

export type RetryJobPayload = {
  jobId: string;
};

export type CancelJobPayload = {
  jobId: string;
};

export type JobActionResult = {
  jobId: string;
  status: RenderJobStatus;
  message: string;
};
