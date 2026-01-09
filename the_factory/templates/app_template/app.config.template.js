import 'dotenv/config';

export default {
  expo: {
    name: "{{APP_NAME}}",
    slug: "{{APP_SLUG}}",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "{{SPLASH_BACKGROUND_COLOR}}"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "{{BUNDLE_IDENTIFIER}}"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "{{SPLASH_BACKGROUND_COLOR}}"
      },
      package: "{{BUNDLE_IDENTIFIER}}"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    scheme: "{{APP_SLUG}}",
    plugins: [
      "expo-router"
    ],
    extra: {
      revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
      eas: {
        projectId: "PLACEHOLDER_EAS_PROJECT_ID"
      }
    }
  }
};