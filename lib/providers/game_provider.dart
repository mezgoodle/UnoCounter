import 'package:flutter/material.dart';
import 'package:unocounter/models/game.dart';
import 'package:unocounter/repositories/game_repository.dart';
import 'package:unocounter/utils/logger.dart';

class GameProvider with ChangeNotifier {
  final GameRepository _gameRepository;
  bool _isLoading = false;
  bool _hasError = false;

  GameProvider(this._gameRepository) {
    _initializeGamesStream();
  }

  List<GameSerializer> _games = [];
  List<GameSerializer> get games => _games;

  bool get isLoading => _isLoading;
  bool get hasError => _hasError;

  void _initializeGamesStream() {
    _isLoading = true;
    notifyListeners();
    _gameRepository.getAll().listen((games) {
      _games = games.values.toList();
      _isLoading = false;
      notifyListeners();
    }, onError: (error) {
      logger.e('Error in games stream', error: error, time: DateTime.now());
      _hasError = true;
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<void> addGame(String name) async {}

  Future<void> removeGame(String documentId) async {}

  Future<void> setDealer(String gameId, String playerId) async {
    try {
      final game = _games.firstWhere((g) => g.id == gameId);
      game.dealerId = playerId;
      await _gameRepository.update(gameId, game);
      notifyListeners();
    } catch (e) {
      logger.e('Error setting dealer', error: e, time: DateTime.now());
    }
  }

  Future<void> updateScore(String gameId, String playerId, int score) async {
    try {
      final game = _games.firstWhere((g) => g.id == gameId);
      game.scores ??= {}; // Ініціалізація мапи, якщо її ще немає
      game.scores![playerId] = score;
      await _gameRepository.update(gameId, game);
      notifyListeners();
    } catch (e) {
      logger.e('Error updating score', error: e, time: DateTime.now());
    }
  }

  Future<void> setCurrentTurnPlayer(String gameId, String playerId) async {
    try {
      final game = _games.firstWhere((g) => g.id == gameId);
      game.currentTurnPlayerId = playerId;
      await _gameRepository.update(gameId, game);
      notifyListeners();
    } catch (e) {
      logger.e('Error setting current turn player',
          error: e, time: DateTime.now());
    }
  }
}
