import { useState, useCallback, useEffect } from 'react'
import type { VideoAnalysis, ScreeningResult } from '../types'
import AnalysisCharts from '../components/AnalysisCharts'
import ContactSpecialist from '../components/ContactSpecialist'
import { generateAnalysisReport } from '../utils/generatePdf'

interface ReportPageProps {
  analyses: VideoAnalysis[]
  childName?: string
}

export default function ReportPage({ analyses, childName = 'Child' }: ReportPageProps) {
  const [showContact, setShowContact] = useState(false)
  const [screening, setScreening] = useState<ScreeningResult | null>(null)

  useEffect(() => {
    fetch('/api/screening/1')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setScreening(data) })
      .catch(() => {})
  }, [])

  const handleDownloadPdf = useCallback(() => {
    generateAnalysisReport(analyses, childName, screening)
  }, [analyses, childName, screening])

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-white">
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-neutral-800">Video Reports</h1>
          {analyses.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={() => setShowContact(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-primary-500 border border-primary-600 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          )}
        </div>

        {showContact && (
          <ContactSpecialist
            analyses={analyses}
            childName={childName}
            onClose={() => setShowContact(false)}
          />
        )}

        {analyses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <ReportCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-soft-md p-6 text-center">
      <div className="text-primary-300 mb-3">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-neutral-600">No reports yet</p>
      <p className="text-xs text-neutral-500 mt-1">
        Upload a video from the Home tab to generate an analysis report
      </p>
    </div>
  )
}

function ReportCard({ analysis }: { analysis: VideoAnalysis }) {
  const [expanded, setExpanded] = useState(false)

  const statusConfig = {
    compressing: { label: 'Compressing video...', color: 'bg-amber-100 text-amber-700', icon: '⏳' },
    analyzing: { label: 'AI is analyzing...', color: 'bg-primary-100 text-primary-700', icon: '🔍' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: '✓' },
    error: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: '✗' },
  }

  const config = statusConfig[analysis.status]
  const date = new Date(analysis.uploadedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isProcessing = analysis.status === 'compressing' || analysis.status === 'analyzing'

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => analysis.status === 'completed' && setExpanded(!expanded)}
        className={`w-full p-4 text-left ${analysis.status === 'completed' ? 'cursor-pointer hover:bg-primary-50/40' : 'cursor-default'}`}
      >
        <div className="flex items-start gap-3">
          {/* ID Badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-700">#{analysis.id}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-neutral-800 truncate">
                {analysis.fileName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color} ${isProcessing ? 'animate-pulse' : ''}`}
              >
                <span>{config.icon}</span>
                {config.label}
              </span>
            </div>

            {analysis.childName && (
              <p className="text-[11px] text-neutral-500 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-[8px] font-bold text-white">{analysis.childName.charAt(0)}</span>
                  {analysis.childName}
                </span>
              </p>
            )}

            {analysis.scenarioTitle && (
              <p className="text-[11px] text-primary-600 font-medium mt-0.5">
                Scenario: {analysis.scenarioTitle}
              </p>
            )}

            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
              <span>{date}</span>
              {analysis.originalSizeMB && (
                <span>
                  {analysis.compressedSizeMB && analysis.compressedSizeMB !== analysis.originalSizeMB
                    ? `${analysis.originalSizeMB}MB → ${analysis.compressedSizeMB}MB`
                    : `${analysis.originalSizeMB}MB`}
                </span>
              )}
            </div>

            {analysis.summary && !expanded && (
              <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{analysis.summary}</p>
            )}

            {analysis.error && (
              <p className="text-xs text-error-600 mt-2">{analysis.error}</p>
            )}
          </div>

          {/* Expand indicator */}
          {analysis.status === 'completed' && (
            <div className="flex-shrink-0 text-primary-400 mt-1">
              <svg
                className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* Expanded full analysis */}
      {expanded && analysis.fullAnalysis && (
        <div className="border-t border-primary-100 px-4 py-4 bg-primary-50/30 space-y-4">
          {analysis.scores && <AnalysisCharts scores={analysis.scores} />}
          <MarkdownContent content={analysis.fullAnalysis} />
        </div>
      )}
    </div>
  )
}

/* ─── Simple Markdown Renderer ─── */

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-sm font-bold text-neutral-800 mt-4 mb-1.5 first:mt-0">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xs font-bold text-neutral-700 mt-3 mb-1">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-1.5 text-xs text-neutral-600 ml-2 mb-0.5">
          <span className="text-primary-400 flex-shrink-0">•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      )
    } else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)/)
      if (match) {
        elements.push(
          <div key={i} className="flex gap-1.5 text-xs text-neutral-600 ml-2 mb-0.5">
            <span className="text-primary-600 flex-shrink-0 font-medium">{match[1]}.</span>
            <span>{formatInline(match[2])}</span>
          </div>
        )
      }
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />)
    } else {
      elements.push(
        <p key={i} className="text-xs text-neutral-600 mb-1">
          {formatInline(line)}
        </p>
      )
    }

    i++
  }

  return <div>{elements}</div>
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-neutral-800">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}
