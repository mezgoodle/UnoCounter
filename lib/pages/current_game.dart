import 'package:flutter/material.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/widgets/app_bar.dart';

class CurrentGamePage extends StatelessWidget {
  const CurrentGamePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final currentDealer = PlayerSerializer.fromMap({
      "name": "John Doe",
      "winnableGames": 10,
    });
    const movesMade = 10;
    return Scaffold(
      appBar: CustomAppBar(title: 'Current Game'),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Moves made: $movesMade',
              style: const TextStyle(fontSize: 24),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Current Dealer: ${currentDealer.name}',
                  style: const TextStyle(fontSize: 24),
                ),
                const SizedBox(width: 8),
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.red,
                  ),
                )
              ],
            ),
          ],
        ),
      ),
    );
  }
}
