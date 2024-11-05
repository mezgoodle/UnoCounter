// games_page_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:unocounter/pages/games.dart';
import 'package:unocounter/pages/new_game.dart';
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

      // Verify the data table exists
      expect(find.byType(DataTable), findsOneWidget);
    });

    testWidgets('should render game data correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: GamesPage(),
        ),
      );

      // Verify the initial data table rows
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

      // Verify the route is popped
      expect(find.byType(GamesPage), findsNothing);
    });
  });

  group('NewGamePage', () {
    testWidgets('NewGamePage displays correctly', (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: NewGamePage()));

      // Verify app bar
      expect(
          find.widgetWithText(CustomAppBar, 'New Game Page'), findsOneWidget);

      // Verify data table columns
      expect(find.text('Name'), findsOneWidget);
      expect(find.text('Number of Winnable Games'), findsOneWidget);
      expect(find.text('Select'), findsOneWidget);

      // Verify buttons
      expect(find.widgetWithText(CustomButton, 'Add Player'), findsOneWidget);
      expect(find.widgetWithText(CustomButton, 'Go back!'), findsOneWidget);
    });

    testWidgets("should render player data correctly",
        (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: NewGamePage()));

      // Verify initial data is displayed
      for (var player in const [
        {'name': 'John Doe', 'winnableGames': 10},
        {'name': 'Jane Doe', 'winnableGames': 20},
        {'name': 'Bob Smith', 'winnableGames': 30},
      ]) {
        expect(find.text(player['name'].toString()), findsOneWidget);
        expect(find.text(player['winnableGames'].toString()), findsOneWidget);
      }
    });

    testWidgets('Add Player dialog works correctly',
        (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: NewGamePage()));

      // Open the dialog
      await tester.tap(find.widgetWithText(CustomButton, 'Add Player'));
      await tester.pumpAndSettle();

      // Verify dialog title
      expect(find.text('Add Player'), findsAtLeast(1));

      // Enter a new player name
      await tester.enterText(find.byType(TextField), 'New Player');
      await tester.pump();

      // Tap the Add button
      await tester.tap(find.text('Add'));
      await tester.pumpAndSettle();

      // Verify the new player is added
      expect(find.text('New Player'), findsOneWidget);
      expect(find.text('0'), findsOneWidget); // Winnable games should be 0

      // Test adding an empty name (should show error)
      await tester.tap(find.widgetWithText(CustomButton, 'Add Player'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), '');
      await tester.pump();
      await tester.tap(find.text('Add')); // Attempt to add with empty name.
      await tester.pump(); // Pump to let error message build

      expect(find.text('Name cannot be empty'),
          findsOneWidget); // Error message should show.

      // Tap Cancel to close
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
    });

    testWidgets('Switch changes selected state', (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: NewGamePage()));

      // Find the first Switch
      final Finder firstSwitch = find.byType(Switch).first;

      // Check initial state (should be false)
      expect((tester.widget(firstSwitch) as Switch).value, isFalse);

      // Tap the Switch
      await tester.tap(firstSwitch);
      await tester.pumpAndSettle();

      // Check new state (should be true)
      expect((tester.widget(firstSwitch) as Switch).value, isTrue);
    });

    testWidgets('Go back button pops the route', (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: NewGamePage()));

      await tester.tap(find.widgetWithText(CustomButton, 'Go back!'));
      await tester.pumpAndSettle();

      expect(find.byType(NewGamePage), findsNothing);
    });
  });
}
