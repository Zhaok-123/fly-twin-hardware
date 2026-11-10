# As-built status and change log

The docs describe the **reference build**. This page tracks where each physical aircraft
differs. Whoever changes the aircraft updates this page in the same PR.

## Units

| Unit | Role | State (2026-11-10) |
|------|------|--------------------|
| Airframe #1 | Flying prototype | Flown manually without companion computer. Being rebuilt: FC moving above the ESC with soft mounting |
| MicoAir stack #2 | Bench FC for HITL (software team) | In hand, not flashed yet |
| BPI CM5 Pro + IO board (#1) | Companion computer | Removed from airframe #1 for bench bring-up; camera fitted |

## Known deviations — airframe #1

| # | Area | Reference build | As built | Action | Owner |
|---|------|-----------------|----------|--------|-------|
| 1 | FC mounting | FC above ESC on 30.5→20 adapter, rubber grommets | FC at the bottom of the stack, screwed hard to the carbon plate | Rebuild per [assembly.md §3](assembly.md#3-flight-controller-on-top-of-the-esc-30-min); recalibrate; re-fly; keep the old logs as the hard-mount baseline | B |
| 2 | Firmware | PX4 mainline v1.16.2 | MicoAir `micoair743-v1.14.3` | Back up, then migrate per [px4-firmware-and-params.md](px4-firmware-and-params.md) | B |
| 3 | Camera mount | TPU adapter in the frame's front camera cage | Printed bracket on the front edge of the carrier adapter plate | Decide which to keep; add the STL to `mounts/` if keeping | B |
| 4 | Landing gear | None | Printed landing legs under each arm | Add STL and a line to [mounts/README.md](../mounts/README.md) | B |
| 5 | Printed parts | STLs in `mounts/stl/` | Actual printed parts may differ in dimensions | Commit the files actually printed | B |
| 6 | Companion UART pins | — | Wired with jumpers to the 40-pin header | Record the pins in [wiring.md](wiring.md#tel1--companion-uart) | B |
| 7 | GPS cable re-pinning | — | Works | Record the mapping in [wiring.md](wiring.md#gps1) | B |
| 8 | Loose USB devices | — | Build photos show two USB devices (a green adapter and a white USB stick) hanging below the aircraft | Document their purpose or remove them | B |

## Change log

| Date | Unit | Change | By |
|------|------|--------|----|
| 2026-09-24 | — | Frame changed from iFlight Nazgul5 V3 to TBS Source One V5.1; companion computer is the Banana Pi BPI-CM5 Pro; camera bring-up deferred | A |
| 2026-11 | #1 | First assembly; manual flights without companion computer | B |
| 2026-11-10 | — | Repo created from the planning documents; firmware standard set to PX4 v1.16.2 | A |
