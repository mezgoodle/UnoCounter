import 'package:cloud_firestore/cloud_firestore.dart';
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
    provider._initializePlayers();
    return provider;
  }

  CollectionReference<PlayerSerializer> get playersCollection =>
      _fireStoreClient.collectionRef<PlayerSerializer>(
        'players',
        fromFirestore: (snapshot, _) =>
            PlayerSerializer.fromMap(snapshot.data()!),
        toFirestore: (player, _) => player.toMap(),
      );

  Future<void> _initializePlayers() async {
    _players = (await playersCollection.get())
        .docs
        .map((snapshot) => snapshot.data())
        .toList();
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
