'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '◨' },
  { href: '/students', label: 'Students', icon: '◉' },
  { href: '/courses', label: 'Courses', icon: '◧' },
  { href: '/enrollments', label: 'Enrollments', icon: '◫' },
  { href: '/pipeline', label: 'Sales Pipeline', icon: '◮' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-crown-400">Crown Academy</h1>
        <p className="text-xs text-gray-400 mt-1">CRM Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-crown-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 mb-2">{session?.user?.name}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-gray-500 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
