import 'package:flutter/material.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class Game {
  final String name;
  final List<String> players;

  const Game({required this.name, required this.players});
}

class GamesPage extends StatelessWidget {
  final List<Game> games;
  final bool isLoading;
  final String? error;

  const GamesPage({
    Key? key,
    this.games = const [
      Game(name: 'Game 1', players: ['Player 1', 'Player 2']),
      Game(name: 'Game 2', players: ['Player 1', 'Player 2']),
      Game(name: 'Game 3', players: ['Player 1', 'Player 2']),
      Game(name: 'Game 4', players: ['Player 1', 'Player 2']),
      Game(name: 'Game 5', players: ['Player 1', 'Player 2']),
    ],
    this.isLoading = false,
    this.error,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (error != null) {
      return Center(child: Text(error!));
    }
    if (games.isEmpty) {
      return const Center(child: Text('No games found'));
    }
    return Scaffold(
      appBar: CustomAppBar(title: 'Games Page'),
      body: SingleChildScrollView(
        child: Column(
          children: [
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: [
                  DataColumn(label: Text('Game')),
                  DataColumn(label: Text('Players')),
                ],
                rows: games.map((row) {
                  return DataRow(
                    cells: [
                      DataCell(Text(row.name)),
                      DataCell(Text(row.players.join(', '))),
                    ],
                  );
                }).toList(),
              ),
            ),
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
      ),
    );
  }
}
