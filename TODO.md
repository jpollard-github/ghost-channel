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
- [x] Validate canonical live bundles and expose initial refresh/cache failures in diagnostics
- [x] Add non-overlapping scheduled, online, and stale-visible source refresh
- [x] Remove expired signals while retaining last valid source health and programming
- [ ] Exercise offline and recovery transitions on physical devices

## Visual system

- [x] Establish restrained global tokens and two data-driven visual families
- [ ] Add transition choreography and more signal-derived visual parameters

## Additional channels

- [ ] Add NASA APOD with server-side key handling and complete copyright/credit metadata
- [ ] Define an explicit public interface for future ArcadeGhosts content

## PWA and physical-device testing

- [x] Add manifest, original icon, and minimal versioned shell service worker
- [x] Add configurable desktop, tablet, and iPhone responsive screenshot review
- [x] Add diagnostics device metrics and copyable local review profile
- [x] Add a touch-accessible diagnostics gesture for installed displays
- [x] Generate and automate resource checks for 192px, 512px, and maskable PNG icons
- [ ] Validate installed icon and splash rendering across physical install surfaces
- [ ] Test wake lock, long-running memory use, and install flows on tablet hardware
- [ ] Replace provisional tablet and iPhone dimensions with physical browser and standalone measurements

## Deployment and domain — deferred

- [x] Create a Vercel project and preview deployment only when explicitly requested
- [ ] Choose and configure a domain only after preview validation

## Ideas parking lot

- [ ] Quiet hours and time-aware programming
- [ ] Channel-specific color grammars
- [ ] Optional device-local programming preferences without accounts
