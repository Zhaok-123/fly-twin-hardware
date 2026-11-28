# PX4 parameter files

The supplied [PX4 v1.16.2 file](airframe1_px4-v1.16.2_2026-11-12.params), dated
2026-11-12, is the confirmed latest export after checks for Airframe #1. See
[as-built status](../docs/as-built-status.md) for the current configuration and
[firmware and parameters](../docs/px4-firmware-and-params.md) for migration notes.

To save a file from QGroundControl: Vehicle Setup → Parameters → Tools → *Save to file*.

Name new files `<unit>_<firmware>_<YYYY-MM-DD>[_note].params`, for example:

- `airframe1_micoair-v1.14.3_YYYY-MM-DD_baseline.params` — vendor firmware, before migration
- `airframe1_px4-v1.16.2_YYYY-MM-DD.params` — Airframe #1 export
- `bench-hitl_px4-v1.16.2_YYYY-MM-DD.params` — bench flight controller, `SYS_HITL = 1`; never load on an aircraft

Keep each export as a new file; do not overwrite an earlier baseline. Record which
parameters changed and why with the update.
