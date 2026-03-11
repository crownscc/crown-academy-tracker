'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Enrollment = {
  id: string
  status: string
  progress: number
  grade: string | null
  enrolledAt: Date
  student: { id: string; name: string }
  course: { id: string; name: string }
}

type Option = { id: string; name: string }

export function EnrollmentActions({
  enrollments,
  students,
  courses,
}: {
  enrollments: Enrollment[]
  students: Option[]
  courses: Option[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      studentId: formData.get('studentId') as string,
      courseId: formData.get('courseId') as string,
    }

    await fetch('/api/enrollments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  async function handleUpdateProgress(id: string, progress: number) {
    await fetch(`/api/enrollments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    })
    router.refresh()
  }

  async function handleUpdateStatus(id: string, status: string) {
    await fetch(`/api/enrollments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this enrollment?')) return
    await fetch(`/api/enrollments/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="mb-6 bg-crown-600 hover:bg-crown-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        + Enroll Student
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Enroll Student in Course</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select name="studentId" required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select name="courseId" required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-crown-600 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                  {loading ? 'Enrolling...' : 'Enroll'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrollments.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No enrollments yet.</td></tr>
            ) : enrollments.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{e.student.name}</td>
                <td className="px-6 py-4 text-gray-600">{e.course.name}</td>
                <td className="px-6 py-4">
                  <select
                    value={e.status}
                    onChange={(ev) => handleUpdateStatus(e.id, ev.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-crown-500 h-2 rounded-full" style={{ width: `${e.progress}%` }} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={e.progress}
                      onChange={(ev) => handleUpdateProgress(e.id, parseInt(ev.target.value) || 0)}
                      className="w-14 text-xs border rounded px-1 py-0.5 text-center"
                    />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(e.id)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
