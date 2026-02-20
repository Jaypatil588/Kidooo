import { useState, useRef, useEffect, useMemo } from 'react'
import type { Child, VideoAnalysis, AnalysisScores } from '../types'
import type { UploadStatus, ActiveJob } from '../hooks/useVideoAnalyses'
import ScenarioFlow from '../components/ScenarioFlow'
import CameraRecorder from '../components/CameraRecorder'
import AnalysisCharts from '../components/AnalysisCharts'
import { formatAge } from '../utils'

interface HomePageProps {
  child: Child
  onChildSwitch: () => void
  onUploadReport: (file: File) => void
  onImportFromAI: () => void
  recentAnalyses: VideoAnalysis[]
  uploadStatus: UploadStatus
  uploadError: string | null
  uploadPercent: number
  activeJob: ActiveJob | null
  onUploadVideo: (file: File, scenarioId: string) => void
  onDismissJob: () => void
  onViewReport: () => void
}

export default function HomePage({
  child,
  onChildSwitch,
  onUploadReport,
  onImportFromAI,
  recentAnalyses,
  uploadStatus,
  uploadError,
  uploadPercent,
  activeJob,
  onUploadVideo,
  onDismissJob,
  onViewReport,
}: HomePageProps) {
  const [showScenarioFlow, setShowScenarioFlow] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraScenarioId, setCameraScenarioId] = useState<string | null>(null)
  const reportInputRef = useRef<HTMLInputElement>(null)
  const initial = child.name.charAt(0).toUpperCase()

  const isUploading = uploadStatus === 'uploading'
  const isBusy = isUploading || (activeJob !== null && activeJob.analysis?.status !== 'completed' && activeJob.analysis?.status !== 'error')

  const handleStartUpload = () => {
    if (!isBusy) setShowScenarioFlow(true)
  }

  const handleScenarioUpload = (file: File, scenarioId: string) => {
    onUploadVideo(file, scenarioId)
    setShowScenarioFlow(false)
  }

  const handleStartRecording = (scenarioId: string) => {
    setCameraScenarioId(scenarioId)
    setShowCamera(true)
    setShowScenarioFlow(false)
  }

  const handleRecordingComplete = (file: File) => {
    if (cameraScenarioId) {
      onUploadVideo(file, cameraScenarioId)
    }
    setShowCamera(false)
    setCameraScenarioId(null)
  }

  if (showCamera) {
    return (
      <CameraRecorder
        onRecordingComplete={handleRecordingComplete}
        onClose={() => { setShowCamera(false); setCameraScenarioId(null) }}
      />
    )
  }

  if (showScenarioFlow && !isUploading) {
    return (
      <ScenarioFlow
        onUpload={handleScenarioUpload}
        onClose={() => setShowScenarioFlow(false)}
        isUploading={isUploading}
        onStartRecording={handleStartRecording}
      />
    )
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-white">
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-6 space-y-3 sm:space-y-4">
        {/* Child Selector Card */}
        <div
          onClick={onChildSwitch}
          className="bg-gradient-to-r from-pastel-sunflower via-pastel-peach to-pastel-coral rounded-2xl shadow-soft-md p-3 sm:p-4 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 text-base rounded-full border-2 border-white/60 flex-shrink-0 bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center font-bold text-white shadow-soft-md">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white">{child.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm text-white/90">Age: {formatAge(child.dateOfBirth)}</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-white/70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Upload Video Button */}
        <button
          onClick={handleStartUpload}
          disabled={isBusy}
          className="inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-200 border-2 border-primary-600 shadow-soft-lg w-full text-base sm:text-lg py-4 px-8 gap-3"
        >
          {isUploading ? (
            <>
              <span className="flex-shrink-0 animate-spin"><SpinnerIcon /></span>
              <span>Uploading... {uploadPercent}%</span>
            </>
          ) : (
            <>
              <span className="flex-shrink-0"><VideoIcon /></span>
              <span>Upload Video</span>
            </>
          )}
        </button>

        {/* ─── Progress Panel ─── */}
        {(isUploading || activeJob) && (
          <ProgressPanel
            uploadStatus={uploadStatus}
            uploadPercent={uploadPercent}
            activeJob={activeJob}
            onDismiss={onDismissJob}
          />
        )}

        {uploadError && !activeJob && (
          <p className="text-xs text-error-600 bg-error-50 border border-error-200 rounded-lg px-3 py-2">
            {uploadError}
          </p>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <input
            ref={reportInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUploadReport(file)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => reportInputRef.current?.click()}
            disabled={isBusy}
            className="bg-white border border-neutral-200 shadow-soft-sm rounded-xl p-3 hover:border-primary-300 hover:shadow-md transition-all disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                <ReportIcon />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-neutral-800 text-center leading-tight">
                Upload Evaluation Report
              </span>
            </div>
          </button>
          <button
            onClick={onImportFromAI}
            className="bg-white border border-neutral-200 shadow-soft-sm rounded-xl p-3 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
                <ChatBubbleIcon />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-neutral-800 text-center leading-tight">
                Import from AI
              </span>
            </div>
          </button>
        </div>

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-neutral-800">Recent Analyses</h3>
              <button onClick={onViewReport} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {recentAnalyses.map((a) => (
                <AnalysisCard key={a.id} analysis={a} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Dashboard */}
        <StatsDashboard analyses={recentAnalyses} childName={child.name} />
      </div>
    </div>
  )
}

/* ─── Progress Panel ─── */

const STEP_CONFIG = {
  uploading: { label: 'Uploading video to server', icon: '↑', color: 'text-primary-600' },
  compressing: { label: 'Compressing video', icon: '⚙', color: 'text-amber-600' },
  analyzing: { label: 'AI is analyzing the video', icon: '🔍', color: 'text-primary-700' },
  completed: { label: 'Analysis complete!', icon: '✓', color: 'text-green-600' },
  error: { label: 'Processing failed', icon: '✗', color: 'text-red-600' },
} as const

function ProgressPanel({
  uploadStatus,
  uploadPercent,
  activeJob,
  onDismiss,
}: {
  uploadStatus: UploadStatus
  uploadPercent: number
  activeJob: ActiveJob | null
  onDismiss: () => void
}) {
  const logsEndRef = useRef<HTMLDivElement>(null)
  const serverStatus = activeJob?.analysis?.status
  const logs = activeJob?.analysis?.logs ?? []
  const isDone = serverStatus === 'completed' || serverStatus === 'error'

  let currentStep: keyof typeof STEP_CONFIG = 'uploading'
  if (uploadStatus === 'uploading') {
    currentStep = 'uploading'
  } else if (serverStatus) {
    currentStep = serverStatus
  }

  const stepCfg = STEP_CONFIG[currentStep]

  let overallPercent = 0
  if (uploadStatus === 'uploading') {
    overallPercent = Math.round(uploadPercent * 0.2)
  } else if (serverStatus === 'compressing') {
    overallPercent = 30
  } else if (serverStatus === 'analyzing') {
    overallPercent = 60
  } else if (serverStatus === 'completed') {
    overallPercent = 100
  } else if (serverStatus === 'error') {
    overallPercent = 100
  }

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <div className={`bg-white rounded-2xl border shadow-soft-md overflow-hidden transition-all ${
      isDone && serverStatus === 'completed'
        ? 'border-green-200'
        : isDone && serverStatus === 'error'
          ? 'border-red-200'
          : 'border-primary-200'
    }`}>
      <div className="px-3 py-2.5 flex items-center gap-2.5 border-b border-neutral-100">
        <span className={`text-base ${stepCfg.color}`}>{stepCfg.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${stepCfg.color}`}>{stepCfg.label}</p>
          {activeJob?.analysis?.fileName && (
            <p className="text-[10px] text-neutral-500 truncate">
              {activeJob.analysis.scenarioTitle && `${activeJob.analysis.scenarioTitle} · `}
              {activeJob.analysis.fileName}
            </p>
          )}
        </div>
        {isDone && (
          <button onClick={onDismiss} className="text-neutral-400 hover:text-neutral-600 p-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="h-1.5 bg-primary-50">
        <div
          className={`h-full transition-all duration-700 ease-out rounded-r-full ${
            serverStatus === 'error' ? 'bg-red-500' : serverStatus === 'completed' ? 'bg-green-500' : 'bg-gradient-to-r from-primary-400 to-primary-600'
          } ${!isDone ? 'animate-pulse' : ''}`}
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      <div className="max-h-36 overflow-y-auto">
        <div className="px-3 py-2 space-y-1">
          {uploadStatus === 'uploading' && (
            <LogLine time={null} message={`Uploading to server... ${uploadPercent}%`} isLatest />
          )}
          {uploadStatus !== 'uploading' && activeJob && logs.length === 0 && (
            <LogLine time={null} message="Waiting for server..." isLatest />
          )}
          {logs.map((log, i) => (
            <LogLine key={i} time={log.time} message={log.message} isLatest={i === logs.length - 1 && !isDone} />
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  )
}

function LogLine({ time, message, isLatest }: { time: string | null; message: string; isLatest: boolean }) {
  const ts = time
    ? new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className={`flex items-start gap-2 text-[11px] leading-relaxed ${isLatest ? 'text-neutral-800' : 'text-neutral-500'}`}>
      {isLatest ? (
        <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
      ) : (
        <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-300" />
      )}
      <span className="flex-1">{message}</span>
      {ts && <span className="flex-shrink-0 text-neutral-400 tabular-nums">{ts}</span>}
    </div>
  )
}

/* ─── Analysis Card ─── */

function AnalysisCard({ analysis }: { analysis: VideoAnalysis }) {
  const statusConfig = {
    compressing: { label: 'Compressing...', color: 'bg-amber-100 text-amber-700', pulse: true },
    analyzing: { label: 'Analyzing...', color: 'bg-primary-100 text-primary-700', pulse: true },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', pulse: false },
    error: { label: 'Failed', color: 'bg-red-100 text-red-700', pulse: false },
  }

  const config = statusConfig[analysis.status]
  const date = new Date(analysis.uploadedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-soft-sm p-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary-700">#{analysis.id}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-neutral-800 truncate">{analysis.fileName}</p>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}>
              {config.label}
            </span>
          </div>
          {analysis.childName && (
            <p className="text-[11px] text-neutral-500 mb-0.5">
              <span className="inline-flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-[8px] font-bold text-white">{analysis.childName.charAt(0)}</span>
                {analysis.childName}
              </span>
            </p>
          )}
          {analysis.scenarioTitle && (
            <p className="text-[11px] text-primary-600 font-medium mb-0.5">{analysis.scenarioTitle}</p>
          )}
          <p className="text-xs text-neutral-500">{date}</p>
          {analysis.summary && <p className="text-xs text-neutral-600 mt-1.5 line-clamp-2">{analysis.summary}</p>}
          {analysis.error && <p className="text-xs text-error-600 mt-1.5">{analysis.error}</p>}
        </div>
      </div>
    </div>
  )
}

/* ─── Stats Dashboard ─── */

const SCORE_LABELS: Record<keyof AnalysisScores, string> = {
  communication: 'Communication',
  eyeContact: 'Eye Contact',
  socialEngagement: 'Social',
  gestures: 'Gestures',
  speechClarity: 'Speech',
  emotionalResponse: 'Emotional',
}

const SCORE_KEYS = Object.keys(SCORE_LABELS) as (keyof AnalysisScores)[]

function scoreColor(v: number) {
  if (v >= 7) return 'text-green-600'
  if (v >= 4) return 'text-amber-600'
  return 'text-red-600'
}

function scoreBg(v: number) {
  if (v >= 7) return 'bg-green-500'
  if (v >= 4) return 'bg-amber-400'
  return 'bg-red-500'
}

function StatsDashboard({ analyses, childName }: { analyses: VideoAnalysis[]; childName: string }) {
  const completed = useMemo(
    () => analyses.filter((a) => a.status === 'completed'),
    [analyses],
  )

  const withScores = useMemo(
    () => completed.filter((a) => a.scores),
    [completed],
  )

  const avgScores = useMemo(() => {
    const avg: AnalysisScores = { communication: 0, eyeContact: 0, socialEngagement: 0, gestures: 0, speechClarity: 0, emotionalResponse: 0 }
    if (withScores.length === 0) return avg
    const sums: Record<string, number> = {}
    const counts: Record<string, number> = {}
    for (const a of withScores) {
      if (!a.scores) continue
      for (const k of SCORE_KEYS) {
        const v = a.scores[k]
        sums[k] = (sums[k] || 0) + v
        counts[k] = (counts[k] || 0) + 1
      }
    }
    for (const k of SCORE_KEYS) {
      avg[k] = counts[k] ? Math.round((sums[k] / counts[k]) * 10) / 10 : 0
    }
    return avg
  }, [withScores])

  if (completed.length === 0) return null

  const overallAvg = (() => {
    const vals = SCORE_KEYS.map((k) => avgScores[k])
    const sum = vals.reduce((s, v) => s + v, 0)
    return Math.round((sum / vals.length) * 10) / 10
  })()

  return (
    <div className="space-y-3">
      <h3 className="text-sm sm:text-base font-bold text-neutral-800">{childName}&#39;s Development Overview</h3>

      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-3 text-center">
          <p className="text-2xl font-bold text-primary-600">{completed.length}</p>
          <p className="text-[10px] text-neutral-500 font-medium mt-0.5">Assessments</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-3 text-center">
          <p className={`text-2xl font-bold ${scoreColor(overallAvg)}`}>{overallAvg}</p>
          <p className="text-[10px] text-neutral-500 font-medium mt-0.5">Overall Score</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-3 text-center">
          <p className={`text-2xl font-bold ${overallAvg >= 7 ? 'text-green-600' : overallAvg >= 4 ? 'text-amber-600' : 'text-red-600'}`}>
            {overallAvg >= 7 ? 'Good' : overallAvg >= 4 ? 'Fair' : 'Low'}
          </p>
          <p className="text-[10px] text-neutral-500 font-medium mt-0.5">Status</p>
        </div>
      </div>

      {/* Radar + Bar charts */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-4">
        <p className="text-xs font-bold text-neutral-700 mb-1 text-center">Average Developmental Profile</p>
        <p className="text-[10px] text-neutral-400 text-center mb-3">Based on {withScores.length > 0 ? `${withScores.length} scored assessment${withScores.length > 1 ? 's' : ''}` : `${completed.length} assessment${completed.length > 1 ? 's' : ''}`}</p>
        <AnalysisCharts scores={avgScores} />
      </div>

      {/* Individual score bars */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-4 space-y-2.5">
        <p className="text-xs font-bold text-neutral-700">Score Summary</p>
        {SCORE_KEYS.map((k) => {
          const v = avgScores[k]
          return (
            <div key={k} className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-600 w-20 flex-shrink-0 truncate">{SCORE_LABELS[k]}</span>
              <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${v > 0 ? scoreBg(v) : 'bg-neutral-300'}`}
                  style={{ width: `${Math.max((v / 10) * 100, v === 0 ? 3 : 0)}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-8 text-right ${v > 0 ? scoreColor(v) : 'text-neutral-400'}`}>{v}</span>
            </div>
          )
        })}
        <div className="flex items-center gap-3 mt-1 justify-center border-t border-neutral-100 pt-2">
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Typical (7-10)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Mild (4-6)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Concern (1-3)
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Inline SVG Icons ─── */

function VideoIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ChatBubbleIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

