// games_page_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:unocounter/pages/games.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

void main() {
  group('GamesPage', () {
    testWidgets('should render GamesPage', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: GamesPage(),
        ),
      );
      expect(find.byType(GamesPage), findsOneWidget);
      // Verify the app bar title
      expect(find.widgetWithText(CustomAppBar, 'Games Page'), findsOneWidget);
      // Verify the data table columns
      expect(find.text('Game'), findsOneWidget);
      expect(find.text('Players'), findsOneWidget);
      // Verify the button exists and has the correct text
      expect(find.widgetWithText(CustomButton, 'Go back!'), findsOneWidget);
    });

    testWidgets('should render a list of games', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: GamesPage(),
        ),
      );
      expect(find.byType(DataTable), findsOneWidget);
    });

    testWidgets('should render game data correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: GamesPage(),
        ),
      );
      for (var game in const [
        ['Game 1', 'Player 1', 'Player 2'],
        ['Game 2', 'Player 1', 'Player 2'],
        ['Game 3', 'Player 1', 'Player 2'],
        ['Game 4', 'Player 1', 'Player 2'],
        ['Game 5', 'Player 1', 'Player 2'],
      ]) {
        expect(find.text(game[0]), findsOneWidget);
        expect(find.text(game.sublist(1).join(', ')), findsAtLeastNWidgets(1));
      }
    });
    testWidgets('Go back button pops the route', (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: GamesPage()));

      // Tap the button
      await tester.tap(find.widgetWithText(CustomButton, 'Go back!'));
      await tester.pumpAndSettle();
      expect(find.byType(GamesPage), findsNothing);
    });
  });
}
