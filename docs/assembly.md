# Assembly guide — Airframe #1 (as-built revision)

**FlyTwin / FlyAgent · TBS Source One V5.1 · 21 November 2026 · Draft for hardware review**

This guide documents the **physical configuration photographed and described for Airframe #1**. It replaces the outdated assembly arrangement in the original reference guide; it does **not** certify flight readiness or independently validate every dimension. See [interactive 3D assembly viewer](../viewer/index.html) for the nine-stage model and exploded view.

> **Current status:** The MicoAir 50A ESC is below the NxtPX4v2 flight controller. The FC is rigidly attached to an 8-hole printed adapter; silicone washers/spacers exist in the external mounting chain, but effective vibration isolation is **not yet verified**. The ArmSoM CM5/IO assembly is physically fitted. The onboard compute BEC is **not installed**, TEL1 MAVLink is **not verified**, and the upgraded PX4 v1.16.2 has **not yet passed a new real-aircraft flight test**.

![Photographed assembly](../build-log/2026-11-21_airframe1_rebuild/photos/01_airframe_overview.jpg)

*Figure P1 — Airframe #1 with CM5 carrier and front adjustable camera; photograph shows an inspection/handling configuration, not a flight-ready configuration.*

## 1. Scope and components

| Subsystem | Airframe #1 as observed | Source / drawing basis |
| --- | --- | --- |
| Airframe | TBS Source One V5.1, five-inch Quad X | Simplified in viewer |
| Propulsion | 4 × iFlight XING2 2207 1855KV, four Gemfan 51466 props | Photographs; motors/props schematic in viewer |
| Flight stack | MicoAir 50A four-in-one ESC below MicoAir NxtPX4v2 FC | Actual assembly photos |
| FC/ESC adapter | Printed **38 × 38 × 2 mm** plate with **20 × 20** and **30.5 × 30.5 mm** hole patterns | Actual eight-hole STL |
| Upper carrier | Printed **90 × 137 × 3 mm** V3 plate | Actual STL |
| Companion | **ArmSoM CM5 + CM5-IO** on four raised supports | Observed board; external geometry schematic |
| GPS / camera | Holybro Micro M10 GPS on printed mast; IMX219 on adjustable metal hinge | Photographs; GPS mast STL |
| Landing gear | Four printed V7 legs, each nominally 80 mm tall | Actual V7 STL |
| Battery support | Underslung printed battery tray and strap | Actual STL; battery not fixed in model |

The five actual printed STL types are [carrier V3](../mounts/stl/01_carrier_adapter_plate_V3_new.stl), [ESC/FC adapter](../mounts/stl/05_esc_plate_38x38x2_8xM3_R1.stl), [GPS mast V2](../mounts/stl/03_gps_mast_v2_rounded_rect.stl), [battery tray](../mounts/stl/04_battery_tray_TPU_new.stl), and [landing leg V7](../mounts/stl/landing_foot_v7.stl). There are **8 printed-part instances** in total: 1 + 1 + 1 + 1 + 4. Print material and individual fastener length should be recorded from purchased/installed parts; **do not infer material merely from a filename**.

## 2. Center-stack geometry and mounting datums

![Center stack illustration](images/fig01_center_stack.svg)

*Figure 1 — As-built vertical order and four user-measured clearances. Printed plates have their native dimensions; other components and fasteners are schematic.*

All distances below are **measured clear gaps between the named faces**, not total stack height:

| ID | From / to | Measured gap |
| --- | --- | ---: |
| H1 | Carbon-frame mounting face → ESC bottom face | **4.6 mm** |
| H2 | ESC top face → small printed adapter bottom face | **6.0 mm** |
| H3 | Small printed adapter top face → large V3 carrier bottom face | **15.5 mm** |
| H4 | Large V3 carrier top face → CM5-IO underside | **5.8 mm** |

The FC lies **within the H3 space** above the small adapter. The four **outer** through-fasteners continue from the carbon frame, through the ESC/adapter mounting chain, and upward to the large carrier plate. Stand-offs / threaded couplers at the top carry the upper carrier. The four **inner** fasteners independently secure the FC to the printed adapter.

![Adapter hole plan](images/fig02_fc_adapter_holes.svg)

*Figure 2 — Nominal adapter geometry from the supplied eight-hole STL. Outer holes: 30.5 × 30.5 mm. Inner holes: 20 × 20 mm. All eight holes are nominal M3 clearance; check the actual hardware rather than forcing screws.*

**Vibration limitation.** The FC is rigid at its inner mounting points. Silicone washers are used around the ESC and below the adapter, but a continuous metallic fastening route may bypass the elastomer. Do **not** describe this assembly as a verified FC soft-mount. Validate clamp/contact paths before any flight, then examine the PX4 vibration data in the new flight log.

## 3. Assembly sequence

**Safety prerequisite:** Disconnect all batteries. **Remove the four propellers before assembly, soldering, firmware changes, wiring checks or motor tests.** Photograph each step before covering it with the next layer if further reconstruction will be needed.

### Step 1 — Carbon frame, arms and motors

1. Assemble the four carbon arms and central plates as supplied for the Source One V5.1.
2. Install the four XING2 motors with correctly sized screws; verify that no screw touches motor windings.
3. Route three motor leads from each motor to the central ESC; keep wires outside propeller arcs and away from sharp carbon edges.
4. Identify the aircraft **nose** as the end carrying the adjustable camera. Use the same forward reference across photos, viewer and PX4 orientation checks.

![Frame with motor placement](../build-log/2026-11-21_airframe1_rebuild/photos/02_frame_and_motors.jpg)

*Figure P2 — Carbon-frame / motor arrangement with upper carrier temporarily removed.*

### Step 2 — Lower ESC and continuous outer fasteners

1. Insert the four outer mounting screws through the carbon frame at the **30.5 × 30.5 mm** pattern.
2. Position the silicone spacers/washers and lower nut-height spacing as photographed. The measured **frame-to-ESC underside gap is H1 = 4.6 mm**.
3. Place the 50A ESC as the **lower PCB**, with sufficient component and solder-joint clearance.
4. Connect or inspect the already-soldered motor leads and battery power lead. Inspect the power capacitor solder joints and polarity. Do not use the capacitor package as a structural support.
5. Re-check that the full fastener stack does not bend the ESC PCB or compress an exposed electrical component.

**Existing electrical wiring:** The original repository specifies the battery lead, ESC-to-FC harness and polarity checks in [wiring.md](wiring.md). Use that page for signal identities; photographs alone are not a reliable pinout. The XT30/BEC branch is **not evidence that the BEC is installed**.

### Step 3 — Printed 8-hole adapter and NxtPX4v2 FC

1. On the ESC's four outer fasteners, place the observed silicone washers and spacer/nut stack.
2. Seat the **38 × 38 × 2 mm eight-hole printed adapter** using the **outer 30.5 mm holes**. The measured ESC-top-to-adapter-underside gap is **H2 = 6.0 mm**.
3. Mount the NxtPX4v2 FC to the adapter's **inner 20 × 20 mm holes** using the four independent inner screws and nuts. The FC is **rigidly attached** to the adapter; no inner-hole FC grommets have been confirmed.
4. Keep the FC USB-C socket and microSD access clear. Install the matching original ESC-to-FC cable and verify connector orientation against the hardware, not cable colour.
5. Check clearance from the ESC, FC solder joints, all screw ends and the upper carrier supports. Do not allow the adapter or nuts to touch live pads.

![Stack top photograph](../build-log/2026-11-21_airframe1_rebuild/photos/03_flight_stack_top.jpg)

*Figure P3 — FC above the eight-hole adapter; outer mounting chain and inner FC fasteners are visible.*

![ESC stack side photograph](../build-log/2026-11-21_airframe1_rebuild/photos/04_flight_stack_side.jpg)

*Figure P4 — Side view showing FC, printed adapter, ESC and continuous outer mounting screws.*

![ESC lower mount detail](../build-log/2026-11-21_airframe1_rebuild/photos/05_esc_spacing_detail.jpg)

*Figure P5 — Close-up of silicone components, nut-height supports and soldered ESC motor pads. Confirm that the metallic fastener chain does not defeat vibration isolation.*

### Step 4 — Upper through-couplers and V3 carrier

1. Continue the four **outer** fasteners upward using the installed threaded extension couplers.
2. Position the large **90 × 137 × 3 mm** V3 carrier on these four center-stack supports. The adapter-top-to-carrier-underside clearance is **H3 = 15.5 mm**, including the FC space.
3. Fit the upper retaining nuts. Confirm the carrier is level and does not press on the FC, its connectors or the CSI ribbon.
4. The carrier provides mounting points for the CM5-IO board and the GPS mast. Preserve the front cable slot and the board's service access.

![Bare V3 carrier photo](../build-log/2026-11-21_airframe1_rebuild/photos/06_carrier_plate.jpg)

*Figure P6 — V3 carrier shown without the IO board. The internal fastener pattern belongs to the center stack; four outer posts raise the IO board.*

### Step 5 — ArmSoM CM5 and IO board

1. Install the CM5 compute module on the compatible IO carrier and secure it using the board's actual fixing hardware; do not support a module only by its board-to-board connectors.
2. Mount the IO board on **four separate risers** on the V3 plate. The measured carrier-top-to-IO-underside clearance is **H4 = 5.8 mm**.
3. Confirm access to the IO board's USB, Ethernet, DC input and CSI connectors.
4. Leave enough free length for the camera FPC through the carrier slot. Keep cables clear of props and screw ends.
5. The **onboard 12 V BEC is not installed**. Do not label the compute board as operational from flight-battery power until a separate loaded power test is completed.

![Upper plan illustration](images/fig03_upper_layout.svg)

*Figure 3 — Simplified upper-carrier layout. The printed V3 geometry is authoritative for its outline/holes; schematic electronic-board outlines do not constitute fabrication data.*

![Photograph of CM5 assembly](../build-log/2026-11-21_airframe1_rebuild/photos/07_upper_compute.jpg)

*Figure P7 — ArmSoM CM5/IO installed above the V3 carrier; camera FPC shown being handled.*

### Step 6 — Rear GPS mast and GPS module

1. Fix the actual **35 mm tall printed GPS mast V2** to the rear mounting area of the V3 carrier.
2. Attach the Holybro Micro M10 module to the mast platform; preserve the forward arrow direction.
3. Route the GPS cable to the flight-controller GPS connector without tension or contact with motor wires.
4. Use the actual verified cable re-pinning, **not** an assumed connector pin order. The original [wiring guide](wiring.md#gps1) notes a mismatch between GPS and flight-controller cable pin arrangements.

### Step 7 — Adjustable forward camera

1. Fix the **metal tilting hinge bracket** at the front carbon-plate extension using the observed screws/standoffs.
2. Fasten the IMX219 camera board to the bracket using the two white printed spacing sleeves and through-screws.
3. Adjust the pitch angle so the lens has a forward view without the frame or props obstructing it; verify lock-nut tightness.
4. Route the CSI FPC with a smooth bend and strain relief to the CM5-IO camera connector. Do not twist, pinch or sharply crease the ribbon.

![Adjustable camera hinge photo](../build-log/2026-11-21_airframe1_rebuild/photos/08_camera_bracket.jpg)

*Figure P8 — Adjustable hinge, white spacing sleeves and camera board; the tilt setting is adjustable, not a fixed 20-degree CAD datum.*

### Step 8 — Underslung battery tray and four V7 legs

1. Fit the actual printed **45 × 81.5 × 15 mm** battery tray beneath the central frame using the existing mounting hardware and battery strap.
2. Inspect the strap routing and clearance to motor wires, camera bracket and the ground.
3. Attach four V7 landing legs under the motor arms, keeping the supplied motor hole pattern and ensuring that mounting screws cannot reach motor windings.
4. Confirm all four feet are firmly seated and the aircraft rests without rocking. Validate printed-part cracking and fatigue separately; STL geometry alone does not prove print strength.
5. The tray is shown **empty** in the current assembly viewer. A LiPo is a removable flight item, not a permanently installed component.

![Underside view](../build-log/2026-11-21_airframe1_rebuild/photos/09_battery_tray_underside.jpg)

*Figure P9 — Underside showing the battery tray, strap, four motor-arm feet and central carbon structure.*

![One landing leg](../build-log/2026-11-21_airframe1_rebuild/photos/10_landing_leg.jpg)

*Figure P10 — Installed V7-style landing leg under a motor arm.*

### Step 9 — Propellers: illustration only

The 3D viewer displays Gemfan propellers to resemble the airframe photos. **Do not install propellers for any of the electrical, firmware, calibration or motor-direction tests above.** Before a future flight, verify the actual PX4 motor map, spin directions, propeller orientation and all applicable operating checks independently.

## 4. Mechanical and electrical checks before powered testing

- [ ] Battery disconnected and **all propellers removed**.
- [ ] Four ESC/FC outer through-fasteners are secured; **the ESC PCB is not acting as a bent load-bearing spacer**.
- [ ] Inner FC screws are secure; their tips and washers clear circuitry.
- [ ] Silicone washers do not bridge to bare solder or power pads; metal paths and vibration coupling have been assessed.
- [ ] Carrier, GPS mast, camera hinge and all four V7 legs are rigidly retained where intended.
- [ ] CM5/IO board is elevated without board flex; connectors, ribbon and antennas have strain relief.
- [ ] No battery/ESC power connector is shorted or reversed; use a multimeter for polarity and continuity checks.
- [ ] Original ESC-to-FC harness and GPS/RC cable pinouts are verified against actual silk-screen markings.
- [ ] BEC remains **not installed**, and TEL1 serial telemetry remains **not verified** in the as-built record.
- [ ] PX4 v1.16.2 output mapping, RC, sensors, GPS, battery measurement and failsafes are checked **with props removed** before planning a controlled reflight.

![Current verification boundary](images/fig04_status_boundary.svg)

*Figure 4 — Actual assembled hardware is separated from unfinished power, UART and flight checks.*

## 5. Repository records and pending acceptance

| Record | Location | Current action |
| --- | --- | --- |
| Physical differences from reference build | [as-built-status.md](as-built-status.md) | Record FC-over-ESC conversion, new carrier/camera mount, unfinished validation |
| Bill of materials | [bom/bom.md](../bom/bom.md) | Replace planning-state components with actually installed versions |
| Printed models | [mounts/stl/](../mounts/stl/) and [mounts/README.md](../mounts/README.md) | Commit the five supplied STL revisions; note as-built quantities and unknown print material |
| Photos and assembly notes | [build-log](../build-log/2026-11-21_airframe1_rebuild/notes.md) | File dated photos, H1-H4, and the mechanical fastening chain |
| PX4 parameters | [params/](../params/) | Export a **new** file after revalidation; never overwrite old baseline |
| Flight logs | Separate data repository, **not this hardware repo** | Archive the new `.ulg` only after a real flight |
| TEL1 / 12 V BEC | [wiring.md](wiring.md) | Add **measured** UART pin/device/baud and BEC results once verified |

**Open acceptance items:** (1) verify effective vibration isolation / mechanical loading, (2) complete PX4 v1.16.2 props-off revalidation and controlled reflight, (3) install and validate flight-battery-to-CM5 power, and (4) demonstrate bidirectional PX4 TEL1/MAVLink telemetry on the actual companion computer.

---

**Documentation scope:** The structure above is based on user-provided photos, measurements H1-H4 and five actual STL files, plus the repository's original assembly instructions. Simplified drawings and viewer geometry are **not** machining drawings, installation torque references or evidence of flight certification. Recheck connector pinouts and motor direction on the physical hardware before use.