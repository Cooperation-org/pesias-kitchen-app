/**
 * Pseudonymous ID utilities for anonymous QR scanning
 * Generates and manages browser-based pseudonymous identifiers
 */

const PSEUDONYMOUS_ID_KEY = 'pesia_pseudonymous_id';
const SESSION_STORAGE_KEY = 'pesia_session_data';

/**
 * Generate a new pseudonymous ID using UUID v4
 */
export function generatePseudonymousId(): string {
  // Generate UUID v4 manually (lightweight implementation)
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  const uuid = template.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  // Store in localStorage for persistence across sessions
  if (typeof window !== 'undefined') {
    localStorage.setItem(PSEUDONYMOUS_ID_KEY, uuid);
  }
  
  return uuid;
}

/**
 * Get existing pseudonymous ID from localStorage
 */
export function getPseudonymousId(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(PSEUDONYMOUS_ID_KEY);
}

/**
 * Clear pseudonymous ID (for testing purposes)
 */
export function clearPseudonymousId(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(PSEUDONYMOUS_ID_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Check if a scan has already been recorded for this event
 */
export function hasScannedEvent(eventId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionData) return false;
  
  try {
    const data = JSON.parse(sessionData);
    return data.scannedEvents?.includes(eventId) || false;
  } catch {
    return false;
  }
}

/**
 * Mark an event as scanned in session storage
 */
export function markEventAsScanned(eventId: string): void {
  if (typeof window === 'undefined') return;
  
  let sessionData: any = {};
  
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      sessionData = JSON.parse(existing);
    }
  } catch {
    // Start fresh if parsing fails
  }
  
  if (!sessionData.scannedEvents) {
    sessionData.scannedEvents = [];
  }
  
  if (!sessionData.scannedEvents.includes(eventId)) {
    sessionData.scannedEvents.push(eventId);
  }
  
  sessionData.lastActivity = new Date().toISOString();
  
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
}

/**
 * Generate a browser fingerprint for additional security
 */
export function generateBrowserFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: Date.now()
  };
  
  // Create a simple hash from the fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  let hash = 0;
  
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Get session metadata for tracking
 */
export function getSessionMetadata() {
  if (typeof window === 'undefined') return {};
  
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
}

/**
 * Validate pseudonymous ID format
 */
export function isValidPseudonymousId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}