import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/pages/current_game.dart';

void main() {
  group('CurrentGamePage tests', () {
    testWidgets('Test _findLeaders with no players',
        (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: CurrentGamePage()));

      final state =
          tester.state<CurrentGamePageState>(find.byType(CurrentGamePage));
      final leaders = state._findLeaders();
      expect(leaders, isNull);
    });
    testWidgets('Test _findLeaders with one player',
        (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: CurrentGamePage()));

      final state =
          tester.state<CurrentGamePageState>(find.byType(CurrentGamePage));
      state._players.clear();
      state._players
          .add(PlayerSerializer(name: "Alice", winnableGames: 10, score: 15));
      final leaders = state._findLeaders();

      expect(leaders?.length, 1);
      expect(leaders?.first.name, "Alice");
    });

    testWidgets('Test _findLeaders with multiple players and one leader',
        (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: CurrentGamePage()));

      final state =
          tester.state<CurrentGamePageState>(find.byType(CurrentGamePage));
      state._players.clear();
      state._players.addAll([
        PlayerSerializer(name: "Alice", winnableGames: 10, score: 15),
        PlayerSerializer(name: "Bob", winnableGames: 5, score: 25),
        PlayerSerializer(name: "Charlie", winnableGames: 12, score: 10),
      ]);
      final leaders = state._findLeaders();

      expect(leaders?.length, 1);
      expect(leaders?.first.name, "Bob");
    });

    testWidgets('Test _findLeaders with multiple players and multiple leaders',
        (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: CurrentGamePage()));

      final state =
          tester.state<CurrentGamePageState>(find.byType(CurrentGamePage));
      state._players.clear();
      state._players.addAll([
        PlayerSerializer(name: "Alice", winnableGames: 10, score: 25),
        PlayerSerializer(name: "Bob", winnableGames: 5, score: 25),
        PlayerSerializer(name: "Charlie", winnableGames: 12, score: 10),
      ]);
      final leaders = state._findLeaders();

      expect(leaders?.length, 2);
      expect(leaders?.any((l) => l.name == "Alice"), true);
      expect(leaders?.any((l) => l.name == "Bob"), true);
    });
    testWidgets('Test _buildDealerIcon with dealer',
        (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: CurrentGamePage()));

      final state =
          tester.state<CurrentGamePageState>(find.byType(CurrentGamePage));
      final dealerIcon = state._buildDealerIcon('Bob');
      expect(dealerIcon, isA<Container>());
    });
    testWidgets('Test _buildDealerIcon without dealer',
        (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: CurrentGamePage()));

      final state =
          tester.state<CurrentGamePageState>(find.byType(CurrentGamePage));
      final dealerIcon = state._buildDealerIcon('Alice');
      expect(dealerIcon, isA<SizedBox>());
    });
  });
}
