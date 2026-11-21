# 3D-printed parts

This repository retains the four original **planning-stage** STL files for historical
reference. The **as-built Airframe #1** revisions are listed first below; they are the
five source STLs supplied by the builder for the November 2026 hardware documentation.
The [interactive assembly viewer](../viewer/index.html) embeds the five actual meshes;
the [STL parts viewer](../viewer/parts.html) loads individual mesh files by HTTP.

## Airframe #1 — supplied as-built printed parts (2026-11-21)

| STL | Qty on #1 | Nominal bounding-box size (mm) | Function / facts |
|---|---:|---|---|
| [01_carrier_adapter_plate_V3_new.stl](stl/01_carrier_adapter_plate_V3_new.stl) | 1 | **90 × 137 × 3** | Upper carrier on the four center-stack extension fasteners; four separate raised mounts for CM5-IO. |
| [03_gps_mast_v2_rounded_rect.stl](stl/03_gps_mast_v2_rounded_rect.stl) | 1 | **29.9 × 36.44 × 35** | Rear GPS mast, approximately 35 mm tall. |
| [04_battery_tray_TPU_new.stl](stl/04_battery_tray_TPU_new.stl) | 1 | **45 × 81.5 × 15** | Underslung battery tray with strap. Filename is not proof of print material. |
| [05_esc_plate_38x38x2_8xM3_R1.stl](stl/05_esc_plate_38x38x2_8xM3_R1.stl) | 1 | **38 × 38 × 2** | Adapter with 20 × 20 mm inner FC mounting pattern and 30.5 × 30.5 mm outer through-fastener pattern; 8 × ~3.3 mm M3 clearance holes. |
| [landing_foot_v7.stl](stl/landing_foot_v7.stl) | 4 | **54.5 × 25 × 80** | One repeated landing leg under each motor arm, ~80 mm tall. |

**Total:** Five unique printed-part models; eight installed part instances. Geometry
comes from the supplied STL files. Material, manufacturing process, fastener lengths
and installed clearance must be confirmed on real hardware; the STLs do **not** certify
material or mechanical strength. The described as-built structure and measured center
clearances are recorded in [assembly.md](../docs/assembly.md).

## Original reference models (not necessarily fitted to Airframe #1)

| Historical STL | Reference design material / print notes | Status |
|---|---|---|
| [01_carrier_adapter_plate.stl](stl/01_carrier_adapter_plate.stl) | PETG or PLA+; flat, 0.2 mm layers | Superseded by V3 carrier. |
| [02_camera_adapter_TPU.stl](stl/02_camera_adapter_TPU.stl) | TPU 95A, camera-cage mount | Not fitted; replaced by adjustable metal camera bracket, not a 3D-printed part. |
| [03_gps_mast.stl](stl/03_gps_mast.stl) | PLA, nominal mast | Superseded by supplied GPS mast V2. |
| [04_battery_tray_TPU.stl](stl/04_battery_tray_TPU.stl) | TPU 95A, nominal battery tray | Superseded by supplied battery tray revision. |

## Model provenance and regeneration

[src/gen_mounts.py](src/gen_mounts.py) is the **original planning-stage generator**;
it does **not** reproduce all five supplied as-built STL revisions. Do not regenerate
and overwrite these supplied files with the older default geometry. Original script
requirements: `pip install trimesh manifold3d numpy`.

Coordinates in the original scripts use millimetres, with X left/right, +Y forward and
Z upward. No editable CAD/STEP source for the five newer revisions was provided in this
update. Where needed, obtain it separately rather than claiming that it is in Git.