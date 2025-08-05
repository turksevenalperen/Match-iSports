const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearRequests() {
  try {
    await prisma.teamRequest.deleteMany()
    console.log('All team requests deleted')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearRequests()
