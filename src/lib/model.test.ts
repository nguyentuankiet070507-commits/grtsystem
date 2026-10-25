import { describe, expect, it } from 'vitest';
import { initialCafes } from './seed';
import { availabilityMessage, cafeState, counts, elapsed, freshness, prediction, recommend } from './model';
import { updateSeats } from './store';

const clone = () => structuredClone(initialCafes);
const withStatus = (cafeIndex:number, status:'available'|'occupied'|'unavailable') => {
  const cafes=clone(); cafes[cafeIndex].tables.forEach(t=>t.seats.forEach(s=>{s.status=status;s.occupiedSince=status==='occupied'?new Date(Date.now()-30*60000).toISOString():null;})); return cafes[cafeIndex];
};

describe('occupancy state and customer-facing availability',()=>{
  it('counts unavailable seats independently and exposes serviceable capacity',()=>expect(counts(initialCafes[4])).toEqual({occupied:30,available:0,unavailable:2,capacity:32,serviceable:30}));
  it('labels a cafe full when every usable seat is occupied',()=>expect(cafeState(initialCafes[4])).toBe('FULL'));
  it('labels a cafe unavailable when every seat is temporarily unavailable',()=>expect(cafeState(withStatus(0,'unavailable'))).toBe('UNAVAILABLE'));
  it('does not describe an all-unavailable cafe as full',()=>expect(availabilityMessage(withStatus(0,'unavailable'))).toContain('No seats currently usable'));
  it('labels a closed cafe closed even when seats are technically free',()=>{const cafe=withStatus(0,'available');cafe.open=false;expect(cafeState(cafe)).toBe('CLOSED')});
  it('uses only serviceable seats for occupancy ratio',()=>{const cafe=withStatus(0,'unavailable');cafe.tables[0].seats[0].status='available';cafe.tables[0].seats[1].status='occupied';cafe.tables[0].seats[1].occupiedSince=new Date().toISOString();expect(cafeState(cafe)).toBe('MODERATE')});
  it('classifies under-half utilization as quiet',()=>expect(cafeState(withStatus(3,'available'))).toBe('QUIET'));
  it('explains temporary unavailable seats in the full state',()=>expect(availabilityMessage(initialCafes[4])).toContain('2 temporarily unavailable'));
});

describe('freshness, timers, prediction, and recommendation safeguards',()=>{
  it('shows live freshness below two minutes',()=>expect(freshness(new Date(Date.now()-60_000).toISOString())[0]).toBe('Live'));
  it('shows recently updated from two through ten minutes',()=>expect(freshness(new Date(Date.now()-5*60_000).toISOString())[0]).toBe('Recently updated'));
  it('shows a stale warning from ten through thirty minutes',()=>expect(freshness(new Date(Date.now()-15*60_000).toISOString())[0]).toBe('May be outdated'));
  it('marks data unavailable when it is older than thirty minutes',()=>expect(freshness(new Date(Date.now()-31*60_000).toISOString())[0]).toBe('Data unavailable / outdated'));
  it('does not show a timer when a seat has no occupancy timestamp',()=>expect(elapsed(null)).toBeNull());
  it('formats multi-hour occupied time',()=>expect(elapsed(new Date(Date.now()-65*60_000).toISOString())).toBe('1h 5 min'));
  it('does not invent a wait estimate while seats remain available',()=>expect(prediction(initialCafes[1])).toBeNull());
  it('returns an honest insufficent-history message for a full cafe',()=>{const cafe=withStatus(0,'occupied');cafe.sessions=[20,30,40];expect(prediction(cafe)).toBe('Not enough historical data yet.')});
  it('offers a wait range only for a full cafe with enough history',()=>expect(prediction(initialCafes[4])).toMatch(/^~\d+–\d+ min$/));
  it('never recommends the active cafe, closed cafes, or cafes with no available seats',()=>{const cafes=clone();cafes[1].open=false;const results=recommend(cafes[0],cafes);expect(results.every(x=>x.c.id!==cafes[0].id&&x.c.open&&counts(x.c).available>0)).toBe(true)});
});

describe('manager updates',()=>{
  it('sets occupied_since and manual source when occupying an available seat',()=>{const cafes=clone();const id=cafes[1].tables[0].seats[0].id;const updated=updateSeats(cafes,cafes[1].id,[id],'occupied');const seat=updated[1].tables[0].seats[0];expect(seat.status).toBe('occupied');expect(seat.occupiedSince).toBeTruthy();expect(seat.source).toBe('manual')});
  it('clears occupied_since when freeing a seat',()=>{const cafes=clone();const id=cafes[0].tables[0].seats[0].id;const updated=updateSeats(cafes,cafes[0].id,[id],'available');const seat=updated[0].tables[0].seats[0];expect(seat.status).toBe('available');expect(seat.occupiedSince).toBeNull()});
  it('does not modify seats outside the selected target',()=>{const cafes=clone();const target=cafes[1].tables[0].seats[0].id;const untouched=cafes[1].tables[0].seats[1];const before={...untouched};const updated=updateSeats(cafes,cafes[1].id,[target],'occupied');expect(updated[1].tables[0].seats[1]).toEqual(before)});
});
