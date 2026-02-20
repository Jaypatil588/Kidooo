import { useState } from 'react'
import type { VideoAnalysis } from '../types'

interface ContactSpecialistProps {
  analyses: VideoAnalysis[]
  childName: string
  onClose: () => void
}

export default function ContactSpecialist({ analyses, childName, onClose }: ContactSpecialistProps) {
  const [copied, setCopied] = useState(false)

  const completed = analyses.filter((a) => a.status === 'completed')

  const generateTextSummary = () => {
    let text = `Kidooo Developmental Report — ${childName}\n`
    text += `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`

    for (const a of completed) {
      text += `--- Analysis #${a.id} ---\n`
      text += `Scenario: ${a.scenarioTitle || 'General'}\n`
      text += `File: ${a.fileName}\n`
      text += `Date: ${new Date(a.uploadedAt).toLocaleDateString()}\n`
      if (a.scores) {
        text += `Scores: Communication ${a.scores.communication}/10, Eye Contact ${a.scores.eyeContact}/10, Social ${a.scores.socialEngagement}/10, Gestures ${a.scores.gestures}/10, Speech ${a.scores.speechClarity}/10, Emotional ${a.scores.emotionalResponse}/10\n`
      }
      if (a.summary) text += `Summary: ${a.summary}\n`
      text += '\n'
    }

    text += '\nNote: This data is from Kidooo, a screening tool. It is not a diagnostic instrument.\n'
    return text
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateTextSummary())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback */
    }
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Developmental Screening Data — ${childName}`)
    const body = encodeURIComponent(
      generateTextSummary() +
      '\n\n(Please also attach the PDF report generated from Kidooo for complete details.)'
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 safe-area-bottom">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-800">Share with Specialist</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs text-amber-800">
            <strong>Important:</strong> This screening data is for informational purposes only.
            It does not constitute a medical diagnosis. Please share with a qualified healthcare professional
            for proper evaluation.
          </p>
        </div>

        <p className="text-xs text-neutral-600">
          Share your child's screening data ({completed.length} completed {completed.length === 1 ? 'analysis' : 'analyses'}) with a specialist.
        </p>

        {/* Email option */}
        <button
          onClick={handleEmail}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">Email Report</p>
            <p className="text-xs text-neutral-500">Opens your email client with a pre-filled summary</p>
          </div>
        </button>

        {/* Copy option */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              {copied ? 'Copied!' : 'Copy Summary'}
            </p>
            <p className="text-xs text-neutral-500">Copy a text summary to your clipboard</p>
          </div>
        </button>
      </div>
    </div>
  )
}
