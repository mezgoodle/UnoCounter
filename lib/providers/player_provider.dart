import 'package:flutter/material.dart';
import 'package:unocounter/database/firestore.dart';
import 'package:unocounter/models/player.dart';

class PlayerProvider with ChangeNotifier {
  final FirestoreClient _fireStoreClient;
  bool _isLoading = false;

  PlayerProvider(this._fireStoreClient) {
    _initializePlayersStream();
  }

  List<PlayerSerializer> _players = [];
  List<PlayerSerializer> get players => _players;

  List<PlayerSerializer> get selectedPlayers =>
      players.where((p) => p.selected).toList();
  int get selectedPlayersCount => selectedPlayers.length;

  bool get isLoading => _isLoading;

  void _initializePlayersStream() {
    _isLoading = true;
    notifyListeners();
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
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<void> addPlayer(String name) async {
    final newPlayer = PlayerSerializer(name: name, winnableGames: 0);
    try {
      await _fireStoreClient.addDocument('players', newPlayer.toMap());
    } catch (e) {
      debugPrint('Error adding player: $e');
    }
  }

  void toggleSelection(int index, bool value) {
    _players[index].selected = value;
    notifyListeners();
  }

  Future<void> removePlayer(String documentId) async {
    try {
      await _fireStoreClient.deleteDocument('players', documentId);
    } catch (e) {
      debugPrint('Error removing player: $e');
    }
  }
}
