(function (root) {
  'use strict';

  root.createHardwareParts = function (THREE) {
    const steel = function () {
      return new THREE.MeshPhongMaterial({
        color: 0xb8bec3,
        specular: 0x777777,
        shininess: 72
      });
    };
    const silicone = function () {
      return new THREE.MeshPhongMaterial({
        color: 0x34383a,
        specular: 0x222222,
        shininess: 18
      });
    };
    const plastic = function () {
      return new THREE.MeshPhongMaterial({
        color: 0x4b91c4,
        specular: 0x555555,
        shininess: 32
      });
    };

    function mesh(group, geometry, material) {
      const partMesh = new THREE.Mesh(geometry, material);
      partMesh.castShadow = true;
      partMesh.receiveShadow = true;
      group.add(partMesh);
      return partMesh;
    }

    function annulusGeometry(outerRadius, innerRadius, height) {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
      shape.closePath();

      const hole = new THREE.Path();
      hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false,
        curveSegments: 48
      });
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, -height / 2, 0);
      return geometry;
    }

    function addWasher(id, name, desc, outerDiameter, innerDiameter, height, materialFactory, materialName) {
      const group = new THREE.Group();
      group.name = id;
      mesh(group, annulusGeometry(outerDiameter / 2, innerDiameter / 2, height), (materialFactory || silicone)());
      return { id: id, name: name, desc: desc, material: materialName || '硅胶', group: group };
    }

    function addScrew(id, name, rodLength, desc, rodDiameter, headDiameter, headHeight) {
      rodDiameter = rodDiameter || 3;
      headDiameter = headDiameter || 5.5;
      headHeight = headHeight || 3;
      const group = new THREE.Group();
      group.name = id;
      mesh(group, new THREE.CylinderGeometry(rodDiameter / 2, rodDiameter / 2, rodLength, 48), steel());
      const head = mesh(group, new THREE.CylinderGeometry(headDiameter / 2, headDiameter / 2, headHeight, 48), steel());
      head.position.y = rodLength / 2 + headHeight / 2;
      return { id: id, name: name, desc: desc, material: '金属（示意）', group: group };
    }

    function addHexBorePart(id, name, acrossFlats, thickness, boreDiameter, desc) {
      const cornerRadius = acrossFlats / Math.sqrt(3);
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const x = cornerRadius * Math.cos(angle);
        const z = cornerRadius * Math.sin(angle);
        if (i === 0) shape.moveTo(x, z);
        else shape.lineTo(x, z);
      }
      shape.closePath();

      const hole = new THREE.Path();
      hole.absarc(0, 0, boreDiameter / 2, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: false,
        curveSegments: 48
      });
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, -thickness / 2, 0);

      const group = new THREE.Group();
      group.name = id;
      mesh(group, geometry, steel());
      return {
        id: id,
        name: name,
        desc: desc,
        material: '金属（示意）',
        group: group
      };
    }

    function addNut(id, name, thickness) {
      const acrossFlats = 5.6;
      const cornerRadius = acrossFlats / Math.sqrt(3);
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const x = cornerRadius * Math.cos(angle);
        const z = cornerRadius * Math.sin(angle);
        if (i === 0) shape.moveTo(x, z);
        else shape.lineTo(x, z);
      }
      shape.closePath();

      // Smooth, unthreaded clearance bore for an M3 screw.
      const hole = new THREE.Path();
      hole.absarc(0, 0, 1.6, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: false,
        curveSegments: 48
      });
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, -thickness / 2, 0);

      const group = new THREE.Group();
      group.name = id;
      mesh(group, geometry, steel());
      return {
        id: id,
        name: name,
        desc: '正六角螺母，对边 5.6 mm，厚 ' + thickness + ' mm；未建螺纹，贯穿孔 Ø3.2 mm。',
        material: '金属（示意）',
        group: group
      };
    }

    function addHexStandoff() {
      const acrossFlats = 5.6;
      const cornerRadius = acrossFlats / Math.sqrt(3);
      const bodyHeight = 5;
      const holeDepth = 4;
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const x = cornerRadius * Math.cos(angle);
        const z = cornerRadius * Math.sin(angle);
        if (i === 0) shape.moveTo(x, z);
        else shape.lineTo(x, z);
      }
      shape.closePath();

      const hole = new THREE.Path();
      hole.absarc(0, 0, 1.5, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      const group = new THREE.Group();
      group.name = 'm3-single-ended-hex-standoff';

      // The annular lower section leaves a 4 mm blind bore; the solid upper
      // millimeter closes it before the rod begins.
      const boreGeometry = new THREE.ExtrudeGeometry(shape, {
        depth: holeDepth,
        bevelEnabled: false,
        curveSegments: 48
      });
      boreGeometry.rotateX(-Math.PI / 2);
      boreGeometry.translate(0, -bodyHeight / 2, 0);
      mesh(group, boreGeometry, steel());

      const capShape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const x = cornerRadius * Math.cos(angle);
        const z = cornerRadius * Math.sin(angle);
        if (i === 0) capShape.moveTo(x, z);
        else capShape.lineTo(x, z);
      }
      capShape.closePath();
      const capGeometry = new THREE.ExtrudeGeometry(capShape, {
        depth: bodyHeight - holeDepth,
        bevelEnabled: false
      });
      capGeometry.rotateX(-Math.PI / 2);
      capGeometry.translate(0, bodyHeight / 2 - (bodyHeight - holeDepth), 0);
      mesh(group, capGeometry, steel());

      const rodLength = 6;
      const rod = mesh(group, new THREE.CylinderGeometry(1.5, 1.5, rodLength, 48), steel());
      rod.position.y = bodyHeight / 2 + rodLength / 2;

      return {
        id: 'm3-single-ended-hex-standoff',
        name: '单头六角柱（M3）',
        desc: '六角主体对边 5.6 mm、高 5 mm；顶部延伸 M3 螺杆，直径 3 mm、长度 6 mm；另一端为 Ø3 mm 轴向盲孔，深 4 mm。未建螺纹。',
        material: '金属（示意）',
        group: group
      };
    }

    const grommetGroup = new THREE.Group();
    grommetGroup.name = 'silicone-damping-grommet';
    const grommetMaterial = silicone();
    const lowerFlange = mesh(grommetGroup, annulusGeometry(3, 1.5, 1.6), grommetMaterial);
    lowerFlange.position.y = -1.45;
    const grommetWaist = mesh(grommetGroup, annulusGeometry(2, 1.5, 1.5), grommetMaterial);
    grommetWaist.position.y = 0.1;
    const upperFlange = mesh(grommetGroup, annulusGeometry(3, 1.5, 1.4), grommetMaterial);
    upperFlange.position.y = 1.55;

    return [
      addScrew('m3-screw-40', 'M3×40 圆柱头内六角螺钉', 40, '螺杆直径 3 mm、杆长 40 mm（不含头部）；圆柱头直径约 5.5 mm、高约 3 mm，为示意尺寸。未建螺纹，未细化内六角孔。'),
      addScrew('m3-screw-16', 'M3×16 螺钉', 16, '螺杆直径 3 mm、杆长 16 mm（不含头部）；圆柱头直径约 5.5 mm、高约 3 mm，沿用 M3×40 的示意尺寸。未建螺纹，实际材质和头型未提供，均为示意。'),
      addScrew('m3-screw-12', 'M3×12 螺钉', 12, '螺杆直径 3 mm、杆长 12 mm（不含头部）；圆柱头直径约 5.5 mm、高约 3 mm，沿用 M3×40 的示意尺寸。未建螺纹，实际材质和头型未提供，均为示意。'),
      addScrew('m3-screw-20', 'M3×20 螺钉', 20, '螺杆直径 3 mm、杆长 20 mm（不含头部）；圆柱头直径约 5.5 mm、高约 3 mm，沿用现有示意尺寸。未建螺纹，头型为示意。'),
      addScrew('m2p5-screw-16', 'M2.5×16 圆柱头螺钉', 16, '螺杆直径 2.5 mm、杆长 16 mm（不含头部）；圆柱头直径约 4.5 mm、高约 2.5 mm，为示意尺寸。未建螺纹。', 2.5, 4.5, 2.5),
      addNut('m3-hex-nut-2p5', 'M3 六角螺母（厚 2.5 mm）', 2.5),
      addNut('m3-hex-nut-5', 'M3 六角螺母（厚 5 mm）', 5),
      addHexBorePart('m2p5-hex-nut-6', 'M2.5 六角柱/通孔螺母（高 6 mm）', 4.7, 6, 2.5, '正六角通孔螺母/六角柱，对边 4.7 mm、高 6 mm；未建螺纹，贯穿孔 Ø2.5 mm。'),
      addHexBorePart('m2p5-hex-nut-2', 'M2.5 普通薄六角螺母（厚 2 mm）', 5, 2, 2.5, '正六角螺母，对边 5 mm、厚 2 mm；未建螺纹，贯穿孔 Ø2.5 mm。'),
      addWasher('m3-silicone-washer-6x3x1p5', 'M3×6×1.5 硅胶垫圈', '外径 6 mm、内径 3 mm、厚 1.5 mm，贯穿孔。', 6, 3, 1.5),
      addWasher('m2-silicone-washer-5x2x1', 'M2×5×1 硅胶垫圈', '外径 5 mm、内径 2 mm、厚 1 mm，贯穿孔。', 5, 2, 1),
      addWasher('m3-hard-plastic-washer-7x3x1', 'M3×7×1 塑料硬垫片', '外径约 7 mm、内径约 3 mm、厚 1 mm，带贯穿孔。塑料类型未提供，颜色仅作显示示意。', 7, 3, 1, plastic, '塑料（示意）'),
      {
        id: 'silicone-damping-grommet',
        name: '硅胶缓震圈（Ø6/Ø4/内孔Ø3）',
        desc: '内径 3 mm 贯穿孔；上凸缘外径 6 mm、厚 1.4 mm，腰部外径 4 mm、高 1.5 mm，下凸缘外径 6 mm、厚 1.6 mm，总高 4.5 mm。',
        material: '硅胶',
        group: grommetGroup
      },
      addHexStandoff()
    ];
  };
}(typeof window !== 'undefined' ? window : globalThis));
