import 'package:flutter/material.dart';
import 'package:unocounter/database/firebase.dart';
import 'package:unocounter/models/player.dart';

class PlayerProvider with ChangeNotifier {
  final FirestoreClient _fireStoreClient;

  PlayerProvider(this._fireStoreClient);
  PlayerProvider._(this._fireStoreClient);

  List<PlayerSerializer> _players = [];
  List<PlayerSerializer> get players => _players;

  List<PlayerSerializer> get selectedPlayers =>
      players.where((p) => p.selected).toList();
  int get selectedPlayersCount => selectedPlayers.length;

  factory PlayerProvider.withInitialPlayers(FirestoreClient fireStoreClient) {
    final provider = PlayerProvider._(fireStoreClient);
    provider.initializePlayers();
    return provider;
  }

  Future<void> initializePlayers() async {
    _initializePlayersStream();
  }

  void _initializePlayersStream() {
    _fireStoreClient.getDocumentsStream('players').listen((snapshot) {
      final newPlayers = <String, PlayerSerializer>{};

      for (final doc in snapshot) {
        final player = PlayerSerializer.fromMap(doc);
        newPlayers[player.id!] = player;
      }

      // Update selected status for existing players
      for (final player in _players) {
        if (newPlayers.containsKey(player.id)) {
          newPlayers[player.id!]!.selected = player.selected;
        }
      }

      _players = newPlayers.values.toList();
      notifyListeners();
    });
  }

  Future<void> addPlayer(String name) async {
    final newPlayer = PlayerSerializer(name: name, winnableGames: 0);
    await _fireStoreClient.addDocument('players', newPlayer.toMap());
  }

  void toggleSelection(int index, bool value) {
    _players[index].selected = value;
    notifyListeners();
  }

  void removePlayer(String documentId) async {
    await _fireStoreClient.deleteDocument('players', documentId);
  }
}
