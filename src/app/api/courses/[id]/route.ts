import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      price: data.price,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
  return NextResponse.json(course)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.course.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
