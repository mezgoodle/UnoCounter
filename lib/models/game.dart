import 'package:unocounter/models/player.dart';

class GameSerializer {
  String? id;
  List<dynamic>? players =
      <PlayerSerializer>[]; // TODO: ask gemini for type, see the result in the rendered display

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
