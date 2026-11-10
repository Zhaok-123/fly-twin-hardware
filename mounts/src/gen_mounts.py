"""
FlyAgent stage-1 Route B printed-part generator (frame: TBS Source One V5.1, 5-inch).
Usage: python3 gen_mounts.py   -> writes 4 STL files to ./stl/
Every dimension that may need adjusting to the real parts is in the parameter block
below; edit and re-run.
Units: mm. Axes: X left/right, Y fore/aft (+Y = nose), Z up/down.
"""
import trimesh, numpy as np, os
from trimesh.creation import box, cylinder

# ===================== Parameters (measure the real parts) =====================
# --- 1. Carrier adapter plate ---
PLATE_W, PLATE_L, PLATE_T = 130.0, 90.0, 3.0      # width (left/right), length (fore/aft), thickness
CM5IO_HOLE_DX, CM5IO_HOLE_DY = 93.0, 73.0          # IO-board mounting hole spacing (verify; official DXF)
CM5IO_HOLE_D = 2.8                                  # M2.5 clearance
FRAME_STACK = 30.5                                  # top-plate 30.5x30.5 stack holes (M3)
FRAME_STANDOFF_DY, FRAME_STANDOFF_DX = 62.0, 30.0   # Source One V5 top-plate standoff screws: fore/aft and lateral spacing (verify)
FRAME_HOLE_D = 3.3                                  # M3 clearance
FPC_SLOT_W, FPC_SLOT_L, FPC_SLOT_Y = 18.0, 4.0, 40.0  # front FPC slot: width, length, fore/aft offset from centre
GPS_MAST_HOLE_DX, GPS_MAST_Y = 15.0, -38.0          # rear GPS mast: hole spacing, fore/aft position
LIGHTEN = True                                      # add lightening cut-outs

# --- 2. Camera adapter (TPU) ---
CAM_BOARD_HOLE_DX, CAM_BOARD_HOLE_DY = 21.0, 12.5   # IMX219 board hole spacing (Raspberry Pi v2 standard)
CAM_BOARD_HOLE_D = 2.0                              # M2 self-tapping
CAM_FACE_W, CAM_FACE_H, CAM_FACE_T = 27.0, 26.0, 2.0
CAM_BLOCK_W, CAM_BLOCK_H, CAM_BLOCK_D = 19.0, 20.0, 7.0  # block that fits the camera cage: width = cage inner width (19 or 20, verify)
CAM_CAGE_HOLE_D = 2.2                               # cage side M2 screw clearance
CAM_FPC_RECESS_W, CAM_FPC_RECESS_H = 18.0, 4.0      # rear recess for the FPC connector

# --- 3. GPS mast ---
MAST_BASE, MAST_BASE_T = 24.0, 3.0
MAST_D, MAST_H = 8.0, 30.0
MAST_TOP_D, MAST_TOP_T = 32.0, 2.0
MAST_HOLE_DX = GPS_MAST_HOLE_DX

# --- 4. Battery tray (TPU) ---
BATT_W, BATT_L, BATT_H = 36.0, 76.0, 32.0           # battery envelope (Tattu 4S 1550 ~35x75x31, verify)
TRAY_WALL, TRAY_FLOOR, TRAY_SIDE_H = 2.5, 3.0, 12.0
TRAY_CLEAR = 1.0                                    # clearance per side
STRAP_SLOT_W, STRAP_SLOT_L, STRAP_Y = 22.0, 3.5, 0.0  # strap slots: strap width, slot width, fore/aft position
TRAY_MOUNT = FRAME_STACK                            # tray bolts to the bottom-plate stack holes (M3)
# ============================================================================

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stl")
os.makedirs(OUT, exist_ok=True)

def B(w, l, h, x=0, y=0, z=0):
    m = box(extents=(w, l, h)); m.apply_translation((x, y, z)); return m

def C(d, h, x=0, y=0, z=0, axis="z"):
    m = cylinder(radius=d/2, height=h, sections=48)
    if axis == "x": m.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2, (0, 1, 0)))
    if axis == "y": m.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2, (1, 0, 0)))
    m.apply_translation((x, y, z)); return m

def diff(a, cutters):
    return trimesh.boolean.difference([a] + cutters, engine="manifold")

def save(m, name):
    m = m.process(validate=True)
    m.export(os.path.join(OUT, name))
    print(f"{name:32s} watertight={m.is_watertight}  bbox={np.round(m.extents,1)}  vol={m.volume/1000:.1f} cm3")

# ---------- 1. Carrier adapter plate ----------
p = B(PLATE_W, PLATE_L, PLATE_T)
cut = []
for sx in (1, -1):
    for sy in (1, -1):
        cut.append(C(CM5IO_HOLE_D, 10, sx*CM5IO_HOLE_DX/2, sy*CM5IO_HOLE_DY/2))
        cut.append(C(FRAME_HOLE_D, 10, sx*FRAME_STACK/2, sy*FRAME_STACK/2))
        cut.append(C(FRAME_HOLE_D, 10, sx*FRAME_STANDOFF_DX/2, sy*FRAME_STANDOFF_DY/2))
cut.append(B(FPC_SLOT_W, FPC_SLOT_L, 10, 0, FPC_SLOT_Y))
for sx in (1, -1):
    cut.append(C(FRAME_HOLE_D, 10, sx*GPS_MAST_HOLE_DX/2, GPS_MAST_Y))
if LIGHTEN:
    for sx in (1, -1):
        cut.append(B(22, 26, 10, sx*46, 12))
        cut.append(B(22, 18, 10, sx*46, -18))
plate = diff(p, cut)
save(plate, "01_carrier_adapter_plate.stl")

# ---------- 2. Camera adapter ----------
face = B(CAM_FACE_W, CAM_FACE_T, CAM_FACE_H)                        # front face, normal +Y
blk = B(CAM_BLOCK_W, CAM_BLOCK_D, CAM_BLOCK_H, 0, -CAM_FACE_T/2 - CAM_BLOCK_D/2, 0)
cam = trimesh.boolean.union([face, blk], engine="manifold")
cut = []
for sx in (1, -1):
    for sz in (1, -1):
        cut.append(C(CAM_BOARD_HOLE_D, 8, sx*CAM_BOARD_HOLE_DX/2, 0, sz*CAM_BOARD_HOLE_DY/2, axis="y"))
cut.append(C(CAM_CAGE_HOLE_D, CAM_BLOCK_W + 4, 0, -CAM_FACE_T/2 - CAM_BLOCK_D/2, 0, axis="x"))  # cage side screw
cut.append(B(CAM_FPC_RECESS_W, 3.0, CAM_FPC_RECESS_H, 0, -CAM_FACE_T/2 - 1.5 + 0.01, -CAM_FACE_H/2 + CAM_FPC_RECESS_H/2))  # FPC connector recess
cut.append(B(12, 3.0, CAM_FACE_H, 0, -CAM_FACE_T/2 - 1.5, -CAM_FACE_H/2 - 2))                 # FPC exit downward
cam = diff(cam, cut)
save(cam, "02_camera_adapter_TPU.stl")

# ---------- 3. GPS mast ----------
base = B(MAST_BASE, MAST_BASE, MAST_BASE_T, 0, 0, MAST_BASE_T/2)
col = C(MAST_D, MAST_H, 0, 0, MAST_BASE_T + MAST_H/2)
top = C(MAST_TOP_D, MAST_TOP_T, 0, 0, MAST_BASE_T + MAST_H + MAST_TOP_T/2)
mast = trimesh.boolean.union([base, col, top], engine="manifold")
cut = [C(FRAME_HOLE_D, 10, sx*MAST_HOLE_DX/2, 0, 0) for sx in (1, -1)]
for a in (0, np.pi/2):                                              # zip-tie slots in the top disc
    for s in (1, -1):
        cut.append(B(3, 8, 10, s*11*np.cos(a), s*11*np.sin(a), MAST_BASE_T + MAST_H + 1))
mast = diff(mast, cut)
save(mast, "03_gps_mast.stl")

# ---------- 4. Battery tray ----------
iw, il = BATT_W + 2*TRAY_CLEAR, BATT_L + 2*TRAY_CLEAR
ow, ol = iw + 2*TRAY_WALL, il + 2*TRAY_WALL
oh = TRAY_FLOOR + TRAY_SIDE_H
outer = B(ow, ol, oh, 0, 0, oh/2)
inner = B(iw, il, TRAY_SIDE_H + 1, 0, 0, TRAY_FLOOR + (TRAY_SIDE_H + 1)/2)
tray = diff(outer, [inner])
cut = []
for sx in (1, -1):                                                  # strap slots through walls and floor
    cut.append(B(ow + 2, STRAP_SLOT_L, TRAY_SIDE_H, 0, STRAP_Y + sx*STRAP_SLOT_W/2, TRAY_FLOOR + TRAY_SIDE_H/2 + 0.5))
for sx in (1, -1):
    for sy in (1, -1):
        cut.append(C(FRAME_HOLE_D, 10, sx*TRAY_MOUNT/2, sy*TRAY_MOUNT/2, TRAY_FLOOR/2))
cut.append(B(22, 22, 10, 0, 0, 0))                                  # floor lightening cut-out (clear of the four holes)
tray = diff(tray, cut)
save(tray, "04_battery_tray_TPU.stl")
