import 'package:flutter/material.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class Player {
  final String name;
  final int winnableGames;
  bool selected;

  Player({
    required this.name,
    required this.winnableGames,
    this.selected = false,
  });
}

class NewGamePage extends StatefulWidget {
  const NewGamePage({super.key});

  @override
  State<NewGamePage> createState() => _NewGamePageState();
}

class _NewGamePageState extends State<NewGamePage> {
  final List<Player> players = [
    Player(name: 'John Doe', winnableGames: 10),
    Player(name: 'Jane Doe', winnableGames: 20),
    Player(name: 'Bob Smith', winnableGames: 30),
  ];

  void _onCheckboxChanged(int index, bool? value) {
    setState(() {
      players[index].selected = value ?? false;
    });
  }

  void _addPlayer(String name) {
    if (players
        .any((player) => player.name.toLowerCase() == name.toLowerCase())) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Player already exists!")),
      );
      return;
    }
    setState(() {
      players.add(Player(name: name, winnableGames: 0));
    });
  }

  void _removePlayer(int index) {
    setState(() {
      players.removeAt(index);
    });
  }

  void _showAddPlayerDialog() {
    final nameController = TextEditingController();
    var isInputValid = true;

    void dispose() {
      nameController.dispose();
    }

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setState) {
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
                        _addPlayer(nameController.text.trim());
                        Navigator.of(context).pop();
                        nameController.dispose();
                      }
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  child: Text('Cancel'),
                  onPressed: () {
                    Navigator.of(context).pop();
                    nameController.dispose();
                  },
                ),
                TextButton(
                  child: Text('Add'),
                  onPressed: () {
                    setState(() {
                      isInputValid = nameController.text.trim().isNotEmpty;
                    });

                    if (isInputValid) {
                      _addPlayer(nameController.text.trim());
                      Navigator.of(context).pop();
                      nameController.dispose();
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
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              'Selected Players: ${players.where((p) => p.selected).length}',
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
              rows: players.asMap().entries.map((entry) {
                int index = entry.key;
                Player row = entry.value;
                return DataRow(
                  cells: [
                    DataCell(Text(row.name)),
                    DataCell(Text(row.winnableGames.toString())),
                    DataCell(Switch(
                      value: row.selected,
                      onChanged: (bool value) {
                        _onCheckboxChanged(index, value);
                      },
                    )),
                    DataCell(Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _removePlayer(index),
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
              onPressed: _showAddPlayerDialog,
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
      ),
    );
  }
}
