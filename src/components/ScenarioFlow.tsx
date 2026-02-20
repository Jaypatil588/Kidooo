import { useState, useRef } from 'react'
import { AGE_GROUPS, getScenariosByAge, type AgeGroup, type Scenario } from '../data/scenarios'

type Step = 'age' | 'scenario' | 'instructions'

const MAX_FILE_SIZE_MB = 500

interface ScenarioFlowProps {
  onUpload: (file: File, scenarioId: string) => void
  onClose: () => void
  isUploading: boolean
  onStartRecording?: (scenarioId: string) => void
}

export default function ScenarioFlow({ onUpload, onClose, isUploading, onStartRecording }: ScenarioFlowProps) {
  const [step, setStep] = useState<Step>('age')
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAgeSelect = (age: AgeGroup) => {
    setSelectedAge(age)
    setStep('scenario')
  }

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    if (scenario.analyzableViaVideo) {
      setStep('instructions')
    }
  }

  const handleBack = () => {
    if (step === 'instructions') {
      setStep('scenario')
      setSelectedScenario(null)
    } else if (step === 'scenario') {
      setStep('age')
      setSelectedAge(null)
    } else {
      onClose()
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedScenario) {
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > MAX_FILE_SIZE_MB) {
        setSizeError(`File is too large (${sizeMB.toFixed(0)}MB). Maximum allowed is ${MAX_FILE_SIZE_MB}MB.`)
        e.target.value = ''
        return
      }
      setSizeError(null)
      onUpload(file, selectedScenario.id)
      e.target.value = ''
    }
  }

  const handleRecordClick = () => {
    if (selectedScenario && onStartRecording) {
      onStartRecording(selectedScenario.id)
    }
  }

  const stepTitle = {
    age: 'Choose Age Group',
    scenario: selectedAge === 'under3' ? 'Under 3 Years' : 'Older Children',
    instructions: selectedScenario?.title ?? 'Instructions',
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-white">
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-800">
              {stepTitle[step]}
            </h1>
            <p className="text-xs text-neutral-500">
              {step === 'age' && 'Select your child\'s age group'}
              {step === 'scenario' && 'Pick a screening scenario'}
              {step === 'instructions' && 'Follow these steps, then upload'}
            </p>
          </div>
        </div>

        {/* Step Content */}
        {step === 'age' && <AgeGroupStep onSelect={handleAgeSelect} />}
        {step === 'scenario' && selectedAge && (
          <ScenarioStep ageGroup={selectedAge} onSelect={handleScenarioSelect} />
        )}
        {step === 'instructions' && selectedScenario && (
          <InstructionsStep
            scenario={selectedScenario}
            onUploadClick={handleUploadClick}
            onRecordClick={onStartRecording ? handleRecordClick : undefined}
            isUploading={isUploading}
            sizeError={sizeError}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

/* ─── Step 1: Age Group ─── */

function AgeGroupStep({ onSelect }: { onSelect: (age: AgeGroup) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {AGE_GROUPS.map((group) => (
        <button
          key={group.id}
          onClick={() => onSelect(group.id)}
          className="bg-white border-2 border-neutral-200 rounded-2xl p-5 hover:border-primary-400 hover:shadow-soft-md transition-all text-center group"
        >
          <div className="text-4xl mb-2">{group.icon}</div>
          <h3 className="text-sm font-bold text-neutral-800 group-hover:text-primary-700">
            {group.label}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">{group.subtitle}</p>
        </button>
      ))}
    </div>
  )
}

/* ─── Step 2: Scenario Selection ─── */

function ScenarioStep({
  ageGroup,
  onSelect,
}: {
  ageGroup: AgeGroup
  onSelect: (s: Scenario) => void
}) {
  const scenarios = getScenariosByAge(ageGroup)
  const videoScenarios = scenarios.filter((s) => s.analyzableViaVideo)
  const otherScenarios = scenarios.filter((s) => !s.analyzableViaVideo)

  return (
    <div className="space-y-4">
      {/* Video-analyzable scenarios */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
          Video Scenarios
        </p>
        {videoScenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className="w-full bg-white border border-neutral-200 rounded-xl p-3 hover:border-primary-300 hover:shadow-soft-md transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-lg flex-shrink-0">
                {scenario.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700">
                  {scenario.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                  {scenario.description}
                </p>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Non-video scenarios */}
      {otherScenarios.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Tracked Differently
          </p>
          {otherScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-left opacity-80"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-lg flex-shrink-0">
                  {scenario.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {scenario.description}
                  </p>
                  {scenario.alternativeNote && (
                    <p className="text-[11px] text-primary-600 mt-1.5 bg-primary-50 rounded-lg px-2 py-1">
                      {scenario.alternativeNote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Step 3: Instructions ─── */

function InstructionsStep({
  scenario,
  onUploadClick,
  onRecordClick,
  isUploading,
  sizeError,
}: {
  scenario: Scenario
  onUploadClick: () => void
  onRecordClick?: () => void
  isUploading: boolean
  sizeError: string | null
}) {
  return (
    <div className="space-y-4">
      {/* Scenario info */}
      <div className="bg-white rounded-2xl border border-primary-200 shadow-soft-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl">
            {scenario.icon}
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-800">{scenario.title}</h2>
            <p className="text-xs text-neutral-500">{scenario.description}</p>
          </div>
        </div>

        {/* Parent script */}
        <div className="space-y-0">
          <p className="text-xs font-bold text-primary-700 mb-2 uppercase tracking-wide">
            Parent Script
          </p>
          {scenario.parentScript.map((step, i) => {
            const isSubStep = step.startsWith('  •')
            return (
              <div
                key={i}
                className={`flex gap-2.5 ${isSubStep ? 'ml-6 mb-1' : 'mb-2'}`}
              >
                {!isSubStep && (
                  <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary-700">{i + 1}</span>
                  </div>
                )}
                {isSubStep && (
                  <span className="text-primary-400 flex-shrink-0 mt-0.5 text-xs">•</span>
                )}
                <p className={`text-xs text-neutral-700 leading-relaxed ${isSubStep ? '' : 'font-medium'}`}>
                  {isSubStep ? step.slice(4) : step}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary-50 rounded-2xl p-3 border border-primary-100">
        <p className="text-xs font-bold text-primary-700 mb-1">Tips for a good recording</p>
        <ul className="text-[11px] text-primary-700/80 space-y-0.5">
          <li>• Record in a quiet, well-lit room</li>
          <li>• Make sure your child's face is clearly visible</li>
          <li>• Keep the camera steady</li>
          <li>• Don't worry if it's not perfect — natural behavior is best!</li>
        </ul>
      </div>

      {sizeError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {sizeError}
        </p>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          onClick={onUploadClick}
          disabled={isUploading}
          className="inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-200 border-2 border-primary-600 shadow-soft-lg w-full text-base sm:text-lg py-4 px-8 gap-3"
        >
          {isUploading ? (
            <>
              <span className="flex-shrink-0 animate-spin">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <span className="flex-shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </span>
              <span>Upload Video</span>
            </>
          )}
        </button>

        {onRecordClick && !isUploading && (
          <button
            onClick={onRecordClick}
            className="inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 bg-white text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-200 border-2 border-primary-300 w-full text-base sm:text-lg py-4 px-8 gap-3"
          >
            <span className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </span>
            <span>Record with Camera</span>
          </button>
        )}
      </div>
    </div>
  )
}
