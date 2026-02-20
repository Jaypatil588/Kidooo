import { useState, useEffect, useCallback } from 'react'
import BottomNav, { type NavTab } from './components/BottomNav'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'
import ReportPage from './pages/ReportPage'
import ScreeningPage from './pages/ScreeningPage'
import AddChildFlow from './components/AddChildFlow'
import { useVideoAnalyses } from './hooks/useVideoAnalyses'
import type { Child, ScreeningResult } from './types'

const DEFAULT_CHILD: Child = { id: '1', name: 'Jay', dateOfBirth: '2024-03-15' }

const mockUser = {
  fullName: 'Jay Patil',
  email: 'jaypatilsde@gmail.com',
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [language, setLanguage] = useState('en')
  const [children, setChildren] = useState<Child[]>([DEFAULT_CHILD])
  const [selectedChildIdx, setSelectedChildIdx] = useState(0)
  const [showAddChild, setShowAddChild] = useState(false)

  const {
    recentAnalyses,
    allAnalysesByIdAsc,
    uploadStatus,
    uploadError,
    uploadPercent,
    activeJob,
    uploadVideo,
    uploadReport,
    dismissActiveJob,
  } = useVideoAnalyses()

  // Load children from server on mount
  useEffect(() => {
    fetch('/api/children')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.length > 0) setChildren(data)
      })
      .catch(() => {})
  }, [])

  const currentChild = children[selectedChildIdx] || children[0]

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'))
  }

  const handleViewChildProfile = (childId: string) => {
    const idx = children.findIndex((c) => c.id === childId)
    if (idx >= 0) {
      setSelectedChildIdx(idx)
      setActiveTab('home')
    }
  }

  const handleAddChildComplete = useCallback(async (child: Child, screening: ScreeningResult) => {
    // Save child to server
    try {
      await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(child),
      })
    } catch { /* persist locally anyway */ }

    // Save screening to server
    try {
      await fetch('/api/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screening),
      })
    } catch { /* persist locally anyway */ }

    setChildren((prev) => [...prev, child])
    setSelectedChildIdx((prev) => prev + 1 === children.length ? children.length : prev)
    setShowAddChild(false)
    setActiveTab('home')
    // Select the newly added child
    setTimeout(() => {
      setSelectedChildIdx(children.length) // new child is at the end
    }, 0)
  }, [children.length])

  const handleLogout = () => {
    console.log('Logout')
  }

  const handleChildSwitch = () => {
    if (children.length > 1) {
      setSelectedChildIdx((prev) => (prev + 1) % children.length)
    }
  }

  const handleUploadVideo = (file: File, scenarioId: string) => {
    uploadVideo(file, scenarioId, currentChild.id, currentChild.name)
  }

  const handleUploadReport = (file: File) => {
    uploadReport(file, currentChild.id, currentChild.name)
  }

  const handleImportFromAI = () => {
    console.log('Import from AI')
  }

  const handleViewReport = () => {
    setActiveTab('report')
  }

  // If showing the add-child flow, render it full screen
  if (showAddChild) {
    return (
      <AddChildFlow
        onComplete={handleAddChildComplete}
        onClose={() => setShowAddChild(false)}
      />
    )
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            child={currentChild}
            onChildSwitch={handleChildSwitch}
            onUploadReport={handleUploadReport}
            onImportFromAI={handleImportFromAI}
            recentAnalyses={recentAnalyses}
            uploadStatus={uploadStatus}
            uploadError={uploadError}
            uploadPercent={uploadPercent}
            activeJob={activeJob}
            onUploadVideo={handleUploadVideo}
            onDismissJob={dismissActiveJob}
            onViewReport={handleViewReport}
          />
        )
      case 'screening':
        return <ScreeningPage childId={currentChild.id} />
      case 'profile':
        return (
          <ProfilePage
            children={children}
            user={mockUser}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            onViewChildProfile={handleViewChildProfile}
            onAddChild={() => setShowAddChild(true)}
            onLogout={handleLogout}
          />
        )
      case 'report':
        return <ReportPage analyses={allAnalysesByIdAsc} childName={currentChild.name} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <div className="min-h-screen bg-white">
        <div className="pb-20">{renderPage()}</div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
