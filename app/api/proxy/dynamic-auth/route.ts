import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required Dynamic SDK fields
    if (!body.walletAddress || !body.userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required Dynamic SDK authentication data' },
        { status: 400 }
      );
    }

    // Forward request to backend Dynamic enhanced authentication endpoint
    const response = await fetch(`${API_BASE_URL}/auth/dynamic-enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers if needed
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify({
        walletAddress: body.walletAddress,
        authMethod: body.authMethod || 'wallet',
        userId: body.userId,
        email: body.email,
        phone: body.phone,
        passkeyId: body.passkeyId,
        socialProvider: body.socialProvider
      })
    });

    const data = await response.json();
    
    // Log for debugging
    console.log('Dynamic auth backend response:', response.status, data);
    
    // Return the backend response with appropriate status
    return NextResponse.json(data, { 
      status: response.status 
    });

  } catch (error) {
    console.error('Dynamic auth proxy error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Dynamic authentication failed. Please try again.',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}