import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'database.g.dart';

class Players extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().withLength(min: 3, max: 32).unique()();
  IntColumn get winnableGames => integer().withDefault(Constant(0))();
  DateTimeColumn get createdAt => dateTime().nullable()();
}

@DriftDatabase(tables: [Players])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  Future<List<Player>> getPlayers() => select(players).get();
  Future<Player?> getPlayer(int id) =>
      (select(players)..where((p) => p.id.equals(id))).getSingleOrNull();
  Future<int> insertPlayer(PlayersCompanion newPlayer) =>
      into(players).insert(newPlayer);
  Future<bool> updatePlayer(Player updatedPlayer) =>
      update(players).replace(updatedPlayer);

  Future<int> deletePlayer(int id) =>
      (delete(players)..where((p) => p.id.equals(id))).go();

  static QueryExecutor _openConnection() {
    return driftDatabase(name: "database.db");
  }
}
