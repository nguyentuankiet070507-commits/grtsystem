import { describe, expect, it } from 'vitest';
import { initialCafes } from './seed';
import { availabilityState, canTransition, customerAvailabilityLabel, filterDiscoverableCafes } from './discovery';

const clone = () => structuredClone(initialCafes);
const at = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const all = (index: number, status: 'available' | 'occupied' | 'unavailable') => {
  const cafe = clone()[index];
  cafe.tables.flatMap((table) => table.seats).forEach((seat) => {
    seat.status = status;
    seat.occupiedSince = status === 'occupied' ? at(20) : null;
  });
  return cafe;
};

describe('map and card availability truthfulness', () => {
  it('maps a fully unavailable venue to unavailable, not full', () => expect(availabilityState(all(0, 'unavailable'))).toBe('unavailable'));
  it('maps a closed venue to closed before inspecting seats', () => { const cafe = all(0, 'available'); cafe.open = false; expect(availabilityState(cafe)).toBe('closed'); });
  it('maps stale data to unknown rather than advertising availability', () => { const cafe = all(0, 'available'); cafe.lastUpdated = at(31); expect(availabilityState(cafe)).toBe('unknown'); });
  it('maps zero available serviceable seats to full', () => expect(availabilityState(initialCafes[4])).toBe('full'));
  it('labels a fully unavailable venue with zero usable seats', () => expect(customerAvailabilityLabel(all(0, 'unavailable'))).toContain('0 of 32 seats usable'));
  it('labels full against usable capacity and discloses unavailable seats', () => expect(customerAvailabilityLabel(initialCafes[4])).toContain('0 available of 30 usable seats (2 unavailable)'));
  it('does not call outdated information available', () => { const cafe = all(0, 'available'); cafe.lastUpdated = at(31); expect(customerAvailabilityLabel(cafe)).toBe('Availability needs an update'); });
  it('classifies a single free seat among serviceable seats as nearly full', () => { const cafe = all(0, 'occupied'); cafe.tables[0].seats[0].status = 'available'; cafe.tables[0].seats[0].occupiedSince = null; expect(availabilityState(cafe)).toBe('nearly_full'); });
});

describe('discovery filters and safe status transitions', () => {
  it('finds a cafe by case-insensitive name', () => expect(filterDiscoverableCafes(initialCafes, 'green bean', []).map((c) => c.id)).toEqual(['green']));
  it('requires every selected feature', () => expect(filterDiscoverableCafes(initialCafes, '', ['Quiet', 'Study-friendly']).map((c) => c.id)).toEqual(['campus', 'study']));
  it('excludes full, closed, unavailable, and stale cafes from only-available results', () => { const cafes = clone(); cafes[0] = all(0, 'unavailable'); cafes[1].open = false; cafes[2].lastUpdated = at(31); expect(filterDiscoverableCafes(cafes, '', [], true).every((c) => !['bk', 'campus', 'green'].includes(c.id))).toBe(true); });
  it('allows available to occupied', () => expect(canTransition('available', 'occupied')).toBe(true));
  it('allows available to unavailable', () => expect(canTransition('available', 'unavailable')).toBe(true));
  it('allows occupied to available', () => expect(canTransition('occupied', 'available')).toBe(true));
  it('allows unavailable to available', () => expect(canTransition('unavailable', 'available')).toBe(true));
  it('blocks occupied to unavailable to avoid silently deleting a live session', () => expect(canTransition('occupied', 'unavailable')).toBe(false));
  it('blocks unavailable to occupied until the seat is restored', () => expect(canTransition('unavailable', 'occupied')).toBe(false));
  it('blocks no-op transitions', () => expect(canTransition('available', 'available')).toBe(false));
});