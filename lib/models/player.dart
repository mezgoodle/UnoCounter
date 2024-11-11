class PlayerSerializer {
  String name;
  int winnableGames;
  bool selected;

  PlayerSerializer({
    required this.name,
    required this.winnableGames,
    this.selected = false,
  });
}
