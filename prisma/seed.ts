import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crown.direct' },
    update: {},
    create: {
      email: 'admin@crown.direct',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  })
  console.log('Created admin user:', admin.email)

  // Create a sales user
  const salesPassword = await hash('sales123', 12)
  const sales = await prisma.user.upsert({
    where: { email: 'sales@crown.direct' },
    update: {},
    create: {
      email: 'sales@crown.direct',
      password: salesPassword,
      name: 'Sales Team',
      role: 'sales',
    },
  })
  console.log('Created sales user:', sales.email)

  // Create sample courses
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { id: 'course-1' },
      update: {},
      create: {
        id: 'course-1',
        name: 'Crown Leadership Fundamentals',
        description: 'Core leadership skills for emerging leaders',
        capacity: 25,
        price: 2500,
        status: 'active',
      },
    }),
    prisma.course.upsert({
      where: { id: 'course-2' },
      update: {},
      create: {
        id: 'course-2',
        name: 'Advanced Sales Mastery',
        description: 'High-performance sales techniques and strategies',
        capacity: 20,
        price: 3500,
        status: 'active',
      },
    }),
    prisma.course.upsert({
      where: { id: 'course-3' },
      update: {},
      create: {
        id: 'course-3',
        name: 'Business Communication Excellence',
        description: 'Professional communication and presentation skills',
        capacity: 30,
        price: 1800,
        status: 'active',
      },
    }),
  ])
  console.log('Created', courses.length, 'courses')

  // Create sample students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: { name: 'John Smith', email: 'john@example.com', phone: '+1-555-0101', status: 'active' },
    }),
    prisma.student.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-555-0102', status: 'active' },
    }),
    prisma.student.upsert({
      where: { email: 'mike@example.com' },
      update: {},
      create: { name: 'Mike Davis', email: 'mike@example.com', phone: '+1-555-0103', status: 'active' },
    }),
  ])
  console.log('Created', students.length, 'students')

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: { name: 'Alice Brown', email: 'alice@corp.com', source: 'Website', stage: 'new', value: 5000, notes: 'Interested in Leadership course', assignedId: sales.id },
    }),
    prisma.lead.create({
      data: { name: 'Bob Wilson', email: 'bob@startup.io', source: 'Referral', stage: 'contacted', value: 7500, notes: 'Team of 3 for Sales Mastery' },
    }),
    prisma.lead.create({
      data: { name: 'Carol Lee', email: 'carol@enterprise.com', source: 'LinkedIn', stage: 'qualified', value: 15000, notes: 'Corporate training package' },
    }),
    prisma.lead.create({
      data: { name: 'David Kim', email: 'david@agency.co', source: 'Event', stage: 'proposal', value: 10000, notes: 'Sent proposal for Q2 training' },
    }),
  ])
  console.log('Created', leads.length, 'leads')

  console.log('\n✓ Database seeded successfully!')
  console.log('\nDefault login credentials:')
  console.log('  Admin: admin@crown.direct / admin123')
  console.log('  Sales: sales@crown.direct / sales123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
