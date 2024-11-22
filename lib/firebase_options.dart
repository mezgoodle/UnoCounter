// File generated by FlutterFire CLI.
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for ios - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDck2dbdSIMWGAXv_N0D2-bmc1_I85AoLE',
    appId: '1:149051998392:web:bac786b09d87d5fc66744d',
    messagingSenderId: '149051998392',
    projectId: 'unocounter-65b56',
    authDomain: 'unocounter-65b56.firebaseapp.com',
    storageBucket: 'unocounter-65b56.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDoByKBwL9aeiufo8IGbBV6Yi0UJ2T-EfQ',
    appId: '1:149051998392:android:41b9f64ac609d8ed66744d',
    messagingSenderId: '149051998392',
    projectId: 'unocounter-65b56',
    storageBucket: 'unocounter-65b56.firebasestorage.app',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyDck2dbdSIMWGAXv_N0D2-bmc1_I85AoLE',
    appId: '1:149051998392:web:beadbcb5989bf9a566744d',
    messagingSenderId: '149051998392',
    projectId: 'unocounter-65b56',
    authDomain: 'unocounter-65b56.firebaseapp.com',
    storageBucket: 'unocounter-65b56.firebasestorage.app',
  );
}
