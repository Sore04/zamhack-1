import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zamhack.app',
  appName: 'ZamHack',
  webDir: 'public',          // ← changed from 'out' to 'public'
  server: {
    url: 'https://zamhack.vercel.app',
    cleartext: true
  }
};

export default config;