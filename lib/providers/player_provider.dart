import 'package:flutter/material.dart';
import 'package:unocounter/models/player.dart';

class PlayerProvider with ChangeNotifier {
  PlayerProvider._();
  List<Player> _players = [];

  List<Player> get players => _players;

  List<Player> get selectedPlayers => players.where((p) => p.selected).toList();
  int get selectedPlayersCount => selectedPlayers.length;

  factory PlayerProvider.withInitialPlayers() {
    final provider = PlayerProvider._();
    provider.initializePlayers();
    return provider;
  }

  factory PlayerProvider() {
    return PlayerProvider._();
  }

  void initializePlayers() {
    _players = [
      Player(name: 'John Doe', winnableGames: 10),
      Player(name: 'Jane Doe', winnableGames: 20),
      Player(name: 'Bob Smith', winnableGames: 30),
    ];
    notifyListeners();
  }

  void addPlayer(String name) {
    _players.add(Player(name: name, winnableGames: 0));
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
