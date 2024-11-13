import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:unocounter/database/firebase.dart';
import 'package:unocounter/firebase_options.dart';
import 'package:unocounter/pages/new_game.dart';
import 'package:unocounter/pages/games.dart';
import 'package:provider/provider.dart';
import 'providers/player_provider.dart';
import 'package:unocounter/pages/home.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  FirestoreClient firestoreClient = FirestoreClient();
  // Отримання документів
  QuerySnapshot querySnapshot = await firestoreClient.getDocuments('players');
  for (var doc in querySnapshot.docs) {
    print(doc.data());
  }
  runApp(
    ChangeNotifierProvider(
      create: (context) => PlayerProvider.withInitialPlayers(),
      child: const MyApp(),
    ),
  );
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
        '/game': (context) => const HomePage(),
      },
    );
  }
}
