# Assembly guide — 5-inch prototype (Route B)

Build time: ~3 h with experience, plan 5 h for the first one. Parts: [../bom/bom.md](../bom/bom.md).
Background on every design choice: [architecture.md](architecture.md). Pinouts: [wiring.md](wiring.md).
Interactive version of these steps: [../viewer/index.html](../viewer/index.html).

> Conventions: **+Y / "nose" = forward.** Motor numbering follows **PX4 Quad X**, which is
> different from Betaflight:
>
> | Motor | Position | Direction (seen from above) |
> |-------|----------|-----------------------------|
> | 1 | front right | counter-clockwise |
> | 2 | rear left | counter-clockwise |
> | 3 | front left | clockwise |
> | 4 | rear right | clockwise |

## Tools

Soldering iron ≥ 60 W with a chisel tip, solder, flux, wire strippers, M2/M2.5/M3 drivers
and the frame's hex keys, multimeter, heat-shrink + heat gun, medium threadlocker,
calipers, safety glasses.

## 0. Before you start

- [ ] Print the four parts in [../mounts/](../mounts/) (or order them printed). Measure
      the dimensions marked *verify* in [../mounts/README.md](../mounts/README.md) first.
- [ ] Charge batteries to **storage voltage** only, in a LiPo bag.
- [ ] Install QGroundControl on your PC.
- [ ] Open the MicoAir stack box and check what is included: standoffs, grommets,
      8-pin cable, any 20×20 hardware. Measure the FC and ESC hole spacing and hole size.

## 1. Frame and motors (30 min)

1. Bolt the four arms to the bottom plate with the supplied M3 screws. **Do not fit the
   top plate yet.**
2. Fit the four motors to the arm ends with M3×6 screws and threadlocker. Check screw
   length: a screw that touches the motor windings will short them.
3. Route each motor's leads along its arm toward the centre and secure with two zip ties
   per arm. Leave enough length to reach the ESC pads.

## 2. ESC (40 min — most of the soldering is here)

1. Fit the frame's M3 standoffs in the 30.5 mm pattern. Fit the ESC on rubber grommets,
   **arrow to the nose**.
2. Cut the motor leads to length, strip 3 mm, tin them.
3. Solder each motor's three leads to its three pads (12 joints). Lead order does not
   matter — direction is fixed later in software.
4. Solder the XT60 lead (14 AWG, ~10 cm) to the battery pads. **Red to +, black to −.**
   Check polarity with a multimeter before heating anything.
5. Solder the low-ESR capacitor across the battery pads, long leg to +, as close to the
   board as possible.
6. Solder the XT30 pigtail (for the compute BEC) in parallel on the battery pads, exiting
   to the side.
7. **Measure resistance between battery + and −. It must not be a short.** Do not
   continue until it is clean.

## 3. Flight controller on top of the ESC (30 min)

This is the step that differs from the first build: the flight controller goes **above**
the ESC and is **soft-mounted**.

1. Fit the **30.5→20 mm adapter plate** on top of the ESC standoffs (M3 standoffs/nuts).
2. Fit **rubber grommets** in the four 20×20 holes of the flight controller. Mount the FC
   on the adapter with M2 (or M3 — match the FC holes) screws and standoffs, **arrow to the
   nose**, same direction as the ESC.
3. Leave 3–5 mm between the underside of the FC and the tallest ESC component, plus
   grommet thickness. Tighten until the grommets are just snug — **do not crush them.**
4. Plug the 8-pin SH stack cable ESC ↔ FC `ESC` socket. Plugged, not soldered.
5. Orient the FC so the **USB-C port, microSD slot and boot button face outward** and are
   reachable without removing anything. This is the reason for the whole rebuild.
6. Receiver (RadioMaster RP1): solder four wires on the receiver side, crimp a GH plug on
   the other end into FC `RC` (receiver TX → FC RX, receiver RX → FC TX). Stick the
   receiver to the rear of the frame; run the antenna out along a rear arm.
7. GPS (Holybro Micro M10): the supplied GH 6-pin cable plugs into FC `GPS1`. **Check the
   pin order before plugging in** — Holybro's cable follows the Pixhawk order, the
   NxtPX4v2 silkscreen does not. See [wiring.md](wiring.md#gps1). Re-pin the GH housing
   with tweezers if needed; a reversed plug can kill the GPS.
8. Companion UART: GH cable into FC `TEL1`, keep **TX, RX, GND only** on the other end
   (Dupont female, ~15 cm). Leave the 5 V wire disconnected and insulated. Tie it aside.

## 4. Bench power test (20 min — props OFF)

1. **No props.** Plug the battery.
2. Connect the FC USB-C to your PC; QGroundControl should detect it.
3. Measure the XT30 pigtail: it should read battery voltage.
4. After 10 s, touch the ESC and FC: neither should be hot.
5. Unplug the battery.

## 5. Top plate and carrier adapter plate (15 min)

1. Replace the two rear 22 mm standoffs with **M3×30 mm** standoffs so the top plate sits
   level (the frame ships with 30 mm front / 22 mm rear).
2. Fit the top plate with four screws.
3. Place the printed carrier adapter plate on the top plate and bolt it through to the
   standoffs with four M3×8 screws (centre holes; the 30.5 stack holes are a fallback).
4. Fit four 6 mm M2.5 nylon standoffs at the adapter plate corners.

## 6. Companion computer and compute BEC (20 min)

1. Plug the BPI CM5 Pro module into the IO board's board-to-board connectors and
   **fix it with four M2.5 screws** — never rely on the connectors alone.
2. Fit the heatsink on the SoC (airflow in flight is enough; no fan).
3. Mount the IO board on the M2.5 standoffs: **USB ports to the rear, camera connector to
   the front.**
4. Lead the Wi-Fi antenna out and zip-tie it to the adapter plate edge, **≥ 15 mm from
   carbon.**
5. BEC: solder an XT30 male on the input, a DC 5.5×2.1 plug on the output (check the IO
   board jack first). Confirm the output is **12 V** with a multimeter before connecting.
   Stick the BEC beside the ESC; plug its input into the XT30 pigtail.
6. Connect the TEL1 wires to the IO board's 40-pin UART: FC TX → board RX, FC RX → board
   TX, GND → GND. Pin numbers: [wiring.md](wiring.md#tel1--companion-uart).

## 7. Camera and GPS (20 min)

1. Screw the IMX219 board to the TPU camera adapter (M2), push the adapter into the front
   camera cage, set ~20° up-tilt, lock with the cage side screws.
2. Route the 22-pin FPC under the top plate, up through the slot at the front edge of the
   adapter plate, into the IO board CAM connector. Keep a slack loop; tape the FPC to the
   connector.
3. Bolt the GPS mast to the rear of the adapter plate; fit the GPS on top, **arrow to the
   nose.**

## 8. Battery (10 min)

1. Attach the TPU battery tray under the bottom plate (M3 through the 30.5 stack holes, or
   3M tape + zip ties through the plate slots).
2. Stick a 3 mm EVA pad to the bottom of the tray.
3. Run the strap through the tray slots, place the battery, strap tight. XT60 exits to
   the side.
4. Keep the battery connector capped when not in use.

## Final inspection

- [ ] Every screw re-checked by hand.
- [ ] Shake the aircraft: nothing loose, no rattles.
- [ ] Every wire, FPC and antenna tied down and **outside the prop arcs**.
- [ ] Centre of gravity: balanced on two fingers under the stack, within 1 cm fore/aft.
      Nose-heavy → move the battery back.
- [ ] FC USB-C, microSD and boot button reachable without tools.

Then do the software setup (props still off): [px4-firmware-and-params.md](px4-firmware-and-params.md).

## 9. First flight (tethered)

1. Props on: match direction to each motor, convex side up, nuts tight.
2. Tether: Kevlar line from the stack standoffs to a 20 kg weight, with a swivel.
3. **Manual / stabilized:** take off to 1 m, hover 10 s, land. Listen for vibration.
4. **Position mode:** release the sticks. Drift > 1 m means vibration or compass trouble —
   fix before going further (check grommets, props, GPS mast height).
5. Download the `.ulg`, upload to Flight Review, archive the Vibration page.
6. **Offboard:** companion computer commands a position hold; pilot ready to flip back to
   manual at any moment.
7. All three stable → untether and start skill testing.

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| A motor does not spin in the motor test | Cold joint on its three pads; 8-pin stack cable not seated |
| Drifts in position mode | Vibration into the IMU (grommets crushed, damaged prop); compass interference (raise the GPS mast) |
| Companion gets no MAVLink heartbeat | TX/RX swapped; baud mismatch; `MAV_1_CONFIG` not set; UART not enabled in the board's device tree |
| No camera image | FPC reversed (contacts facing the wrong way) or not fully seated; image lacks IMX219 overlay |
| Wi-Fi drops | Antenna touching carbon; antenna next to power leads |
| IO board reboots | BEC current too low (need ≥ 3 A); loose XT30 |
