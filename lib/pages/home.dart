import 'package:flutter/material.dart';
import 'package:unocounter/pages/games.dart';
import 'package:unocounter/pages/new_game.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('First Route'),
      ),
      body: Center(
        child: Column(
          children: [
            ElevatedButton(
              child: const Text('See all games!'),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const GamesPage()),
                );
              },
            ),
            ElevatedButton(
              child: const Text('Create new game!'),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const NewGamePage()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
