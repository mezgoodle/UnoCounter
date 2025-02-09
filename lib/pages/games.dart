import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:unocounter/models/game.dart';
import 'package:unocounter/providers/game_provider.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class Game {
  final String name;
  final List<String> players;

  const Game({required this.name, required this.players});
}

class GamesPage extends StatelessWidget {
  const GamesPage({super.key});

  @override
  Widget build(BuildContext context) {
    // if (isLoading) {
    //   return const Center(child: CircularProgressIndicator());
    // }
    // if (error != null) {
    //   return Center(child: Text(error!));
    // }
    // if (games.isEmpty) {
    //   return const Center(child: Text('No games found'));
    // }
    return Scaffold(
      appBar: CustomAppBar(title: 'Games Page'),
      body: Consumer<GameProvider>(builder: (context, gameProvider, _) {
        if (gameProvider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (gameProvider.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'Failed to load games',
                  style: Theme.of(context).textTheme.titleMedium,
                )
              ],
            ),
          );
        }
        if (gameProvider.games.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'No games found',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 16),
                // CustomButton(
                //   text: 'Add Player',
                //   onPressed: () => _showAddPlayerDialog(context),
                // ),
              ],
            ),
          );
        }
        return SingleChildScrollView(
          child: Column(
            children: [
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columns: [
                    DataColumn(label: Text('Game')),
                    DataColumn(label: Text('Players')),
                  ],
                  rows: gameProvider.games.asMap().entries.map((entry) {
                    // int index = entry.key;
                    GameSerializer row = entry.value;
                    return DataRow(
                      cells: [
                        DataCell(Text(row.id.toString())),
                        DataCell(Text(row.players!.join(', '))),
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
        );
      }),
    );
  }
}
