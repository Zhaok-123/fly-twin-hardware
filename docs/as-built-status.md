# Airframe #1 as-built status and change log

This is the authoritative current-state record. The assembly guide, BOM, wiring page and
architecture page contain practical instructions or reference-design context and link
here for the latest configuration. **The 2026-11-21 photographs predate the builder's
later corrections recorded below; they do not confirm the current mount arrangement or
the dimensions listed here.** The viewer uses supplied STL files, but their alignment to
the physical aircraft has not been verified.

## Current state — builder update 2026-11-28

| Area | Current information | Basis / status |
|---|---|---|
| Flight stack | MicoAir 50A ESC below MicoAir NxtPX4v2 FC; FC uses the inner holes of the printed adapter. | Builder-described assembly. |
| FC/ESC adapter | `05_esc_plate_40x40x1p5_outer4p1_R1.stl`: 40 × 40 × 1.5 mm; 30.5 mm outer pitch with 4.1 mm holes and 20 mm inner pitch with 3.3 mm holes. | Supplied STL header gives nominal dimensions and hole patterns; check fit on the hardware. |
| Mounting hardware | Builder reports grommets installed at the adapter's outer holes and silicone washers above the FC at its inner holes. A separate request for inner-hole FC grommets remains open; upper washers do not establish that separate grommets are fitted. | Latest builder description; the dated photographs do not confirm this arrangement. Vibration performance and load paths remain unmeasured. |
| Upper structure | The carbon top plate has been removed; the V3 printed carrier occupies its position. | Builder statement. Structural fit and load transfer have not been independently checked. |
| Companion | BPI-CM5 Pro 4+32G WiFi compute module, identified from its packaging, with a separately purchased ArmSoM CM5-IO board. | Builder-provided identification. Vendor and order details are not recorded. |
| Other fitted parts | Adjustable IMX219 camera hinge, GPS mast V2, underslung battery tray and four V7 landing legs. The builder identifies all five supplied STL revisions as the installed parts (eight instances total). | Builder-reported installed set; the 2026-11-21 photos do not confirm the latest STL geometries. |
| Firmware / power / data | PX4 v1.16.2 has been flashed. Compute BEC is not installed; TEL1 MAVLink has not been validated. A new Airframe #1 reflight after the firmware update is not recorded. | Existing build and firmware record; do not infer an operational link or accepted flight. |

## Known differences and open checks

| # | Area | Earlier reference or record | Current state | Still to verify |
|---|---|---|---|---|
| 1 | FC/ESC order | Early layout placed the FC below the ESC; a proposed isolation arrangement showed grommets at the inner FC holes. | FC is above the ESC on the 40 × 40 × 1.5 mm eight-hole adapter. Outer-hole grommets and upper silicone washers at the FC's inner holes are builder-reported. Separate inner-hole grommets requested for the FC are not confirmed fitted. | Inspect contact and clamp paths; confirm the requested inner grommets; measure FC vibration in flight before describing isolation as effective. |
| 2 | Upper frame plate | Reference layout included a carbon top plate under the carrier. | Builder states the carbon top plate was removed and the printed V3 carrier takes its place. | Check fit, fastener engagement and structural load transfer on the aircraft. |
| 3 | Carrier / models | Earlier carrier dimensions and CAD sketches described a reference layout. | The builder identifies all five supplied STL revisions as installed: `01_carrier_adapter_plate_V3.stl`, `03_gps_mast_v2_rounded_rect.stl`, `04_battery_tray_TPU.stl`, `05_esc_plate_40x40x1p5_outer4p1_R1.stl` and `landing_foot_v7.stl` (eight instances). | Mesh-to-airframe alignment, material, print process, fastener lengths and physical clearances are not verified. The old generator does not reproduce the supplied revisions. |
| 4 | Companion board | Older documents referred to a BPI-CM5 Pro board or an ArmSoM CM5 module. | Package marking identifies the module as BPI-CM5 Pro 4+32G WiFi; the IO board is a separately purchased ArmSoM CM5-IO. | Verify board silkscreen, UART pins, firmware/image and loaded flight-battery power before use. No vendor or order detail is available. |
| 5 | PX4 | Airframe #1 previously used MicoAir vendor PX4 v1.14.3. | Official PX4 v1.16.2 was flashed on 2026-11-10. The supplied parameter file is dated 2026-11-12; whether it is a post-check export has not been confirmed. | Revalidate actuator mapping, RC, sensors, GPS, battery measurement and failsafes with props removed; then export the actual configuration and perform a controlled reflight. |
| 6 | Camera / GPS / landing gear | Earlier printed camera and GPS parts were planning models. | IMX219 camera uses an adjustable metal hinge; GPS mast V2, underslung tray and four V7 legs are included in the build documentation. | Confirm cable strain relief, fastener clearance and print condition on the aircraft. |
| 7 | Companion power / UART | 4S-to-12 V BEC and TEL1 MAVLink were planned. | Flight-battery BEC is not installed; TEL1 is not validated. | Verify the loaded 12 V rail and measure UART pin/device/baud; confirm heartbeat before treating the link as working. |

## Latest builder-supplied clearances

The following face-to-face clearances were supplied with the latest update. The unit is
interpreted as millimetres from context. These values are not measurements extracted from
the STL files, and the earlier photographs do not confirm them.

| Datum | Faces | Clearance |
|---|---|---:|
| H1 | Frame mounting surface → ESC underside | 5.0 mm |
| H2 | ESC upper surface → FC adapter underside | 7.5 mm |
| H3 | FC adapter upper surface → V3 carrier underside | 12.5 mm |
| H4 | V3 carrier upper surface → CM5-IO underside | 6.7 mm |

Use [the assembly guide](assembly.md) for the nine section-by-section instructions and
the [36-step offline viewer](../viewer/index.html) for the part-by-part visual tutorial.
The viewer is an aid for identifying and ordering parts; it is not evidence that the
meshes match the physical airframe.

## Change log

| Date | Unit | Change | Basis |
|---|---|---|---|
| 2026-09-24 | — | Reference frame changed from iFlight Nazgul5 V3 to TBS Source One V5.1; BPI-CM5 Pro was specified as the compute module. | Project record |
| 2026-11 | #1 | Initial assembly and manual flights using MicoAir vendor firmware, without the companion computer. | Existing build record |
| 2026-11-10 | #1 | Official PX4 v1.16.2 flashed; no post-update flight acceptance recorded. | Builder record |
| 2026-11-21 | #1 | Rebuild photos and notes recorded the FC-over-ESC arrangement, V3 carrier, camera hinge, GPS mast, tray and landing legs. | Dated photos and notes; not proof of later changes |
| 2026-11-28 | #1 | Updated adapter identity, mounting description, carrier position, compute-board identification and H1–H4 clearances. | Latest builder-provided corrections; photos do not confirm these updates |
