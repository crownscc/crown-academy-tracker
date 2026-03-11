import { AppShell } from '@/components/AppShell'
import { prisma } from '@/lib/prisma'
import { PipelineBoard } from './PipelineBoard'

export const dynamic = 'force-dynamic'

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

export default async function PipelinePage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: { assignedTo: { select: { name: true } } },
  })

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0)

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-500 mt-1">{leads.length} leads &middot; ${totalValue.toLocaleString()} total value</p>
        </div>
      </div>
      <PipelineBoard leads={leads} stages={STAGES} />
    </AppShell>
  )
}
