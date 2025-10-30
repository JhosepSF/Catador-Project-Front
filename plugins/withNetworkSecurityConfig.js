// plugins/withNetworkSecurityConfig.js
const { withAndroidManifest, AndroidConfig, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const XML_NAME = 'network_security_config.xml';
const XML_CONTENT = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" /> <!-- permite CAs instaladas por el usuario -->
    </trust-anchors>
  </base-config>
</network-security-config>`;

module.exports = function withNetworkSecurityConfig(config) {
  // Escribe el XML dentro del proyecto nativo en prebuild
  config = withDangerousMod(config, ['android', async (cfg) => {
    const androidPath = cfg.modRequest.platformProjectRoot;
    const resXmlDir = path.join(androidPath, 'app', 'src', 'main', 'res', 'xml');
    fs.mkdirSync(resXmlDir, { recursive: true });
    fs.writeFileSync(path.join(resXmlDir, XML_NAME), XML_CONTENT, 'utf8');
    return cfg;
  }]);

  // Apunta el AndroidManifest al XML
  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return cfg;
  });
};
