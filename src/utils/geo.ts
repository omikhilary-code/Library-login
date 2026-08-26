/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in meters.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Checks if a given coordinate is within a target branch radius.
 */
export function isWithinGeofence(
  currentLat: number,
  currentLng: number,
  branchLat: number,
  branchLng: number,
  radiusMeters: number
): { isInside: boolean; distanceMeters: number } {
  const distanceMeters = calculateDistanceMeters(
    currentLat,
    currentLng,
    branchLat,
    branchLng
  );
  return {
    isInside: distanceMeters <= radiusMeters,
    distanceMeters,
  };
}

/**
 * Creates slight jitter for testing within a radius
 */
export function generateNearbyCoordinate(
  baseLat: number,
  baseLng: number,
  distanceMeters: number
): { lat: number; lng: number } {
  const earthRadius = 6378137; // meters
  const dLat = (distanceMeters * Math.cos(Math.PI / 4)) / earthRadius;
  const dLng =
    (distanceMeters * Math.sin(Math.PI / 4)) /
    (earthRadius * Math.cos((Math.PI * baseLat) / 180));

  return {
    lat: baseLat + (dLat * 180) / Math.PI,
    lng: baseLng + (dLng * 180) / Math.PI,
  };
}
