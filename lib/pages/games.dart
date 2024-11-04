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
    return Scaffold(
      appBar: CustomAppBar(title: 'Games Page'),
      body: Column(
        children: [
          DataTable(
            columns: [
              DataColumn(label: Text('Game')),
              DataColumn(label: Text('Players')),
            ],
            rows: games.map((row) {
              return DataRow(
                cells: [
                  DataCell(Text(row.first)),
                  DataCell(Text(row.sublist(1).join(', '))),
                ],
              );
            }).toList(),
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
  }
}
