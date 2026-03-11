'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  source: string | null
  stage: string
  value: number | null
  notes: string | null
  assignedTo: { name: string } | null
  createdAt: Date
}

const STAGE_COLORS: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-purple-500',
  proposal: 'bg-orange-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
}

export function PipelineBoard({ leads, stages }: { leads: Lead[]; stages: string[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
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
      source: formData.get('source') as string || null,
      stage: formData.get('stage') as string,
      value: parseFloat(formData.get('value') as string) || null,
      notes: formData.get('notes') as string || null,
    }

    const url = editing ? `/api/leads/${editing.id}` : '/api/leads'
    const method = editing ? 'PUT' : 'POST'

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowForm(false)
    setEditing(null)
    setLoading(false)
    router.refresh()
  }

  async function handleStageChange(id: string, stage: string) {
    await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => { setEditing(null); setShowForm(true) }}
        className="mb-6 bg-crown-600 hover:bg-crown-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        + Add Lead
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Lead' : 'Add Lead'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="name" defaultValue={editing?.name} placeholder="Contact Name" required className="w-full px-3 py-2 border rounded-lg" />
              <input name="email" type="email" defaultValue={editing?.email} placeholder="Email" required className="w-full px-3 py-2 border rounded-lg" />
              <input name="phone" defaultValue={editing?.phone || ''} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <input name="source" defaultValue={editing?.source || ''} placeholder="Source (e.g., Referral)" className="w-full px-3 py-2 border rounded-lg" />
                <input name="value" type="number" step="0.01" defaultValue={editing?.value || ''} placeholder="Deal Value ($)" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <select name="stage" defaultValue={editing?.stage || 'new'} className="w-full px-3 py-2 border rounded-lg">
                {stages.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <textarea name="notes" defaultValue={editing?.notes || ''} placeholder="Notes" rows={3} className="w-full px-3 py-2 border rounded-lg" />
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-crown-600 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter(l => l.stage === stage)
          const stageValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0)

          return (
            <div key={stage} className="min-w-[280px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage] || 'bg-gray-400'}`} />
                <h3 className="font-semibold text-gray-700 capitalize">{stage}</h3>
                <span className="text-xs text-gray-400 ml-auto">{stageLeads.length} &middot; ${stageValue.toLocaleString()}</span>
              </div>
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                      {lead.value && <span className="text-xs font-semibold text-green-600">${lead.value.toLocaleString()}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{lead.email}</p>
                    {lead.source && <p className="text-xs text-gray-400 mb-2">Source: {lead.source}</p>}
                    {lead.notes && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{lead.notes}</p>}
                    <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead.id, e.target.value)}
                        className="text-xs border rounded px-1 py-0.5 flex-1"
                      >
                        {stages.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <button onClick={() => { setEditing(lead); setShowForm(true) }} className="text-xs text-blue-600 hover:text-blue-800 px-1">Edit</button>
                      <button onClick={() => handleDelete(lead.id)} className="text-xs text-red-600 hover:text-red-800 px-1">Del</button>
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="text-center text-xs text-gray-300 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    No leads
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
