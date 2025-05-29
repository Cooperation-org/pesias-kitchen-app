import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app/api";
const url = `${API_URL }`;
    const response = await fetch(url  , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy error' },
      { status: 500 }
    );
  }
}