# Airframe #1 — 2026-11-21 rebuild (as-built documentation)

The photographs record the flight-controller-over-ESC conversion and the current upper carrier, camera mount, landing legs, GPS mast and underslung battery tray. Some frames were taken with the CM5 board temporarily removed for inspection. No powered operation is implied by the photographs.

## Measurements

- H1: frame mounting surface to ESC lower surface = **4.6 mm**
- H2: ESC upper surface to small FC/ESC adapter lower surface = **6.0 mm**
- H3: small adapter upper surface to large carrier lower surface = **15.5 mm**
- H4: carrier upper surface to CM5-IO lower surface = **5.8 mm**

## Observed / described mechanical changes

- A printed **38 × 38 × 2 mm** adapter has 30.5 × 30.5 mm outer and 20 × 20 mm inner fastener patterns.
- Four outer screws extend continuously upward from the carbon frame, carrying the ESC, printed adapter and upper carrier through spacers and couplers.
- NxtPX4v2 FC mounts rigidly to the adapter's four inner holes. Silicone washers are present elsewhere in the mounting chain, but FC vibration isolation is unverified.
- An ArmSoM CM5 + CM5-IO board sits on four short risers over the 90 × 137 × 3 mm printed V3 carrier.
- An adjustable metal hinge mounts the forward IMX219 camera. GPS remains on a printed mast; battery tray is underslung; four V7 landing legs are installed.
- Flight-battery-to-CM5 BEC is **not installed**. TEL1 MAVLink is **not validated**. Official PX4 v1.16.2 has been flashed but has not passed a new Airframe #1 reflight.

See [docs/assembly.md](../../docs/assembly.md) for the complete review draft and photos in `photos/`.