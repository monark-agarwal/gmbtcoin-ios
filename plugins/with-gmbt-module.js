const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withGMBTModule(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosRoot = config.modRequest.platformProjectRoot;
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.modRequest.projectName;

      const sourceRoot = path.join(projectRoot, 'native');
      const targetFolder = path.join(iosRoot, projectName);

      // Copy Swift + ObjC bridge
      ['GMBTModule.swift', 'GMBTModule.m'].forEach((file) => {
        const src = path.join(sourceRoot, file);
        const dest = path.join(targetFolder, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      });

      // Copy xcframework into ios root
      const frameworkSrc = path.join(sourceRoot, 'Mobile.xcframework');
      const frameworkDest = path.join(iosRoot, 'Mobile.xcframework');

      if (fs.existsSync(frameworkSrc)) {
        fs.cpSync(frameworkSrc, frameworkDest, { recursive: true });
      }

      return config;
    },
  ]);
};