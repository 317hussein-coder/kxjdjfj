# MY MEDIA SEE — Native Android player

A new standalone C++20 Android NativeActivity project. The player uses Android NDK media APIs (no Qt, Java source, WebView, HTML, or CSS). Media support is provided by the device's Android media codecs and container parsers, so exact format support varies by device.

## Build
GitHub Actions workflow: **Build MY MEDIA SEE APK**. The debug APK is uploaded as an artifact named `MY-MEDIA-SEE-debug-apk`.

## Current scope
This initial native build is a real C++20 NativeActivity with Android's NDK media player API and intent handling for direct media URLs. It is not a claim that 50 features are already implemented. Features are tracked explicitly in `FEATURES.md`.
