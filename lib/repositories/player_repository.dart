import 'package:flutter/foundation.dart';
import 'package:unocounter/database/firestore.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/repositories/repository.dart';

class PlayerRepository implements IRepository<PlayerSerializer> {
  final String collectionName = 'players';
  final FirestoreClient _client;

  PlayerRepository(this._client);

  @override
  add(PlayerSerializer item) async {
    return await _client.addDocument(collectionName, item.toMap());
  }

  @override
  Future<void> update(String id, PlayerSerializer item) async {
    return await _client.updateDocument(collectionName, id, item.toMap());
  }

  @override
  delete(String id) async => await _client.deleteDocument(collectionName, id);

  @override
  getAll() {
    return _client.getDocumentsStream(collectionName).map((snapshot) {
      final newPlayers = <String, PlayerSerializer>{};

      for (final doc in snapshot) {
        final player = PlayerSerializer.fromMap(doc);
        if (player.id != null) {
          newPlayers[player.id!] = player;
        } else {
          debugPrint('Player has no id: $player');
          continue;
        }
      }

      return newPlayers;
    });
  }
}
