# PX4 parameter files

Export from QGroundControl: Vehicle Setup → Parameters → Tools → *Save to file*.

Naming: `<unit>_<firmware>_<YYYY-MM-DD>[_note].params`, for example

- `airframe1_micoair-v1.14.3_2026-11-11_baseline.params` — vendor firmware, before migration
- `airframe1_px4-v1.16.2_2026-11-14.params`
- `bench-hitl_px4-v1.16.2_2026-11-12.params` — bench flight controller, `SYS_HITL = 1`, **never load on an aircraft**

Commit a new file for every change (do not overwrite), and say in the commit message
which parameters changed and why.
