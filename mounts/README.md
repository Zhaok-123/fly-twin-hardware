# 3D-printed parts

Frame: TBS Source One V5.1 (5"). Companion: Banana Pi BPI-CM5 Pro + IO board (same
footprint as ArmSoM CM5 / CM5-IO). Preview of the four parts: [preview.png](preview.png).
View them in 3D: [../viewer/parts.html](../viewer/parts.html).

The STL files were generated from **nominal** dimensions in the planning stage. Measure
the *verify* dimensions on your parts before printing, then regenerate (see below).

| File | Material | Print | Dimensions to verify |
|------|----------|-------|----------------------|
| [01_carrier_adapter_plate.stl](stl/01_carrier_adapter_plate.stl) | PETG or PLA+ | Flat, 0.2 mm layers, 4 walls, 40 % infill | IO-board mounting holes (assumed 93 × 73 mm, M2.5; check the official DXF); Source One V5 top-plate standoff screw spacing (assumed 62 mm fore/aft × 30 mm lateral) |
| [02_camera_adapter_TPU.stl](stl/02_camera_adapter_TPU.stl) | TPU 95A | Front face down, no supports | Camera cage inner width (19 or 20 mm; generated at 19); IMX219 board holes (assumed Pi v2 standard 21 × 12.5 mm; wide-angle boards may differ) |
| [03_gps_mast.stl](stl/03_gps_mast.stl) | PLA | Base down, supports under the top disc | — |
| [04_battery_tray_TPU.stl](stl/04_battery_tray_TPU.stl) | TPU 95A | Opening up | Battery size (Tattu 4S 1550 assumed ~35 × 75 × 31 mm) |

Assumptions baked into the files:

- Both the top-plate standoff holes and the 30.5 × 30.5 stack holes are on the adapter
  plate; at least one set will fit.
- The Source One V5 ships with 30 mm front / 22 mm rear standoffs, so the top plate is
  tilted. Replace the rear pair with 30 mm before fitting the adapter plate.
- The camera adapter is clamped by the cage's M2 side screws; tilt is set by rotating it,
  then tightening.
- The battery tray bolts through the bottom plate's 30.5 stack holes; those screws need
  to be ~4 mm longer.

## Parts printed for airframe #1 but not in this folder yet

- Landing legs (one under each arm)
- Camera bracket on the front edge of the carrier adapter plate (used instead of
  `02_camera_adapter_TPU`)

Add the STL (and STEP or source, if available) and a row in the table above.

## Regenerating

[src/gen_mounts.py](src/gen_mounts.py) is parametric: all dimensions are at the top.

```bash
pip install trimesh manifold3d numpy
python src/gen_mounts.py        # writes to src/stl/ — copy into ../stl/ after checking
```

Units are mm. Axes: X left/right, Y fore/aft (+Y = nose), Z up.
