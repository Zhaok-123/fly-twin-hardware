# Wiring

> Reference pinouts below are for the MicoAir NxtPX4v2. Airframe #1's wiring and open
> checks are recorded in [as-built status](as-built-status.md).

Flight-controller peripherals use JST-GH sockets. Labels below follow MicoAir's
NxtPX4v2 documentation; check the board silkscreen before connecting cables.

The [flight-controller connector photo](fc-connectors.md) shows the plug positions and
wire colours on the assembled aircraft.

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

Airframe #1's GPS works. Record the actual repinning here when confirmed.

## RC

| FC `RC` silkscreen | Receiver (RP1) pad |
|--------------------|--------------------|
| 5V | 5V |
| GND | GND |
| TX | RX |
| RX | TX |

PX4 detects CRSF automatically on the RC port. Bind with the ELRS procedure.

## TEL1 → companion UART

Connect ground and TX/RX only. Leave the FC's 5 V pin cut or insulated; do not connect
the FC and IO board 5 V rails together.

| FC `TEL1` silkscreen | Wire | IO board 40-pin |
|----------------------|------|-----------------|
| GND | yes | GND — *verify pin number* |
| 5V | **no** — cut/insulate | — |
| TX | yes | UART RX — *verify pin number* |
| RX | yes | UART TX — *verify pin number* |

On the ArmSoM CM5-IO, check the 40-pin header against the board silkscreen and the exact
board revision and OS image. The `/dev/ttyS*` mapping and any device-tree overlay depend
on the image. Find candidate serial devices with:

```bash
ls /dev/ttyS* /dev/ttyAMA* 2>/dev/null
dmesg | grep -i tty
```

Confirm the device with MAVSDK (`serial:///dev/ttySx:921600`) by receiving a heartbeat,
then record the header pins and device name here.

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
- The camera is mounted; image capture has not been brought up.
