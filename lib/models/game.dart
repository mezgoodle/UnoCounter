import 'package:unocounter/models/player.dart';

class GameSerializer {
  String? id;
  List<PlayerSerializer>? players = <PlayerSerializer>[];

  GameSerializer({
    this.id,
    this.players,
  });

  Map<String, dynamic> toMap() {
    return {'players': players};
  }

  factory GameSerializer.fromMap(Map<String, dynamic> map) {
    final players = map['players'];

    return GameSerializer(id: map['id'], players: players);
  }
}
