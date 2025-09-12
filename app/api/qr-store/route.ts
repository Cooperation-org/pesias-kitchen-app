import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

const qrDataStore = new Map<string, { data: any; expiresAt: number }>();

const EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of qrDataStore.entries()) {
    if (value.expiresAt < now) {
      qrDataStore.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    cleanExpiredEntries();
    
    const { qrData } = await request.json();
    
    if (!qrData) {
      return NextResponse.json({ error: 'QR data is required' }, { status: 400 });
    }
    
    const id = nanoid(8); // Short 8-character ID
    const expiresAt = Date.now() + EXPIRY_TIME;
    
    qrDataStore.set(id, { data: qrData, expiresAt });
    
    return NextResponse.json({ id, expiresAt: new Date(expiresAt).toISOString() });
  } catch (error) {
    console.error('Error storing QR data:', error);
    return NextResponse.json({ error: 'Failed to store QR data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    cleanExpiredEntries();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const stored = qrDataStore.get(id);
    
    if (!stored) {
      return NextResponse.json({ error: 'QR data not found or expired' }, { status: 404 });
    }
    
    if (stored.expiresAt < Date.now()) {
      qrDataStore.delete(id);
      return NextResponse.json({ error: 'QR data expired' }, { status: 404 });
    }
    
    // Delete after retrieval for security
    qrDataStore.delete(id);
    
    return NextResponse.json({ qrData: stored.data });
  } catch (error) {
    console.error('Error retrieving QR data:', error);
    return NextResponse.json({ error: 'Failed to retrieve QR data' }, { status: 500 });
  }
}