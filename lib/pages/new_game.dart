import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/providers/player_provider.dart';

class NewGamePage extends StatelessWidget {
  const NewGamePage({super.key});

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'New Game Page'),
      body: Consumer<PlayerProvider>(builder: (context, playerProvider, child) {
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                'Selected Players: ${playerProvider.players.where((p) => p.selected).length}',
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
                  Player row = entry.value;
                  return DataRow(
                    cells: [
                      DataCell(Text(row.name)),
                      DataCell(Text(row.winnableGames.toString())),
                      DataCell(Switch(
                        value: row.selected,
                        onChanged: (bool value) {
                          playerProvider.toggleSelection(index, value);
                        },
                      )),
                      DataCell(Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () => playerProvider.removePlayer(index),
                          ),
                        ],
                      )),
                    ],
                  );
                }).toList(),
              ),
            ),
            Center(
              child: CustomButton(
                text: 'Add Player',
                onPressed: () => _showAddPlayerDialog(context),
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
