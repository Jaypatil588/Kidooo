export interface LogEntry {
  time: string
  message: string
}

export interface AnalysisScores {
  communication: number
  eyeContact: number
  socialEngagement: number
  gestures: number
  speechClarity: number
  emotionalResponse: number
}

export interface VideoAnalysis {
  id: number
  fileName: string
  uploadedAt: string
  status: 'compressing' | 'analyzing' | 'completed' | 'error'
  summary: string | null
  fullAnalysis: string | null
  originalSizeMB: number
  compressedSizeMB: number | null
  completedAt: string | null
  error: string | null
  logs: LogEntry[]
  scenarioId: string | null
  scenarioTitle: string | null
  scores: AnalysisScores | null
  childId: string | null
  childName: string | null
}

export interface Child {
  id: string
  name: string
  dateOfBirth: string
}

export interface ScreeningResult {
  childId: string
  answers: Record<number, boolean>
  score: number
  riskLevel: 'low' | 'medium' | 'high'
  completedAt: string
}
