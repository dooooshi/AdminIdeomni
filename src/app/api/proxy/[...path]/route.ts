import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:2999/api';

// Helper function to forward headers (excluding host and connection headers)
function getForwardHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Forward important headers
  const headersToForward = [
    'authorization',
    'content-type',
    'accept',
    'accept-language',
    'x-user-type',
    'user-agent',
  ];

  headersToForward.forEach(headerName => {
    const value = request.headers.get(headerName);
    if (value) {
      headers[headerName] = value;
    }
  });

  return headers;
}

// Helper function to create error response
function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Generic handler for all HTTP methods
async function handleRequest(request: NextRequest, method: string) {
  try {
    const { pathname, searchParams } = new URL(request.url);
    
    // Extract the path after /api/proxy/
    const pathSegments = pathname.split('/api/proxy/');
    const apiPath = pathSegments[1] || '';
    
    // Construct the backend URL
    const backendUrl = `${API_BASE_URL}/${apiPath}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    // Get request body for methods that support it
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const requestBody = await request.text();
        body = requestBody || undefined;
      } catch (error) {
        // If body parsing fails, continue without body
        console.warn('Failed to parse request body:', error);
      }
    }

    // Forward headers
    const forwardHeaders = getForwardHeaders(request);

    // Log the request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Proxying ${method} ${apiPath} to ${backendUrl}`);
      console.log('📤 Forward Headers:', forwardHeaders);
      if (body) {
        console.log('📤 Request Body:', body);
      }
    }

    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method,
      headers: forwardHeaders,
      body,
    });

    // Get response data
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // If not JSON, return as text
      responseData = responseText;
    }

    // Log the response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 Backend Response (${response.status}):`, responseData);
    }

    // Create response with proper headers
    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward response headers (excluding problematic ones)
    const headersToForward = [
      'content-type',
      'cache-control',
      'expires',
      'last-modified',
      'etag',
    ];

    headersToForward.forEach(headerName => {
      const value = response.headers.get(headerName);
      if (value) {
        nextResponse.headers.set(headerName, value);
      }
    });

    // Add CORS headers for browser compatibility
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Accept-Language, X-User-Type');

    return nextResponse;

  } catch (error) {
    console.error('❌ Proxy Error:', error);
    
    return createErrorResponse(
      process.env.NODE_ENV === 'development' 
        ? `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Internal server error'
    );
  }
}

// Handle GET requests
export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

// Handle POST requests
export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

// Handle PUT requests
export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

// Handle PATCH requests
export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

// Handle DELETE requests
export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Accept-Language, X-User-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
} 