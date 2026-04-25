import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.walletAddress || !body.qrData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: walletAddress and qrData' },
        { status: 400 }
      );
    }

    // Forward request to backend wallet scanning endpoint
    const response = await fetch(`${API_BASE_URL}/wallet/scan-qr`, {
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
        anonymous: body.anonymous || false,
        qrData: body.qrData
      })
    });

    const data = await response.json();
    
    // Log for debugging
    console.log('Backend API response:', response.status, data);
    
    // Return the backend response with appropriate status
    return NextResponse.json(data, { 
      status: response.status 
    });

  } catch (error) {
    console.error('Wallet scan proxy error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again.' 
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