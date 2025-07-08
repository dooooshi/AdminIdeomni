// Mock API endpoints - disabled as part of new auth system migration

/**
 * GET api/mock/users/{id}
 */
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
	return new Response(JSON.stringify({ message: 'Mock users API disabled' }), { status: 404 });
}

/**
 * PUT api/mock/users/{id}
 */
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
	return new Response(JSON.stringify({ message: 'Mock users API disabled' }), { status: 404 });
}
