import { useState, useEffect, useCallback } from 'react'
import { MCHAT_QUESTIONS, scoreMChat, type RiskLevel } from '../data/mchat-questions'
import type { ScreeningResult } from '../types'

interface ScreeningPageProps {
  childId: string
}

type PageState = 'landing' | 'quiz' | 'results'

export default function ScreeningPage({ childId }: ScreeningPageProps) {
  const [pageState, setPageState] = useState<PageState>('landing')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const [savedResult, setSavedResult] = useState<ScreeningResult | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/screening/${childId}`)
      if (res.ok) {
        const data = await res.json()
        setSavedResult(data)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [childId])

  useEffect(() => { fetchResult() }, [fetchResult])

  const handleAnswer = (answer: boolean) => {
    const qId = MCHAT_QUESTIONS[currentQ].id
    setAnswers((prev) => ({ ...prev, [qId]: answer }))

    if (currentQ < MCHAT_QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1)
    } else {
      submitResults({ ...answers, [qId]: answer })
    }
  }

  const submitResults = async (finalAnswers: Record<number, boolean>) => {
    const { score, riskLevel } = scoreMChat(finalAnswers)
    const result: ScreeningResult = {
      childId,
      answers: finalAnswers,
      score,
      riskLevel,
      completedAt: new Date().toISOString(),
    }

    try {
      await fetch('/api/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
    } catch {
      /* save locally anyway */
    }

    setSavedResult(result)
    setPageState('results')
  }

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ((c) => c - 1)
  }

  const handleRetake = () => {
    setAnswers({})
    setCurrentQ(0)
    setSavedResult(null)
    setPageState('quiz')
  }

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="text-sm text-neutral-500">Loading...</div>
      </div>
    )
  }

  if (pageState === 'results' || (pageState === 'landing' && savedResult)) {
    return <ResultsView result={savedResult!} onRetake={handleRetake} />
  }

  if (pageState === 'quiz') {
    return (
      <QuizView
        question={MCHAT_QUESTIONS[currentQ]}
        questionIndex={currentQ}
        totalQuestions={MCHAT_QUESTIONS.length}
        currentAnswer={answers[MCHAT_QUESTIONS[currentQ].id]}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    )
  }

  return <LandingView onStart={() => setPageState('quiz')} hasResult={!!savedResult} />
}

/* ─── Landing ─── */

function LandingView({ onStart, hasResult }: { onStart: () => void; hasResult: boolean }) {
  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-white">
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-6 space-y-4">
        <h1 className="text-base sm:text-lg font-bold text-neutral-800">Developmental Screening</h1>

        <div className="bg-white rounded-2xl border border-primary-200 shadow-soft-md p-5">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-neutral-800">M-CHAT-R Screening</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Modified Checklist for Autism in Toddlers, Revised
            </p>
          </div>

          <div className="space-y-2 text-xs text-neutral-600 mb-4">
            <p>
              The M-CHAT-R is a scientifically validated screening tool designed for toddlers between
              <strong className="text-neutral-800"> 16 and 30 months</strong> of age.
            </p>
            <p>
              It consists of <strong className="text-neutral-800">20 yes/no questions</strong> about your child's behavior and takes about 5 minutes to complete.
            </p>
            <p className="text-primary-600 font-medium">
              Your answers will be used as context when our AI analyzes your child's videos, providing more accurate assessments.
            </p>
          </div>

          <button
            onClick={onStart}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors border-2 border-primary-600 shadow-soft-md"
          >
            {hasResult ? 'Retake Screening' : 'Start Screening'}
          </button>
        </div>

        <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
          <p className="text-[11px] text-primary-700/80">
            <strong className="text-primary-700">Note:</strong> This is a screening tool, not a diagnostic instrument.
            A positive result does not mean your child has autism — it means further evaluation is recommended.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Quiz ─── */

function QuizView({
  question,
  questionIndex,
  totalQuestions,
  currentAnswer,
  onAnswer,
  onBack,
}: {
  question: typeof MCHAT_QUESTIONS[0]
  questionIndex: number
  totalQuestions: number
  currentAnswer?: boolean
  onAnswer: (answer: boolean) => void
  onBack: () => void
}) {
  const progress = ((questionIndex) / totalQuestions) * 100

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-white">
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {questionIndex > 0 && (
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs text-neutral-500 font-medium">
              Question {questionIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-md p-5">
          <p className="text-sm font-semibold text-neutral-800 leading-relaxed">
            {question.text}
          </p>
          {question.example && (
            <p className="text-xs text-neutral-500 mt-2 bg-neutral-50 rounded-lg p-2.5">
              <span className="font-medium text-neutral-600">Example: </span>
              {question.example}
            </p>
          )}
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onAnswer(true)}
            className={`py-5 rounded-2xl text-base font-bold transition-all border-2 ${
              currentAnswer === true
                ? 'bg-primary-500 text-white border-primary-600 shadow-soft-md'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onAnswer(false)}
            className={`py-5 rounded-2xl text-base font-bold transition-all border-2 ${
              currentAnswer === false
                ? 'bg-primary-500 text-white border-primary-600 shadow-soft-md'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            No
          </button>
        </div>

        <p className="text-[11px] text-neutral-400 text-center">
          Answer based on your child's usual behavior, not rare occurrences.
        </p>
      </div>
    </div>
  )
}

/* ─── Results ─── */

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string; description: string; action: string }> = {
  low: {
    label: 'Low Risk',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Your child\'s screening results indicate low risk. This is encouraging!',
    action: 'If your child is younger than 24 months or you have other concerns, consider rescreening later or discussing with your pediatrician.',
  },
  medium: {
    label: 'Medium Risk',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Your child\'s screening results indicate medium risk. A follow-up screening is recommended.',
    action: 'Please take your child to their pediatrician for a follow-up screening. You can also seek early intervention services.',
  },
  high: {
    label: 'High Risk',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Your child\'s screening results indicate high risk. A comprehensive evaluation is strongly recommended.',
    action: 'Please take your child to their pediatrician for a full developmental evaluation. Begin early intervention services as soon as possible.',
  },
}

function ResultsView({ result, onRetake }: { result: ScreeningResult; onRetake: () => void }) {
  const config = RISK_CONFIG[result.riskLevel]
  const date = new Date(result.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-white">
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-6 space-y-4">
        <h1 className="text-base sm:text-lg font-bold text-neutral-800">Screening Results</h1>

        {/* Score card */}
        <div className={`rounded-2xl border-2 p-5 ${config.bgColor}`}>
          <div className="text-center mb-3">
            <div className={`text-3xl font-bold ${config.color}`}>{result.score}/20</div>
            <div className={`text-sm font-bold ${config.color} mt-1`}>{config.label}</div>
          </div>
          <p className="text-xs text-neutral-700 text-center">{config.description}</p>
        </div>

        {/* Recommendation */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-4">
          <h3 className="text-sm font-bold text-neutral-800 mb-2">Recommended Next Steps</h3>
          <p className="text-xs text-neutral-600">{config.action}</p>
        </div>

        {/* AI context info */}
        <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
          <p className="text-xs text-primary-700">
            <strong>AI context:</strong> Your screening answers will be included when analyzing future videos, giving
            our AI more context for accurate assessments.
          </p>
        </div>

        {/* Meta */}
        <p className="text-xs text-neutral-400 text-center">Completed on {date}</p>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onRetake}
            className="w-full py-3 bg-white text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors border-2 border-primary-200"
          >
            Retake Screening
          </button>
        </div>

        <p className="text-[10px] text-neutral-400 text-center px-4">
          This screening is based on the M-CHAT-R (Modified Checklist for Autism in Toddlers, Revised).
          It is not a diagnostic tool. &copy; 2009 Diana Robins, Deborah Fein &amp; Marianne Barton.
        </p>
      </div>
    </div>
  )
}
