(function (root) {
  'use strict';


  root.createAssemblyParts = function (THREE, stlGeometries) {
    const M = {
      carbon: new THREE.MeshStandardMaterial({ color: 0x202326, roughness: 0.55, metalness: 0.35 }),
      pcb: new THREE.MeshStandardMaterial({ color: 0x2e6b4f, roughness: 0.6, metalness: 0.1 }),
      pcbDark: new THREE.MeshStandardMaterial({ color: 0x1f4b36, roughness: 0.6 }),
      copper: new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.4, metalness: 0.6 }),
      alu: new THREE.MeshStandardMaterial({ color: 0x9aa3aa, roughness: 0.35, metalness: 0.7 }),
      print: new THREE.MeshStandardMaterial({ color: 0xebebe7, roughness: 0.8, side: THREE.DoubleSide }),
      tpu: new THREE.MeshStandardMaterial({ color: 0xd7d5d0, roughness: 0.9, side: THREE.DoubleSide }),
      rubber: new THREE.MeshStandardMaterial({ color: 0x6d7073, roughness: 0.9 }),
      black: new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.7 }),
      batt: new THREE.MeshStandardMaterial({ color: 0x6f7f8c, roughness: 0.7 }),
      chip: new THREE.MeshStandardMaterial({ color: 0x101214, roughness: 0.4, metalness: 0.3 }),
      prop: new THREE.MeshStandardMaterial({ color: 0x26c7c7, roughness: 0.48, transparent: true, opacity: 0.84, side: THREE.DoubleSide }),
      lens: new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.2, metalness: 0.5 }),
      white: new THREE.MeshStandardMaterial({ color: 0xeaeae6, roughness: 0.7 }),
      wire: new THREE.MeshStandardMaterial({ color: 0xb8332a, roughness: 0.7 })
    };
    const parts = [];
    const corners = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    // 270 mm is the distance between opposite outer arm-end vertices. The 16 mm
    // arm width adds 16 mm perpendicular to the motor-center diagonal.
    const armWidth = 16;
    const armOuterDiagonal = 270;
    const motorDiagonal = Math.sqrt(armOuterDiagonal ** 2 - armWidth ** 2);
    const armEnd = motorDiagonal / (2 * Math.SQRT2);
    const footprint = [[-armEnd, armEnd], [armEnd, armEnd], [-armEnd, -armEnd], [armEnd, -armEnd]];
    const motorInset = 8 / Math.SQRT2;
    const motorPoints = footprint.map(function (point) {
      return [point[0] - Math.sign(point[0]) * motorInset, point[1] - Math.sign(point[1]) * motorInset];
    });
    // Y=0 is the upper face of the frame arms. The ESC sits on a 2.5 mm nut
    // and 1.5 mm washer; the actual carrier is positioned from the 40 mm rods.
    const Z = { frame: 0, escBottom: 4, escTop: 7, adapterBottom: 16.6, adapterTop: 18.1,
      trayTop: -6.5, trayBottom: -9.5, carrierBottom: 31.5, carrierTop: 34.5, ioBottom: 41.5 };
    const IO_HOLES = [[-35.5, 40], [22.576, 40.132], [-35.5, -46], [22.5, -46]];
    // Center the schematic board on the extents of the retained V3 hole coordinates.
    const IO_BOARD_CENTER = [-6.462, -2.934];

    function add(id, name, step, desc, explode, build, metadata) {
      const group = new THREE.Group();
      group.name = id;
      group.userData = { id: id, name: name, step: step, desc: desc };
      build(group);
      const item = {
        id: id, name: name, step: step, desc: desc, group: group,
        explode: new THREE.Vector3(explode[0], explode[1], explode[2]),
        base: group.position.clone()
      };
      if (metadata) Object.assign(item, metadata);
      parts.push(item);
      return group;
    }
    function box(g, w, h, d, mat, x, y, z, ry) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat.clone());
      mesh.position.set(x || 0, y || 0, z || 0);
      mesh.rotation.y = ry || 0;
      g.add(mesh);
      return mesh;
    }
    function cyl(g, r, h, mat, x, y, z, seg) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 28), mat.clone());
      mesh.position.set(x || 0, y || 0, z || 0);
      g.add(mesh);
      return mesh;
    }
    function rod(g, x, z, low, high, r, mat) {
      return cyl(g, r || 1.5, high - low, mat || M.alu, x, (low + high) / 2, z, 12);
    }
    function beam(g, x1, z1, x2, z2, y, width, thick, mat) {
      const dx = x2 - x1, dz = z2 - z1;
      const mesh = box(g, width, thick, Math.hypot(dx, dz), mat, (x1 + x2) / 2, y, (z1 + z2) / 2);
      mesh.rotation.y = Math.atan2(dx, dz);
      return mesh;
    }
    function addArc(path, cx, cz, radius, start, end, segments) {
      for (let i = 1; i <= segments; i++) {
        const angle = start + (end - start) * i / segments;
        path.lineTo(cx + radius * Math.cos(angle), cz + radius * Math.sin(angle));
      }
    }
    function addFrameExtrusion(g, shape, thickness, centerY, mat) {
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 24 });
      geometry.translate(0, 0, -thickness / 2);
      geometry.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geometry, mat.clone());
      mesh.position.y = centerY;
      g.add(mesh);
      return mesh;
    }
    function framePlate(g, length, thickness, centerY, mat) {
      const halfWidth = 15, halfLength = length / 2, radius = 2.05, centerOffset = 0.25;
      const dz = Math.sqrt(radius * radius - centerOffset * centerOffset);
      const notchCenters = [-15.25, 15.25];
      const shape = new THREE.Shape();
      shape.moveTo(-halfWidth, -halfLength);
      shape.lineTo(halfWidth, -halfLength);
      for (const center of notchCenters) {
        shape.lineTo(halfWidth, center - dz);
        addArc(shape, 15.25, center, radius, -Math.PI / 2 - Math.asin(centerOffset / radius),
          Math.PI / 2 + Math.asin(centerOffset / radius) - Math.PI * 2, 18);
      }
      shape.lineTo(halfWidth, halfLength);
      shape.lineTo(-halfWidth, halfLength);
      for (const center of notchCenters.slice().reverse()) {
        shape.lineTo(-halfWidth, center + dz);
        addArc(shape, -15.25, center, radius, Math.PI / 2 - Math.asin(centerOffset / radius),
          -Math.PI / 2 + Math.asin(centerOffset / radius), 18);
      }
      shape.lineTo(-halfWidth, -halfLength);
      shape.closePath();
      for (const x of [-10, 10]) for (const z of [-10, 10]) {
        const hole = new THREE.Path();
        hole.absarc(x, z, 1.65, 0, Math.PI * 2, true);
        shape.holes.push(hole);
      }
      return addFrameExtrusion(g, shape, thickness, centerY, mat);
    }
    function frameArm(g, x1, z1, x2, z2, width, thickness, centerY, mat, motorHoles) {
      const dx = x2 - x1, dz = z2 - z1, length = Math.hypot(dx, dz);
      const ux = dx / length, uz = dz / length, px = uz, pz = -ux, halfWidth = width / 2;
      const shape = new THREE.Shape();
      shape.moveTo(x1 + px * halfWidth, z1 + pz * halfWidth);
      shape.lineTo(x2 + px * halfWidth, z2 + pz * halfWidth);
      shape.lineTo(x2 - px * halfWidth, z2 - pz * halfWidth);
      shape.lineTo(x1 - px * halfWidth, z1 - pz * halfWidth);
      shape.lineTo(x1 - px * 1.65, z1 - pz * 1.65);
      for (let i = 1; i <= 24; i++) {
        const angle = Math.PI - Math.PI * i / 24;
        shape.lineTo(x1 + 1.65 * (px * Math.cos(angle) + ux * Math.sin(angle)),
          z1 + 1.65 * (pz * Math.cos(angle) + uz * Math.sin(angle)));
      }
      shape.lineTo(x1 + px * halfWidth, z1 + pz * halfWidth);
      shape.closePath();
      const hole = new THREE.Path();
      hole.absarc(Math.sign(x1) * 15.25, Math.sign(z1) * 15.25, 2.05, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      for (const point of motorHoles || []) {
        const motorHole = new THREE.Path();
        motorHole.absarc(point[0], point[1], 1.6, 0, Math.PI * 2, true);
        shape.holes.push(motorHole);
      }
      return addFrameExtrusion(g, shape, thickness, centerY, mat);
    }
    function pivotCyl(g, r, len, mat, x, y, z, axis) {
      const mesh = cyl(g, r, len, mat, x, y, z, 24);
      if (axis === 'x') mesh.rotation.z = Math.PI / 2;
      else if (axis === 'z') mesh.rotation.x = Math.PI / 2;
      return mesh;
    }
    function printed(g, file, material, x, y, z, orientation) {
      const sourceGeometry = stlGeometries && stlGeometries[file];
      if (!sourceGeometry) throw new Error('Missing loaded STL geometry: ' + file);
      const geometry = sourceGeometry.clone();
      if (orientation === 'horizontal') {
        // Native +Y (nose) becomes Three.js +Z; native +Z becomes Three.js -Y.
        geometry.rotateX(Math.PI / 2);
      } else if (orientation === 'upright') {
        geometry.rotateX(-Math.PI / 2);
        geometry.rotateY(Math.PI);
      } else if (orientation === 'tray') {
        geometry.rotateX(-Math.PI / 2);
      }
      const host = new THREE.Group();
      host.position.set(x, y, z);
      const mesh = new THREE.Mesh(geometry, material.clone());
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      host.add(mesh);
      g.add(host);
      return host;
    }
    function id2(prefix, i) { return prefix + '-' + String(i + 1).padStart(2, '0'); }
    function locLabel(i) { return ['front-left', 'front-right', 'rear-left', 'rear-right'][i]; }

    const frameDesc = 'Simplified Source One V5.1 Quad X frame illustration. The diagonal across the outer arm tips is 270 mm; the motors and actual V7 feet are moved 8 mm inward along each arm. Each arm has two Ø3.2 mm mounting holes on the outward side of the foot base. The edge margin is approximately 0.74 mm; this is illustrative and must be checked against the physical parts. The lower plate is 167 × 30 mm and the estimated upper plate is approximately 110 × 30 mm. The 30.5 × 30.5 mm outer holes extend 0.25 mm beyond the 30 mm plate width and are shown as open-edge notches. Measure the physical frame to confirm its details.';
    add('frame-carbon-lower-plate', 'Source One V5.1 lower carbon plate', 1, frameDesc, [0, 0, 0], function (g) {
      framePlate(g, 167, 3, -5, M.carbon);
    }, { material: 'Carbon fiber (schematic)' });
    add('frame-carbon-upper-plate', 'Source One V5.1 upper carbon plate', 1, frameDesc, [0, 0, 0], function (g) {
      framePlate(g, 110, 2.5, -1.5, M.carbon);
    }, { material: 'Carbon fiber (schematic)' });
    for (let i = 0; i < footprint.length; i++) {
      const x = footprint[i][0], z = footprint[i][1];
      const motorX = motorPoints[i][0], motorZ = motorPoints[i][1];
      const motorHoles = [[motorX + Math.sign(x) * 8, motorZ], [motorX, motorZ + Math.sign(z) * 8]];
      add(id2('frame-carbon-arm', i), 'Source One V5.1 carbon arm ' + (i + 1) + ' (' + locLabel(i) + ')', 1,
        frameDesc, [0, 0, 0], function (g) {
          frameArm(g, Math.sign(x) * 10, Math.sign(z) * 10, x, z, armWidth, 6, -3, M.carbon, motorHoles);
        }, { material: 'Carbon fiber (schematic)' });
    }
    const motorDesc = 'Illustrative XING2 2207 1855KV motor. The bottom of the base is at Y=0 and sits against the top of the arm; the motor center is shifted 8 mm inward along the arm. The motor body, base, and shaft are approximate shapes.';
    for (let i = 0; i < motorPoints.length; i++) {
      const x = motorPoints[i][0], z = motorPoints[i][1];
      add(id2('motor', i), 'XING2 2207 1855KV motor ' + (i + 1) + ' (' + locLabel(i) + ')', 2,
        motorDesc, [0, 0, 0], function (g) {
          cyl(g, 14, 19, M.copper, x, 13.5, z);
          cyl(g, 15, 4, M.black, x, 2, z);
          cyl(g, 2.5, 6, M.alu, x, 21, z);
        }, { material: 'Copper, aluminum and black anodized finish (schematic)' });
    }

    const escDesc = 'Illustrative MicoAir 50A ESC board, 3 mm thick, with through-holes on both the 30.5 × 30.5 mm outer pattern and the 20 × 20 mm inner pattern. Four M3×40 long screws support the outer mounting points. Above the arms, each mounting point has an M3 nut (2.5 mm thick) and an M3 silicone washer, followed by the ESC. The rear edge faces -Z. The illustrative board bottom is at Y=4 mm. The power lead and capacitor are illustrative only; threads are not modeled.';
    add('esc-pcb', 'MicoAir 50A ESC lower PCB', 5, escDesc, [0, 14, 0], function (g) {
      const shape = new THREE.Shape();
      shape.moveTo(-22, -21.75);
      shape.lineTo(22, -21.75);
      shape.lineTo(22, 21.75);
      shape.lineTo(-22, 21.75);
      shape.closePath();
      for (const [offset, radius] of [[15.25, 2], [10, 1.5]]) {
        for (const x of [-offset, offset]) for (const z of [-offset, offset]) {
          const hole = new THREE.Path();
          hole.absarc(x, z, radius, 0, Math.PI * 2, true);
          shape.holes.push(hole);
        }
      }
      addFrameExtrusion(g, shape, 3, (Z.escBottom + Z.escTop) / 2, M.pcbDark);
    }, { material: 'PCB (schematic)' });
    let fet = 0;
    for (const [x, z] of [[-12, 0], [12, 0], [0, -12], [0, 12]]) {
      fet++;
      add(id2('esc-chip', fet - 1), 'ESC power device ' + fet, 5,
        'Schematic power device on the lower ESC PCB.', [0, 14, 0], function (g) {
          box(g, 5, 2, 5, M.chip, x, Z.escTop + 1, z);
        }, { material: 'Black electronic package (schematic)' });
    }
    let terminal = 0;
    for (const side of [-1, 1]) for (let i = -2; i <= 2; i++) {
      const x = side * 16.8, z = i * 5;
      terminal++;
      add(id2('esc-terminal', terminal - 1), 'ESC terminal pad ' + terminal, 5,
        'Schematic copper terminal pad along the ESC edge.', [0, 14, 0], function (g) {
          box(g, 4, 1.6, 2.5, M.copper, x, Z.escTop + 0.4, z);
        }, { material: 'Copper (schematic)' });
    }
    add('esc-power-lead', 'ESC power lead', 5,
      'Approximate lead placement only; this is not an electrical wiring map.', [0, 14, 0], function (g) {
        box(g, 5, 5, 36, M.wire, -4, 6, -36);
      }, { material: 'Insulated wire (schematic)' });
    add('esc-capacitor', 'ESC low-ESR capacitor', 5,
      'Schematic low-ESR capacitor attached near the rear edge of the ESC.', [0, 14, 0], function (g) {
        const mesh = cyl(g, 5.5, 19, M.batt, 4, 13, -28);
        mesh.rotation.x = Math.PI / 2;
      }, { material: 'Capacitor can (schematic)' });

    add('esc-fc-adapter', 'Actual 40 × 40 × 1.5 mm FC/ESC adapter (8 holes)', 8,
      'Actual 05_esc_plate_40x40x1p5_R1 STL; its original geometry and hole positions are preserved. The bottom is at Y=16.6 mm and the top at Y=18.1 mm. The four outer holes hold silicone vibration-damping grommets with Ø4 × 1.5 mm waists; the four inner holes align with the flight-controller M3×12 screws.',
      [0, 48, 0], function (g) {
        printed(g, '05_esc_plate_40x40x1p5_outer4p1_R1.stl', M.print, 0, Z.adapterTop, 0, 'horizontal');
      }, { file: '05_esc_plate_40x40x1p5_outer4p1_R1.stl', material: 'Printed material not verified' });

    const boardY = Z.adapterTop + 4.7;
    add('flight-controller-pcb', 'MicoAir NxtPX4v2 flight controller PCB', 8,
      'Illustrative MicoAir NxtPX4v2 flight-controller board, 32 × 27 × 2 mm, with four Ø3 mm holes on a centered 20 × 20 mm square. The board bottom is at Y=21.8 mm, 3.7 mm above the adapter plate top at Y=18.1 mm. Four M3×12 screws pass down from above; four M3 washers sit on the board and four M3 nuts, 2.5 mm thick, sit below the adapter plate.',
      [0, 65, 0], function (g) {
        const outline = new THREE.Shape();
        outline.moveTo(-16, -13.5);
        outline.lineTo(16, -13.5);
        outline.lineTo(16, 13.5);
        outline.lineTo(-16, 13.5);
        outline.closePath();
        for (const x of [-10, 10]) for (const z of [-10, 10]) {
          const hole = new THREE.Path();
          hole.absarc(x, z, 1.5, 0, Math.PI * 2, true);
          outline.holes.push(hole);
        }
        addFrameExtrusion(g, outline, 2, boardY, M.pcb);
      }, { material: 'PCB (schematic)' });
    add('flight-controller-chip', 'Flight controller main chip', 8,
      'Schematic main chip package on the NxtPX4v2 board.', [0, 65, 0], function (g) {
        box(g, 12, 1.8, 13, M.chip, 0, boardY + 1.8, 0);
      }, { material: 'Black electronic package (schematic)' });
    add('flight-controller-usb', 'Flight controller USB-C port', 8,
      'Schematic USB-C port on the board’s -X edge; its position and orientation are illustrative.', [0, 65, 0], function (g) {
        box(g, 4, 2.5, 8, M.alu, -14, boardY + 1.25, 0);
      }, { material: 'Aluminum (schematic)' });
    add('flight-controller-connector', 'Flight controller connector', 8,
      'Schematic black connector on the board’s +X edge; its position and orientation are illustrative.', [0, 65, 0], function (g) {
        box(g, 4, 1.5, 8, M.black, 14, boardY + 1.5, 0);
      }, { material: 'Black polymer (schematic)' });
    add('flight-controller-direction-mark', 'Flight controller forward marker (+Z)', 8,
      'The white arrow marks the flight controller’s forward direction (+Z), aligned with the front of the frame.', [0, 65, 0], function (g) {
        const arrow = new THREE.Shape();
        arrow.moveTo(0, -5); arrow.lineTo(-3, 2); arrow.lineTo(-1, 2); arrow.lineTo(-1, 7);
        arrow.lineTo(1, 7); arrow.lineTo(1, 2); arrow.lineTo(3, 2); arrow.closePath();
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(arrow), M.white.clone());
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, boardY + 2.72, 0);
        g.add(mesh);
      }, { material: 'White marking (schematic)' });
    add('carrier-plate-v3', 'Actual 90 × 137 × 3 mm carrier plate (V3)', 10,
      'Actual V3 carrier-plate STL; its original geometry, origin, and hole positions are preserved. The bottom is at Y=31.5 mm and the top at Y=34.5 mm, resting on four M3 single-ended hex standoffs of equal height. The cable opening faces forward (+Z), and the GPS mounting holes face rearward (-Z).',
      [0, 102, 0], function (g) {
        printed(g, '01_carrier_adapter_plate_V3.stl', M.print, 0, (Z.carrierBottom + Z.carrierTop) / 2, 0, 'horizontal');
      }, { file: '01_carrier_adapter_plate_V3.stl', material: 'Printed material not verified' });

    const ioDesc = 'The ArmSoM CM5-IO baseboard and Banana Pi BPI-CM5 Pro compute module are illustrative; purchase the physical components separately. The IO board uses the four existing V3 carrier-plate hole coordinates. First, four M2.5×16 screws pass up from below to secure four 6 mm-high M2.5 hex standoffs. Place the IO board on the standoffs and secure it with four thin nuts. The four M2 washers are shown elastically expanded to 2.5 mm inner diameter while retaining their 5 mm outer diameter.';
    add('io-carrier-outline', 'ArmSoM CM5 IO main board', 12,
      'Illustrative 80 × 100 mm ArmSoM CM5 IO board, with four Ø3.3 mm mounting holes aligned to the V3 carrier plate using the original IO_HOLES world coordinates. The board bottom is at Y=41.5 mm.', [0, 145, 0], function (g) {
        g.position.set(IO_BOARD_CENTER[0], 0, IO_BOARD_CENTER[1]);
        const outline = new THREE.Shape();
        outline.moveTo(-40, -50); outline.lineTo(40, -50); outline.lineTo(40, 50); outline.lineTo(-40, 50); outline.closePath();
        for (const [x, z] of IO_HOLES) {
          const hole = new THREE.Path();
          hole.absarc(x - IO_BOARD_CENTER[0], IO_BOARD_CENTER[1] - z, 1.65, 0, Math.PI * 2, true);
          outline.holes.push(hole);
        }
        const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(outline, { depth: 2, bevelEnabled: false, curveSegments: 24 }), M.black.clone());
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = Z.ioBottom;
        g.add(mesh);
      }, { material: 'Black polymer (schematic)' });
    add('cm5-io-pcb', 'Banana Pi BPI-CM5 Pro compute module PCB', 12, ioDesc, [0, 145, 0], function (g) {
      g.rotation.y = Math.PI / 2;
      g.position.set(IO_BOARD_CENTER[0], 0, IO_BOARD_CENTER[1]);
      box(g, 50, 2.5, 40, M.pcb, 0, Z.ioBottom + 3.5, 2);
    }, { material: 'PCB (schematic)' });
    add('cm5-soc', 'BPI-CM5 Pro system module', 12,
      'Schematic system module package on the ArmSoM CM5 IO board.', [0, 145, 0], function (g) {
        g.rotation.y = Math.PI / 2;
        g.position.set(IO_BOARD_CENTER[0], 0, IO_BOARD_CENTER[1]);
        box(g, 24, 1.5, 24, M.chip, 0, Z.ioBottom + 5.5, 2);
      }, { material: 'Black electronic package (schematic)' });
    for (let i = 0; i < 3; i++) {
      const localX = [-24, 0, 24][i];
      add(id2('io-port', i), 'CM5 IO metal port ' + (i + 1), 12,
        'One of three schematic metal ports along the aircraft left side.', [0, 145, 0], function (g) {
          g.rotation.y = Math.PI / 2;
          g.position.set(IO_BOARD_CENTER[0], 0, IO_BOARD_CENTER[1]);
          box(g, 15, 10, 14, M.alu, -localX, Z.ioBottom + 7, 40);
        }, { material: 'Aluminum (schematic)' });
    }
    add('io-black-connector', 'CM5 IO black connector', 12,
      'Schematic black connector next to the IO metal port row.', [0, 145, 0], function (g) {
        g.rotation.y = Math.PI / 2;
        g.position.set(IO_BOARD_CENTER[0], 0, IO_BOARD_CENTER[1]);
        box(g, 12, 11, 11, M.black, -25, Z.ioBottom + 7, 22);
      }, { material: 'Black polymer (schematic)' });
    add('io-header', 'CM5 IO rear header', 12,
      'Long schematic IO header along the rear edge, facing the GPS mast.', [0, 145, 0], function (g) {
        g.rotation.y = Math.PI / 2;
        g.position.set(IO_BOARD_CENTER[0], 0, IO_BOARD_CENTER[1]);
        box(g, 50, 8, 4, M.black, 47, Z.ioBottom + 6.5, 0, Math.PI / 2);
      }, { material: 'Black polymer (schematic)' });

    add('gps-mast-v2', 'Actual GPS mast V2', 13,
      'Actual GPS mast STL with its original geometry preserved, mounted on the rear side of the carrier plate (-Z). The heads of two M3×12 screws sit above the GPS base. Each screw passes down through an M3×7×1 hard washer, the mast base, and the carrier plate, then is secured with an M3 nut below the plate.',
      [-40, 55, -50], function (g) {
        printed(g, '03_gps_mast_v2_rounded_rect.stl', M.tpu, 0, Z.carrierTop, -65, 'upright');
      }, { file: '03_gps_mast_v2_rounded_rect.stl', material: 'Printed material not verified' });
    add('gps-module', 'GPS module housing', 13,
      'Schematic black GPS module body on the printed mast platform.', [-40, 55, -50], function (g) {
        box(g, 27.9, 6, 34.44, M.black, 0, Z.carrierTop + 38, -65);
      }, { material: 'Black polymer (schematic)' });
    add('gps-module-cover', 'GPS module top and wire detail', 13,
      'Schematic red GPS module top detail.', [-40, 55, -50], function (g) {
        box(g, 25, 1, 31.5, M.wire, 0, Z.carrierTop + 41.5, -65);
      }, { material: 'Illustrative electronic detail' });
    add('gps-direction-mark', 'GPS forward direction mark', 13,
      'The white arrow marks the GPS forward direction (+Z), aligned with the flight controller and the front of the frame.', [-40, 55, -50], function (g) {
        const arrow = new THREE.Shape();
        arrow.moveTo(0, -5); arrow.lineTo(-3, 2); arrow.lineTo(-1, 2); arrow.lineTo(-1, 7);
        arrow.lineTo(1, 7); arrow.lineTo(1, 2); arrow.lineTo(3, 2); arrow.closePath();
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(arrow), M.white.clone());
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, Z.carrierTop + 42.1, -65);
        g.add(mesh);
      }, { material: 'White marking (schematic)' });

    const cameraDesc = 'Illustrative adjustable camera bracket and IMX219 assembly facing forward (+Z), with the existing bracket, lens, and cable positions preserved. The hinge angle and cable route are illustrative only.';
    add('camera-bracket-base', 'Camera bracket base plate', 14, cameraDesc, [0, 0, 60], function (g) {
      box(g, 24, 3, 25, M.alu, 0, -1, 79);
    }, { material: 'Aluminum (schematic)' });
    add('camera-bracket-upright', 'Camera bracket upright', 14, cameraDesc, [0, 0, 60], function (g) {
      box(g, 3, 20, 24, M.alu, 0, 8, 92);
    }, { material: 'Aluminum (schematic)' });
    add('camera-hinge', 'Camera bracket hinge', 14,
      'Schematic hinge barrel across the adjustable camera bracket.', [0, 0, 60], function (g) {
        pivotCyl(g, 5, 24, M.alu, 0, 7, 91, 'x');
      }, { material: 'Aluminum (schematic)' });
    for (let i = 0; i < 2; i++) {
      const y = i === 0 ? 1 : 14;
      add(id2('camera-spacer', i), 'Camera white spacer sleeve ' + (i + 1), 14,
        'One of the white sleeves holding the camera board.', [0, 0, 60], function (g) {
          pivotCyl(g, 2.4, 22, M.white, 0, y, 105, 'z');
        }, { material: 'White polymer' });
    }
    add('camera-imx219-pcb', 'IMX219 camera PCB', 14,
      'Schematic IMX219 camera board held at the front of the bracket.', [0, 0, 60], function (g) {
        box(g, 25, 24, 1.8, M.pcbDark, 0, 8, 109);
      }, { material: 'PCB (schematic)' });
    add('camera-lens', 'IMX219 camera lens', 14,
      'Schematic camera lens and barrel.', [0, 0, 60], function (g) {
        const lens = cyl(g, 6.5, 6, M.lens, 0, 8, 113);
        lens.rotation.x = Math.PI / 2;
      }, { material: 'Optical glass and metal (schematic)' });
    add('camera-fpc', 'Camera FPC cable', 14,
      'Simplified white camera flex cable route over the bracket.', [0, 0, 60], function (g) {
        box(g, 14, 0.8, 29, M.white, 0, 17, 95);
      }, { material: 'Flexible circuit (schematic)' });

    add('battery-tray', 'Actual underslung battery tray (empty)', 3,
      'Actual 04_battery_tray_TPU STL with the original mesh unchanged and the opening facing down. The 3 mm base plate sits against the frame bottom at Y≈-6.5; its lower surface is at Y≈-9.5. The tray is shown empty.',
      [0, -55, 0], function (g) {
        printed(g, '04_battery_tray_TPU.stl', M.tpu, 0, Z.trayTop, 0, 'horizontal');
      }, { file: '04_battery_tray_TPU.stl', material: 'Printed material not verified' });
    add('battery-strap', 'Battery tray retaining strap', 3,
      'Illustrative retaining strap below the empty tray.', [0, -55, 0], function (g) {
        box(g, 47, 2.3, 10, M.black, 0, -23.5, 0);
      }, { material: 'Black polymer (schematic)' });
    for (let i = 0; i < motorPoints.length; i++) {
      const x = motorPoints[i][0], z = motorPoints[i][1];
      const toward = Math.atan2(-x, -z);
      add(id2('landing-leg-v7', i), 'Actual V7 landing leg ' + (i + 1) + ' (' + locLabel(i) + ')', 2,
        'Actual V7 foot STL instance, 80 mm high, with its original geometry preserved. The top of the foot is positioned at Y=-6 against the underside of the arm; like the motor, its center is shifted 8 mm inward along the arm.',
        [0, -30, 0], function (g) {
          const host = printed(g, 'landing_foot_v7.stl', M.tpu, x, -86, z, 'upright');
          host.rotation.y = toward + Math.PI / 2;
        }, { file: 'landing_foot_v7.stl', material: 'Printed material not verified' });
    }
    const propDesc = 'Illustrative Gemfan 51466 propeller. Its center is shifted 8 mm inward along the arm with the motor. The propeller is for display only and should be removed during bench, firmware, wiring, and motor-direction checks. Motor direction has not been verified.';
    for (let i = 0; i < motorPoints.length; i++) {
      const x = motorPoints[i][0], z = motorPoints[i][1];
      add(id2('propeller', i), 'Gemfan 51466 propeller ' + (i + 1) + ' (' + locLabel(i) + ')', 15,
        propDesc, [0, 35, 0], function (g) {
          cyl(g, 6, 2, M.alu, x, 24, z, 14);
          for (let bladeIndex = 0; bladeIndex < 3; bladeIndex++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(50, 1.2, 10), M.prop.clone());
            blade.geometry.translate(28, 0, 0);
            blade.position.set(x, 24, z);
            blade.rotation.y = bladeIndex * 2 * Math.PI / 3;
            g.add(blade);
          }
        }, { material: 'Composite propeller (schematic)' });
    }

    const steps = [
      ['Assemble the carbon-fiber frame', 'Align the upper and lower plates with the four arms. The diagonal across the outer frame outline is 270 mm, with the front facing +Z.'],
      ['Install the motors and actual V7 feet', 'Shift the four motors and feet 8 mm inward along their arms. The top of each foot sits at Y=-6 against the underside of the arm. Use the two outward-facing holes on each foot; pass eight M3×16 screws up through the feet and arms into the motor bases.'],
      ['Install the empty battery tray and long screws', 'The base of the actual tray STL sits against the frame bottom at Y≈-6.5, with its lower surface at Y≈-9.5. Pass four M3×20 screws up through the 20 × 20 mm inner pattern from below the tray. Pass four M3×40 screws up through the 30.5 × 30.5 mm outer pattern from the tray base; the rod ends reach Y≈30.5.'],
      ['Install the ESC lower supports', 'Fit one M3 nut, 2.5 mm thick, on each of the four outer M3×40 rods, followed by one M3 silicone washer. The washer tops are at Y=4 to support the ESC.'],
      ['Place the ESC', 'Set the MicoAir 50A ESC on the four silicone washers with its rear edge facing -Z. The board is 3 mm thick, with its bottom at Y=4.'],
      ['Install the ESC upper washers and lock nuts', 'Stack two M3×6×1.5 silicone washers on each outer rod above the ESC (eight washers total). Add one M3 nut, 5 mm thick, at each position to hold the washers. The nut tops are at Y=15, below the adapter plate and vibration-damping grommets.'],
      ['Preassemble the flight-controller stack beside the frame', 'Preassemble the actual 40 × 40 × 1.5 mm adapter plate, flight controller, four grommets, four M3×12 screws, four M3 washers, and four M3 nuts (2.5 mm thick) to the right of the frame. This step alone shows the assembly offset from its installed position.'],
      ['Fit the flight-controller stack onto the long screws', 'Lower the preassembled stack along the four outer M3×40 rods, aligning the grommets with the outer holes. When facing the front (+Z), fit one M3 nut, 2.5 mm thick, onto each of the two left-side (+X) outer rods; leave the right side without these nuts. Insert the flight-controller’s inner M3×12 screws from above.'],
      ['Install four single-ended hex standoffs', 'Fit the M3 single-ended standoffs over the outer M3×40 rod ends, with the blind bores facing down and overlapping each rod by 4 mm. All four standoffs are the same height, with their bases near Y=26.5 and tops at Y=31.5.'],
      ['Install the V3 carrier plate', 'Place the actual 90 × 137 × 3 mm carrier plate on the four standoff tops. The cable opening faces forward (+Z), and the GPS holes face rearward (-Z). The plate bottom is at Y=31.5 and the top at Y=34.5. Secure the standoffs from above with four M3 nuts, each 2.5 mm thick.'],
      ['Install the IO-board mounting screws and standoffs', 'Using the original four IO_HOLES coordinates, pass four M2.5×16 screws upward through the carrier plate from below. Add one original M2×5×1 silicone washer under each hole (shown elastically expanded to a 2.5 mm bore), then fit four 6 mm-high M2.5 hex through-hole standoffs and four expanded washers above the plate.'],
      ['Secure the ArmSoM CM5 IO board', 'Lower the illustrative 80 × 100 mm board onto the four upper washers, with its ports facing the left side (-X). Secure it from above with four M2.5 thin nuts.'],
      ['Install the GPS and actual mast', 'Mount the actual GPS mast at the rear of the carrier plate (-Z). Secure it with two M3×12 screws, two M3×7×1 hard plastic washers, and two M3 nuts, each 2.5 mm thick. The GPS arrow faces +Z.'],
      ['Install the forward-facing camera', 'Install the adjustable bracket, IMX219 camera, and cable in their shown positions. The camera sits at the front (+Z); the hinge angle and cable route are illustrative.'],
      ['Install the propellers last', 'Fit four illustrative Gemfan 51466 propellers. Remove them before bench, firmware, wiring, and motor-direction checks.']
    ];

    const assemblyDefinitions = [
      {
        id: 'frame', name: 'Source One V5.1 carbon-fiber frame', step: 1, explode: [0, 0, 0],
        desc: 'Includes the lower plate, estimated upper plate, and four 16 mm-wide arms. The 270 mm dimension is the diagonal across the outer arm-tip outline; motor and foot centers are shifted 8 mm inward along the arms, without changing the arm outline. The remaining edge near the motor-foot holes is approximately 0.74 mm; this is illustrative and must be measured on the physical parts. The 30.5 × 30.5 mm outer holes are shown as open-edge notches because the plate is only 30 mm wide.'
      },
      {
        id: 'motors', name: 'XING2 2207 1855KV motors ×4', step: 2, explode: [0, 0, 0],
        desc: 'Four illustrative motors sit 8 mm inward from the arm tips. The bottom of each base is at Y=0 against the top of the arm. Motor-foot screws are shown as separate parts.'
      },
      {
        id: 'esc', name: 'MicoAir 50A ESC', step: 5, explode: [0, 14, 0],
        desc: 'Illustrative board, approximately 44 × 43.5 × 3 mm, with 30.5 mm outer holes and 20 mm inner holes; its rear edge faces -Z. Four 2.5 mm M3 nuts and silicone washers sit below the board. Above it, each outer rod has two silicone washers and one M3 nut, 5 mm thick. All are separate hardware instances.'
      },
      {
        id: 'fc-adapter', name: 'Actual 40 × 40 × 1.5 mm flight-controller adapter plate', step: 8, explode: [0, 48, 0],
        desc: 'The actual STL retains its original geometry. The bottom is at Y=16.6 mm and the top at Y=18.1 mm. Silicone vibration-damping grommets fit in the four outer holes; the four inner holes secure the flight controller. In step 7, the plate is shown preassembled with the flight controller and hardware beside the frame.',
        staging: { start: 14, end: 19, offset: [110, 0, 0] },
        file: '05_esc_plate_40x40x1p5_outer4p1_R1.stl'
      },
      {
        id: 'fc', name: 'MicoAir NxtPX4v2 flight controller', step: 8, explode: [0, 65, 0],
        desc: 'Illustrative 32 × 27 × 2 mm flight-controller board. Its bottom is at Y=21.8 mm, 3.7 mm above the adapter plate top at Y=18.1 mm. Four M3×12 screws pass down through the 20 × 20 mm inner pattern. Four washers sit on the board and four M3 nuts, 2.5 mm thick, sit below the adapter plate. The white arrow points toward +Z. Shown preassembled beside the frame in step 7.',
        staging: { start: 14, end: 19, offset: [110, 0, 0] }
      },
      {
        id: 'carrier', name: 'Actual V3 carrier plate, 90 × 137 × 3 mm', step: 10, explode: [0, 102, 0],
        desc: 'The actual carrier-plate STL retains its original geometry and hole positions. The bottom is at Y=31.5 and the top at Y=34.5, resting on four single-ended hex standoffs. The cable opening is at the front (+Z), and the GPS holes are at the rear (-Z).',
        file: '01_carrier_adapter_plate_V3.stl'
      },
      {
        id: 'cm5-io', name: 'ArmSoM CM5-IO baseboard and BPI-CM5 Pro compute module', step: 12, explode: [0, 145, 0],
        desc: 'Illustrative 80 × 100 mm IO board aligned to the carrier-plate holes using IO_HOLES world coordinates. The board bottom is at Y=41.5 mm, resting on four 6 mm-high M2.5 hex through-hole standoffs and upper washers. Four M2.5×16 screws secure it from below, and four thin nuts secure it from above.'
      },
      {
        id: 'gps', name: 'Actual GPS mast and GPS module', step: 13, explode: [-40, 55, -50],
        desc: 'The actual GPS mast STL retains its original geometry and sits at the rear of the carrier plate (-Z). Two M3×12 screws, hard plastic washers, and nuts are shown separately. The GPS and flight-controller arrows both point toward +Z.',
        file: '03_gps_mast_v2_rounded_rect.stl'
      },
      {
        id: 'camera', name: 'Forward-facing camera bracket and IMX219', step: 14, explode: [0, 0, 60],
        desc: 'The illustrative bracket, hinge, white sleeves, camera board, lens, and cable retain their shown positions at the front (+Z). The hinge angle and cable route are illustrative only.'
      },
      {
        id: 'battery-tray', name: 'Actual underslung battery tray (empty)', step: 3, explode: [0, -55, 0],
        desc: 'Actual tray STL with an illustrative retaining strap. The 3 mm base plate contacts the frame bottom at Y≈-6.5, with its lower surface at Y≈-9.5. The tray is empty; no flight battery is included.',
        file: '04_battery_tray_TPU.stl'
      },
      {
        id: 'legs', name: 'Actual V7 landing feet ×4', step: 2, explode: [0, -30, 0],
        desc: 'Four actual V7 STL instances retain their original geometry. The top of each foot is at Y=-6 against the underside of the arm, shifted 8 mm inward from the arm tip. Two M3×16 screws per foot pass upward into the motor base.',
        file: 'landing_foot_v7.stl'
      },
      {
        id: 'props', name: 'Illustrative Gemfan 51466 propellers ×4', step: 15, explode: [0, 35, 0],
        desc: 'The four propeller centers shift inward 8 mm with the motors. These are for appearance only; remove them before bench, wiring, and motor-direction checks.'
      }
    ];

    function assemblyForPart(id) {
      if (id.startsWith('frame-')) return 'frame';
      if (id.startsWith('motor-')) return 'motors';
      if (id === 'esc-pcb' || id.startsWith('esc-chip-') ||
          id.startsWith('esc-terminal-') || id === 'esc-power-lead' || id === 'esc-capacitor') return 'esc';
      if (id === 'esc-fc-adapter') return 'fc-adapter';
      if (id.startsWith('flight-controller-')) return 'fc';
      if (id === 'carrier-plate-v3') return 'carrier';
      if (id.startsWith('io-') || id === 'cm5-io-pcb' || id === 'cm5-soc') return 'cm5-io';
      if (id.startsWith('gps-')) return 'gps';
      if (id.startsWith('camera-')) return 'camera';
      if (id === 'battery-tray' || id === 'battery-strap') return 'battery-tray';
      if (id.startsWith('landing-leg-v7-')) return 'legs';
      if (id.startsWith('propeller-')) return 'props';
      return null;
    }

    const assemblyItems = assemblyDefinitions.map(function (definition) {
      const group = new THREE.Group();
      group.name = definition.id;
      group.userData = {
        id: definition.id,
        name: definition.name,
        step: definition.step,
        desc: definition.desc
      };
      const item = {
        id: definition.id,
        name: definition.name,
        step: definition.step,
        desc: definition.desc,
        group: group,
        explode: new THREE.Vector3(definition.explode[0], definition.explode[1], definition.explode[2]),
        base: group.position.clone()
      };
      if (definition.file) item.file = definition.file;
      if (definition.staging) {
        item.staging = {
          start: definition.staging.start,
          end: definition.staging.end,
          offset: definition.staging.offset.slice()
        };
      }
      return item;
    });
    const assembliesById = new Map(assemblyItems.map(function (item) { return [item.id, item]; }));
    for (const part of parts) {
      const assembly = assembliesById.get(assemblyForPart(part.id));
      if (!assembly) throw new Error('Unassigned assembly model part: ' + part.id);
      assembly.group.add(part.group);
    }

    if (typeof root.createHardwareParts !== 'function') {
      throw new Error('Hardware model factory is not loaded');
    }
    const hardwareCatalog = root.createHardwareParts(THREE);
    const hardwareById = new Map(hardwareCatalog.map(function (item) { return [item.id, item]; }));
    const resultParts = assemblyItems.slice();
    const stagedOffset = [110, 0, 0];
    const m2StretchedWasherGeometry = (function () {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 2.5, 0, Math.PI * 2, false);
      shape.closePath();
      const hole = new THREE.Path();
      hole.absarc(0, 0, 1.25, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 48 });
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, -0.5, 0);
      return geometry;
    }());

    function addHardware(templateId, instanceId, name, step, x, y, z, options) {
      options = options || {};
      const source = hardwareById.get(templateId);
      if (!source) throw new Error('Missing hardware model template: ' + templateId);
      const group = source.group.clone(true);
      group.name = instanceId;
      group.position.set(x, y, z);
      if (options.upward) group.rotation.z = Math.PI;
      if (options.stretchedM2Washer) {
        group.traverse(function (object) {
          if (object.isMesh) object.geometry = m2StretchedWasherGeometry;
        });
      }
      const desc = options.desc || source.desc;
      group.userData = { id: instanceId, sourceId: templateId, name: name, step: step, desc: desc };
      const item = {
        id: instanceId,
        sourceId: templateId,
        name: name,
        step: step,
        desc: desc,
        group: group,
        explode: new THREE.Vector3(0, options.explodeY || 0, 0),
        base: group.position.clone(),
        catalogVisible: false
      };
      if (options.staging) {
        item.staging = { start: options.staging.start, end: options.staging.end, offset: options.staging.offset.slice() };
      }
      resultParts.push(item);
      return item;
    }

    function addScrew(templateId, instanceId, name, step, x, z, contactY, upward, options) {
      const length = { 'm3-screw-40': 40, 'm3-screw-20': 20, 'm3-screw-16': 16,
        'm3-screw-12': 12, 'm2p5-screw-16': 16 }[templateId];
      const centerY = upward ? contactY + length / 2 : contactY - length / 2;
      return addHardware(templateId, instanceId, name, step, x, centerY, z,
        Object.assign({}, options || {}, { upward: upward }));
    }

    const outerMounts = [[-15.25, 15.25], [15.25, 15.25], [-15.25, -15.25], [15.25, -15.25]];
    const innerMounts = [[-10, -10], [-10, 10], [10, -10], [10, 10]];
    const cornerNames = ['Front-left', 'Front-right', 'Rear-left', 'Rear-right'];
    const staged = { start: 14, end: 19, offset: stagedOffset };

    for (let i = 0; i < motorPoints.length; i++) {
      const x = motorPoints[i][0], z = motorPoints[i][1];
      const outwardHoles = [[x + Math.sign(footprint[i][0]) * 8, z], [x, z + Math.sign(footprint[i][1]) * 8]];
      for (let j = 0; j < outwardHoles.length; j++) {
        addScrew('m3-screw-16', 'motor-foot-m3x16-' + String(i + 1) + '-' + String(j + 1),
          cornerNames[i] + ' motor-foot M3×16 screw ' + (j + 1), 2, outwardHoles[j][0], outwardHoles[j][1], -11, true,
          { explodeY: -7, desc: 'M3×16 screw passes upward from below through the actual foot and arm into the motor base. It occupies one of the two outward-facing holes on each foot. Threads are not modeled.' });
      }
    }

    for (let i = 0; i < innerMounts.length; i++) {
      addScrew('m3-screw-20', 'battery-inner-m3x20-' + String(i + 1), 'Battery tray inner M3×20 screw ' + (i + 1),
        3, innerMounts[i][0], innerMounts[i][1], Z.trayBottom, true,
        { explodeY: -8, desc: 'M3×20 screw passes upward from the tray bottom through the 20 × 20 mm inner mounting pattern. Rod length is 20 mm, excluding the head. Threads are not modeled.' });
      addScrew('m3-screw-40', 'battery-outer-m3x40-' + String(i + 1), 'Battery tray outer M3×40 screw ' + (i + 1),
        3, outerMounts[i][0], outerMounts[i][1], Z.trayBottom, true,
        { explodeY: -12, desc: 'M3×40 long screw passes upward from the tray bottom through the tray and the frame’s 30.5 × 30.5 mm outer hole pattern. The rod end is at Y≈30.5 mm and will receive a single-ended hex standoff. Threads are not modeled.' });
    }

    for (let i = 0; i < outerMounts.length; i++) {
      const x = outerMounts[i][0], z = outerMounts[i][1];
      addHardware('m3-hex-nut-2p5', 'esc-lower-m3-nut-' + String(i + 1), cornerNames[i] + ' ESC lower M3 thin nut', 4,
        x, 1.25, z, { explodeY: -5, desc: 'M3 nut, 2.5 mm thick, above the arm at the lower ESC support. Threads are not modeled.' });
      addHardware('m3-silicone-washer-6x3x1p5', 'esc-lower-m3-washer-' + String(i + 1), cornerNames[i] + ' ESC lower M3 silicone washer', 4,
        x, 3.25, z, { explodeY: -7, desc: 'M3×6×1.5 silicone washer between the lower support nut and the ESC.' });
      addHardware('m3-silicone-washer-6x3x1p5', 'esc-upper-m3-washer-a-' + String(i + 1), cornerNames[i] + ' ESC upper M3 silicone washer', 6,
        x, 7.75, z, { explodeY: 8, desc: 'First M3×6×1.5 silicone washer layer, on the ESC top at Y=7 mm.' });
      addHardware('silicone-damping-grommet', 'fc-adapter-grommet-' + String(i + 1), cornerNames[i] + ' adapter-plate silicone vibration-damping grommet', 8,
        x, Z.adapterBottom + 0.65, z, { explodeY: 10, staging: staged,
          desc: 'Grommet waist is Ø4 mm in diameter and 1.5 mm high. It fits into an Ø4.1 mm outer hole in the 40 × 40 × 1.5 mm adapter plate, with the flanges holding the plate faces.' });
      addHardware('m3-silicone-washer-6x3x1p5', 'esc-upper-m3-washer-b-' + String(i + 1), cornerNames[i] + ' ESC second upper M3 silicone washer', 6,
        x, 9.25, z, { explodeY: 10, desc: 'Second M3×6×1.5 silicone washer, stacked directly on the first washer above the ESC.' });
      addHardware('m3-hex-nut-5', 'esc-upper-m3-nut-' + String(i + 1), cornerNames[i] + ' M3 thick nut below adapter plate', 6,
        x, 12.5, z, { explodeY: 14, desc: 'M3 nut, 5 mm thick, pressing on the two M3 silicone washers on each outer rod. It sits below the grommet and adapter plate. Threads are not modeled.' });
      addHardware('m3-single-ended-hex-standoff', 'carrier-m3-single-ended-column-' + String(i + 1), cornerNames[i] + ' carrier-plate M3 single-ended hex standoff', 9,
        x, 29, z, { explodeY: 12, desc: 'M3 single-ended hex standoff with its blind bore facing down, fitted 4 mm over the outer M3×40 rod end. The body is 5 mm high; all four standoff tops are at Y=31.5 mm.' });
      addHardware('m3-hex-nut-2p5', 'carrier-top-m3-nut-' + String(i + 1), cornerNames[i] + ' carrier-plate upper M3 thin nut', 10,
        x, 35.75, z, { explodeY: 8, desc: 'M3 nut, 2.5 mm thick, on top of the carrier plate securing the projecting rod of the single-ended hex standoff. Threads are not modeled.' });
    }

    for (let i = 0; i < 2; i++) {
      const z = i === 0 ? 15.25 : -15.25;
      addHardware('m3-hex-nut-2p5', 'fc-left-outer-m3-nut-' + String(i + 1), 'Left-side (+X) outer-rod M3 thin nut ' + (i + 1), 8,
        15.25, 20.75, z, { explodeY: 12, desc: 'M3 nut, 2.5 mm thick, installed only on the two left-side (+X) outer rods when facing forward (+Z), above the grommet flanges. Do not add this nut to the right-side (-X) rods. Threads are not modeled.' });
    }

    for (let i = 0; i < innerMounts.length; i++) {
      const x = innerMounts[i][0], z = innerMounts[i][1];
      addScrew('m3-screw-12', 'fc-inner-m3x12-' + String(i + 1), 'Flight-controller inner M3×12 screw ' + (i + 1), 8,
        x, z, 25.3, false,
        { explodeY: 10, staging: staged, desc: 'M3×12 screw passes down from above the flight controller through the board and the adapter plate’s inner hole pattern. The rod end is at Y=13.3 mm; the head bottom is at Y=25.3 mm against the M3 washer on the board. An M3 nut, 2.5 mm thick, secures it below the adapter plate. Threads are not modeled.' });
      addHardware('m3-silicone-washer-6x3x1p5', 'fc-top-m3-washer-' + String(i + 1), 'Flight-controller upper M3 silicone washer ' + (i + 1), 8,
        x, 24.55, z, { explodeY: 13, staging: staged, desc: 'M3×6×1.5 silicone washer between the flight-controller board top and the M3×12 screw head.' });
      addHardware('m3-hex-nut-2p5', 'fc-under-m3-nut-' + String(i + 1), 'M3 thin nut below adapter plate ' + (i + 1), 8,
        x, Z.adapterBottom - 1.25, z, { explodeY: -8, staging: staged, desc: 'M3 nut, 2.5 mm thick, below the flight-controller adapter plate securing the inner M3×12 screw. Threads are not modeled.' });
    }

    for (let i = 0; i < IO_HOLES.length; i++) {
      const x = IO_HOLES[i][0], z = IO_HOLES[i][1];
      addScrew('m2p5-screw-16', 'io-m2p5x16-' + String(i + 1), 'IO board-to-carrier M2.5×16 screw ' + (i + 1), 11,
        x, z, Z.carrierBottom - 1, true,
        { explodeY: -8, desc: 'M2.5×16 screw passes upward through the IO_HOLES position from below the V3 carrier plate. Rod length is 16 mm. Threads are not modeled.' });
      addHardware('m2-silicone-washer-5x2x1', 'io-under-m2-washer-' + String(i + 1), 'M2 elastic washer below carrier plate ' + (i + 1), 11,
        x, Z.carrierBottom - 0.5, z, { explodeY: -5, stretchedM2Washer: true,
          desc: 'Original M2×5×1 silicone washer, retaining its 5 mm outer diameter. The inner hole is shown elastically expanded to 2.5 mm. It sits below the carrier plate.' });
      addHardware('m2p5-hex-nut-6', 'io-m2p5-column-' + String(i + 1), '6 mm-high M2.5 hex standoff for IO board ' + (i + 1), 11,
        x, Z.carrierTop + 3, z, { explodeY: 8, desc: 'M2.5 hex standoff with 4.7 mm across flats, 6 mm thickness, and an Ø2.5 mm through-hole. It sits above the carrier plate. Threads are not modeled.' });
      addHardware('m2-silicone-washer-5x2x1', 'io-top-m2-washer-' + String(i + 1), 'M2 elastic washer below IO board ' + (i + 1), 11,
        x, Z.ioBottom - 0.5, z, { explodeY: 11, stretchedM2Washer: true,
          desc: 'Original M2×5×1 silicone washer, retaining its 5 mm outer diameter. The inner hole is shown elastically expanded to 2.5 mm. It sits between the 6 mm standoff and the IO board.' });
      addHardware('m2p5-hex-nut-2', 'io-top-m2p5-thin-nut-' + String(i + 1), 'M2.5 thin nut above IO board ' + (i + 1), 12,
        x, Z.ioBottom + 3, z, { explodeY: 12, desc: 'M2.5 thin nut, 2 mm thick and 5 mm across flats, securing the IO board. Threads are not modeled.' });
    }

    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? -7.5 : 7.5;
      const z = -65;
      addScrew('m3-screw-12', 'gps-m3x12-' + String(i + 1), 'GPS mast M3×12 screw ' + (i + 1), 13,
        x, z, 38.5, false,
        { explodeY: 8, desc: 'M3×12 screw head sits above the GPS mast base. The screw passes downward through the hard plastic washer, mast base, and carrier plate, then is secured with an M3 nut below the plate. Threads are not modeled.' });
      addHardware('m3-hard-plastic-washer-7x3x1', 'gps-m3-hard-washer-' + String(i + 1), 'GPS mast hard plastic washer ' + (i + 1), 13,
        x, 38, z, { explodeY: 5, desc: 'M3×7×1 hard plastic washer between the GPS mast base and the screw head.' });
      addHardware('m3-hex-nut-2p5', 'gps-m3-nut-' + String(i + 1), 'M3 nut below GPS mast ' + (i + 1), 13,
        x, 30.25, z, { explodeY: -8, desc: 'M3 nut, 2.5 mm thick, below the carrier plate securing the GPS mast screw. Threads are not modeled.' });
    }

    function numberedIds(prefix, count) {
      return Array.from({ length: count }, function (_, index) { return prefix + '-' + (index + 1); });
    }
    function gridIds(prefix, rows, columns) {
      const ids = [];
      for (let row = 1; row <= rows; row++) {
        for (let column = 1; column <= columns; column++) ids.push(prefix + '-' + row + '-' + column);
      }
      return ids;
    }

    const tutorial = [
      { title: 'Prepare the carbon-fiber frame', description: 'The frame is shown as the assembly base. The flight-controller arrow will mark the front direction later in the guide.', materials: ['Source One V5.1 frame ×1'], ids: ['frame'] },
      { title: 'Install the four motors', description: 'Place one motor at each arm-tip mounting position with its base against the top of the arm. Shift each motor center 8 mm inward along the arm.', materials: ['XING2 2207 1855KV motors ×4'], ids: ['motors'] },
      { title: 'Install the four V7 feet', description: 'Place the top of each actual V7 foot against the underside of an arm and align the mounting holes.', materials: ['Actual V7 landing feet ×4'], ids: ['legs'] },
      { title: 'Secure the motor feet', description: 'Use the two outward-facing holes on each foot. Pass eight M3×16 screws upward through the feet and arms into the motor bases. The approximately 0.74 mm hole-edge margin is illustrative; verify it on the physical parts.', materials: ['M3×16 screws ×8'], ids: gridIds('motor-foot-m3x16', 4, 2) },
      { title: 'Install the empty battery tray', description: 'Fit the actual TPU tray with its opening facing down and its base plate against the underside of the frame. Leave the tray empty. The retaining strap is illustrative.', materials: ['Actual TPU battery tray ×1', 'Illustrative retaining strap ×1'], ids: ['battery-tray'] },
      { title: 'Insert four M3×20 screws', description: 'Pass the screws upward from below the tray through the 20 × 20 mm inner mounting pattern.', materials: ['M3×20 screws ×4'], ids: numberedIds('battery-inner-m3x20', 4) },
      { title: 'Insert four M3×40 screws', description: 'Pass the screws upward from below the tray through the 30.5 × 30.5 mm outer mounting pattern. The open-edge plate notches are illustrative and must be checked against the physical parts. The rod ends extend approximately 30.5 mm above the frame top.', materials: ['M3×40 screws ×4'], ids: numberedIds('battery-outer-m3x40', 4) },
      { title: 'Install the nuts below the ESC', description: 'Fit one M3 nut, 2.5 mm thick, on each of the four outer long screws above the arms.', materials: ['M3 thin nuts, 2.5 mm thick ×4'], ids: numberedIds('esc-lower-m3-nut', 4) },
      { title: 'Install the silicone washers below the ESC', description: 'Place one M3×6×1.5 silicone washer on each of the four support nuts, with the washer tops level with the ESC bottom.', materials: ['M3×6×1.5 silicone washers ×4'], ids: numberedIds('esc-lower-m3-washer', 4) },
      { title: 'Place the ESC', description: 'Set the illustrative MicoAir 50A ESC on the four silicone washers with its wiring end facing the rear.', materials: ['Illustrative MicoAir 50A ESC ×1'], ids: ['esc'] },
      { title: 'Install the first upper washer layer on the ESC', description: 'Place one M3 silicone washer on the ESC top at each outer long screw.', materials: ['M3×6×1.5 silicone washers ×4'], ids: numberedIds('esc-upper-m3-washer-a', 4) },
      { title: 'Install the second upper washer layer on the ESC', description: 'Stack another washer of the same size on each first-layer washer.', materials: ['M3×6×1.5 silicone washers ×4'], ids: numberedIds('esc-upper-m3-washer-b', 4) },
      { title: 'Install the thick nuts above the ESC', description: 'Fit one M3 nut, 5 mm thick, above the two silicone washers on each outer screw. These nuts support the adapter plate above.', materials: ['M3 nuts, 5 mm thick ×4'], ids: numberedIds('esc-upper-m3-nut', 4) },
      { title: 'Place the flight-controller adapter plate', description: 'Position the actual 40 × 40 × 1.5 mm adapter plate beside the frame for preassembly, keeping its original hole orientation.', materials: ['40 × 40 × 1.5 mm flight-controller adapter plate ×1'], ids: ['fc-adapter'] },
      { title: 'Install the four vibration-damping grommets', description: 'Each grommet has 6 mm outer-diameter flanges. Fit its 4 mm-diameter, 1.5 mm-high waist into an outer adapter-plate hole so the flanges hold both sides of the plate.', materials: ['Silicone vibration-damping grommets (6 mm flanges, 4 × 1.5 mm waist) ×4'], ids: numberedIds('fc-adapter-grommet', 4) },
      { title: 'Place the flight-controller board', description: 'Place the illustrative MicoAir NxtPX4v2 board above the adapter plate. The board bottom is at Y=21.8 mm and the adapter-plate top at Y=18.1 mm, leaving a 3.7 mm gap. Point the board arrow toward the front (+Z).', materials: ['Illustrative MicoAir NxtPX4v2 flight controller ×1'], ids: ['fc'] },
      { title: 'Install the washers above the flight controller', description: 'Place one M3 silicone washer on the board at each of its four mounting holes.', materials: ['M3×6×1.5 silicone washers ×4'], ids: numberedIds('fc-top-m3-washer', 4) },
      { title: 'Insert the flight-controller M3×12 screws', description: 'Pass the screws downward through the washers, flight controller, and adapter plate’s inner holes.', materials: ['M3×12 screws ×4'], ids: numberedIds('fc-inner-m3x12', 4) },
      { title: 'Secure the nuts below the flight controller', description: 'Fit one M3 thin nut, 2.5 mm thick, below the adapter plate on each screw to complete the side preassembly.', materials: ['M3 thin nuts, 2.5 mm thick ×4'], ids: numberedIds('fc-under-m3-nut', 4) },
      { title: 'Move the preassembled flight-controller stack onto the frame', description: 'Move the completed side assembly onto the frame. Align the four outer grommets with the four M3×40 long screws, then lower the stack along the screws.', materials: [], ids: [], move: ['fc-adapter'].concat(numberedIds('fc-adapter-grommet', 4), ['fc'], numberedIds('fc-top-m3-washer', 4), numberedIds('fc-inner-m3x12', 4), numberedIds('fc-under-m3-nut', 4)) },
      { title: 'Install two nuts on the left side', description: 'When facing forward (+Z), fit one M3 thin nut, 2.5 mm thick, on each of the two left-side (+X) outer long screws. Do not add nuts on the right side (-X).', materials: ['M3 thin nuts, 2.5 mm thick ×2'], ids: numberedIds('fc-left-outer-m3-nut', 2) },
      { title: 'Install the four single-ended standoffs', description: 'Point the blind bore of each M3 single-ended standoff down and fit it approximately 4 mm over an outer long screw, keeping all four standoff tops level.', materials: ['M3 single-ended hex standoffs, 5 mm high ×4'], ids: numberedIds('carrier-m3-single-ended-column', 4) },
      { title: 'Place the V3 carrier plate', description: 'Lower the actual carrier plate onto the four standoff tops. Face the cable opening toward the front and the GPS mounting holes toward the rear.', materials: ['Actual V3 carrier plate (90 × 137 × 3 mm) ×1'], ids: ['carrier'] },
      { title: 'Tighten the nuts above the carrier plate', description: 'From above the carrier plate, fit one M3 nut, 2.5 mm thick, at each of the four standoff positions.', materials: ['M3 thin nuts, 2.5 mm thick ×4'], ids: numberedIds('carrier-top-m3-nut', 4) },
      { title: 'Place the M2 washers below the carrier plate', description: 'Place one washer below each of the four outer carrier-plate holes. The inner hole is shown elastically expanded to 2.5 mm.', materials: ['M2×5×1 silicone washers ×4'], ids: numberedIds('io-under-m2-washer', 4) },
      { title: 'Insert the IO-board M2.5×16 screws', description: 'Pass four screws upward from below the carrier plate through the four outer mounting holes.', materials: ['M2.5×16 screws ×4'], ids: numberedIds('io-m2p5x16', 4) },
      { title: 'Install the four IO-board hex standoffs', description: 'Fit one 6 mm-high M2.5 hex through-hole standoff at each of the four mounting positions above the carrier plate.', materials: ['M2.5 hex through-hole standoffs, 6 mm high ×4'], ids: numberedIds('io-m2p5-column', 4) },
      { title: 'Place the washers above the IO-board standoffs', description: 'Place one washer on each hex standoff so it sits below the IO board. The inner hole is shown elastically expanded to 2.5 mm.', materials: ['M2×5×1 silicone washers ×4'], ids: numberedIds('io-top-m2-washer', 4) },
      { title: 'Place the CM5 IO board', description: 'Align the illustrative 80 × 100 mm ArmSoM CM5 IO board with the four outer carrier-plate holes and set it on the washers. Face its ports to the left when looking toward the front.', materials: ['Illustrative ArmSoM CM5-IO baseboard ×1', 'Illustrative BPI-CM5 Pro compute module ×1', 'Illustrative IO metal ports ×3', 'Illustrative black connector ×1', 'Illustrative rear header ×1'], ids: ['cm5-io'] },
      { title: 'Secure the IO board', description: 'Fit one M2.5 thin nut, 2 mm thick, above each of the board’s four mounting holes.', materials: ['M2.5 thin nuts, 2 mm thick ×4'], ids: numberedIds('io-top-m2p5-thin-nut', 4) },
      { title: 'Install the GPS assembly', description: 'Mount the actual GPS mast at the rear of the carrier plate. Point the GPS forward arrow toward the front. The GPS module shape is illustrative.', materials: ['Actual GPS mast V2 ×1', 'Illustrative GPS module ×1', 'Illustrative GPS cover and cable details ×1'], ids: ['gps'] },
      { title: 'Place the GPS plastic washers', description: 'Place one M3×7×1 hard plastic washer above the mast base at each of its two screw positions.', materials: ['M3×7×1 hard plastic washers ×2'], ids: numberedIds('gps-m3-hard-washer', 2) },
      { title: 'Insert the GPS M3×12 screws', description: 'At the two rear mounting positions, point the screw heads upward and pass the screws downward through the washers, mast base, and carrier plate.', materials: ['M3×12 screws ×2'], ids: numberedIds('gps-m3x12', 2) },
      { title: 'Secure the nuts below the GPS mast', description: 'Fit one M3 nut, 2.5 mm thick, on each screw end below the carrier plate.', materials: ['M3 thin nuts, 2.5 mm thick ×2'], ids: numberedIds('gps-m3-nut', 2) },
      { title: 'Install the forward-facing camera', description: 'Place the camera bracket and IMX219 assembly at the front of the frame. The hinge angle and cable route follow the existing illustration.', materials: ['Camera bracket base ×1', 'Camera bracket upright ×1', 'Camera hinge ×1', 'White spacer sleeves ×2', 'IMX219 camera board ×1', 'Camera lens ×1', 'Camera FPC cable ×1'], ids: ['camera'] },
      { title: 'Install the four propellers', description: 'Fit the illustrative Gemfan 51466 propellers to the four motors. The model does not define actual motor direction or wiring.', materials: ['Illustrative Gemfan 51466 propellers ×4'], ids: ['props'] }
    ];

    const partsById = new Map(resultParts.map(function (part) { return [part.id, part]; }));
    const tutorialStepByPartId = new Map();
    tutorial.forEach(function (tutorialStep, index) {
      tutorialStep.ids.forEach(function (id) {
        if (tutorialStepByPartId.has(id)) throw new Error('Duplicate tutorial part assignment: ' + id);
        if (!partsById.has(id)) throw new Error('Unknown tutorial model part: ' + id);
        tutorialStepByPartId.set(id, index + 1);
      });
    });
    for (const part of resultParts) {
      const tutorialStep = tutorialStepByPartId.get(part.id);
      if (!tutorialStep) throw new Error('Unassigned tutorial model part: ' + part.id);
      part.tutorialStep = tutorialStep;
      part.group.userData.tutorialStep = tutorialStep;
    }
    tutorial.forEach(function (tutorialStep) {
      (tutorialStep.move || []).forEach(function (id) {
        const part = partsById.get(id);
        if (!part || !part.staging || part.staging.start !== 14 || part.staging.end !== 19) {
          throw new Error('Tutorial move must reference a side-staged part: ' + id);
        }
      });
    });

    return { parts: resultParts, steps: steps, tutorial: tutorial };
  };
})(window);
