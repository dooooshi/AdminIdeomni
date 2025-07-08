// Mock API endpoints - disabled as part of new auth system migration
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	return NextResponse.json({ message: 'Mock auth API disabled' }, { status: 404 });
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	return NextResponse.json({ message: 'Mock auth API disabled' }, { status: 404 });
}
