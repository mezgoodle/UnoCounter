import 'package:flutter/material.dart';
import 'package:unocounter/models/player.dart';

class PlayerProvider with ChangeNotifier {
  PlayerProvider();
  PlayerProvider._();
  List<PlayerSerializer> _players = [];
  List<PlayerSerializer> get players => _players;

  List<PlayerSerializer> get selectedPlayers =>
      players.where((p) => p.selected).toList();
  int get selectedPlayersCount => selectedPlayers.length;

  factory PlayerProvider.withInitialPlayers() {
    final provider = PlayerProvider._();
    provider._initializePlayers();
    return provider;
  }

  void _initializePlayers() {
    _players = [
      PlayerSerializer(name: 'John Doe', winnableGames: 10),
      PlayerSerializer(name: 'Jane Doe', winnableGames: 20),
      PlayerSerializer(name: 'Bob Smith', winnableGames: 30),
    ];
    notifyListeners();
  }

  void addPlayer(String name) {
    _players.add(PlayerSerializer(name: name, winnableGames: 0));
    notifyListeners();
  }

  void toggleSelection(int index, bool value) {
    _players[index].selected = value;
    notifyListeners();
  }

  void removePlayer(int index) {
    _players.removeAt(index);
    notifyListeners();
  }
}
