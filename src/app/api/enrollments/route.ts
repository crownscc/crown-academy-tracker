import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { enrolledAt: 'desc' },
    include: { student: true, course: true },
  })
  return NextResponse.json(enrollments)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: data.studentId,
      courseId: data.courseId,
    },
  })
  return NextResponse.json(enrollment, { status: 201 })
}
