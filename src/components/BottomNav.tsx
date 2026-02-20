import {
  HomeIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from './icons'

export type NavTab = 'home' | 'screening' | 'report' | 'profile'

interface BottomNavProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

function ScreeningIcon({ filled = false, className = 'w-6 h-6' }: { filled?: boolean; className?: string }) {
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3a1.5 1.5 0 00-1.5 1.5H15A1.5 1.5 0 0013.5 3zM4.5 9.375A1.125 1.125 0 015.625 8.25h9.75c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V9.375zM6 12.75a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 3a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  )
}

const tabs: { id: NavTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (active) => <HomeIcon filled={active} />,
  },
  {
    id: 'screening',
    label: 'Screening',
    icon: (active) => <ScreeningIcon filled={active} />,
  },
  {
    id: 'report',
    label: 'Report',
    icon: (active) => <DocumentTextIcon filled={active} />,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active) => <UserCircleIcon filled={active} />,
  },
]

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-white border-t border-neutral-200 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-around px-2 py-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px] ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {tab.icon(isActive)}
                  <span
                    className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
