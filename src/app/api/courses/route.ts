import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const course = await prisma.course.create({
    data: {
      name: data.name,
      description: data.description || null,
      capacity: data.capacity || 30,
      price: data.price || null,
      status: data.status || 'active',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
  return NextResponse.json(course, { status: 201 })
}
