import 'package:flutter/material.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/repositories/player_repository.dart';

class PlayerProvider with ChangeNotifier {
  final PlayerRepository _playerRepository;
  bool _isLoading = false;
  bool _hasError = false;

  PlayerProvider(this._playerRepository) {
    _initializePlayersStream();
  }

  List<PlayerSerializer> _players = [];
  List<PlayerSerializer> get players => _players;

  List<PlayerSerializer> get selectedPlayers =>
      players.where((p) => p.selected).toList();
  int get selectedPlayersCount => selectedPlayers.length;

  bool get isLoading => _isLoading;
  bool get hasError => _hasError;

  void _initializePlayersStream() {
    _isLoading = true;
    notifyListeners();
    _playerRepository.getAll().listen((players) {
      final newPlayers = players;
      for (final player in _players) {
        if (newPlayers.containsKey(player.id)) {
          newPlayers[player.id!]!.selected = player.selected;
        }
      }
      _players = newPlayers.values.toList();
      _isLoading = false;
      notifyListeners();
    }, onError: (error) {
      debugPrint('Error in players stream: $error');
      _hasError = true;
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<void> addPlayer(String name) async {
    final newPlayer = PlayerSerializer(name: name, winnableGames: 0);
    try {
      await _playerRepository.add(newPlayer);
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
      await _playerRepository.delete(documentId);
    } catch (e) {
      debugPrint('Error removing player: $e');
    }
  }
}
