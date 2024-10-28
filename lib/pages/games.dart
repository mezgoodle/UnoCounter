import 'package:flutter/material.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class GamesPage extends StatelessWidget {
  const GamesPage({super.key});

  final List<List<String>> games = const [
    ['Game 1', 'Player 1', 'Player 2'],
    ['Game 2', 'Player 1', 'Player 2'],
    ['Game 3', 'Player 1', 'Player 2'],
    ['Game 4', 'Player 1', 'Player 2'],
    ['Game 5', 'Player 1', 'Player 2'],
  ];

  @override
  Widget build(BuildContext context) {
    // TODO: show here as a list of games, table
    return Scaffold(
      appBar: CustomAppBar(title: 'Games Page'),
      body: Column(
        children: [
          Table(
              border: TableBorder.symmetric(),
              children: games.map((row) {
                return TableRow(
                  children: row.map((cell) {
                    return TableCell(
                      child: Text(
                        cell,
                        style: const TextStyle(fontSize: 20),
                      ),
                    );
                  }).toList(),
                );
              }).toList()),
          Center(
            child: CustomButton(
              text: 'Go back!',
              onPressed: () {
                Navigator.pop(context);
              },
            ),
          ),
        ],
      ),
    );
  }
}
