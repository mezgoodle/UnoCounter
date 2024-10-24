import 'package:flutter/material.dart';
import 'package:unocounter/pages/games.dart';
import 'package:unocounter/pages/new_game.dart';
import 'package:unocounter/widgets/app_bar.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Uno Counter'),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.3,
              child: Image(
                image: AssetImage('images/logo.png'),
              ),
            ),
            SizedBox(height: 30),
            FractionallySizedBox(
              widthFactor: 0.8,
              child: ElevatedButton(
                child: const Text(
                  'See all games!',
                  style: TextStyle(fontSize: 20),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const GamesPage()),
                  );
                },
              ),
            ),
            SizedBox(height: 15),
            FractionallySizedBox(
              widthFactor: 0.8,
              child: ElevatedButton(
                child: const Text(
                  'Create new game!',
                  style: TextStyle(fontSize: 20),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const NewGamePage()),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
