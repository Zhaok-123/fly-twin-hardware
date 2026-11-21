# As-built status and change log

The [architecture](architecture.md), original BOM and some older planning notes describe
a **reference design**. This page records the physical configuration of each aircraft.
Whoever changes the aircraft updates this page in the same pull request.

## Units (reviewed 2026-11-21)

| Unit | Role | Verified state |
|---|---|---|
| Airframe #1 | Flying hardware prototype | ESC below FC; custom printed eight-hole adapter; V3 upper carrier with **ArmSoM CM5 + CM5-IO** installed; adjustable IMX219 camera, printed GPS mast, battery tray and four V7 legs. Mechanically assembled; **not signed off for flight** after rebuild. |
| MicoAir stack #2 | Separate bench controller for planned HITL | Original 2026-11-10 record said in hand, not flashed; no later bench hardware verification in this update. Do not confuse this unit with PX4/Gazebo SITL. |
| Companion on Airframe #1 | RK3576 Linux + camera system | ArmSoM CM5/CM5-IO photographed on the carrier, rather than the originally specified BPI-CM5 Pro. Flight-battery 12 V BEC not installed; TEL1 not verified. |

## Known deviations — Airframe #1

| # | Area | Reference / earlier description | Current as-built fact | Validation or documentation still required |
|---|---|---|---|---|
| 1 | FC/ESC order and mounting | FC below ESC; reference update envisioned FC above ESC on rubber-grommet mounting | FC **above** ESC. FC is rigidly mounted to a custom 38 × 38 × 2 mm 8-hole printed adapter (inner 20 × 20 mm). ESC / adapter use the outer 30.5 × 30.5 mm hole chain, silicone washers/spacers and long through-fasteners extending to the upper carrier. | Inspect clamp path and IMU vibration; silicone washers do not independently prove soft-mount isolation. |
| 2 | Firmware | Vendor MicoAir PX4 1.14.3 | Official **PX4 v1.16.2** flashed on Airframe #1 (2026-11-10). | Full props-off actuator/RC/GPS/failsafe revalidation, fresh parameter export and controlled reflight remain pending. |
| 3 | Upper carrier / companion | Older 130 × 90 mm reference carrier and BPI-CM5 Pro | **90 × 137 × 3 mm printed V3 carrier**, ArmSoM CM5/CM5-IO raised on four short standoffs. | Verify loaded flight-battery compute power before airborne use. |
| 4 | Camera | TPU mount in front camera cage | Actual IMX219 on **adjustable metal tilt hinge** with white spacing sleeves. | Verify mechanical retention and CSI ribbon strain relief; reference TPU file remains for history only. |
| 5 | Landing gear / GPS / battery | Initial printed references / no feet | Four printed **V7** legs, printed **GPS mast V2** and underslung printed battery tray installed. | Inspect print condition and fastener clearance; actual print material not certified by STL filenames. |
| 6 | Printed models | Four planning-stage STL versions | Five supplied as-built STL types, eight instances, committed in `mounts/stl/` alongside legacy references. | Keep exact installed revisions and their provenance. |
| 7 | Companion power and UART | 4S→12 V BEC and TEL1/MAVLink are planned | **BEC not installed**; **TEL1 MAVLink untested**. | Confirm 12 V power under load and actual UART pin/device/baud + heartbeat; never infer from a planning pinout. |
| 8 | Electrical notes | Original reference design lists DShot600 and generic motor mapping | Old real-aircraft configuration was DShot300 and historical motor-output mapping. Current firmware settings not independently verified in this update. | Verify all four motor mappings/directions with props off, and export actual PX4 v1.16.2 parameters before flight. |

## Measured center-stack clearances

All measurements were supplied by the aircraft builder. They are **clearances between
named faces**, not summed stack dimensions.

| Datum | Faces | Clearance |
|---|---|---:|
| H1 | Carbon frame mounting surface → ESC underside | 4.6 mm |
| H2 | ESC upper surface → printed FC adapter underside | 6.0 mm |
| H3 | Printed FC adapter upper surface → V3 carrier underside | 15.5 mm |
| H4 | V3 carrier upper surface → CM5-IO underside | 5.8 mm |

The four outer through-fasteners continue from the carbon frame to the carrier supports.
The FC is secured independently to the four inner adapter holes. See
[assembly guide](assembly.md) and the [dated photo log](../build-log/2026-11-21_airframe1_rebuild/notes.md).

## Change log

| Date | Unit | Change | By |
|---|---|---|---|
| 2026-09-24 | — | Reference frame changed from iFlight Nazgul5 V3 to TBS Source One V5.1; companion was specified as BPI-CM5 Pro. | A |
| 2026-11 | #1 | Initial assembly; manual flights using MicoAir vendor firmware, without companion computer. | B |
| 2026-11-10 | #1 | Official PX4 v1.16.2 flashed; no new-flight acceptance evidenced. | B |
| 2026-11-10 | — | Reference hardware repository created. | A |
| 2026-11-21 | #1 | Documented ESC-under-FC rebuild, V3 CM5 carrier, camera hinge, printed parts and H1–H4; mechanical drawings, photos and 3D viewer added. | B |