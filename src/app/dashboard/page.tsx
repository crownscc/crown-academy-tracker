import { AppShell } from '@/components/AppShell'
import { prisma } from '@/lib/prisma'

async function getStats() {
  const [students, courses, enrollments, leads] = await Promise.all([
    prisma.student.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.lead.count(),
  ])

  const leadsByStage = await prisma.lead.groupBy({
    by: ['stage'],
    _count: { id: true },
    _sum: { value: true },
  })

  const recentStudents = await prisma.student.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  const totalPipelineValue = leadsByStage.reduce(
    (sum, s) => sum + (s._sum.value || 0),
    0
  )

  return { students, courses, enrollments, leads, leadsByStage, recentStudents, recentLeads, totalPipelineValue }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total Students', value: stats.students, color: 'bg-blue-500' },
    { label: 'Active Courses', value: stats.courses, color: 'bg-green-500' },
    { label: 'Enrollments', value: stats.enrollments, color: 'bg-purple-500' },
    { label: 'Pipeline Value', value: `$${stats.totalPipelineValue.toLocaleString()}`, color: 'bg-crown-500' },
  ]

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to Crown Academy CRM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className={`w-10 h-10 ${card.color} rounded-lg mb-3 flex items-center justify-center text-white font-bold text-sm`}>
              {typeof card.value === 'number' ? card.value : '$'}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Students</h2>
          {stats.recentStudents.length === 0 ? (
            <p className="text-gray-400 text-sm">No students yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h2>
          {stats.leadsByStage.length === 0 ? (
            <p className="text-gray-400 text-sm">No leads yet</p>
          ) : (
            <div className="space-y-3">
              {stats.leadsByStage.map((stage) => (
                <div key={stage.stage} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{stage.stage}</p>
                    <p className="text-sm text-gray-500">{stage._count.id} leads</p>
                  </div>
                  <span className="font-semibold text-gray-700">
                    ${(stage._sum.value || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
