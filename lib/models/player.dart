class PlayerSerializer {
  String? id;
  String name;
  int winnableGames;
  bool selected;

  PlayerSerializer({
    this.id,
    required this.name,
    required this.winnableGames,
    this.selected = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'winnableGames': winnableGames,
    };
  }

  factory PlayerSerializer.fromMap(Map<String, dynamic> map) {
    return PlayerSerializer(
      id: map['id'],
      name: map['name'],
      winnableGames: map['winnableGames'],
    );
  }
}
