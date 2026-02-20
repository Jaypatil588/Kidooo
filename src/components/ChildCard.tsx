import type { Child } from '../types'
import { formatAge } from '../utils'

interface ChildCardProps {
  child: Child
  onViewProfile: (childId: string) => void
}

export default function ChildCard({ child, onViewProfile }: ChildCardProps) {
  const initial = child.name.charAt(0).toUpperCase()

  return (
    <button
      onClick={() => onViewProfile(child.id)}
      className="w-full border border-neutral-200 rounded-lg p-3 hover:border-primary-300 hover:bg-primary-50/50 transition-colors cursor-pointer text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pastel-sunflower to-pastel-coral flex items-center justify-center text-white text-sm font-bold shadow-soft-sm">
          {initial}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-neutral-800">{child.name}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Age: {formatAge(child.dateOfBirth)}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-primary-600">
          <span>View Profile</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}
