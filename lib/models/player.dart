class Player {
  String name;
  int winnableGames;
  bool selected;

  Player({
    required this.name,
    required this.winnableGames,
    this.selected = false,
  });
}
