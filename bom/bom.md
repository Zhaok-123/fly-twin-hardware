# Bill of materials — 5-inch prototype (Route B)

Prices are historical planning estimates (CNY, Taobao, 2026-09); dashes indicate costs
not recorded. **Status:** *In hand* = received; *On #1* = fitted to Airframe #1;
*To order*; *Verify* = purchase or installation not confirmed.

For the current configuration and open checks, see the
[as-built record](../docs/as-built-status.md).

## A. Flight hardware (per aircraft)

| # | Part | Exact model | Qty | Unit ¥ | Total ¥ | Where / search term | Status |
|---|------|-------------|----:|-------:|--------:|---------------------|--------|
| A1 | Frame | TBS Source One V5.1, 5", 6 mm arms, ~118 g, with hardware | 1 | 252 | 252 | TBS / GetFPV ~$30 | On #1 |
| A2 | Standoffs | M3 × 30 mm aluminium ×4 + M3×8 screws (level the top plate) | 1 set | 10 | 10 | Any hardware shop | Verify |
| A3 | Motors | iFlight XING2 2207 1855KV | 4 | 90 | 360 | Taobao search: iFlight XING2 2207 1855KV | On #1 |
| A4 | Props | Gemfan 51466 tri-blade (2 CW + 2 CCW per set) | 4 pairs | 10 | 40 | Taobao search: Gemfan 51466 | On #1 (verify model) |
| A5 | Flight stack | MicoAir NxtPX4v2 **50A stack**: NxtPX4v2 FC (STM32H743, dual BMI088, SPL06 baro, 20×20 mm, onboard 5 V and 12 V BEC) + MicoAir 50A 4-in-1 ESC + stack hardware + 8-pin cable | 1 | 628 | 628 | MicoAir official Taobao store | On #1 |
| A6 | FC/ESC adapter | **Custom printed 40 × 40 × 1.5 mm, eight holes; 20 mm inner and 30.5 mm outer patterns** | 1 | — | — | Supplied [STL](../mounts/stl/05_esc_plate_40x40x1p5_outer4p1_R1.stl) | **Builder reports installed on #1** |
| A7 | Mounting spacers and silicone | Four grommets at the adapter's outer holes and silicone washers above the FC at the inner holes | 1 set | — | — | [Fasteners by joint](../docs/fasteners.md) | **Installed on #1** |
| A8 | GPS | Holybro Micro M10 (plastic case), with compass | 1 | 166 | 166 | Holybro store | On #1 |
| A9 | Receiver | RadioMaster RP1 ELRS 2.4 GHz | 1 | 60 | 60 | "RadioMaster RP1" | On #1 |
| A10 | Battery | Tattu R-Line 4S 1550 mAh 95C | 2 | 180 | 360 | Taobao search: Tattu R-Line 4S 1550 mAh | Verify |
| A11 | Compute BEC | Planned 4S → 12 V supply for CM5-IO; bench supply is separate | 1 | 50 | 50 | Historical plan; no acceptance on airframe | **Not installed on #1** |
| A12 | Prop guards | 5" universal | 1 set | 40 | 40 | Taobao | Verify |
| A13 | Wiring | XT60 + 14 AWG, XT30 pigtail, low-ESR capacitor, 22 AWG silicone wire, heat-shrink, zip ties, crash strip | 1 set | 120 | 120 | Taobao | Verify |
| A14 | Small hardware | M2.5 6 mm nylon standoffs, M3 nylon standoffs, M2.5 screws, 3 mm EVA pad, battery strap | 1 set | 30 | 30 | Taobao | Verify |
| A15 | Printed parts | **Five types / eight instances:** V3 carrier, GPS mast V2, battery tray, 8-hole FC adapter, V7 landing leg ×4 | 1 set | — | — | [As-built STL list](../mounts/README.md) | **Builder reports all five supplied revisions installed; mesh alignment unverified** |
| | **Subtotal (excl. compute)** | | | | **≈ 2,170** | | |

## B. Compute

| # | Part | Exact model | Qty | Unit ¥ | Total ¥ | Where | Status |
|---|------|-------------|----:|-------:|--------:|-------|--------|
| B1 | Compute module + IO board | **BPI-CM5 Pro 4+32G WiFi module** + separately purchased **ArmSoM CM5-IO** board (RK3576) | 1 | — | — | — | **Power and UART unverified** |
| B2 | Heatsink | ~30×30 mm for the SoC (if not included) | 1 | 10 | 10 | Taobao | Verify |
| B3 | Camera | IMX219 120° wide-angle, Raspberry Pi connector, 15 cm FPC (+ 22→15-pin adapter if needed) | 1 | 33 | 33 | Taobao search: IMX219 120° Raspberry Pi camera | In hand, fitted |
| B4 | Wi-Fi antenna | IPEX → external antenna (if not included) | 1 | 10 | 10 | Taobao | Verify |

## C. Bench / development (shared)

| # | Part | Qty | Unit ¥ | Total ¥ | Purpose | Status |
|---|------|----:|-------:|--------:|---------|--------|
| C1 | MicoAir NxtPX4v2 50A stack #2 | 1 | 628 | 628 | Bench HITL flight controller; second airframe later | In hand |
| C2 | 12 V / 3 A DC power adapter, 5.5×2.1 | 1 | 30 | 30 | Power the IO board on the bench | Verify |
| C3 | USB-TTL serial adapter (CH340/CP2102, 3.3 V) | 1 | 15 | 15 | Companion boot console, recovery | Verify |
| C4 | Dupont wires, GH cable kit | 1 set | 100 | 100 | Bench wiring | Verify |
| C5 | microSD 32–64 GB, high-endurance + reader | 2 | 40 | 80 | Flashing, logs | Verify |
| C6 | USB-C cables ×2 | 1 set | 20 | 20 | FC and IO board | Verify |

## D. Tools and safety (one-off)

| Part | Model | Qty | Total ¥ | Note |
|------|-------|----:|--------:|------|
| Transmitter | RadioMaster Pocket ELRS 2.4 GHz | 1 | 330 | Mandatory during development |
| Charger | ISDT 608AC | 1 | 220 | Also does 6S Li-ion for the 7" |
| Soldering iron | ≥ 60 W adjustable (e.g. T12) | 1 | 150 | |
| Tether kit | 5 m Kevlar line + swivel + 20 kg weight | 1 | 100 | All first flights |
| LiPo bags | Large | 2 | 60 | |
| Safety glasses | | 3 | 60 | One per person |
| Fire blanket | | 1 | 40 | |
| Anemometer | Handheld digital | 1 | 60 | Fly learned policies only below 5 m/s |
| Multimeter, drivers, heat-shrink, heat gun | | 1 set | 200 | |
| **Subtotal** | | | **≈ 1,220** | |

## E. Crash spares (keep in stock)

| Part | Qty | Total ¥ |
|------|----:|--------:|
| Frame | 1 | 200 |
| Source One V5 replacement arms | 4 | 80 |
| Motors | 4 | 360 |
| Props | 10 pairs | 100 |
| MicoAir 50A 4-in-1 ESC | 1 | 300 |
| IMX219 camera | 2 | 120 |
| FPC cables (10 cm / 15 cm, 3 each) | 6 | 30 |
| **Subtotal** | | **≈ 1,190** |

## Not used any more

| Part | Replaced by | Why |
|------|-------------|-----|
| iFlight Nazgul5 V3 frame | TBS Source One V5.1 | Nazgul5 V3 not sold as a bare frame in China; Source One is open-source |
| iFlight BLITZ E55S ESC | MicoAir 50A ESC (in the stack) | Comes matched with the FC, cable and current scale included |
| Holybro Pixhawk 6C Mini + PM06 | MicoAir NxtPX4v2 | Cost; NxtPX4v2 is also the open reference design for the AIO FC |
| Earlier generic “ArmSoM CM5 module” identification | BPI-CM5 Pro 4+32G WiFi module + separately purchased ArmSoM CM5-IO board | Corrected to the builder-confirmed module and IO board models |
