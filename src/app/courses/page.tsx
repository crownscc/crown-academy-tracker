import { AppShell } from '@/components/AppShell'
import { prisma } from '@/lib/prisma'
import { CourseActions } from './CourseActions'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } },
  })

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-1">{courses.length} total courses</p>
        </div>
      </div>
      <CourseActions courses={courses} />
    </AppShell>
  )
}
