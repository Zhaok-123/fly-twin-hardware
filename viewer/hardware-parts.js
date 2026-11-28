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
      return { id: id, name: name, desc: desc, material: materialName || 'Silicone', group: group };
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
      return { id: id, name: name, desc: desc, material: 'Metal (illustrative)', group: group };
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
        material: 'Metal (illustrative)',
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
        desc: 'Hex nut with 5.6 mm across flats and a thickness of ' + thickness + ' mm. Threads are not modeled; the through-hole is Ø3.2 mm.',
        material: 'Metal (illustrative)',
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
        name: 'Single-ended hex standoff (M3)',
        desc: 'Hex body with 5.6 mm across flats and a height of 5 mm. An M3 rod extends 6 mm from the top (3 mm diameter); the other end has a 4 mm-deep, Ø3 mm axial blind bore. Threads are not modeled.',
        material: 'Metal (illustrative)',
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
      addScrew('m3-screw-40', 'M3×40 socket-head cap screw', 40, 'Rod diameter: 3 mm; rod length: 40 mm (excluding the head). Illustrative cylindrical head: approximately 5.5 mm in diameter and 3 mm high. Threads are not modeled, and the hex socket is not detailed.'),
      addScrew('m3-screw-16', 'M3×16 screw', 16, 'Rod diameter: 3 mm; rod length: 16 mm (excluding the head). Illustrative cylindrical head: approximately 5.5 mm in diameter and 3 mm high, based on the M3×40 example. Threads are not modeled. The actual material and head type were not specified; both are illustrative.'),
      addScrew('m3-screw-12', 'M3×12 screw', 12, 'Rod diameter: 3 mm; rod length: 12 mm (excluding the head). Illustrative cylindrical head: approximately 5.5 mm in diameter and 3 mm high, based on the M3×40 example. Threads are not modeled. The actual material and head type were not specified; both are illustrative.'),
      addScrew('m3-screw-20', 'M3×20 screw', 20, 'Rod diameter: 3 mm; rod length: 20 mm (excluding the head). Illustrative cylindrical head: approximately 5.5 mm in diameter and 3 mm high, based on the existing example. Threads are not modeled; the head type is illustrative.'),
      addScrew('m2p5-screw-16', 'M2.5×16 socket-head cap screw', 16, 'Rod diameter: 2.5 mm; rod length: 16 mm (excluding the head). Illustrative cylindrical head: approximately 4.5 mm in diameter and 2.5 mm high. Threads are not modeled.', 2.5, 4.5, 2.5),
      addNut('m3-hex-nut-2p5', 'M3 hex nut (2.5 mm thick)', 2.5),
      addNut('m3-hex-nut-5', 'M3 hex nut (5 mm thick)', 5),
      addHexBorePart('m2p5-hex-nut-6', 'M2.5 hex standoff / through-hole nut (6 mm high)', 4.7, 6, 2.5, 'Hexagonal through-hole nut/standoff with 4.7 mm across flats and a height of 6 mm. Threads are not modeled; the through-hole is Ø2.5 mm.'),
      addHexBorePart('m2p5-hex-nut-2', 'M2.5 thin hex nut (2 mm thick)', 5, 2, 2.5, 'Hex nut with 5 mm across flats and a thickness of 2 mm. Threads are not modeled; the through-hole is Ø2.5 mm.'),
      addWasher('m3-silicone-washer-6x3x1p5', 'M3×6×1.5 silicone washer', 'Outer diameter: 6 mm; inner diameter: 3 mm; thickness: 1.5 mm. Through-hole.', 6, 3, 1.5),
      addWasher('m2-silicone-washer-5x2x1', 'M2×5×1 silicone washer', 'Outer diameter: 5 mm; inner diameter: 2 mm; thickness: 1 mm. Through-hole.', 5, 2, 1),
      addWasher('m3-hard-plastic-washer-7x3x1', 'M3×7×1 hard plastic washer', 'Outer diameter: approximately 7 mm; inner diameter: approximately 3 mm; thickness: 1 mm. Has a through-hole. The plastic type was not specified; its color is illustrative.', 7, 3, 1, plastic, 'Plastic (illustrative)'),
      {
        id: 'silicone-damping-grommet',
        name: 'Silicone vibration-damping grommet (Ø6 / Ø4 / Ø3 bore)',
        desc: 'Ø3 mm through-hole. Upper flange: 6 mm outer diameter and 1.4 mm thick. Waist: 4 mm outer diameter and 1.5 mm high. Lower flange: 6 mm outer diameter and 1.6 mm thick. Total height: 4.5 mm.',
        material: 'Silicone',
        group: grommetGroup
      },
      addHexStandoff()
    ];
  };
}(typeof window !== 'undefined' ? window : globalThis));
