import 'dotenv/config'; // This loads your .env file locally

export default ({ config }) => ({
  ...config,
  name: 'parksapp',
  slug: 'parksapp',
  version: '1.0.0',
  scheme: 'parksapp',
  newArchEnabled: true,
  web: {
    bundler: 'metro',
    output: 'server',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to let you share them with your friends.',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
        locationWhenInUsePermission: 'Show current location on map.',
      },
    ],
    [
      '@rnmapbox/maps',
      {
        RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
        RNMapboxMapsVersion: '11.0.0',
      },
    ],
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.anonymous.parksapp',
    permissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '74638a57-36ec-4d5c-a76a-752b3495267a',
    },
  },
});
