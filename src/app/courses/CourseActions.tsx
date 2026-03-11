'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = {
  id: string
  name: string
  description: string | null
  capacity: number
  price: number | null
  status: string
  startDate: Date | null
  endDate: Date | null
  _count: { enrollments: number }
}

export function CourseActions({ courses }: { courses: Course[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      capacity: parseInt(formData.get('capacity') as string) || 30,
      price: parseFloat(formData.get('price') as string) || null,
      status: formData.get('status') as string,
      startDate: formData.get('startDate') || null,
      endDate: formData.get('endDate') || null,
    }

    const url = editing ? `/api/courses/${editing.id}` : '/api/courses'
    const method = editing ? 'PUT' : 'POST'

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowForm(false)
    setEditing(null)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this course?')) return
    await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  function formatDate(d: Date | null) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString()
  }

  return (
    <>
      <button
        onClick={() => { setEditing(null); setShowForm(true) }}
        className="mb-6 bg-crown-600 hover:bg-crown-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        + Add Course
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Course' : 'Add Course'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="name" defaultValue={editing?.name} placeholder="Course Name" required className="w-full px-3 py-2 border rounded-lg" />
              <textarea name="description" defaultValue={editing?.description || ''} placeholder="Description" rows={2} className="w-full px-3 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <input name="capacity" type="number" defaultValue={editing?.capacity || 30} placeholder="Capacity" className="w-full px-3 py-2 border rounded-lg" />
                <input name="price" type="number" step="0.01" defaultValue={editing?.price || ''} placeholder="Price ($)" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <select name="status" defaultValue={editing?.status || 'active'} className="w-full px-3 py-2 border rounded-lg">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <input name="startDate" type="date" defaultValue={editing?.startDate ? new Date(editing.startDate).toISOString().split('T')[0] : ''} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <input name="endDate" type="date" defaultValue={editing?.endDate ? new Date(editing.endDate).toISOString().split('T')[0] : ''} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <p className="text-gray-400 col-span-3">No courses yet. Add your first course above.</p>
        ) : courses.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                c.status === 'active' ? 'bg-green-100 text-green-700' :
                c.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>{c.status}</span>
            </div>
            {c.description && <p className="text-sm text-gray-500 mb-3">{c.description}</p>}
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div><span className="text-gray-400">Capacity:</span> <span className="font-medium">{c._count.enrollments}/{c.capacity}</span></div>
              <div><span className="text-gray-400">Price:</span> <span className="font-medium">{c.price ? `$${c.price}` : 'Free'}</span></div>
              <div><span className="text-gray-400">Start:</span> <span className="font-medium">{formatDate(c.startDate)}</span></div>
              <div><span className="text-gray-400">End:</span> <span className="font-medium">{formatDate(c.endDate)}</span></div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => { setEditing(c); setShowForm(true) }} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
              <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
