# Ghost Channel backlog

## Foundation

- [x] Create strict Next.js/React/TypeScript foundation and CI
- [x] Document repository boundaries and source policy
- [x] Add review/export workflows

## First vertical slice

- [x] Normalize local, NWS, and USGS signals behind `/api/signals`
- [x] Build deterministic, channel-aware scheduling
- [x] Add playback controls, keyboard support, diagnostics, and procedural visuals
- [ ] Tune editorial selection rules with physical-display observation

## Resilience and offline behavior

- [x] Cache the last non-empty bundle in IndexedDB
- [x] Provide explicit source health and local fallback
- [ ] Exercise offline and recovery transitions on physical devices

## Visual system

- [x] Establish restrained global tokens and two data-driven visual families
- [ ] Add transition choreography and more signal-derived visual parameters

## Additional channels

- [ ] Add NASA APOD with server-side key handling and complete copyright/credit metadata
- [ ] Define an explicit public interface for future ArcadeGhosts content

## PWA and physical-device testing

- [x] Add manifest, original icon, and minimal versioned shell service worker
- [ ] Generate and test PNG icon sizes across install surfaces
- [ ] Test wake lock, long-running memory use, and install flows on tablet hardware

## Deployment and domain — deferred

- [ ] Create a Vercel project and preview deployment only when explicitly requested
- [ ] Choose and configure a domain only after preview validation

## Ideas parking lot

- [ ] Quiet hours and time-aware programming
- [ ] Channel-specific color grammars
- [ ] Optional device-local programming preferences without accounts
