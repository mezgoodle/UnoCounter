import 'package:cloud_firestore/cloud_firestore.dart';

class GameSerializer {
  String? id;
  List<DocumentReference>? players = <DocumentReference>[];
  GameSerializer({
    this.id,
    this.players,
  });

  Map<String, dynamic> toMap() {
    return {'players': players};
  }

  factory GameSerializer.fromMap(Map<String, dynamic> map) {
    List<DocumentReference>? players;
    if (map['players'] != null) {
      players =
          (map['players'] as List<dynamic>).map<DocumentReference>((item) {
        return item as DocumentReference; // Cast each item to DocumentReference
      }).toList();
    }

    return GameSerializer(id: map['id'] as String?, players: players);
  }
}
