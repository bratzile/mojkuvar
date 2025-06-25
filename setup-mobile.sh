#!/bin/bash

APP_DIR="/opt/receptomat"
WEB_OUTPUT_DIR="$APP_DIR/dist"
MOBILE_DIR="$APP_DIR/mobile"

cd "$APP_DIR" || { echo "❌ Ne mogu da pristupim $APP_DIR"; exit 1; }

echo "✅ Ulazak u $APP_DIR..."

npm install @capacitor/core @capacitor/cli @capacitor/assets

npx cap init receptomat com.receptomat.app --web-dir=dist

cat <<EOF > capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.receptomat.app',
  appName: 'Receptomat',
  webDir: 'dist',
  bundledWebRuntime: false
};

export default config;
EOF

echo "✅ capacitor.config.ts generisan"

npm run build

npx cap add android
npx cap add ios
npx cap copy
npx cap sync

echo "📂 Otvaranje u Android Studio..."
npx cap open android

echo "📂 Otvaranje u Xcode..."
npx cap open ios

echo "✅ Gotovo. Možeš da builduješ i testiraš mobilne aplikacije."
echo "ℹ️ Web aplikacija ostaje dostupna na: /var/www/receptomat"
