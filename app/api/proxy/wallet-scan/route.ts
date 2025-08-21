import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.202:5000/api'
    const url = `${BASE_API_URL}/wallet/scan-qr`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}