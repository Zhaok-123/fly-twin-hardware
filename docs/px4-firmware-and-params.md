# PX4 firmware and parameters

> Firmware version, parameter-file status, and current validation state are maintained in
> [as-built status](as-built-status.md). This page's migration steps and parameter values
> are historical reference material; verify settings with props removed before flight.

## Firmware decision

| | Before (airframe #1 first flights) | Now (team standard) |
|---|---|---|
| Source | MicoAir vendor branch `micoair743-v1.14.3` | PX4 mainline |
| Version | 1.14.3 (git `4a0e65f2`, built 2024-11-19) | **v1.16.2** |
| Board target | HKUST_NXT_DUAL (vendor build) | `hkust_nxt-dual_default` |

Why mainline v1.16.2:

- Simulation (PX4 SITL) and the real aircraft must run the same code. The
  `hkust_nxt-dual` target only exists in mainline from **v1.15.0**; v1.14.3 mainline does
  not support this board, so the vendor build cannot be reproduced in SITL.
- The AIO carrier board's flight controller will be ported from the mainline
  `hkust_nxt-dual` target.
- Anyone following this repo can build and flash the exact same firmware.
- v1.16.2 rather than v1.17.0: it is the third point release of its series, supports
  Ubuntu 22.04 + Gazebo Harmonic for SITL, and is the conservative choice for a team on
  its first real aircraft. Moving to 1.17 later is a rebuild, nothing more.

Check what a board is running: QGroundControl → Analyze Tools → MAVLink Console → `ver all`.

## Historical migration plan — do not repeat on Airframe #1

The following steps are retained for provenance, not as current instructions. Check
[as-built status](as-built-status.md) before applying anything here. Export the actual
current parameters and verify the configuration with propellers removed.

1. **Back up the vendor state** (airframe #1):
   - QGC → Parameters → Tools → Save to file →
     `params/airframe1_micoair-v1.14.3_baseline_YYYY-MM-DD.params`
   - Write down: `BAT1_V_DIV`, `BAT1_A_PER_V`, battery cell count/thresholds, DShot
     settings, RC channel mapping, flight-mode switch, kill switch.
   - Record where the vendor firmware file can be downloaded (MicoAir). Once mainline is
     flashed, this file is the only way back.
2. **Build** (Ubuntu 22.04 / WSL2):
   ```bash
   git clone --recursive -b v1.16.2 https://github.com/PX4/PX4-Autopilot.git
   cd PX4-Autopilot
   bash Tools/setup/ubuntu.sh        # once, then restart the shell
   make hkust_nxt-dual_default
   # output: build/hkust_nxt-dual_default/hkust_nxt-dual_default.px4
   ```
3. **Flash:** QGC → Vehicle Setup → Firmware → plug the FC in (props off, battery off) →
   PX4 → Advanced → *Custom firmware file* → select the `.px4`. If the board does not
   enter the bootloader, hold the boot button while plugging USB.
4. **Verify:** `ver all` shows v1.16.2 / HKUST_NXT_DUAL; both IMUs and the baro appear in
   QGC sensors; GPS gets a fix by a window.
5. **Do not load the old parameter file wholesale** — names and defaults change between
   versions. Set values by hand from your notes and the table below, then calibrate
   everything (accelerometer, gyro, level horizon, compass, radio, ESC/battery).
6. Export the new parameters: `params/airframe1_px4-v1.16.2_YYYY-MM-DD.params`.

## Bench FC (stack #2) — HITL only

Stack #2 is the software team's bench unit for HITL. Label it **"BENCH / HITL"**:
`SYS_HITL = 1` on a flying aircraft disables real sensors and outputs. Never move a
parameter file from the bench unit to a flying aircraft.

## Historical initial setup proposal — verify, do not apply blindly

The list and table below are an unverified reference plan, not a record of the current
configuration. Airframe #1 previously used DShot300; its current protocol, telemetry
support, motor mapping and directions must be checked on the actual hardware with props
removed. Do not assume the proposed settings or motor map below are correct.

1. Airframe: **Generic Quadcopter** (`SYS_AUTOSTART = 4001`).
2. Sensor calibration: accelerometer, gyro, level horizon, compass (GPS-mounted).
3. Radio: bind RP1 to the Pocket, calibrate sticks, assign a 3-position mode switch
   (Manual / Position / Offboard) and a **kill switch**.
4. ESC: historical proposal was DShot600 and bidirectional telemetry. Verify the current protocol and hardware/firmware support before changing either.
5. Motor test (QGC → Motors): with props removed, verify each physical output and motor direction against the current QGC actuator configuration. The historical proposal was **1 FR, 2 RL, 3 FL, 4 RR** and **1, 2 CCW; 3, 4 CW**; this is not an established mapping for the current firmware.
6. Companion link: `MAV_1_CONFIG = TEL1`, `SER_TEL1_BAUD = 921600`, `MAV_1_MODE = Onboard`.
7. Failsafes and geofence (table below). Export the parameter file and commit it.

## Historical proposed parameters — not verified settings

Parameter names below are those used in our planning docs. **Check each name in QGC on
v1.16.2** — a few failsafe parameters were renamed between releases. Update this table
with the names and values actually set.

| Parameter | Purpose | Value |
|-----------|---------|-------|
| `SYS_AUTOSTART` | Airframe | 4001 (Generic Quadcopter) |
| `DSHOT_CONFIG` / `DSHOT_TEL_CFG` | ESC protocol / telemetry | DShot600 / on |
| `IMU_GYRO_DNF_EN` | Dynamic notch from ESC RPM | on |
| `MAV_1_CONFIG` / `SER_TEL1_BAUD` / `MAV_1_MODE` | Companion link | TEL1 / 921600 / Onboard |
| `COM_RC_IN_MODE` | RC required | development: RC required |
| `COM_OF_LOSS_T` | Offboard setpoint timeout | 1 s |
| Offboard-loss action (`COM_OBL_RC_ACT` / `COM_OBL_ACT`, *verify name*) | On offboard loss | Hold / position |
| `NAV_RCL_ACT` | RC loss | Return |
| `NAV_DLL_ACT` / `COM_DL_LOSS_T` | Data link loss | Return / 10 s |
| `GF_MAX_HOR_DIST` / `GF_MAX_VER_DIST` / `GF_ACTION` | Geofence | 30 m / 15 m / Return |
| `BAT_LOW_THR` / `BAT_CRIT_THR` / `COM_LOW_BAT_ACT` | Battery | 25 % / 15 % / Return then Land |
| `MPC_XY_VEL_MAX` / `MPC_Z_VEL_MAX_UP` | Second speed limit (behind the onboard safety layer) | 3 m/s / 2 m/s |
| `SYS_HITL` | HITL | 0 on aircraft; 1 on the bench FC only |
