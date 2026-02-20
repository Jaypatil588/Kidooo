import type { Child } from '../types'
import ChildCard from '../components/ChildCard'
import UserInfo from '../components/UserInfo'
import Button from '../components/Button'
import { PlusIcon } from '../components/icons'
import ResourcesFooter from '../components/ResourcesFooter'

interface ProfilePageProps {
  children: Child[]
  user: {
    fullName: string
    email: string
  }
  language: string
  onToggleLanguage: () => void
  onViewChildProfile: (childId: string) => void
  onAddChild: () => void
  onLogout: () => void
}

export default function ProfilePage({
  children,
  user,
  language,
  onToggleLanguage,
  onViewChildProfile,
  onAddChild,
  onLogout,
}: ProfilePageProps) {
  return (
    <div className="min-h-full bg-gradient-to-b from-primary-50 to-white">
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-6 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-neutral-800">Profile</h1>
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>
        </div>

        {/* My Children Card */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-soft-sm p-3 sm:p-4">
          <h2 className="text-sm sm:text-base font-bold text-neutral-800 mb-3">My Children</h2>
          <div className="space-y-2 mb-3">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} onViewProfile={onViewChildProfile} />
            ))}
          </div>
          <Button
            icon={<PlusIcon />}
            fullWidth
            onClick={onAddChild}
          >
            Add Your Child
          </Button>
        </div>

        {/* User Information Card */}
        <UserInfo fullName={user.fullName} email={user.email} onLogout={onLogout} />

        {/* Resources Footer */}
        <ResourcesFooter />
      </div>
    </div>
  )
}
