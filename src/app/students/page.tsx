import { AppShell } from '@/components/AppShell'
import { prisma } from '@/lib/prisma'
import { StudentActions } from './StudentActions'

export const dynamic = 'force-dynamic'

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } },
  })

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">{students.length} total students</p>
        </div>
      </div>
      <StudentActions students={students} />
    </AppShell>
  )
}
