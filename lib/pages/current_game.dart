import 'package:flutter/material.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/widgets/app_bar.dart';

class CurrentGamePage extends StatefulWidget {
  const CurrentGamePage({Key? key}) : super(key: key);

  @override
  _CurrentGamePageState createState() => _CurrentGamePageState();
}

class _CurrentGamePageState extends State<CurrentGamePage> {
  final String _currentDealerName = "Bob";
  final int _movesMade = 10;

  // Тимчасові тестові дані
  final List<PlayerSerializer> _players = [
    PlayerSerializer(name: "Alice", winnableGames: 10, score: 15),
    PlayerSerializer(name: "Bob", winnableGames: 5, score: 25),
    PlayerSerializer(name: "Charlie", winnableGames: 12, score: 10),
    PlayerSerializer(name: "David", winnableGames: 8, score: 30),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Current Game'),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Text(
              'Moves made: $_movesMade',
              style: const TextStyle(fontSize: 24),
            ),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: _buildPlayerTable(),
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildPlayerTable() {
    return DataTable(
      columns: const [
        DataColumn(label: Text('Player')),
        DataColumn(label: Text('Score')),
        DataColumn(label: Text('Dealer')),
      ],
      rows: _players.map((player) {
        return DataRow(cells: [
          DataCell(Text(player.name)),
          DataCell(Text(player.score.toString())),
          DataCell(
            _buildDealerIcon(player.name),
          ),
        ]);
      }).toList(),
    );
  }

  Widget _buildDealerIcon(String playerName) {
    if (playerName == _currentDealerName) {
      return Container(
        width: 8,
        height: 8,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.red,
        ),
      );
    }
    return const SizedBox.shrink();
  }
}
