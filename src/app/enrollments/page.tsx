import { AppShell } from '@/components/AppShell'
import { prisma } from '@/lib/prisma'
import { EnrollmentActions } from './EnrollmentActions'

export const dynamic = 'force-dynamic'

export default async function EnrollmentsPage() {
  const [enrollments, students, courses] = await Promise.all([
    prisma.enrollment.findMany({
      orderBy: { enrolledAt: 'desc' },
      include: { student: true, course: true },
    }),
    prisma.student.findMany({ orderBy: { name: 'asc' } }),
    prisma.course.findMany({ where: { status: 'active' }, orderBy: { name: 'asc' } }),
  ])

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-500 mt-1">{enrollments.length} total enrollments</p>
        </div>
      </div>
      <EnrollmentActions
        enrollments={enrollments}
        students={students.map(s => ({ id: s.id, name: s.name }))}
        courses={courses.map(c => ({ id: c.id, name: c.name }))}
      />
    </AppShell>
  )
}
