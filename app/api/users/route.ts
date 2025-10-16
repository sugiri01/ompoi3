import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })
    
    // Transform the data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.userCode,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.replace('_', ' '),
      status: user.status,
      lastLogin: user.lastLogin 
        ? formatTimeAgo(user.lastLogin) 
        : 'Never logged in'
    }))
    
    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role } = body
    
    // Generate user code
    const userCount = await prisma.user.count()
    const userCode = `U${String(userCount + 1).padStart(5, '0')}`
    
    // Map role for database
    const dbRole = role === 'QC Agent' ? 'QC_Agent' : role
    
    const newUser = await prisma.user.create({
      data: {
        userCode,
        name,
        email,
        phone,
        role: dbRole,
        status: 'Pending',
      },
    })
    
    return NextResponse.json({
      success: true,
      user: newUser,
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userCode, role, status } = body
    
    // Map role for database
    const dbRole = role === 'QC Agent' ? 'QC_Agent' : role
    
    const updatedUser = await prisma.user.update({
      where: { userCode },
      data: {
        role: dbRole,
        status,
      },
    })
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 60) return `${minutes} mins ago`
  if (hours < 24) return `${hours} hours ago`
  if (days < 7) return `${days} days ago`
  if (date.getTime() === 0) return 'Account Locked'
  return 'Email Verification Pending'
}