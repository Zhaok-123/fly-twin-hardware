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

    const frameDesc = '简化的 Source One V5.1 Quad X 机架示意。机臂末端外轮廓对角线保持270 mm；电机与真实V7脚沿机臂径向内移8 mm。每个机臂按脚底座朝外的两个Ø3.2 mm安装位开孔，孔边距约0.74 mm，仅作示意，须实物确认。下板为167×30 mm，上板约110×30 mm；30.5×30.5 mm外孔位置在30 mm板宽外0.25 mm，按开边缺口表示。机架细节需实物测量。';
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
    const motorDesc = 'XING2 2207 1855KV示意电机，底座下表面Y=0并贴机臂上表面；电机中心沿机臂向内8 mm。机身、底座和轴为近似外形。';
    for (let i = 0; i < motorPoints.length; i++) {
      const x = motorPoints[i][0], z = motorPoints[i][1];
      add(id2('motor', i), 'XING2 2207 1855KV motor ' + (i + 1) + ' (' + locLabel(i) + ')', 2,
        motorDesc, [0, 0, 0], function (g) {
          cyl(g, 14, 19, M.copper, x, 13.5, z);
          cyl(g, 15, 4, M.black, x, 2, z);
          cyl(g, 2.5, 6, M.alu, x, 21, z);
        }, { material: 'Copper, aluminum and black anodized finish (schematic)' });
    }

    const escDesc = 'MicoAir 50A ESC示意板，板厚3 mm，四个30.5×30.5 mm外孔与四个20×20 mm内孔均为通孔。外侧四处由M3×40长螺钉支撑；机臂上方依次为4颗厚2.5 mm的M3螺母、4个M3硅胶垫圈和ESC，尾端朝-Z。示意板底面Y=4 mm。电源线与电容仅为示意，不建螺纹。';
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
      '真实05_esc_plate_40x40x1p5_R1 STL，保留原几何与孔位；底面Y=16.6 mm、顶面Y=18.1 mm。四个外孔装入腰部Ø4×1.5 mm的硅胶缓震圈，四个内孔与飞控M3×12螺钉对齐。',
      [0, 48, 0], function (g) {
        printed(g, '05_esc_plate_40x40x1p5_outer4p1_R1.stl', M.print, 0, Z.adapterTop, 0, 'horizontal');
      }, { file: '05_esc_plate_40x40x1p5_outer4p1_R1.stl', material: 'Printed material not verified' });

    const boardY = Z.adapterTop + 4.7;
    add('flight-controller-pcb', 'MicoAir NxtPX4v2 flight controller PCB', 8,
      'MicoAir NxtPX4v2飞控示意板，32×27×2 mm，四个Ø3 mm内孔位于20×20 mm中心方形。板底Y=21.8 mm，与适配板顶面Y=18.1 mm相隔3.7 mm；4颗M3×12螺钉从上向下穿入，板上有4个M3垫圈、适配板下有4颗M3厚2.5 mm螺母。',
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
    add('flight-controller-direction-mark', '飞控前向标记（+Z）', 8,
      '白色箭头表示飞控前向+Z，与机架前方一致。', [0, 65, 0], function (g) {
        const arrow = new THREE.Shape();
        arrow.moveTo(0, -5); arrow.lineTo(-3, 2); arrow.lineTo(-1, 2); arrow.lineTo(-1, 7);
        arrow.lineTo(1, 7); arrow.lineTo(1, 2); arrow.lineTo(3, 2); arrow.closePath();
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(arrow), M.white.clone());
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, boardY + 2.72, 0);
        g.add(mesh);
      }, { material: 'White marking (schematic)' });
    add('carrier-plate-v3', 'Actual 90 × 137 × 3 mm carrier plate (V3)', 10,
      '真实V3载板STL保持原几何、原点和孔位；底面Y=31.5 mm、顶面Y=34.5 mm，落在四个等高M3单头六角柱上。前方+Z为排线孔，后方-Z为GPS安装孔。',
      [0, 102, 0], function (g) {
        printed(g, '01_carrier_adapter_plate_V3.stl', M.print, 0, (Z.carrierBottom + Z.carrierTop) / 2, 0, 'horizontal');
      }, { file: '01_carrier_adapter_plate_V3.stl', material: 'Printed material not verified' });

    const ioDesc = 'ArmSoM CM5-IO底板与Banana Pi BPI-CM5 Pro核心板为示意，实物分别购买。IO底板以V3载板现有四孔坐标定位，先由4颗M2.5×16螺钉从下向上固定四个6 mm高M2.5六角柱，再放置IO板并用4颗薄螺母固定。四个M2垫圈的内孔按弹性撑开至2.5 mm示意，外径保持5 mm。';
    add('io-carrier-outline', 'ArmSoM CM5 IO main board', 12,
      '80×100 mm ArmSoM CM5 IO主板示意，四个Ø3.3 mm安装孔按IO_HOLES原世界坐标与V3载板孔对齐。板底位于Y=41.5 mm。', [0, 145, 0], function (g) {
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
      '真实GPS mast STL保留原几何，安装在载板后侧-Z；两颗M3×12螺钉头在GPS底座上方，螺钉向下穿过M3×7×1硬垫片、mast底座和载板，载板下方由M3螺母固定。',
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
      '白色箭头表示GPS前向+Z，与飞控和机架前方一致。', [-40, 55, -50], function (g) {
        const arrow = new THREE.Shape();
        arrow.moveTo(0, -5); arrow.lineTo(-3, 2); arrow.lineTo(-1, 2); arrow.lineTo(-1, 7);
        arrow.lineTo(1, 7); arrow.lineTo(1, 2); arrow.lineTo(3, 2); arrow.closePath();
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(arrow), M.white.clone());
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, Z.carrierTop + 42.1, -65);
        g.add(mesh);
      }, { material: 'White marking (schematic)' });

    const cameraDesc = '前向+Z的可调相机支架与IMX219示意组件，保持原有支架、镜头和排线位置；铰链角度与排线路径仅作示意。';
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
      '真实04_battery_tray_TPU STL，不改原网格，开口朝下。底板厚3 mm，贴机架底面Y≈-6.5，底板下表面Y≈-9.5；托盘保持空置。',
      [0, -55, 0], function (g) {
        printed(g, '04_battery_tray_TPU.stl', M.tpu, 0, Z.trayTop, 0, 'horizontal');
      }, { file: '04_battery_tray_TPU.stl', material: 'Printed material not verified' });
    add('battery-strap', 'Battery tray retaining strap', 3,
      '空托盘下方的示意固定带。', [0, -55, 0], function (g) {
        box(g, 47, 2.3, 10, M.black, 0, -23.5, 0);
      }, { material: 'Black polymer (schematic)' });
    for (let i = 0; i < motorPoints.length; i++) {
      const x = motorPoints[i][0], z = motorPoints[i][1];
      const toward = Math.atan2(-x, -z);
      add(id2('landing-leg-v7', i), 'Actual V7 landing leg ' + (i + 1) + ' (' + locLabel(i) + ')', 2,
        '真实V7脚STL实例，高80 mm，保留原几何；脚顶面移至Y=-6与机臂底面贴合，脚中心与电机同样沿机臂内移8 mm。',
        [0, -30, 0], function (g) {
          const host = printed(g, 'landing_foot_v7.stl', M.tpu, x, -86, z, 'upright');
          host.rotation.y = toward + Math.PI / 2;
        }, { file: 'landing_foot_v7.stl', material: 'Printed material not verified' });
    }
    const propDesc = 'Gemfan 51466示意桨叶，中心随电机沿机臂内移8 mm。桨叶仅供展示；台架、固件、接线和电机转向检查时应拆下，转向未验证。';
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
      ['组装碳纤维机架', '对齐上下板和4根机臂；机架外轮廓对角线保持270 mm，前方为+Z。'],
      ['安装电机与真实V7脚', '4台电机与脚沿各机臂向内8 mm；脚顶Y=-6贴机臂底面。每脚取朝外的2个孔，8颗M3×16从脚底向上穿过脚和机臂进入电机底座。'],
      ['安装空电池托盘与长螺钉', '托盘真实STL底板贴机架底Y≈-6.5，底面Y≈-9.5。4颗M3×20从托盘下方穿20×20内圈孔向上；4颗M3×40从托盘底面穿30.5×30.5外孔向上，杆端到Y≈30.5。'],
      ['安装ESC下方支撑', '在4根外侧M3×40螺杆上各装1颗厚2.5 mm的M3螺母，再装1个M3硅胶垫圈；垫圈顶面Y=4，供ESC落座。'],
      ['放置ESC', '将MicoAir 50A ESC落在4个硅胶垫圈上，尾端朝-Z；板厚3 mm，底面Y=4。'],
      ['安装ESC上方垫圈和锁紧螺母', '4根外螺杆上各连续放2个M3×6×1.5硅胶垫圈，共8个；再在每处装1颗厚5 mm的M3螺母压住垫圈，螺母顶面Y=15，位于适配板及缓震圈下方。'],
      ['侧边预装飞控叠层', '将实际40×40×1.5 mm适配板、飞控、4个缓震圈、4颗M3×12、4个M3垫圈和4颗厚2.5 mm螺母在机架右侧预装；仅此步将预装件偏移展示。'],
      ['将飞控叠层装到长螺杆上', '预装件沿4根外侧M3×40螺杆放下，缓震圈对准外孔；面向机头（+Z）时左侧（+X）两根外杆各加1颗厚2.5 mm的M3螺母，右侧不加。飞控内圈M3×12由上向下。'],
      ['安装4根单头六角柱', '将M3单头柱盲孔朝下套入外侧M3×40杆端4 mm；4柱等高，柱底约Y=26.5、顶面Y=31.5。'],
      ['安装V3载板', '真实90×137×3 mm载板落在四柱顶面；前方+Z为排线孔，后方-Z为GPS孔。载板底Y=31.5、顶Y=34.5，四颗厚2.5 mm的M3螺母从上方锁紧单头柱。'],
      ['安装IO板支撑螺钉与垫柱', '按IO_HOLES四个原坐标，4颗M2.5×16从载板下方朝上穿孔；板下各放1个原M2×5×1硅胶垫圈（内孔弹性撑至2.5 mm），板上装4个高6 mm的M2.5六角通孔柱和4个撑开垫圈。'],
      ['固定ArmSoM CM5 IO主板', '将80×100 mm示意主板落在四个上垫圈上，确认左侧-X端口朝向；板上用4颗M2.5薄螺母固定。'],
      ['安装GPS与真实mast', '在载板后侧-Z安装真实GPS mast；用2颗M3×12、2片M3×7×1塑料硬垫片和2颗厚2.5 mm的M3螺母固定。GPS箭头朝+Z。'],
      ['安装前向相机', '按原位置安装可调支架、IMX219相机和排线；相机位于+Z前端，铰链角度与排线路径为示意。'],
      ['最后安装螺旋桨', '安装4片Gemfan 51466示意桨。台架、固件、接线和电机转向检查前拆下螺旋桨。']
    ];

    const assemblyDefinitions = [
      {
        id: 'frame', name: 'Source One V5.1碳纤维机架', step: 1, explode: [0, 0, 0],
        desc: '包含下板、估算的上板和4根16 mm宽机臂。270 mm指相对机臂末端外轮廓对角线；电机及脚中心沿臂内移8 mm，机臂外轮廓不变。电机脚孔附近余边约0.74 mm，仅作示意，需实测。30.5×30.5 mm外孔因板宽仅30 mm而画成开边缺口。'
      },
      {
        id: 'motors', name: 'XING2 2207 1855KV电机×4', step: 2, explode: [0, 0, 0],
        desc: '四台示意电机位于机臂末端内侧8 mm；底座下表面Y=0并贴机臂上表面。电机脚螺钉为独立实例。'
      },
      {
        id: 'esc', name: 'MicoAir 50A ESC', step: 5, explode: [0, 14, 0],
        desc: '约44×43.5×3 mm示意板，保留30.5 mm外孔和20 mm内孔；尾端朝-Z。四颗2.5 mm M3螺母及硅胶垫圈在板下；板上每根外杆有两片硅胶垫圈和一颗厚5 mm的M3螺母，均为独立硬件实例。'
      },
      {
        id: 'fc-adapter', name: '真实40×40×1.5 mm飞控适配板', step: 8, explode: [0, 48, 0],
        desc: '真实STL保持原几何，底面Y=16.6 mm、顶面Y=18.1 mm；外4孔安装硅胶缓震圈，内4孔固定飞控。第7步与飞控和五金在机架右侧预装展示。',
        staging: { start: 14, end: 19, offset: [110, 0, 0] },
        file: '05_esc_plate_40x40x1p5_outer4p1_R1.stl'
      },
      {
        id: 'fc', name: 'MicoAir NxtPX4v2飞控', step: 8, explode: [0, 65, 0],
        desc: '32×27×2 mm示意飞控板底面Y=21.8 mm，与适配板顶面Y=18.1 mm相隔3.7 mm；四颗M3×12由上向下穿20×20 mm内孔；4个垫圈在板上、4颗M3厚2.5 mm螺母在适配板下。板上白箭头指向+Z。第7步侧边预装。',
        staging: { start: 14, end: 19, offset: [110, 0, 0] }
      },
      {
        id: 'carrier', name: '真实V3载板90×137×3 mm', step: 10, explode: [0, 102, 0],
        desc: '真实载板STL保持原几何和孔位，底面Y=31.5、顶面Y=34.5，落在4个单头六角柱顶面；+Z前侧为排线孔，-Z后侧为GPS孔。',
        file: '01_carrier_adapter_plate_V3.stl'
      },
      {
        id: 'cm5-io', name: 'ArmSoM CM5-IO底板与BPI-CM5 Pro核心板', step: 12, explode: [0, 145, 0],
        desc: '80×100 mm IO主板按IO_HOLES世界坐标对齐载板孔，板底Y=41.5 mm，落在4个6 mm高M2.5六角通孔柱及上垫圈上；4颗M2.5×16从下向上固定，板上由4颗薄螺母锁紧。'
      },
      {
        id: 'gps', name: '真实GPS mast与GPS模块', step: 13, explode: [-40, 55, -50],
        desc: '真实GPS mast STL保留原几何，位于载板后侧-Z；两颗M3×12、硬塑料垫片和螺母独立显示。GPS与飞控箭头均朝+Z。',
        file: '03_gps_mast_v2_rounded_rect.stl'
      },
      {
        id: 'camera', name: '前向相机支架与IMX219', step: 14, explode: [0, 0, 60],
        desc: '保留原示意支架、铰链、白色垫套、相机板、镜头与排线位置，安装在+Z前端；铰链角度和排线路径仅作示意。'
      },
      {
        id: 'battery-tray', name: '真实下挂电池托盘（空）', step: 3, explode: [0, -55, 0],
        desc: '真实托盘STL与示意固定带；3 mm底板接触机架底面Y≈-6.5，板底Y≈-9.5。空托盘，不包含飞行电池。',
        file: '04_battery_tray_TPU.stl'
      },
      {
        id: 'legs', name: '真实V7着陆脚×4', step: 2, explode: [0, -30, 0],
        desc: '四个真实V7 STL实例保持原几何，脚顶面Y=-6贴机臂底面；相对机臂外端内移8 mm。每个脚的两颗M3×16向上穿入电机底座。',
        file: 'landing_foot_v7.stl'
      },
      {
        id: 'props', name: 'Gemfan 51466示意桨×4', step: 15, explode: [0, 35, 0],
        desc: '四片桨中心随电机内移8 mm，仅作外观示意；台架、接线和电机转向检查前应拆下。'
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
    const cornerNames = ['前左', '前右', '后左', '后右'];
    const staged = { start: 14, end: 19, offset: stagedOffset };

    for (let i = 0; i < motorPoints.length; i++) {
      const x = motorPoints[i][0], z = motorPoints[i][1];
      const outwardHoles = [[x + Math.sign(footprint[i][0]) * 8, z], [x, z + Math.sign(footprint[i][1]) * 8]];
      for (let j = 0; j < outwardHoles.length; j++) {
        addScrew('m3-screw-16', 'motor-foot-m3x16-' + String(i + 1) + '-' + String(j + 1),
          cornerNames[i] + '电机脚M3×16螺钉' + (j + 1), 2, outwardHoles[j][0], outwardHoles[j][1], -11, true,
          { explodeY: -7, desc: 'M3×16螺钉由脚底向上穿过真实脚和机臂，进入电机底座；位置为每脚朝臂外侧的两个孔之一。未建螺纹。' });
      }
    }

    for (let i = 0; i < innerMounts.length; i++) {
      addScrew('m3-screw-20', 'battery-inner-m3x20-' + String(i + 1), '电池托盘内圈M3×20螺钉' + (i + 1),
        3, innerMounts[i][0], innerMounts[i][1], Z.trayBottom, true,
        { explodeY: -8, desc: 'M3×20螺钉从托盘底面向上，穿过20×20 mm内圈安装位；杆长20 mm，不含头。未建螺纹。' });
      addScrew('m3-screw-40', 'battery-outer-m3x40-' + String(i + 1), '电池托盘外圈M3×40螺钉' + (i + 1),
        3, outerMounts[i][0], outerMounts[i][1], Z.trayBottom, true,
        { explodeY: -12, desc: 'M3×40长螺钉从托盘底面向上穿过托盘与机架30.5×30.5 mm外孔，杆端Y≈30.5 mm；后续套入单头六角柱。未建螺纹。' });
    }

    for (let i = 0; i < outerMounts.length; i++) {
      const x = outerMounts[i][0], z = outerMounts[i][1];
      addHardware('m3-hex-nut-2p5', 'esc-lower-m3-nut-' + String(i + 1), cornerNames[i] + 'ESC下方M3薄螺母', 4,
        x, 1.25, z, { explodeY: -5, desc: '厚2.5 mm的M3螺母，位于机臂上方、ESC下支撑处。未建螺纹。' });
      addHardware('m3-silicone-washer-6x3x1p5', 'esc-lower-m3-washer-' + String(i + 1), cornerNames[i] + 'ESC下方M3硅胶垫圈', 4,
        x, 3.25, z, { explodeY: -7, desc: 'M3×6×1.5硅胶垫圈，位于下支撑螺母与ESC之间。' });
      addHardware('m3-silicone-washer-6x3x1p5', 'esc-upper-m3-washer-a-' + String(i + 1), cornerNames[i] + 'ESC上方M3硅胶垫圈', 6,
        x, 7.75, z, { explodeY: 8, desc: 'M3×6×1.5硅胶垫圈，第一层位于ESC上表面Y=7 mm。' });
      addHardware('silicone-damping-grommet', 'fc-adapter-grommet-' + String(i + 1), cornerNames[i] + '适配板硅胶缓震圈', 8,
        x, Z.adapterBottom + 0.65, z, { explodeY: 10, staging: staged,
          desc: '硅胶缓震圈腰部Ø4 mm、高1.5 mm，嵌入40×40×1.5 mm适配板的Ø4.1 mm外孔；上下凸缘夹持板面。' });
      addHardware('m3-silicone-washer-6x3x1p5', 'esc-upper-m3-washer-b-' + String(i + 1), cornerNames[i] + 'ESC上方第二片M3硅胶垫圈', 6,
        x, 9.25, z, { explodeY: 10, desc: 'M3×6×1.5硅胶垫圈，紧叠在ESC上方第一片垫圈之上。' });
      addHardware('m3-hex-nut-5', 'esc-upper-m3-nut-' + String(i + 1), cornerNames[i] + '适配板下方M3厚螺母', 6,
        x, 12.5, z, { explodeY: 14, desc: '厚5 mm的M3螺母，压在每根外杆两片M3硅胶垫圈上；位于缓震圈与适配板下方。未建螺纹。' });
      addHardware('m3-single-ended-hex-standoff', 'carrier-m3-single-ended-column-' + String(i + 1), cornerNames[i] + '载板M3单头六角柱', 9,
        x, 29, z, { explodeY: 12, desc: 'M3单头六角柱，盲孔朝下套入外侧M3×40杆端4 mm；柱体高5 mm，四柱顶面均为Y=31.5 mm。' });
      addHardware('m3-hex-nut-2p5', 'carrier-top-m3-nut-' + String(i + 1), cornerNames[i] + '载板上M3薄螺母', 10,
        x, 35.75, z, { explodeY: 8, desc: '厚2.5 mm的M3螺母，位于载板顶面并固定单头六角柱的上伸螺杆。未建螺纹。' });
    }

    for (let i = 0; i < 2; i++) {
      const z = i === 0 ? 15.25 : -15.25;
      addHardware('m3-hex-nut-2p5', 'fc-left-outer-m3-nut-' + String(i + 1), '面向机头左侧+X外杆M3薄螺母' + (i + 1), 8,
        15.25, 20.75, z, { explodeY: 12, desc: '厚2.5 mm的M3螺母，仅安装在面向机头（+Z）时左侧（+X）的两根外杆、缓震圈上凸缘之上；右侧（-X）外杆不加此螺母。未建螺纹。' });
    }

    for (let i = 0; i < innerMounts.length; i++) {
      const x = innerMounts[i][0], z = innerMounts[i][1];
      addScrew('m3-screw-12', 'fc-inner-m3x12-' + String(i + 1), '飞控内圈M3×12螺钉' + (i + 1), 8,
        x, z, 25.3, false,
        { explodeY: 10, staging: staged, desc: 'M3×12螺钉从飞控上方向下穿过板与适配板内圈孔；螺杆下端Y=13.3 mm，头部底面Y=25.3 mm并压在板上M3垫圈，适配板下方由2.5 mm M3螺母承接。未建螺纹。' });
      addHardware('m3-silicone-washer-6x3x1p5', 'fc-top-m3-washer-' + String(i + 1), '飞控板上M3硅胶垫圈' + (i + 1), 8,
        x, 24.55, z, { explodeY: 13, staging: staged, desc: 'M3×6×1.5硅胶垫圈，位于飞控板上表面与M3×12螺钉头之间。' });
      addHardware('m3-hex-nut-2p5', 'fc-under-m3-nut-' + String(i + 1), '适配板下M3薄螺母' + (i + 1), 8,
        x, Z.adapterBottom - 1.25, z, { explodeY: -8, staging: staged, desc: '厚2.5 mm的M3螺母，位于FC适配板下方，固定内圈M3×12螺钉。未建螺纹。' });
    }

    for (let i = 0; i < IO_HOLES.length; i++) {
      const x = IO_HOLES[i][0], z = IO_HOLES[i][1];
      addScrew('m2p5-screw-16', 'io-m2p5x16-' + String(i + 1), 'IO载板M2.5×16螺钉' + (i + 1), 11,
        x, z, Z.carrierBottom - 1, true,
        { explodeY: -8, desc: 'M2.5×16螺钉从V3载板下方朝上穿过IO_HOLES孔位；杆长16 mm，未建螺纹。' });
      addHardware('m2-silicone-washer-5x2x1', 'io-under-m2-washer-' + String(i + 1), '载板下M2弹性垫圈' + (i + 1), 11,
        x, Z.carrierBottom - 0.5, z, { explodeY: -5, stretchedM2Washer: true,
          desc: '原M2×5×1硅胶垫圈，外径保持5 mm；示意弹性撑开后内孔为2.5 mm，位于载板下方。' });
      addHardware('m2p5-hex-nut-6', 'io-m2p5-column-' + String(i + 1), 'IO主板6 mm高M2.5六角柱' + (i + 1), 11,
        x, Z.carrierTop + 3, z, { explodeY: 8, desc: '对边4.7 mm、厚6 mm、Ø2.5 mm通孔的M2.5六角柱，位于载板上方。未建螺纹。' });
      addHardware('m2-silicone-washer-5x2x1', 'io-top-m2-washer-' + String(i + 1), 'IO主板下M2弹性垫圈' + (i + 1), 11,
        x, Z.ioBottom - 0.5, z, { explodeY: 11, stretchedM2Washer: true,
          desc: '原M2×5×1硅胶垫圈，外径保持5 mm；示意弹性撑开后内孔为2.5 mm，位于6 mm六角柱与IO板之间。' });
      addHardware('m2p5-hex-nut-2', 'io-top-m2p5-thin-nut-' + String(i + 1), 'IO主板上M2.5薄螺母' + (i + 1), 12,
        x, Z.ioBottom + 3, z, { explodeY: 12, desc: '厚2 mm、对边5 mm的M2.5薄螺母，固定IO主板。未建螺纹。' });
    }

    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? -7.5 : 7.5;
      const z = -65;
      addScrew('m3-screw-12', 'gps-m3x12-' + String(i + 1), 'GPS mast M3×12螺钉' + (i + 1), 13,
        x, z, 38.5, false,
        { explodeY: 8, desc: 'M3×12螺钉头位于GPS mast底座上方，向下穿过塑料硬垫片、mast底座与载板；下端由载板下方M3螺母固定。未建螺纹。' });
      addHardware('m3-hard-plastic-washer-7x3x1', 'gps-m3-hard-washer-' + String(i + 1), 'GPS mast塑料硬垫片' + (i + 1), 13,
        x, 38, z, { explodeY: 5, desc: 'M3×7×1塑料硬垫片，位于GPS mast底座上方与螺钉头之间。' });
      addHardware('m3-hex-nut-2p5', 'gps-m3-nut-' + String(i + 1), 'GPS mast上方M3螺母' + (i + 1), 13,
        x, 30.25, z, { explodeY: -8, desc: '厚2.5 mm的M3螺母，位于载板下方，固定GPS mast安装螺钉。未建螺纹。' });
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
      { title: '准备碳纤维机架', description: '机架作为装配基础整体展示；机头方向之后由飞控箭头标识。', materials: ['Source One V5.1机架 ×1'], ids: ['frame'] },
      { title: '安装四台电机', description: '将电机放在各机臂末端安装位，底座贴机臂上表面；电机中心沿机臂内移8 mm。', materials: ['XING2 2207 1855KV电机 ×4'], ids: ['motors'] },
      { title: '安装四个V7脚', description: '将真实V7脚顶面贴紧机臂底面，并对齐每个脚的安装孔。', materials: ['真实V7着陆脚 ×4'], ids: ['legs'] },
      { title: '固定电机脚', description: '每个脚取朝外的两个孔位，用M3×16螺钉从脚底向上穿过脚和机臂，进入电机底座。孔边距约0.74 mm仅为示意，需实物确认。', materials: ['M3×16螺钉 ×8'], ids: gridIds('motor-foot-m3x16', 4, 2) },
      { title: '安装空电池托盘', description: '安装真实TPU托盘，开口朝下；托盘底板贴紧机架下表面，保持空置。托盘固定带为示意。', materials: ['真实TPU电池托盘 ×1', '示意固定带 ×1'], ids: ['battery-tray'] },
      { title: '装入四颗M3×20螺钉', description: '从托盘下方向上穿过20×20 mm内圈安装位。', materials: ['M3×20螺钉 ×4'], ids: numberedIds('battery-inner-m3x20', 4) },
      { title: '装入四颗M3×40螺钉', description: '从托盘下方向上穿过30.5×30.5 mm外圈安装位；板边开口为示意，需按实物确认。杆端高出机架上表面约30.5 mm。', materials: ['M3×40螺钉 ×4'], ids: numberedIds('battery-outer-m3x40', 4) },
      { title: '安装ESC下方螺母', description: '在四根外侧长螺杆上各装一颗厚2.5 mm的M3螺母，位置在机臂上方。', materials: ['M3薄螺母（厚2.5 mm）×4'], ids: numberedIds('esc-lower-m3-nut', 4) },
      { title: '安装ESC下方硅胶垫圈', description: '在四颗下支撑螺母上各放一只M3×6×1.5硅胶垫圈，使垫圈顶面与ESC底面齐平。', materials: ['M3×6×1.5硅胶垫圈 ×4'], ids: numberedIds('esc-lower-m3-washer', 4) },
      { title: '放置ESC', description: '将MicoAir 50A ESC落在四只硅胶垫圈上，接线端朝机尾。', materials: ['MicoAir 50A ESC示意件 ×1'], ids: ['esc'] },
      { title: '安装ESC上方第一层垫圈', description: '每根外侧长螺杆在ESC上表面各放一片M3硅胶垫圈。', materials: ['M3×6×1.5硅胶垫圈 ×4'], ids: numberedIds('esc-upper-m3-washer-a', 4) },
      { title: '安装ESC上方第二层垫圈', description: '在第一层垫圈上再各叠放一片同规格M3硅胶垫圈。', materials: ['M3×6×1.5硅胶垫圈 ×4'], ids: numberedIds('esc-upper-m3-washer-b', 4) },
      { title: '安装ESC上方厚螺母', description: '在每根外侧螺杆的两片硅胶垫圈上方装一颗厚5 mm的M3螺母，供上方适配板支撑。', materials: ['M3螺母（厚5 mm）×4'], ids: numberedIds('esc-upper-m3-nut', 4) },
      { title: '放置飞控适配板', description: '将真实40×40×1.5 mm适配板放在机架侧边预装位，保持原孔位方向。', materials: ['40×40×1.5 mm飞控适配板 ×1'], ids: ['fc-adapter'] },
      { title: '安装四个缓震圈', description: '缓震圈外凸缘直径6 mm；将外径4 mm、高1.5 mm的腰部嵌入适配板外孔，使上下凸缘夹持板面。', materials: ['硅胶缓震圈（凸缘外径6 mm、腰部4×1.5 mm）×4'], ids: numberedIds('fc-adapter-grommet', 4) },
      { title: '放置飞控板', description: '将MicoAir NxtPX4v2飞控置于适配板上方，板底Y=21.8 mm、适配板顶面Y=18.1 mm，两者间隔3.7 mm；板上箭头朝机头（+Z）。', materials: ['MicoAir NxtPX4v2飞控示意件 ×1'], ids: ['fc'] },
      { title: '安装飞控上垫圈', description: '在飞控四个安装孔位置各放一片M3硅胶垫圈，位于板上。', materials: ['M3×6×1.5硅胶垫圈 ×4'], ids: numberedIds('fc-top-m3-washer', 4) },
      { title: '装入飞控M3×12螺钉', description: '从上向下穿过垫圈、飞控和适配板内圈孔。', materials: ['M3×12螺钉 ×4'], ids: numberedIds('fc-inner-m3x12', 4) },
      { title: '固定飞控下方螺母', description: '在适配板下方为四颗螺钉各装一颗厚2.5 mm的M3薄螺母，完成侧边预装。', materials: ['M3薄螺母（厚2.5 mm）×4'], ids: numberedIds('fc-under-m3-nut', 4) },
      { title: '将飞控预装组移到机身', description: '把侧边完成的预装组整体移到机身，使四个外孔缓震圈对准四根M3×40长螺杆，再沿杆放下。', materials: [], ids: [], move: ['fc-adapter'].concat(numberedIds('fc-adapter-grommet', 4), ['fc'], numberedIds('fc-top-m3-washer', 4), numberedIds('fc-inner-m3x12', 4), numberedIds('fc-under-m3-nut', 4)) },
      { title: '安装左侧两颗螺母', description: '面向机头（+Z）时，仅在左侧（+X）两根外侧长螺杆上各装一颗厚2.5 mm的M3薄螺母；右侧（-X）不加。', materials: ['M3薄螺母（厚2.5 mm）×2'], ids: numberedIds('fc-left-outer-m3-nut', 2) },
      { title: '安装四根单头柱', description: '将M3单头柱盲孔朝下，分别套入外侧长螺杆约4 mm，使四根柱顶面齐平。', materials: ['M3单头六角柱（高5 mm）×4'], ids: numberedIds('carrier-m3-single-ended-column', 4) },
      { title: '放置V3载板', description: '将真实载板落在四根柱顶面并贴合；排线孔朝机头，GPS安装孔朝机尾。', materials: ['真实V3载板（90×137×3 mm）×1'], ids: ['carrier'] },
      { title: '锁紧载板上方螺母', description: '从载板上方在四个柱位各装一颗厚2.5 mm的M3螺母。', materials: ['M3薄螺母（厚2.5 mm）×4'], ids: numberedIds('carrier-top-m3-nut', 4) },
      { title: '放置载板下M2垫圈', description: '在载板四个外侧安装孔下方各放一片垫圈；示意内孔弹性撑至2.5 mm。', materials: ['M2×5×1硅胶垫圈 ×4'], ids: numberedIds('io-under-m2-washer', 4) },
      { title: '装入IO板M2.5×16螺钉', description: '从载板下方将四颗螺钉向上穿过四个外侧安装孔。', materials: ['M2.5×16螺钉 ×4'], ids: numberedIds('io-m2p5x16', 4) },
      { title: '安装四根IO板六角柱', description: '在载板上方的四个安装位各装一根高6 mm的M2.5六角通孔柱。', materials: ['M2.5六角通孔柱（高6 mm）×4'], ids: numberedIds('io-m2p5-column', 4) },
      { title: '放置IO板上方垫圈', description: '在四根六角柱顶端各放一片垫圈，垫圈位于IO板下方；示意内孔弹性撑至2.5 mm。', materials: ['M2×5×1硅胶垫圈 ×4'], ids: numberedIds('io-top-m2-washer', 4) },
      { title: '放置CM5 IO主板', description: '将80×100 mm ArmSoM CM5 IO板按载板四个外侧安装孔对齐，放在四个垫圈上；接口朝向面向机头时的左侧。', materials: ['ArmSoM CM5-IO底板示意件 ×1', 'BPI-CM5 Pro核心板示意件 ×1', 'IO金属接口示意件 ×3', '黑色连接器示意件 ×1', '后排针示意件 ×1'], ids: ['cm5-io'] },
      { title: '固定IO主板', description: '在主板上方四个安装孔各装一颗M2.5薄螺母；螺母厚2 mm。', materials: ['M2.5薄螺母（厚2 mm）×4'], ids: numberedIds('io-top-m2p5-thin-nut', 4) },
      { title: '安装GPS组件', description: '将真实GPS mast装在载板机尾端；GPS前向箭头朝机头。GPS模块外形为示意。', materials: ['真实GPS mast V2 ×1', 'GPS模块示意件 ×1', 'GPS顶盖与线缆细节示意 ×1'], ids: ['gps'] },
      { title: '放置GPS塑料垫片', description: '在mast底座两个螺钉位各放一片M3×7×1塑料硬垫片，位于底座上方。', materials: ['M3×7×1塑料硬垫片 ×2'], ids: numberedIds('gps-m3-hard-washer', 2) },
      { title: '装入GPS M3×12螺钉', description: '在机尾两个安装位将螺钉头朝上，从上向下穿过垫片、mast底座和载板。', materials: ['M3×12螺钉 ×2'], ids: numberedIds('gps-m3x12', 2) },
      { title: '固定GPS下方螺母', description: '在载板下方的两颗螺钉末端各装一颗厚2.5 mm的M3螺母。', materials: ['M3薄螺母（厚2.5 mm）×2'], ids: numberedIds('gps-m3-nut', 2) },
      { title: '安装前向相机', description: '将相机支架与IMX219组件放在机架机头端；铰链角度和排线路径按现有示意。', materials: ['相机支架底座 ×1', '相机支架立板 ×1', '相机铰链 ×1', '白色垫套 ×2', 'IMX219相机板 ×1', '相机镜头 ×1', '相机FPC排线 ×1'], ids: ['camera'] },
      { title: '安装四片螺旋桨', description: '在四台电机位置安装Gemfan 51466示意桨；模型未定义实际转向和接线。', materials: ['Gemfan 51466螺旋桨 ×4'], ids: ['props'] }
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
