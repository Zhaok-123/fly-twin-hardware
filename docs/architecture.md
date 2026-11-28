# Architecture — how the prototype works

> This page describes the reference design. For Airframe #1's current configuration and
> open checks, see [as-built status](as-built-status.md); DShot600, bidirectional
> telemetry and offboard control have not been verified on the aircraft.

This document explains *why* the aircraft is built the way it is. The step-by-step
build is in [assembly.md](assembly.md); pin-level detail is in [wiring.md](wiring.md).

## 1. Division of labour

```
┌───────────────────────────────────────────────────────────┐
│ Companion computer — BPI-CM5 Pro 4+32G WiFi module        │
│   on separately purchased ArmSoM CM5-IO (RK3576)          │
│   camera → YOLO (NPU) → RL policy → velocity setpoints    │
│   safety clipping, task planner, logging                  │
└──────────────────────────┬────────────────────────────────┘
                           │ MAVLink over UART (921600 baud)
┌──────────────────────────▼────────────────────────────────┐
│ Flight controller — MicoAir NxtPX4v2 (STM32H743, PX4)     │
│   EKF2 state estimation, position/velocity/attitude loops,│
│   failsafes, geofence, motor output (DShot)               │
└──────────────────────────┬────────────────────────────────┘
                           │ DShot600 + bidirectional telemetry
┌──────────────────────────▼────────────────────────────────┐
│ ESC (MicoAir 50A 4-in-1) → 4 motors                       │
└───────────────────────────────────────────────────────────┘
```

**PX4 keeps the aircraft stable; the companion computer decides where it goes.** The
learned skills only ever send body-frame velocity + yaw-rate setpoints in PX4 offboard
mode. Linux is not real-time, so nothing on the companion computer sits inside the
attitude loop. If the companion computer crashes or stops sending setpoints, PX4's
offboard-loss failsafe takes over (see [px4-firmware-and-params.md](px4-firmware-and-params.md)).

The RC transmitter is mandatory during development: any stick or switch movement
takes the aircraft out of offboard mode.

## 2. Physical layer stack

Bottom to top:

```
            ┌──────────────────────────────┐
  Layer 5   │ GPS + compass on 30 mm mast  │  farthest from power wiring
            ├──────────────────────────────┤
  Layer 4   │ ArmSoM CM5-IO board +        │  Reference stack; header/power unverified
            │ BPI-CM5 Pro module           │
            ├──────────────────────────────┤
  Layer 3   │ Printed carrier adapter plate│  130 × 90 × 3 mm, bolted to top plate
            │ Carbon top plate             │
            ├──────────────────────────────┤
  Layer 2   │ Flight controller (20×20)    │  soft-mounted on grommets  ← IMU here
            │ 30.5→20 adapter plate        │
            │ ESC (30.5×30.5)              │  soft-mounted on grommets
            ├──────────────────────────────┤
  Layer 1   │ Bottom plate + arms + motors  │
            └──────────────────────────────┘
              Battery strapped *under* the bottom plate (TPU tray + EVA pad)
              Camera in the front camera cage; receiver at the rear
```

This reference stack retains the carbon top plate and shows proposed soft mounts.

### Why the flight controller sits above the ESC (and not at the bottom)

The first build put the flight controller at the bottom, screwed directly to the carbon
plate, because the NxtPX4v2's 20×20 corners cannot take the frame's 30.5 mm standoffs.
It flew, but it is not the reference configuration, for three reasons:

1. **IMU isolation.** Hard-mounted, the IMU sees the full motor vibration. The vibration
   data from this prototype is the design input for the AIO carrier board's IMU
   isolation, so it must be measured with a soft-mounted IMU to be useful.
2. **Service access.** At the bottom of the stack the USB-C port, microSD slot and boot
   button are only reachable by disassembling the aircraft. They are needed after every
   flight (log download, parameter changes, firmware).
3. **Reproducibility.** The build is published; someone following the docs must end up
   with the same aircraft.

The reference proposal mounts the flight controller above the ESC on a **30.5→20 mm
adapter plate**, with **rubber grommets at the 20×20 holes**.

### Why the companion computer is on top and the battery underneath

The Source One V5 is designed for a top-mounted battery. This layout places the IO board
above the center stack and the battery underneath; the battery tray and upper structure
are described in the [assembly guide](assembly.md).

## 3. Power tree

```
4S LiPo 14.8 V nominal (12.6–16.8 V)
  │ XT60
  ▼
ESC battery pads (+ low-ESR capacitor soldered at the pads)
  ├──► Motors ×4 (via ESC)
  ├──► 8-pin stack cable ──► Flight controller VBAT input
  │                           ├─ onboard 5 V BEC ──► FC, GPS, receiver
  │                           └─ onboard 12 V BEC (unused)
  └──► XT30 pigtail ──► 4S→12 V/3 A BEC ──► DC 5.5×2.1 ──► ArmSoM CM5-IO board
                                                          └─ BPI-CM5 Pro module
                                                          └─ IMX219 camera (via CSI)
```

The flight-battery BEC branch is planned and is not installed on Airframe #1.

| Rail | Source | Loads | Budget |
|------|--------|-------|--------|
| 4S main | Battery | Motors (hover ~150–200 W), everything else | 1550 mAh × 95C |
| 5 V FC | FC onboard BEC (2.5 A) | FC, GPS, receiver | < 0.5 A typical |
| 12 V compute | External BEC (3 A) | IO board + RK3576 module + camera | ~7 W at full NPU load |

Notes:
- **The flight controller and companion computer are powered independently.** A brown-out
  or reboot of the companion computer cannot reset the flight controller.
- Battery voltage is measured by the FC; current is measured by the ESC's current sensor
  and reported over the stack cable (scale factors are set by MicoAir — record them
  before reflashing, see [px4-firmware-and-params.md](px4-firmware-and-params.md)).
- The UART link between FC and companion computer shares **ground only** — never connect
  the 5 V pins of the two boards together.
- The FC's own 12 V / 2.5 A BEC could replace the external BEC, but combined-load
  operation has not been verified.

## 4. Data links

| Link | Physical | Protocol | Purpose |
|------|----------|----------|---------|
| FC ↔ ESC | 8-pin SH stack cable | DShot600 + bidirectional DShot (RPM telemetry) | Motor commands; RPM feeds PX4's dynamic notch filter |
| FC ↔ companion | FC `TEL1` GH socket → IO board 40-pin UART (TX/RX/GND) | MAVLink 2, 921600 baud, `MAV_1_MODE = Onboard` | Offboard setpoints, telemetry |
| FC ↔ GPS | FC `GPS1` GH 6-pin | UART (GNSS) + I²C (compass) | Position, heading |
| FC ↔ receiver | FC `RC` GH socket | CRSF (ELRS) | Pilot override |
| FC ↔ PC | FC USB-C | MAVLink | QGroundControl: flashing, parameters, log download |
| Companion ↔ camera | 22-pin FPC | MIPI CSI-2 | Main camera |
| Companion ↔ phone/PC | On-module Wi-Fi 6 (external antenna) | IP | SSH, video preview, app |

## 5. Vibration isolation

Vibration in the IMU is the most common reason a PX4 multicopter drifts in position mode.
The prototype uses three measures:

1. **Mechanical proposal:** ESC and FC each on rubber grommets (two isolation stages).
2. **Electronic:** bidirectional DShot gives PX4 per-motor RPM, enabling the dynamic
   notch filter on the gyro (`IMU_GYRO_DNF_EN`).
3. **Maintenance:** balanced, undamaged props; motor screws with threadlocker.

For each flight, archive the `.ulg`, Flight Review's *Vibration* and *Actuator* pages,
and the raw accelerometer/gyro spectra.
Two datasets matter:

- **Baseline:** first flights with the hard-mounted FC.
- **Reference:** flights after the reported mount update, once the FC's isolation is measured.

Compare the two data sets to inform the AIO board's IMU island design.

## 6. RF and magnetic layout

| Concern | Rule on this aircraft |
|---------|-----------------------|
| Compass interference | GPS/compass on a 30 mm mast at the rear of the adapter plate, as far as possible from the ESC, battery leads and BEC. GPS arrow points to the nose. |
| Wi-Fi range | Antenna led out from the IO board and zip-tied to the adapter plate edge, ≥ 15 mm from any carbon (carbon fibre blocks RF). |
| Receiver | Antenna run out along a rear arm, away from carbon and power leads. |
| Camera FPC | Short (≤ 15 cm), routed with a slack loop, taped to the connector. MIPI is sensitive to length and to being pulled. |

## 7. Mass budget (estimate — replace with scale readings)

| Item | Estimate (g) | Measured (g) |
|------|-------------:|-------------:|
| Source One V5.1 frame (incl. hardware) | 118 | |
| XING2 2207 ×4 | 136 | |
| MicoAir 50A stack (FC + ESC) | 25 | |
| BPI-CM5 Pro module + ArmSoM CM5-IO board + heatsink | 80 | |
| Carrier adapter plate + standoffs (printed) | 25 | |
| IMX219 camera + adapter | 5 | |
| Micro M10 GPS + mast | 15 | |
| Receiver + BEC | 10 | |
| Props ×4 | 24 | |
| Wiring, XT60, capacitor, straps, battery tray | 40 | |
| **Dry weight** | **~480** | |
| Tattu 4S 1550 mAh | 190 | |
| **All-up weight** | **~670** | |

Estimated hover time is ~6–7 minutes and estimated thrust-to-weight is ~6:1. Weigh the
aircraft and validate flight performance before using these estimates for planning.

## 8. Transition to the AIO carrier board

| Prototype part | AIO version |
|----------------|-------------|
| ArmSoM CM5-IO board | FlyAgent AIO carrier board (the BPI-CM5 Pro module is intended to carry over) |
| MicoAir NxtPX4v2 FC | H743 + ICM-42688-P + BMI088 + baro on the AIO board, IMU on an isolated island |
| 12 V BEC | AIO board's own 4S input |
| Printed carrier adapter plate | Not needed (AIO board on the 30.5 mm stack) |
| UART jumper wires | On-board traces |
| Frame, motors, ESC, battery, GPS, receiver, camera | Unchanged |

Parameters and board-level knowledge from the NxtPX4v2 carry over: the AIO flight
controller is a derivative of the same open-source `hkust_nxt-dual` design.
