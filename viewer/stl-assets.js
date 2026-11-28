(function (root) {
  'use strict';

  const filenames = [
    '01_carrier_adapter_plate_V3.stl',
    '03_gps_mast_v2_rounded_rect.stl',
    '04_battery_tray_TPU.stl',
    '05_esc_plate_40x40x1p5_outer4p1_R1.stl',
    'landing_foot_v7.stl'
  ];

  root.loadAssemblyStls = function (THREE) {
    const loader = new THREE.STLLoader();
    return Promise.all(filenames.map(function (filename) {
      const url = '../mounts/stl/' + encodeURIComponent(filename);
      return new Promise(function (resolve, reject) {
        loader.load(url, function (geometry) {
          resolve([filename, geometry]);
        }, undefined, function () {
          reject(new Error('Could not load ' + url + '. Check that the file exists and open the page through a local HTTP server.'));
        });
      });
    })).then(function (entries) {
      return entries.reduce(function (geometries, entry) {
        geometries[entry[0]] = entry[1];
        return geometries;
      }, {});
    });
  };
}(window));
