import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: { assignedTo: { select: { name: true } } },
  })
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      source: data.source || null,
      stage: data.stage || 'new',
      value: data.value || null,
      notes: data.notes || null,
    },
  })
  return NextResponse.json(lead, { status: 201 })
}
