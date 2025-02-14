import 'package:cloud_firestore/cloud_firestore.dart';

class GameSerializer {
  String? id;
  List<DocumentReference>? players = <DocumentReference>[];
  String? dealerId;
  Map<String, int>? scores;
  String? currentTurnPlayerId;

  GameSerializer({
    this.id,
    this.players,
    this.dealerId,
    this.scores,
    this.currentTurnPlayerId,
  });

  Map<String, dynamic> toMap() {
    return {
      'players': players,
      'dealerId': dealerId,
      'scores': scores,
      'currentTurnPlayerId': currentTurnPlayerId
    };
  }

  factory GameSerializer.fromMap(Map<String, dynamic> map) {
    List<DocumentReference>? players;
    if (map['players'] != null) {
      players =
          (map['players'] as List<dynamic>).map<DocumentReference>((item) {
        return item as DocumentReference; // Cast each item to DocumentReference
      }).toList();
    }

    return GameSerializer(
      id: map['id'] as String?,
      players: players,
      dealerId: map['dealerId'] as String?,
      scores: map['scores'] as Map<String, int>?,
      currentTurnPlayerId: map['currentTurnPlayerId'] as String?,
    );
  }
}
