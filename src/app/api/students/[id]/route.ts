import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const student = await prisma.student.update({
    where: { id: params.id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      notes: data.notes,
    },
  })
  return NextResponse.json(student)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.student.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
