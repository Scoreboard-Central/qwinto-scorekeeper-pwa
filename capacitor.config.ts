import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blakelamb.qwintoscorekeeper',
  appName: 'Qwinto Scorekeeper',
  webDir: 'dist/qwinto-scorekeeper-pwa',
  server: {
    androidScheme: 'https'
  }
};

export default config;
