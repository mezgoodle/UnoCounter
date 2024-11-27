/// A serializer class for Player data that handles Firestore serialization.
///
/// Contains player information including an optional Firestore document ID,
/// player name, winnable games count, and selection state.
class PlayerSerializer {
  String? id;
  String name;
  int winnableGames;
  bool selected;
  bool isDealer;

  PlayerSerializer({
    this.id,
    required this.name,
    required this.winnableGames,
    this.selected = false,
    this.isDealer = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'winnableGames': winnableGames,
    };
  }

  factory PlayerSerializer.fromMap(Map<String, dynamic> map) {
    final name = map['name'];
    final winnableGames = map['winnableGames'];

    if (name == null || name is! String) {
      throw ArgumentError('Invalid or missing name in map');
    }
    if (name.isEmpty) {
      throw ArgumentError('Name cannot be empty');
    }
    if (winnableGames == null || winnableGames is! int) {
      throw ArgumentError('Invalid or missing winnableGames in map');
    }
    if (winnableGames < 0) {
      throw ArgumentError('WinnableGames cannot be negative');
    }

    return PlayerSerializer(
      id: map['id'],
      name: name,
      winnableGames: winnableGames,
    );
  }
}
