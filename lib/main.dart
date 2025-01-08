import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:unocounter/database/firestore.dart';
import 'package:unocounter/firebase_options.dart';
import 'package:unocounter/pages/current_game.dart';
import 'package:unocounter/pages/new_game.dart';
import 'package:unocounter/pages/games.dart';
import 'package:provider/provider.dart';
import 'package:unocounter/repositories/player_repository.dart';
import 'providers/player_provider.dart';
import 'package:unocounter/pages/home.dart';
import 'package:unocounter/utils/logger.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    logger.i('Firebase successfully initialized', error: {
      'platform': DefaultFirebaseOptions.currentPlatform.toString(),
      'timestamp': DateTime.now().toIso8601String(),
      'environment': const String.fromEnvironment('FLUTTER_ENV',
          defaultValue: 'development')
    });
  } catch (e) {
    logger.e(
      'Failed to initialize Firebase',
      error: e,
      stackTrace: StackTrace.current,
    );
    runApp(FireBaseErrorWidget());
    return;
  }

  FirestoreClient firestoreClient = FirestoreClient();

  runApp(
    MultiProvider(
      providers: [
        Provider<PlayerRepository>(
          create: (_) => PlayerRepository(firestoreClient),
        ),
        ChangeNotifierProvider(
          create: (context) => PlayerProvider(context.read<PlayerRepository>()),
        )
      ],
      child: const MyApp(),
    ),
  );
}

class FireBaseErrorWidget extends StatelessWidget {
  const FireBaseErrorWidget({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Text(
              "Failed to initialize Firebase. Please check your internet connection"),
        ),
      ),
    );
  }
}

ThemeData myTheme = ThemeData(
  primaryColor: Colors.blue.shade700,
  fontFamily: "Roboto",
  scaffoldBackgroundColor: Colors.blue.shade300,
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: true,
      home: HomePage(),
      theme: myTheme,
      title: "Uno Counter",
      initialRoute: '/',
      routes: {
        '/new-game': (context) => const NewGamePage(),
        '/games': (context) => const GamesPage(),
        '/game': (context) => const CurrentGamePage(),
      },
    );
  }
}
