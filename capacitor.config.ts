import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.qwinto.app',
  appName: 'Qwinto Scorekeeper',
  webDir: 'dist/qwinto-scorekeeper-pwa',
  server: {
    androidScheme: 'https'
  }
};

export default config;
