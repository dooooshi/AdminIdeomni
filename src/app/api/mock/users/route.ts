// Mock API endpoints - disabled as part of new auth system migration
// These endpoints were used with the old NextAuth.js system

/**
 * GET api/mock/users
 */
export async function GET(req: Request) {
	return new Response(JSON.stringify({ message: 'Mock users API disabled' }), { status: 404 });
}

/**
 * POST api/mock/users
 */
export async function POST(req: Request) {
	return new Response(JSON.stringify({ message: 'Mock users API disabled' }), { status: 404 });
}
