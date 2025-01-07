import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/pages/current_game.dart';
import 'package:unocounter/widgets/app_bar.dart';

void main() {
  group('CurrentGamePage tests', () {
    late List<PlayerSerializer> _players;
    setUp(() {
      _players = [
        PlayerSerializer(name: "Alice", winnableGames: 10, score: 15),
        PlayerSerializer(name: "Bob", winnableGames: 5, score: 25),
      ];
    });
    testWidgets('should render the current game', (tester) async {
      await tester.pumpWidget(MaterialApp(home: CurrentGamePage()));

      expect(find.byType(CurrentGamePage), findsOneWidget);
      expect(find.widgetWithText(CustomAppBar, 'Current Game'), findsOneWidget);

      for (final player in _players) {
        expect(find.text(player.name), findsOneWidget);
      }
    });
  });
}
