# 3D-printed parts

The five current STL files listed below were supplied for the latest Airframe #1
documentation. Earlier STL assets were removed from the working tree; earlier revisions
remain in Git history. The original planning-stage generator remains for reference. The
[36-step interactive assembly viewer](../viewer/index.html) presents the
parts in assembly order; the [STL parts viewer](../viewer/parts.html) loads standalone
meshes.

## Supplied Airframe #1 part files

| STL | Qty reported installed | Nominal size (mm) | Function / known details |
|---|---:|---|---|
| [01_carrier_adapter_plate_V3.stl](stl/01_carrier_adapter_plate_V3.stl) | 1 | **90 × 137 × 3** | V3 upper carrier; builder states it occupies the position of the removed carbon top plate. |
| [03_gps_mast_v2_rounded_rect.stl](stl/03_gps_mast_v2_rounded_rect.stl) | 1 | **29.9 × 36.44 × 35** | Rear GPS mast, approximately 35 mm tall. |
| [04_battery_tray_TPU.stl](stl/04_battery_tray_TPU.stl) | 1 | **45 × 81.5 × 15** | Underslung battery tray. The filename does not establish print material. |
| [05_esc_plate_40x40x1p5_outer4p1_R1.stl](stl/05_esc_plate_40x40x1p5_outer4p1_R1.stl) | 1 | **40 × 40 × 1.5** | FC/ESC adapter. STL header specifies 30.5 mm outer pitch with 4.1 mm holes and 20 mm inner pitch with 3.3 mm holes. |
| [landing_foot_v7.stl](stl/landing_foot_v7.stl) | 4 | **54.5 × 25 × 80** | Repeated landing leg under each motor arm, approximately 80 mm tall. |

**Total:** Five unique models and eight part instances. The builder identifies all five
supplied revisions as the installed parts. Their mesh alignment with the built aircraft
has not been verified. See [as-built status](../docs/as-built-status.md) for the source
and confidence of dimensions, fit and mounting details. Material,
manufacturing process, fastener lengths and installed clearance are not certified by an
STL filename or model.

## Model provenance and regeneration

[src/gen_mounts.py](src/gen_mounts.py) is the **legacy planning-stage generator**. It does
not reproduce the five supplied STL revisions; do not regenerate over the supplied files.
The script's original requirements are `pip install trimesh manifold3d numpy`.

The original script uses millimetres, X left/right, +Y forward and Z upward. No editable
CAD or STEP sources for the five supplied revisions were provided. The assembly viewer is
an offline visual aid, not confirmation that its meshes align with Airframe #1.
