import 'package:unocounter/database/firestore.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/repositories/repository.dart';
import 'package:unocounter/utils/logger.dart';

class PlayerRepository implements IRepository<PlayerSerializer> {
  final String collectionName = 'players';
  final FirestoreClient _client;

  PlayerRepository(this._client);

  @override
  add(PlayerSerializer item) {
    logger.i("Adding new player", error: {"player": item.toString()});
    return _client.addDocument(collectionName, item.toMap());
  }

  @override
  update(String id, PlayerSerializer item) {
    logger.i("Updating player", error: {"id": id, "player": item.toString()});
    return _client.updateDocument(collectionName, id, item.toMap());
  }

  @override
  delete(String id) {
    logger.i("Deleting player", error: {"id": id});
    return _client.deleteDocument(collectionName, id);
  }

  @override
  getAll() {
    logger.i("Retrieving all players");
    return _client.getDocumentsStream(collectionName).map((snapshot) {
      final newPlayers = <String, PlayerSerializer>{};

      for (final doc in snapshot) {
        final player = PlayerSerializer.fromMap(doc);
        if (player.id != null) {
          newPlayers[player.id!] = player;
        } else {
          logger.e(
            'Failed to process player: missing ID',
            error: {'player_data': player.toString()},
          );
          continue;
        }
      }

      return newPlayers;
    });
  }
}
