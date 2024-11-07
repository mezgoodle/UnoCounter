import 'package:flutter/material.dart';
import 'package:unocounter/pages/new_game.dart';
import 'package:unocounter/pages/games.dart';

import 'pages/home.dart';

void main() {
  runApp(const MyApp());
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
      },
    );
  }
}
