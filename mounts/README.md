# 3D-printed parts

These five supplied STL files are the revisions identified by the builder as installed on
Airframe #1. Earlier files remain in Git history. The legacy generator does not reproduce
these models. The [36-step assembly viewer](../viewer/index.html) shows the parts in
assembly order; the [STL parts viewer](../viewer/parts.html) loads individual meshes.

## Supplied Airframe #1 part files

| STL | Qty reported installed | Nominal size (mm) | Function / known details |
|---|---:|---|---|
| [01_carrier_adapter_plate_V3.stl](stl/01_carrier_adapter_plate_V3.stl) | 1 | **90 × 137 × 3** | V3 upper carrier; builder states it occupies the position of the removed carbon top plate. |
| [03_gps_mast_v2_rounded_rect.stl](stl/03_gps_mast_v2_rounded_rect.stl) | 1 | **29.9 × 36.44 × 35** | Rear GPS mast, approximately 35 mm tall. |
| [04_battery_tray_TPU.stl](stl/04_battery_tray_TPU.stl) | 1 | **45 × 81.5 × 15** | Underslung battery tray. The filename does not establish print material. |
| [05_esc_plate_40x40x1p5_outer4p1_R1.stl](stl/05_esc_plate_40x40x1p5_outer4p1_R1.stl) | 1 | **40 × 40 × 1.5** | FC/ESC adapter. STL header specifies 30.5 mm outer pitch with 4.1 mm holes and 20 mm inner pitch with 3.3 mm holes. |
| [landing_foot_v7.stl](stl/landing_foot_v7.stl) | 4 | **54.5 × 25 × 80** | Repeated landing leg under each motor arm, approximately 80 mm tall. |

**Total:** Five models and eight part instances. Nominal dimensions and the adapter hole
patterns come from the STL files; physical fit and the source of other build details are
recorded in [as-built status](../docs/as-built-status.md). The tray filename does not
confirm print material.

## Model provenance and regeneration

[src/gen_mounts.py](src/gen_mounts.py) is the **legacy planning-stage generator**. It does
not reproduce the five supplied STL revisions; do not regenerate over the supplied files.
The script's original requirements are `pip install trimesh manifold3d numpy`.

The original script uses millimetres, X left/right, +Y forward and Z upward. No editable
CAD or STEP sources for the five supplied revisions were provided. Viewer geometry is
for visualization; physical alignment has not been checked.
