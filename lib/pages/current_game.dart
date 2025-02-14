import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/providers/game_provider.dart';
import 'package:unocounter/providers/player_provider.dart';
import 'package:unocounter/widgets/app_bar.dart';

class CurrentGamePage extends StatefulWidget {
  final String gameId; // Приймаємо gameId як параметр
  const CurrentGamePage({Key? key, required this.gameId}) : super(key: key);

  @override
  CurrentGamePageState createState() => CurrentGamePageState();
}

class CurrentGamePageState extends State<CurrentGamePage> {
  //  Зараз не використовуємо тестові дані
  // final List<PlayerSerializer> _players = [
  //   PlayerSerializer(name: "Alice", winnableGames: 10, score: 15),
  //   PlayerSerializer(name: "Bob", winnableGames: 5, score: 25),
  //   PlayerSerializer(name: "Charlie", winnableGames: 12, score: 30),
  //   PlayerSerializer(name: "David", winnableGames: 8, score: 30),
  //   PlayerSerializer(name: "Eve", winnableGames: 15, score: 18),
  //   PlayerSerializer(name: "Frank", winnableGames: 10, score: 22),
  //   PlayerSerializer(name: "Grace", winnableGames: 10, score: 15),
  //   PlayerSerializer(name: "Henry", winnableGames: 5, score: 25),
  //   PlayerSerializer(name: "Ivy", winnableGames: 12, score: 30),
  //   PlayerSerializer(name: "Jack", winnableGames: 8, score: 30),
  //   PlayerSerializer(name: "Kate", winnableGames: 15, score: 18),
  //   PlayerSerializer(name: "Liam", winnableGames: 10, score: 22),
  // ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Current Game'),
      body: Padding(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
        child: Consumer<GameProvider>(builder: (context, gameProvider, _) {
          // Отримуємо поточну гру за ID
          final game =
              gameProvider.games.firstWhere((g) => g.id == widget.gameId);

          // Рахуємо загальну кількість ходів (можна отримати з Firebase, якщо потрібно)
          final int movesMade = 10; // Заміни на реальну логіку

          return Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Text(
                'Moves made: $movesMade',
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
                          child: _buildPlayerTable(
                              game.players ?? [])), // передаєм гравців з Game
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildPlayerTable(List<dynamic> playerRefs) {
    return Consumer<PlayerProvider>(
      builder: (context, playerProvider, _) {
        // Створюємо map id гравця -> об'єкт гравця для швидкого доступу
        final playerMap = {
          for (var player in playerProvider.players) player.id: player
        };

        return DataTable(
          columns: const [
            DataColumn(label: Text('Player')),
            DataColumn(label: Text('Score')),
            DataColumn(label: Text('Dealer')),
            DataColumn(label: Text('Actions')), // Додаємо колонку для дій
          ],
          rows: playerRefs.map((playerRef) {
            // Отримуємо ID гравця з DocumentReference
            final playerId = playerRef.id;
            final player = playerMap[playerId];

            // Якщо гравця не знайдено - показуємо текст
            if (player == null) {
              return DataRow(cells: [
                const DataCell(Text("Player not found")),
                const DataCell(Text("")),
                const DataCell(Text("")),
                const DataCell(Text("")),
              ]);
            }

            return DataRow(cells: [
              DataCell(Row(
                children: [
                  Text(player.name),
                  const SizedBox(width: 4),
                  // _buildLeaderIcon(player, leaders), // TODO
                ],
              )),
              DataCell(Text(player.score.toString())),
              DataCell(_buildDealerIcon(player.isDealer)),
              DataCell(
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove),
                      onPressed: () {
                        _updateScore(
                            context, widget.gameId, playerId, player.score - 1);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.add),
                      onPressed: () {
                        _updateScore(
                            context, widget.gameId, playerId, player.score + 1);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.star),
                      onPressed: () {
                        _setDealer(context, widget.gameId, playerId);
                      },
                    )
                  ],
                ),
              ),
            ]);
          }).toList(),
        );
      },
    );
  }

  Widget _buildDealerIcon(bool isDealer) {
    if (isDealer) {
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

  // Widget _buildLeaderIcon(
  //     PlayerSerializer player, List<PlayerSerializer>? leaders) {
  //   if (leaders != null && leaders.any((l) => l.name == player.name)) {
  //     return const Icon(Icons.emoji_events, color: Colors.amber);
  //   }
  //   return const SizedBox.shrink();
  // }

  // List<PlayerSerializer>? _findLeaders() { // TODO: find leaders on the server
  //   return [];
  // }

  // Метод для встановлення дилера
  void _setDealer(BuildContext context, String gameId, String playerId) {
    final gameProvider = Provider.of<GameProvider>(context, listen: false);
    gameProvider.setDealer(gameId, playerId);
  }

  // Метод для оновлення рахунку гравця
  void _updateScore(
      BuildContext context, String gameId, String playerId, int newScore) {
    final gameProvider = Provider.of<GameProvider>(context, listen: false);
    gameProvider.updateScore(gameId, playerId, newScore);
  }
}
