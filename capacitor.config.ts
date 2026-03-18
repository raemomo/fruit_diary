import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.diary.fruit',
  appName: '과일일기',
  webDir: 'dist',
  ios: {
    scrollEnabled: true,  // ← 이게 핵심
  },
  server: {
    allowNavigation: [
      "*.googleapis.com",
      "*.firebaseio.com",
      "*.firestore.googleapis.com"
    ]
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  }
};

export default config;