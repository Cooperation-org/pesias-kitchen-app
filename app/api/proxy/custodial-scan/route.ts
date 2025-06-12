import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate environment variables
    const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 
      "https://pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app";
    
    // CORRECT ENDPOINT: /api/custodial/scan-qr (not /api/custodial-scan)
    const url = `${BASE_API_URL}/api/custodial/scan-qr`;
    
    console.log('=== PROXY DEBUG INFO ===');
    console.log('Target URL:', url);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('External API response status:', response.status);
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse the response as JSON
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
    
    // Check if the external API response was successful
    if (!response.ok) {
      console.error('External API returned error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: data?.message || `External API error: ${response.status} ${response.statusText}`,
          details: data
        },
        { status: response.status }
      );
    }
    
    console.log('Successfully proxied request');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('=== PROXY ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, message: 'Request timeout - external API took too long to respond' },
        { status: 504 }
      );
    }
    
    if (error.message.includes('fetch')) {
      return NextResponse.json(
        { success: false, message: 'Network error - could not reach external API' },
        { status: 502 }
      );
    }
    
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