import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL
    const url = `${BASE_API_URL}/custodial/scan-qr`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
        
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON response from external API',
          details: responseText.substring(0, 200)
        },
        { status: 502 }
      );
    }
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data?.message || `External API error: ${response.status} ${response.statusText}`,
          details: data
        },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: `Proxy error: ${error.message}`,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}