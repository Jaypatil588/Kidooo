import { useState } from 'react'

export default function ResourcesFooter() {
  const [tipsOpen, setTipsOpen] = useState(false)

  return (
    <div className="space-y-3 mt-2">
      {/* Helpful Resources */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-4">
        <h3 className="text-sm font-bold text-neutral-800 mb-2">Helpful Resources</h3>
        <div className="space-y-2">
          <ResourceLink
            title="Autism Speaks — Screen Your Child"
            url="https://www.autismspeaks.org/screen-your-child"
            description="Free M-CHAT-R screening tool"
          />
          <ResourceLink
            title="CDC Developmental Milestones"
            url="https://www.cdc.gov/ncbddd/actearly/milestones/"
            description="Track your child's development"
          />
          <ResourceLink
            title="First Concern to Action Tool Kit"
            url="https://www.autismspeaks.org/toolkit/first-concern-action-tool-kit"
            description="Guide for getting early intervention"
          />
        </div>
      </div>

      {/* Tips for Parents */}
      <button
        onClick={() => setTipsOpen(!tipsOpen)}
        className="w-full bg-primary-50 rounded-2xl border border-primary-100 p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary-700">Tips for Parents</h3>
          <svg
            className={`w-4 h-4 text-primary-500 transition-transform ${tipsOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {tipsOpen && (
          <div className="mt-3 space-y-2 text-xs text-primary-700/80">
            <p>
              <strong className="text-primary-700">Trust your instincts.</strong> You know your child best. If something
              feels different, it's worth exploring.
            </p>
            <p>
              <strong className="text-primary-700">Early action matters.</strong> Research shows that early intervention
              can significantly improve outcomes.
            </p>
            <p>
              <strong className="text-primary-700">Every child is unique.</strong> Developmental timelines vary. These
              screenings identify areas to watch, not diagnoses.
            </p>
            <p>
              <strong className="text-primary-700">Record natural behavior.</strong> The best videos for analysis show
              your child in their everyday environment.
            </p>
            <p>
              <strong className="text-primary-700">Celebrate strengths.</strong> Focus on what your child can do, and
              support growth in areas of need.
            </p>
          </div>
        )}
      </button>

      {/* Need Help */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-4">
        <h3 className="text-sm font-bold text-neutral-800 mb-1">Need Help?</h3>
        <p className="text-xs text-neutral-500 mb-2">
          If you have concerns about your child's development, reach out to a professional.
        </p>
        <div className="space-y-1.5 text-xs text-neutral-600">
          <p>
            <span className="font-semibold">Autism Response Team:</span>{' '}
            <a href="tel:888-288-4762" className="text-primary-600 font-medium">888-AUTISM2 (288-4762)</a>
          </p>
          <p>
            <span className="font-semibold">Email:</span>{' '}
            <a href="mailto:help@autismspeaks.org" className="text-primary-600 font-medium">help@autismspeaks.org</a>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-neutral-400 text-center px-4 pb-2">
        Kidooo is a screening tool, not a diagnostic instrument. Always consult with a qualified healthcare
        professional for diagnosis and treatment.
      </p>
    </div>
  )
}

function ResourceLink({ title, url, description }: { title: string; url: string; description: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2 p-2 rounded-xl hover:bg-primary-50/50 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-800 group-hover:text-primary-700">{title}</p>
        <p className="text-[11px] text-neutral-500">{description}</p>
      </div>
      <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-primary-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
