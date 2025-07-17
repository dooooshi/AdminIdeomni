import { NextRequest, NextResponse } from 'next/server';

// Mock admin data for testing
const mockAdmins = [
  {
    id: 'cm1234567890abcdef',
    username: 'superadmin',
    email: 'superadmin@example.com',
    firstName: 'Super',
    lastName: 'Admin',
    adminType: 1,
    isActive: true,
    lastLoginAt: '2024-01-15T08:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 'cm9876543210fedcba',
    username: 'contentadmin',
    email: 'content@example.com',
    firstName: 'Content',
    lastName: 'Manager',
    adminType: 2,
    isActive: true,
    creator: 'cm1234567890abcdef',
    lastLoginAt: '2024-01-14T16:30:00.000Z',
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-14T16:30:00.000Z',
  },
  {
    id: 'cm5555555555555555',
    username: 'marketingadmin',
    email: 'marketing@example.com',
    firstName: 'Marketing',
    lastName: 'Administrator',
    adminType: 2,
    isActive: false,
    creator: 'cm1234567890abcdef',
    lastLoginAt: '2024-01-12T14:20:00.000Z',
    createdAt: '2024-01-08T09:00:00.000Z',
    updatedAt: '2024-01-13T11:15:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(mockAdmins);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        businessCode: 5001,
        message: 'Internal server error',
        data: null,
        timestamp: new Date().toISOString(),
        path: '/admin/list',
        details: {
          message: 'Failed to retrieve admin list',
          error: 'Internal Server Error',
          statusCode: 500
        }
      },
      { status: 500 }
    );
  }
} 