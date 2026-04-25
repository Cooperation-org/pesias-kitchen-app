import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Anonymous scan request:', {
      pseudonymousId: body.pseudonymousId,
      eventId: body.qrData?.eventId,
      type: body.qrData?.type,
      hasLocation: !!body.geolocation,
      timestamp: body.timestamp
    });

    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/anonymous-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Anonymous Scanner',
        'X-Forwarded-For': request.ip || 'unknown',
        'X-Real-IP': request.ip || 'unknown'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    console.log('Backend response:', {
      success: data.success,
      status: response.status,
      message: data.message
    });

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Anonymous scan proxy error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}