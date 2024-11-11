import 'package:drift/drift.dart';
import 'package:flutter/material.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/database/database.dart';

class PlayerProvider with ChangeNotifier {
  PlayerProvider._();
  late AppDatabase _db;
  List<PlayerSerializer> _players = [];

  List<PlayerSerializer> get players => _players;

  List<PlayerSerializer> get selectedPlayers =>
      players.where((p) => p.selected).toList();
  int get selectedPlayersCount => selectedPlayers.length;

  factory PlayerProvider.withInitialPlayers() {
    final provider = PlayerProvider._();
    provider.initializePlayers();
    return provider;
  }

  factory PlayerProvider() {
    return PlayerProvider._();
  }

  Future<void> initializePlayers() async {
    _players = (await _db.getPlayers()).cast<PlayerSerializer>();
    notifyListeners();
  }

  Future<void> addPlayer(String name) async {
    await _db.insertPlayer(PlayersCompanion(name: Value(name)));
    notifyListeners();
  }

  void toggleSelection(int index, bool value) {
    _players[index].selected = value;
    notifyListeners();
  }

  Future<void> removePlayer(int id) async {
    await _db.deletePlayer(id);
    notifyListeners();
  }

  Future<void> updatePlayerDetails(
      int id, String name, int winnableGames) async {
    final player = await (_db.select(_db.players)
          ..where((tbl) => tbl.id.equals(id)))
        .getSingle();
    await _db.updatePlayer(
        player.copyWith(name: name, winnableGames: winnableGames));
    notifyListeners();
  }
}
