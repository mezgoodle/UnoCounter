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
}
