import 'package:drift/drift.dart';

class Players extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().withLength(min: 3, max: 32).unique()();
  IntColumn get winnableGames => integer().withDefault(Constant(0))();
  DateTimeColumn get createdAt => dateTime().nullable()();
}
