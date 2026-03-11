import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.source !== undefined) updateData.source = data.source
  if (data.stage !== undefined) updateData.stage = data.stage
  if (data.value !== undefined) updateData.value = data.value
  if (data.notes !== undefined) updateData.notes = data.notes

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: updateData,
  })
  return NextResponse.json(lead)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.lead.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
