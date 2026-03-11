import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const students = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const student = await prisma.student.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      status: data.status || 'active',
      notes: data.notes || null,
    },
  })
  return NextResponse.json(student, { status: 201 })
}
