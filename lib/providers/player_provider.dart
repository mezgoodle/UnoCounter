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
      _players = snapshot.map((doc) => PlayerSerializer.fromMap(doc)).toList();
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

  void removePlayer(int index) {
    _players.removeAt(index);
    notifyListeners();
  }
}
