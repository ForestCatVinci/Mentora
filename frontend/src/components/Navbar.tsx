import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Rss, Compass, BookOpen, Map, Users, PlusSquare, LogOut, CalendarDays } from 'lucide-react'
import { UserProfile } from '../lib/api'

interface Props {
  user: UserProfile
  onSignOut: () => void
}

const navItems = [
  { to: '/feed',          icon: Rss,            label: 'Лента' },
  { to: '/opportunities', icon: Compass,         label: 'Возможности' },
  { to: '/courses',       icon: BookOpen,        label: 'Курсы' },
  { to: '/calendar',      icon: CalendarDays,    label: 'Календарь' },
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Кабинет' },
]

const allNavItems = [
  { to: '/feed',          icon: Rss,            label: 'Лента' },
  { to: '/opportunities', icon: Compass,         label: 'Возможности' },
  { to: '/courses',       icon: BookOpen,        label: 'Курсы' },
  { to: '/calendar',      icon: CalendarDays,    label: 'Календарь' },
  { to: '/roadmap',       icon: Map,             label: 'Roadmap' },
  { to: '/mentors',       icon: Users,           label: 'Менторы' },
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Кабинет' },
]

export default function Navbar({ user, onSignOut }: Props) {
  const navigate = useNavigate()
  const canCreatePost = user.role === 'staff' || user.role === 'admin' || user.role === 'mentor'
  const canCreateCourse = user.role === 'staff' || user.role === 'admin' || user.role === 'mentor'

  const handleSignOut = async () => {
    await onSignOut()
    navigate('/')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 px-4 py-6 z-40">
        <div className="mb-8 px-2">
          <span className="text-xl font-bold text-primary-600">Mentoria</span>
          <span className="text-xl font-bold text-gray-900"> Hub</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {allNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {canCreatePost && (
            <button
              onClick={() => navigate('/admin/create-post')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-all duration-150 mt-2"
            >
              <PlusSquare size={18} />
              Создать пост
            </button>
          )}

          {canCreateCourse && (
            <button
              onClick={() => navigate('/admin/create-course')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-all duration-150"
            >
              <PlusSquare size={18} />
              Создать курс
            </button>
          )}
        </nav>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150 border border-red-100 mt-2"
        >
          <LogOut size={18} />
          Выйти из аккаунта
        </button>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors duration-150 ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} className="mb-0.5" />
            {label}
          </NavLink>
        ))}
        <button
          onClick={handleSignOut}
          className="flex-1 flex flex-col items-center py-2 text-[10px] font-medium text-gray-400 hover:text-red-500 transition-colors duration-150"
        >
          <LogOut size={20} className="mb-0.5" />
          Выйти
        </button>
      </nav>
    </>
  )
}
