import { Cafe, cafeState, counts, freshness } from './model';

export type AvailabilityState = 'available' | 'limited' | 'nearly_full' | 'full' | 'unavailable' | 'closed' | 'unknown';

export function availabilityState(cafe: Cafe, now = Date.now()): AvailabilityState {
  if (!cafe.open) return 'closed';
  if (freshness(cafe.lastUpdated, now)[1] === 'outdated') return 'unknown';
  const state = cafeState(cafe);
  if (state === 'UNAVAILABLE') return 'unavailable';
  if (state === 'FULL') return 'full';
  const { available, serviceable } = counts(cafe);
  if (available / serviceable <= 0.15) return 'nearly_full';
  if (available / serviceable <= 0.4) return 'limited';
  return 'available';
}

export function customerAvailabilityLabel(cafe: Cafe, now = Date.now()) {
  const { available, occupied, unavailable, capacity, serviceable } = counts(cafe);
  switch (availabilityState(cafe, now)) {
    case 'closed': return 'Closed';
    case 'unknown': return 'Availability needs an update';
    case 'unavailable': return `Temporarily unavailable · 0 of ${capacity} seats usable`;
    case 'full': return `Full · 0 available of ${serviceable} usable seats${unavailable ? ` (${unavailable} unavailable)` : ''}`;
    case 'nearly_full': return `Nearly full · ${available} available of ${serviceable} usable seats`;
    case 'limited': return `Limited seats · ${available} available of ${serviceable} usable seats`;
    default: return `${available} available of ${serviceable} usable seats · ${occupied} occupied${unavailable ? ` · ${unavailable} unavailable` : ''}`;
  }
}

export function canTransition(from: Cafe['tables'][number]['seats'][number]['status'], to: Cafe['tables'][number]['seats'][number]['status']) {
  return (from === 'available' && (to === 'occupied' || to === 'unavailable')) || ((from === 'occupied' || from === 'unavailable') && to === 'available');
}

export function filterDiscoverableCafes(cafes: Cafe[], query: string, features: string[], onlyAvailable = false, now = Date.now()) {
  const normalized = query.trim().toLowerCase();
  return cafes.filter((cafe) => {
    const matchesQuery = !normalized || `${cafe.name} ${cafe.address}`.toLowerCase().includes(normalized);
    const matchesFeatures = features.every((feature) => cafe.features.includes(feature));
    const state = availabilityState(cafe, now);
    const usableForCustomer = !onlyAvailable || state === 'available' || state === 'limited' || state === 'nearly_full';
    return matchesQuery && matchesFeatures && usableForCustomer;
  });
}