import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.receptomat.app',
  appName: 'Receptomat',
  webDir: 'dist',
  // bundledWebRuntime: false

  
    android: {
       buildOptions: {
          keystorePath: 'f:\receptomat2\receptomat\android\app\receptomat.keystore',
          keystoreAlias: 'receptomat',
       }
    }
  };

export default config;
