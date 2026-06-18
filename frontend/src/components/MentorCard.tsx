import { GraduationCap, Send, Phone, Mail } from 'lucide-react'
import { Mentor } from '../lib/api'

interface Props {
  mentor: Mentor
}

export default function MentorCard({ mentor }: Props) {
  const contacts = [
    mentor.telegram && {
      href: `https://t.me/${mentor.telegram}`,
      icon: Send,
      label: `@${mentor.telegram}`,
    },
    mentor.phone && {
      href: `tel:${mentor.phone}`,
      icon: Phone,
      label: mentor.phone,
    },
    mentor.contact_email && {
      href: `mailto:${mentor.contact_email}`,
      icon: Mail,
      label: mentor.contact_email,
    },
  ].filter(Boolean) as { href: string; icon: React.ElementType; label: string }[]

  return (
    <article className="card p-5 flex flex-col items-center text-center animate-fade-in">
      {mentor.avatar_url ? (
        <img
          src={mentor.avatar_url}
          alt={mentor.full_name}
          className="w-20 h-20 rounded-full object-cover mb-4 ring-4 ring-primary-100"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center mb-4 ring-4 ring-primary-100">
          <span className="text-2xl font-bold text-white">
            {mentor.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <h3 className="font-semibold text-gray-900 mb-0.5">{mentor.full_name}</h3>

      {mentor.university && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <GraduationCap size={12} />
          <span>{mentor.university}</span>
        </div>
      )}

      {mentor.speciality && (
        <p className="text-xs text-primary-600 font-medium mb-2">{mentor.speciality}</p>
      )}

      {mentor.bio && (
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 text-left">{mentor.bio}</p>
      )}

      {contacts.length > 0 ? (
        <div className="w-full mt-auto space-y-2">
          {contacts.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium transition-colors duration-150 w-full"
            >
              <Icon size={14} className="shrink-0" />
              <span className="truncate">{label}</span>
            </a>
          ))}
        </div>
      ) : (
        <a
          href={`mailto:?subject=Запись к ментору ${mentor.full_name}`}
          className="btn-primary text-sm mt-auto flex items-center gap-2"
        >
          <Mail size={14} />
          Связаться
        </a>
      )}
    </article>
  )
}
