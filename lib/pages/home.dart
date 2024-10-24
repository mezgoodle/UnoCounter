import 'package:flutter/material.dart';
import 'package:unocounter/pages/games.dart';
import 'package:unocounter/pages/new_game.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

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
            CustomButton(
              text: "See all games!",
              onPressed: () => Navigator.push(context,
                  MaterialPageRoute(builder: (context) => GamesPage())),
            ),
            SizedBox(height: 15),
            CustomButton(
                text: 'Create new game!',
                onPressed: () {
                  Navigator.push(context,
                      MaterialPageRoute(builder: (context) => NewGamePage()));
                }),
          ],
        ),
      ),
    );
  }
}
