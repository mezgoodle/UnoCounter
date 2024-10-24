import 'package:flutter/material.dart';
import 'package:unocounter/pages/games.dart';
import 'package:unocounter/pages/new_game.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home page'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.3,
              child: Image(
                image: AssetImage('images/logo.png'),
              ),
            ),
            SizedBox(height: 30),
            ElevatedButton(
              child: const Text('See all games!'),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const GamesPage()),
                );
              },
            ),
            SizedBox(height: 15),
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
