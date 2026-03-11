'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Student = {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  notes: string | null
  createdAt: Date
  _count: { enrollments: number }
}

export function StudentActions({ students }: { students: Student[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string || null,
    }

    const url = editing ? `/api/students/${editing.id}` : '/api/students'
    const method = editing ? 'PUT' : 'POST'

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowForm(false)
    setEditing(null)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this student?')) return
    await fetch(`/api/students/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => { setEditing(null); setShowForm(true) }}
        className="mb-6 bg-crown-600 hover:bg-crown-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        + Add Student
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Student' : 'Add Student'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="name" defaultValue={editing?.name} placeholder="Full Name" required className="w-full px-3 py-2 border rounded-lg" />
              <input name="email" type="email" defaultValue={editing?.email} placeholder="Email" required className="w-full px-3 py-2 border rounded-lg" />
              <input name="phone" defaultValue={editing?.phone || ''} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg" />
              <select name="status" defaultValue={editing?.status || 'active'} className="w-full px-3 py-2 border rounded-lg">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
              <textarea name="notes" defaultValue={editing?.notes || ''} placeholder="Notes" rows={3} className="w-full px-3 py-2 border rounded-lg" />
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-crown-600 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Courses</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No students yet. Add your first student above.</td></tr>
            ) : students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                <td className="px-6 py-4 text-gray-600">{s.email}</td>
                <td className="px-6 py-4 text-gray-600">{s.phone || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    s.status === 'active' ? 'bg-green-100 text-green-700' :
                    s.status === 'graduated' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{s.status}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{s._count.enrollments}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditing(s); setShowForm(true) }} className="text-sm text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
