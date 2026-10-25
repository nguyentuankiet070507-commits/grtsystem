# GRTSystem verification report

## Automated checks — passed

The final local verification passed all four commands:

```powershell
npx tsc --noEmit
npm run lint
npm test
npm run build
```

The suite now has **39 passing test cases**.

### Core occupancy and customer truthfulness

1. Counts available, occupied, unavailable, total and usable capacity independently.
2. Marks every usable seat occupied as `FULL`.
3. Marks every seat unavailable as `UNAVAILABLE`.
4. Never calls an all-unavailable café full.
5. Closed state wins over free-seat data.
6. Occupancy ratio excludes unavailable seats.
7. Quiet threshold.
8. Full state discloses unavailable seats.
9–12. Live, recent, stale and outdated freshness labels.
13–14. Empty and multi-hour occupancy timers.
15–17. Safe wait-prediction conditions.
18. Alternatives exclude active, closed and no-seat cafés.
19–21. Manager updates set timestamps/source, clear timestamps, and isolate unselected seats.

### New map/discovery safety coverage

22. All-unavailable venue maps to `unavailable`, not `full`.
23. Closed venue maps to `closed`.
24. Outdated data maps to `unknown`.
25. No available usable seats maps to `full`.
26. All-unavailable label says `0 of N seats usable`.
27. Full label uses usable capacity and exposes unavailable count.
28. Outdated data is not advertised as available.
29. One free usable seat is nearly full.
30. Case-insensitive name search.
31. Every selected feature is required.
32. Available-only filtering excludes full, closed, unavailable and stale results.
33–36. Valid transitions: available→occupied, available→unavailable, occupied→available, unavailable→available.
37–39. Invalid transitions are blocked: occupied→unavailable, unavailable→occupied, and no-op.

## Manual review checklist before deployment

1. Run `npm run dev`, open the local URL, then choose **Map**.
2. Confirm the map shows the `Demo locations · manual updates` ribbon and map attribution.
3. Select each map marker. Confirm the preview name and floor-plan button change with the marker.
4. In **Staff login**, mark an available seat occupied and return to Map. Its marker number/preview must update.
5. Mark every seat unavailable. Public card/detail/map must say unavailable or `0 of N seats usable`, never “seats available”.
6. Test a full café with maintenance seats: public text must show `0 available of usable seats` and state unavailable-seat count separately.
7. Choose an unavailable seat in the dashboard. **Mark occupied** must remain disabled; restore to available first.
8. Check mobile width: map stacks above the preview, floor plan remains horizontally scrollable, and action controls remain usable.

## Limits of this verification

An external browser sandbox could not reach the local dev server (`ERR_CONNECTION_TIMED_OUT`) despite the local Next server running, so GUI click-through was not asserted from this environment. The production compilation and domain tests passed; run the manual checklist above in the same browser/host before any public deployment.

## Review conclusion

The upgraded local MVP is safe to review with explicitly labelled demo data. It is **not a production real-time system yet**: browser-local storage is not shared between devices and no authenticated Supabase adapter is connected. Follow `DEPLOYMENT.md` before a public launch.