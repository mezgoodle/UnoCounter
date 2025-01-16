import 'package:unocounter/database/firestore.dart';
import 'package:unocounter/models/game.dart';
import 'package:unocounter/repositories/repository.dart';
import 'package:unocounter/utils/logger.dart';

class GameRepository implements IRepository<GameSerializer> {
  final String collectionName = 'games';
  final FirestoreClient _client;

  GameRepository(this._client);

  @override
  add(GameSerializer item) {
    logger.i("Adding new game", error: {"game": item.toString()});
    return _client.addDocument(collectionName, item.toMap());
  }

  @override
  update(String id, GameSerializer item) {
    logger.i("Updating game", error: {"id": id, "game": item.toString()});
    return _client.updateDocument(collectionName, id, item.toMap());
  }

  @override
  delete(String id) {
    logger.i("Deleting game", error: {"id": id});
    return _client.deleteDocument(collectionName, id);
  }

  @override
  getAll() {
    logger.i("Retrieving all games");
    return _client.getDocumentsStream(collectionName).map((snapshot) {
      final newGames = <String, GameSerializer>{};

      for (final doc in snapshot) {
        final game = GameSerializer.fromMap(doc);
        if (game.id != null) {
          newGames[game.id!] = game;
        } else {
          logger.e(
            'Failed to process game: missing ID',
            error: {'game_data': game.toString()},
          );
          continue;
        }
      }

      return newGames;
    });
  }
}
