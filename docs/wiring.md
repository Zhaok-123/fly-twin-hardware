# Wiring

All flight-controller peripherals use JST-GH sockets — no soldering on the FC side.
Silkscreen labels below are from the MicoAir NxtPX4v2 documentation; **always confirm
against the silkscreen on your board** before plugging anything in. Rows marked
*verify* have not been checked on the physical aircraft yet.

## Overview

| From | To | Cable | Notes |
|------|----|-------|-------|
| Battery XT60 | ESC battery pads | 14 AWG, soldered | + capacitor at the pads |
| ESC battery pads | Compute BEC input | XT30 pigtail, soldered in parallel | |
| Compute BEC output | IO board DC jack | DC 5.5×2.1 | 12 V; verify jack size on the board |
| ESC | FC `ESC` | 8-pin SH, supplied with the stack | Power, 4 × DShot, current sense, telemetry |
| GPS | FC `GPS1` | GH 6-pin, supplied with the GPS | **Pin order differs — see below** |
| Receiver | FC `RC` | 4 wires soldered at the receiver, GH plug at the FC | CRSF |
| FC `TEL1` | IO board 40-pin UART | GH → Dupont, TX/RX/GND only | No 5 V |
| Camera | IO board `CAM` | 22-pin FPC, ≤ 15 cm | Slack loop, taped |
| FC USB-C | PC | USB-C | QGC, flashing, logs |

## GPS1

| Signal | NxtPX4v2 `GPS1` silkscreen order | Holybro cable (Pixhawk order) |
|--------|-------------------------------|-------------------------------|
| 1 | G (GND) | VCC (5 V) |
| 2 | 5V | TX |
| 3 | Tx | RX |
| 4 | Rx | SCL |
| 5 | SCL | SDA |
| 6 | SDA | GND |

The two orders do not match. Map **by signal name**, not by position: GPS TX → FC Rx,
GPS RX → FC Tx, SCL → SCL, SDA → SDA, 5 V → 5V, GND → G. Re-pin the GH housing (lift the
latch with a needle, pull the contact, reinsert) and label the cable.

Status: airframe #1 has a working GPS, so a working mapping exists — *verify and record
the actual re-pinning here.*

## RC

| FC `RC` silkscreen | Receiver (RP1) pad |
|--------------------|--------------------|
| 5V | 5V |
| GND | GND |
| TX | RX |
| RX | TX |

PX4 detects CRSF automatically on the RC port. Bind with the ELRS procedure.

## TEL1 → companion UART

| FC `TEL1` silkscreen | Wire | IO board 40-pin |
|----------------------|------|-----------------|
| GND | yes | GND — *verify pin number* |
| 5V | **no** — cut/insulate | — |
| TX | yes | UART RX — *verify pin number* |
| RX | yes | UART TX — *verify pin number* |

The BPI CM5 Pro IO board's 40-pin header follows the Raspberry Pi layout, but which
`/dev/ttyS*` maps to which header pins, and whether that UART must be enabled with a
device-tree overlay, depends on the board image. Find it with:

```bash
ls /dev/ttyS* /dev/ttyAMA* 2>/dev/null
dmesg | grep -i tty
```

Then confirm with MAVSDK (`serial:///dev/ttySx:921600`) receiving a heartbeat.
*Fill in the confirmed header pins and device name here.*

## ESC 8-pin

Supplied pre-made with the stack. Do not swap it for a generic Betaflight 8-pin cable:
pin orders differ between vendors. Current-sense scale is configured by MicoAir in the
factory firmware — record `BAT1_A_PER_V` / `BAT1_V_DIV` before reflashing
([px4-firmware-and-params.md](px4-firmware-and-params.md)).

## Camera FPC

- IMX219 boards use the Raspberry Pi 22-pin (0.5 mm pitch) or 15-pin (1 mm pitch) FPC;
  the IO board CAM connector is 22-pin. Use a 22→15 adapter cable if the camera board is
  15-pin.
- Contacts face the right way on both ends — check against the connector's contact side.
- Camera bring-up is deferred; the camera is mounted but not yet producing images.
