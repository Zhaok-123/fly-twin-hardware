# Airframe #1 as-built status and change log

This is the authoritative current-state record; the assembly, BOM, wiring and architecture
pages link here for configuration details.

## Current state — builder update 2026-11-28

| Area | Current information | Basis / status |
|---|---|---|
| Flight stack | MicoAir 50A ESC below MicoAir NxtPX4v2 FC; FC uses the inner holes of the printed adapter. | Builder-described assembly. |
| FC/ESC adapter | `05_esc_plate_40x40x1p5_outer4p1_R1.stl`: 40 × 40 × 1.5 mm; 30.5 mm outer pitch with 4.1 mm holes and 20 mm inner pitch with 3.3 mm holes. | Installed on Airframe #1. |
| Mounting hardware | Four grommets are fitted at the adapter's outer holes, and silicone washers are above the FC at its inner holes. | Installed on Airframe #1. |
| Upper structure | The carbon top plate has been removed; the V3 printed carrier occupies its position. | Installed on Airframe #1. |
| Companion | BPI-CM5 Pro 4+32G WiFi compute module with a separately purchased ArmSoM CM5-IO board. | Builder-confirmed models. |
| Other fitted parts | Adjustable IMX219 camera hinge, GPS mast V2, underslung battery tray and four V7 landing legs. | Builder-reported assembly. |
| Firmware / power / data | PX4 v1.16.2 has been flashed. The supplied `airframe1_px4-v1.16.2_2026-11-12.params` file is the latest export after checks. The compute BEC is not installed; TEL1 MAVLink has not been validated. No post-update reflight is recorded. | Builder-confirmed firmware and parameter record; reflight not recorded. |

## Known differences and open checks

| # | Area | Earlier reference or record | Current state | Still to verify |
|---|---|---|---|---|
| 1 | FC/ESC order | Early layout placed the FC below the ESC. | FC is above the ESC on the adapter, with outer-hole grommets and inner-hole washers. | The review requested grommets at the FC's inner holes. |
| 2 | Upper frame plate | Reference layout included a carbon top plate under the carrier. | The carbon top plate was removed and the printed V3 carrier takes its place. | — |
| 3 | Carrier / models | Earlier carrier dimensions and CAD sketches described a reference layout. | Five installed STL revisions are listed in [printed parts](../mounts/README.md). | Editable sources for these revisions are not available; the generator is for the earlier design. |
| 4 | Companion board | Older documents referred to a BPI-CM5 Pro board or an ArmSoM CM5 module. | BPI-CM5 Pro 4+32G WiFi module with a separately purchased ArmSoM CM5-IO board. | UART pins and flight-battery power. |
| 5 | PX4 | Airframe #1 previously used MicoAir vendor PX4 v1.14.3. | Mainline PX4 v1.16.2 was flashed on 2026-11-10. The supplied `airframe1_px4-v1.16.2_2026-11-12.params` is the latest export after checks. | Keep later exports in `params/`. |
| 6 | Camera / GPS / landing gear | Earlier printed camera and GPS parts were planning models. | IMX219 camera uses an adjustable metal hinge; GPS mast V2, underslung tray and four V7 legs are included in the build documentation. | Confirm cable strain relief, fastener clearance and print condition on the aircraft. |
| 7 | Companion power / UART | 4S-to-12 V BEC and TEL1 MAVLink were planned. | Flight-battery BEC is not installed; TEL1 is not validated. | Test the loaded 12 V rail; verify UART pins, device and baud; confirm a heartbeat. |

## Latest builder-supplied clearances

The builder supplied these face-to-face clearances; units are assumed to be millimetres.
They are not dimensions extracted from the STL files.

| Datum | Faces | Clearance |
|---|---|---:|
| H1 | Frame mounting surface → ESC underside | 5.0 mm |
| H2 | ESC upper surface → FC adapter underside | 7.5 mm |
| H3 | FC adapter upper surface → V3 carrier underside | 12.5 mm |
| H4 | V3 carrier upper surface → CM5-IO underside | 6.7 mm |

See the [assembly guide](assembly.md) for the nine assembly sections and the
[36-step offline viewer](../viewer/index.html) for the part-by-part tutorial.

## Change log

| Date | Unit | Change | Basis |
|---|---|---|---|
| 2026-09-24 | — | Reference frame changed from iFlight Nazgul5 V3 to TBS Source One V5.1; BPI-CM5 Pro was specified as the compute module. | Project record |
| 2026-11 | #1 | Initial assembly and manual flights using MicoAir vendor firmware, without the companion computer. | Existing build record |
| 2026-11-10 | #1 | Official PX4 v1.16.2 flashed; no post-update flight acceptance recorded. | Builder record |
| 2026-11-21 | #1 | Rebuild photos and notes recorded the FC-over-ESC arrangement, V3 carrier, camera hinge, GPS mast, tray and landing legs. | Dated photos and notes |
| 2026-11-28 | #1 | Updated adapter identity, mounting description, carrier position, compute-board identification and H1–H4 clearances. | Builder-provided corrections |
| 2026-11-28 | #1 | Translated the 36-step viewer into English and streamlined the assembly and hardware documentation. | Repository update |
| 2026-11-28 | #1 | Added a fastener table and labeled connector photo; updated the board and parameter records. | Builder-provided assembly information |
