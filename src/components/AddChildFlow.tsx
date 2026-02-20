import { useState } from 'react'
import { MCHAT_QUESTIONS, scoreMChat } from '../data/mchat-questions'
import type { Child, ScreeningResult } from '../types'
import type { RiskLevel } from '../data/mchat-questions'

type FlowStep = 'details' | 'quiz-intro' | 'quiz' | 'results'

interface AddChildFlowProps {
  onComplete: (child: Child, screening: ScreeningResult) => void
  onClose: () => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function AddChildFlow({ onComplete, onClose }: AddChildFlowProps) {
  const [step, setStep] = useState<FlowStep>('details')

  // Child details
  const [name, setName] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [detailsError, setDetailsError] = useState<string | null>(null)

  // Quiz
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, boolean>>({})

  // Results
  const [result, setResult] = useState<{ score: number; riskLevel: RiskLevel } | null>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i)

  const handleDetailsNext = () => {
    if (!name.trim()) {
      setDetailsError('Please enter your child\'s name')
      return
    }
    if (!birthMonth || !birthYear || !birthDay) {
      setDetailsError('Please select a complete date of birth')
      return
    }
    setDetailsError(null)
    setStep('quiz-intro')
  }

  const handleAnswer = (answer: boolean) => {
    const qId = MCHAT_QUESTIONS[currentQ].id
    const updated = { ...answers, [qId]: answer }
    setAnswers(updated)

    if (currentQ < MCHAT_QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1)
    } else {
      const scored = scoreMChat(updated)
      setResult(scored)
      setStep('results')
    }
  }

  const handleQuizBack = () => {
    if (currentQ > 0) setCurrentQ((c) => c - 1)
    else setStep('quiz-intro')
  }

  const handleFinish = () => {
    if (!result) return

    const monthIdx = MONTHS.indexOf(birthMonth)
    const dob = `${birthYear}-${String(monthIdx + 1).padStart(2, '0')}-${birthDay.padStart(2, '0')}`
    const childId = `child_${Date.now()}`

    const child: Child = { id: childId, name: name.trim(), dateOfBirth: dob }
    const screening: ScreeningResult = {
      childId,
      answers,
      score: result.score,
      riskLevel: result.riskLevel,
      completedAt: new Date().toISOString(),
    }

    onComplete(child, screening)
  }

  const handleBack = () => {
    if (step === 'quiz-intro') setStep('details')
    else if (step === 'quiz') handleQuizBack()
    else onClose()
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-white">
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={step === 'results' ? onClose : handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            {step === 'results' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-800">
              {step === 'details' && 'Add Your Child'}
              {step === 'quiz-intro' && 'Developmental Screening'}
              {step === 'quiz' && `Question ${currentQ + 1} of ${MCHAT_QUESTIONS.length}`}
              {step === 'results' && 'Screening Complete'}
            </h1>
            <p className="text-xs text-neutral-500">
              {step === 'details' && 'Enter your child\'s information'}
              {step === 'quiz-intro' && 'Quick questionnaire about your child'}
              {step === 'quiz' && 'M-CHAT-R Screening'}
              {step === 'results' && `${name}'s results`}
            </p>
          </div>
        </div>

        {/* Overall progress */}
        {step !== 'results' && (
          <div className="flex items-center gap-1.5">
            <StepDot active={step === 'details'} done={step !== 'details'} label="1" />
            <div className={`flex-1 h-0.5 ${step === 'details' ? 'bg-neutral-200' : 'bg-primary-400'}`} />
            <StepDot active={step === 'quiz-intro' || step === 'quiz'} done={step === 'results'} label="2" />
            <div className={`flex-1 h-0.5 ${step === 'results' ? 'bg-primary-400' : 'bg-neutral-200'}`} />
            <StepDot active={step === 'results'} done={false} label="3" />
          </div>
        )}

        {/* Step content */}
        {step === 'details' && (
          <DetailsStep
            name={name}
            onNameChange={setName}
            birthMonth={birthMonth}
            onBirthMonthChange={setBirthMonth}
            birthDay={birthDay}
            onBirthDayChange={setBirthDay}
            birthYear={birthYear}
            onBirthYearChange={setBirthYear}
            years={years}
            error={detailsError}
            onNext={handleDetailsNext}
          />
        )}

        {step === 'quiz-intro' && (
          <QuizIntro childName={name} onStart={() => setStep('quiz')} />
        )}

        {step === 'quiz' && (
          <QuizStep
            question={MCHAT_QUESTIONS[currentQ]}
            questionIndex={currentQ}
            totalQuestions={MCHAT_QUESTIONS.length}
            currentAnswer={answers[MCHAT_QUESTIONS[currentQ].id]}
            onAnswer={handleAnswer}
          />
        )}

        {step === 'results' && result && (
          <ResultsStep
            childName={name}
            score={result.score}
            riskLevel={result.riskLevel}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  )
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
        active
          ? 'bg-primary-500 text-white shadow-soft-sm'
          : done
            ? 'bg-primary-200 text-primary-700'
            : 'bg-neutral-200 text-neutral-500'
      }`}
    >
      {done && !active ? '✓' : label}
    </div>
  )
}

/* ─── Step 1: Child Details ─── */

function DetailsStep({
  name, onNameChange,
  birthMonth, onBirthMonthChange,
  birthDay, onBirthDayChange,
  birthYear, onBirthYearChange,
  years, error, onNext,
}: {
  name: string; onNameChange: (v: string) => void
  birthMonth: string; onBirthMonthChange: (v: string) => void
  birthDay: string; onBirthDayChange: (v: string) => void
  birthYear: string; onBirthYearChange: (v: string) => void
  years: number[]; error: string | null; onNext: () => void
}) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">Child's Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter your child's name"
            className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 placeholder:text-neutral-400"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">Date of Birth</label>
          <div className="grid grid-cols-3 gap-2">
            {/* Month */}
            <select
              value={birthMonth}
              onChange={(e) => onBirthMonthChange(e.target.value)}
              className="px-2 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white text-neutral-700"
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Day */}
            <select
              value={birthDay}
              onChange={(e) => onBirthDayChange(e.target.value)}
              className="px-2 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white text-neutral-700"
            >
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={String(d)}>{d}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={birthYear}
              onChange={(e) => onBirthYearChange(e.target.value)}
              className="px-2 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white text-neutral-700"
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-primary-500 text-white rounded-2xl font-bold text-sm hover:bg-primary-600 transition-colors border-2 border-primary-600 shadow-soft-md"
      >
        Continue to Screening
      </button>
    </div>
  )
}

/* ─── Step 1.5: Quiz Intro ─── */

function QuizIntro({ childName, onStart }: { childName: string; onStart: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-primary-200 shadow-soft-md p-5">
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-neutral-800">M-CHAT-R Screening for {childName}</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Modified Checklist for Autism in Toddlers, Revised
          </p>
        </div>

        <div className="space-y-2 text-xs text-neutral-600">
          <p>
            Next, we'll ask <strong className="text-neutral-800">20 yes/no questions</strong> about {childName}'s behavior.
            This takes about <strong className="text-neutral-800">5 minutes</strong>.
          </p>
          <p>
            Answer based on {childName}'s <strong className="text-neutral-800">usual behavior</strong>. If you've only seen
            a behavior once or twice, answer as if it hasn't happened.
          </p>
          <p className="text-primary-600 font-medium">
            These answers help our AI provide more accurate video assessments.
          </p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3.5 bg-primary-500 text-white rounded-2xl font-bold text-sm hover:bg-primary-600 transition-colors border-2 border-primary-600 shadow-soft-md"
      >
        Begin Questionnaire
      </button>

      <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
        <p className="text-[11px] text-primary-700/80">
          <strong className="text-primary-700">Note:</strong> The M-CHAT-R is designed for toddlers 16–30 months,
          but can provide useful baseline data for children of other ages. It is a screening tool, not a diagnosis.
        </p>
      </div>
    </div>
  )
}

/* ─── Step 2: Quiz Questions ─── */

function QuizStep({
  question,
  questionIndex,
  totalQuestions,
  currentAnswer,
  onAnswer,
}: {
  question: typeof MCHAT_QUESTIONS[0]
  questionIndex: number
  totalQuestions: number
  currentAnswer?: boolean
  onAnswer: (answer: boolean) => void
}) {
  const progress = ((questionIndex) / totalQuestions) * 100

  return (
    <div className="space-y-4">
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
  )
}

/* ─── Step 3: Results ─── */

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string; description: string }> = {
  low: {
    label: 'Low Risk',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'The screening results indicate low risk. This is encouraging!',
  },
  medium: {
    label: 'Medium Risk',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'The screening results indicate medium risk. A follow-up with your pediatrician is recommended.',
  },
  high: {
    label: 'High Risk',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    description: 'The screening results indicate high risk. A comprehensive evaluation is strongly recommended.',
  },
}

function ResultsStep({
  childName,
  score,
  riskLevel,
  onFinish,
}: {
  childName: string
  score: number
  riskLevel: RiskLevel
  onFinish: () => void
}) {
  const config = RISK_CONFIG[riskLevel]

  return (
    <div className="space-y-4">
      {/* Score card */}
      <div className={`rounded-2xl border-2 p-5 ${config.bgColor}`}>
        <div className="text-center mb-3">
          <div className={`text-3xl font-bold ${config.color}`}>{score}/20</div>
          <div className={`text-sm font-bold ${config.color} mt-1`}>{config.label}</div>
        </div>
        <p className="text-xs text-neutral-700 text-center">{config.description}</p>
      </div>

      {/* AI context info */}
      <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
        <p className="text-xs text-primary-700">
          <strong>Great!</strong> {childName}'s profile and screening data will help our AI provide
          more accurate video assessments going forward.
        </p>
      </div>

      <button
        onClick={onFinish}
        className="w-full py-3.5 bg-primary-500 text-white rounded-2xl font-bold text-sm hover:bg-primary-600 transition-colors border-2 border-primary-600 shadow-soft-md"
      >
        Add {childName} to My Children
      </button>

      <p className="text-[10px] text-neutral-400 text-center px-4">
        Based on the M-CHAT-R. &copy; 2009 Diana Robins, Deborah Fein &amp; Marianne Barton.
        This is a screening tool, not a diagnostic instrument.
      </p>
    </div>
  )
}
