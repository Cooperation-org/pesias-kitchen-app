/**
 * Geolocation utilities for location verification
 */

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

/**
 * Get current device location
 */
export function getGeolocation(): Promise<GeolocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { coords, timestamp } = position;
        
        const locationData: GeolocationData = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          timestamp,
          altitude: coords.altitude || undefined,
          heading: coords.heading || undefined,
          speed: coords.speed || undefined
        };
        
        resolve(locationData);
      },
      (error) => {
        let errorMessage = 'Unknown geolocation error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c * 1000; // Return distance in meters
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate if user is within acceptable range of event location
 */
export function isWithinEventRange(
  userLocation: GeolocationData,
  eventLatitude: number,
  eventLongitude: number,
  maxDistanceMeters: number = 500 // 500 meters default
): boolean {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    eventLatitude,
    eventLongitude
  );
  
  return distance <= maxDistanceMeters;
}

/**
 * Format location for display
 */
export function formatLocation(location: GeolocationData): string {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

/**
 * Get location accuracy description
 */
export function getAccuracyDescription(accuracy: number): string {
  if (accuracy <= 10) return 'Very High';
  if (accuracy <= 50) return 'High';
  if (accuracy <= 100) return 'Medium';
  if (accuracy <= 500) return 'Low';
  return 'Very Low';
}

/**
 * Request high accuracy location with fallback
 */
export async function getHighAccuracyLocation(): Promise<GeolocationData> {
  try {
    // First try high accuracy
    return await getGeolocation();
  } catch (error) {
    console.warn('High accuracy location failed, trying fallback:', error);
    
    // Fallback with relaxed options
    return new Promise((resolve, reject) => {
      const options: PositionOptions = {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 600000 // 10 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { coords, timestamp } = position;
          
          resolve({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            timestamp,
            altitude: coords.altitude || undefined,
            heading: coords.heading || undefined,
            speed: coords.speed || undefined
          });
        },
        reject,
        options
      );
    });
  }
}