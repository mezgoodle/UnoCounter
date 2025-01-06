import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/providers/player_provider.dart';
import 'package:unocounter/constants/values.dart';

class NewGamePage extends StatelessWidget {
  const NewGamePage({super.key});

  final int maximumPlayersCount = Values.maximumSelectedPlayers;

  void _addPlayer(
      String name, PlayerProvider playerProvider, BuildContext context) {
    final players = playerProvider.players;
    if (players
        .any((player) => player.name.toLowerCase() == name.toLowerCase())) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Player already exists!")),
      );
      return;
    }
    Provider.of<PlayerProvider>(context, listen: false).addPlayer(name);
    Navigator.of(context).pop();
  }

  void _startGame(BuildContext context) {
    final playerProvider = Provider.of<PlayerProvider>(context, listen: false);
    final selectedPlayers =
        playerProvider.players.where((p) => p.selected).toList();

    if (selectedPlayers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Select at least one player!")),
      );
      return;
    }

    Navigator.pushNamed(context, '/game', arguments: selectedPlayers);
  }

  void _showAddPlayerDialog(BuildContext context) {
    final nameController = TextEditingController();
    var isInputValid = true;

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setState) {
            return AlertDialog(
              title: Text('Add Player'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameController,
                    decoration: InputDecoration(
                      hintText: "Enter player's name",
                      errorText: isInputValid ? null : 'Name cannot be empty',
                    ),
                    onSubmitted: (_) {
                      if (nameController.text.trim().isNotEmpty) {
                        final playerName = nameController.text.trim();
                        _addPlayer(
                          playerName,
                          Provider.of<PlayerProvider>(
                            context,
                            listen: false,
                          ),
                          context,
                        );
                      }
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  child: Text('Cancel'),
                  onPressed: () {
                    Navigator.of(dialogContext).pop();
                  },
                ),
                TextButton(
                  child: Text('Add'),
                  onPressed: () {
                    final playerName = nameController.text.trim();
                    setState(() {
                      isInputValid = playerName.isNotEmpty;
                    });

                    if (isInputValid) {
                      _addPlayer(
                        playerName,
                        Provider.of<PlayerProvider>(
                          context,
                          listen: false,
                        ),
                        context,
                      );
                    }
                  },
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<dynamic> _showDeleteDialog(BuildContext context, PlayerSerializer row,
      PlayerProvider playerProvider) {
    return showDialog(
        context: context,
        builder: (BuildContext context) => AlertDialog(
              title: const Text('Delete Player'),
              content: Text.rich(
                TextSpan(
                  children: [
                    TextSpan(text: 'Are you sure you want to delete '),
                    TextSpan(
                      text: row.name,
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    TextSpan(text: '?'),
                  ],
                ),
              ),
              actions: [
                TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text('Cancel')),
                TextButton(
                    onPressed: () {
                      if (row.id != null) {
                        playerProvider.removePlayer(row.id!);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content:
                                  Text('Cannot delete player: Invalid ID')),
                        );
                      }
                      Navigator.of(context).pop();
                    },
                    child: Text('Delete')),
              ],
            ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'New Game'),
      body: Consumer<PlayerProvider>(builder: (context, playerProvider, _) {
        if (playerProvider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (playerProvider.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'Failed to load players',
                  style: Theme.of(context).textTheme.titleMedium,
                )
              ],
            ),
          );
        }
        if (playerProvider.players.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'No players found',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 16),
                CustomButton(
                  text: 'Add Player',
                  onPressed: () => _showAddPlayerDialog(context),
                ),
              ],
            ),
          );
        }
        final selectedPlayersCount = playerProvider.selectedPlayersCount;
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                'Selected Players: $selectedPlayersCount',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: [
                  DataColumn(label: Text('Name')),
                  DataColumn(label: Text('Number of Winnable Games')),
                  DataColumn(label: Text('Select')),
                  DataColumn(label: Text('Delete')),
                ],
                rows: playerProvider.players.asMap().entries.map((entry) {
                  int index = entry.key;
                  PlayerSerializer row = entry.value;
                  return DataRow(
                    cells: [
                      DataCell(Text(row.name)),
                      DataCell(Text(row.winnableGames.toString())),
                      DataCell(Switch(
                        value: row.selected,
                        onChanged: (bool value) {
                          if (playerProvider.selectedPlayersCount <
                                  maximumPlayersCount ||
                              !value) {
                            playerProvider.toggleSelection(index, value);
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: Text(
                                      "You can select only $maximumPlayersCount players!")),
                            );
                          }
                        },
                      )),
                      DataCell(Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () =>
                                _showDeleteDialog(context, row, playerProvider),
                          ),
                        ],
                      )),
                    ],
                  );
                }).toList(),
              ),
            ),
            Center(
              child: Column(
                children: [
                  if (selectedPlayersCount > 0)
                    Padding(
                      padding: EdgeInsets.only(bottom: 20),
                      child: CustomButton(
                        text: 'Start Game',
                        onPressed: () => _startGame(context),
                      ),
                    ),
                  CustomButton(
                    text: 'Add Player',
                    onPressed: () => _showAddPlayerDialog(context),
                  ),
                ],
              ),
            ),
            SizedBox(height: 20),
            Center(
              child: CustomButton(
                text: 'Go back!',
                onPressed: () {
                  Navigator.pop(context);
                },
              ),
            ),
          ],
        );
      }),
    );
  }
}
