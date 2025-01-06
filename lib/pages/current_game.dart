import 'package:flutter/material.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/widgets/app_bar.dart';

class CurrentGamePage extends StatefulWidget {
  const CurrentGamePage({Key? key}) : super(key: key);

  @override
  CurrentGamePageState createState() => CurrentGamePageState();
}

class CurrentGamePageState extends State<CurrentGamePage> {
  final String _currentDealerName = "Bob";
  final int _movesMade = 10;

  // Тимчасові тестові дані
  final List<PlayerSerializer> _players = [
    PlayerSerializer(name: "Alice", winnableGames: 10, score: 15),
    PlayerSerializer(name: "Bob", winnableGames: 5, score: 25),
    PlayerSerializer(name: "Charlie", winnableGames: 12, score: 30),
    PlayerSerializer(name: "David", winnableGames: 8, score: 30),
    PlayerSerializer(name: "Eve", winnableGames: 15, score: 18),
    PlayerSerializer(name: "Frank", winnableGames: 10, score: 22),
    PlayerSerializer(name: "Grace", winnableGames: 10, score: 15),
    PlayerSerializer(name: "Henry", winnableGames: 5, score: 25),
    PlayerSerializer(name: "Ivy", winnableGames: 12, score: 30),
    PlayerSerializer(name: "Jack", winnableGames: 8, score: 30),
    PlayerSerializer(name: "Kate", winnableGames: 15, score: 18),
    PlayerSerializer(name: "Liam", winnableGames: 10, score: 22),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Current Game'),
      body: Padding(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
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
                  child: SizedBox(
                    width: MediaQuery.of(context).size.width - 32,
                    child: SingleChildScrollView(
                        scrollDirection: Axis.vertical,
                        child: _buildPlayerTable()),
                  ),
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
    final leader = _findLeader();
    return DataTable(
      columns: const [
        DataColumn(label: Text('Player')),
        DataColumn(label: Text('Score')),
        DataColumn(label: Text('Dealer')),
      ],
      rows: _players.map((player) {
        return DataRow(cells: [
          DataCell(Row(
            children: [
              Text(player.name),
              const SizedBox(width: 4),
              _buildLeaderIcon(player, leader),
            ],
          )),
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

  Widget _buildLeaderIcon(PlayerSerializer player, PlayerSerializer? leader) {
    if (leader != null && player.name == leader.name) {
      return const Icon(Icons.emoji_events, color: Colors.amber);
    }
    return const SizedBox.shrink();
  }

  PlayerSerializer? _findLeader() {
    if (_players.isEmpty) return null;
    PlayerSerializer leader = _players.first;
    for (final player in _players) {
      if (player.score > leader.score) {
        leader = player;
      }
    }
    return leader;
  }
}
