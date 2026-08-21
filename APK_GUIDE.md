# How to Build the Med AI APK

Since this is a web environment, I cannot directly generate the binary `.apk` file for you. However, I have configured the project so you can build it easily using **Capacitor**.

### Prerequisites
- **Node.js** installed
- **Android Studio** installed (for the final build step)

### Step 1: Install Dependencies
Open your terminal in the project folder and run:

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Build the Web Project
First, we need to generate the static web files (HTML/CSS/JS).

```bash
npm run build
# OR if using Vite directly
npx vite build
```

*This creates a `dist` folder.*

### Step 3: Initialize Android Project
Run the following commands to create the Android native project structure:

```bash
npx cap add android
npx cap sync
```

### Step 4: Open in Android Studio
This command will open the `android` folder in Android Studio:

```bash
npx cap open android
```

### Step 5: Build APK
1. Inside Android Studio, wait for Gradle sync to finish.
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Once finished, a popup will appear. Click **locate** to find your `app-debug.apk`.
4. Transfer this file to your phone and install it!

### Troubleshooting
- If you see a "white screen" on the phone, ensure your `base` path in `vite.config.ts` (if you have one) is set to `./` or `/`.
- Ensure permissions in `AndroidManifest.xml` (inside `android/app/src/main`) include Internet and Camera access. Capacitor usually adds these automatically based on usage.
