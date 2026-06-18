import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LangProvider } from './contexts/LangContext'
import Navbar from './components/Navbar'

import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import MentorOnboarding from './pages/MentorOnboarding'
import Feed from './pages/Feed'
import Opportunities from './pages/Opportunities'
import Courses from './pages/Courses'
import CoursePage from './pages/CoursePage'
import CalendarPage from './pages/Calendar'
import Roadmap from './pages/Roadmap'
import Mentors from './pages/Mentors'
import Dashboard from './pages/Dashboard'
import CreatePost from './pages/admin/CreatePost'
import CreateCourse from './pages/admin/CreateCourse'
import CourseEditor from './pages/admin/CourseEditor'
import ChatBot from './components/ChatBot'

function AppShell() {
  const { user, loading, signOut, refresh } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  const needsOnboarding =
    user.role === 'student' && (!user.grade || user.interests.length === 0 || user.goals.length === 0)

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  const needsMentorOnboarding =
    user.role === 'mentor' && !user.full_name

  if (needsMentorOnboarding && location.pathname !== '/mentor-onboarding') {
    return <Navigate to="/mentor-onboarding" replace />
  }

  const isOnboardingRoute = location.pathname === '/onboarding' || location.pathname === '/mentor-onboarding'
  const canPost = user.role === 'staff' || user.role === 'admin' || user.role === 'mentor'
  const canCreateCourse = user.role === 'staff' || user.role === 'admin' || user.role === 'mentor'

  return (
    <div className="min-h-screen bg-gray-50">
      {!isOnboardingRoute && (
        <Navbar user={user} onSignOut={signOut} />
      )}

      <main className={!isOnboardingRoute ? 'md:pl-60 pb-20 md:pb-0' : ''}>
        {!isOnboardingRoute && <ChatBot user={user} />}
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/mentor-onboarding" element={<MentorOnboarding />} />
          <Route path="/feed" element={<Feed user={user} />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/courses" element={<Courses user={user} />} />
          <Route path="/courses/:courseId" element={<CoursePage user={user} />} />
          <Route path="/calendar" element={<CalendarPage user={user} />} />
          <Route path="/roadmap" element={<Roadmap user={user} />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/dashboard" element={<Dashboard user={user} onRefresh={refresh} />} />
          {canPost && (
            <Route path="/admin/create-post" element={<CreatePost user={user} />} />
          )}
          {canCreateCourse && (
            <>
              <Route path="/admin/create-course" element={<CreateCourse user={user} />} />
              <Route path="/admin/courses/:courseId/edit" element={<CourseEditor user={user} />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </LangProvider>
  )
}
