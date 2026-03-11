import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updateData: Record<string, unknown> = {}
  if (data.status !== undefined) updateData.status = data.status
  if (data.progress !== undefined) updateData.progress = data.progress
  if (data.grade !== undefined) updateData.grade = data.grade

  const enrollment = await prisma.enrollment.update({
    where: { id: params.id },
    data: updateData,
  })
  return NextResponse.json(enrollment)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.enrollment.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
