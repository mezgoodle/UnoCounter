import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:unocounter/pages/games.dart';
import 'package:unocounter/pages/new_game.dart';
import 'package:unocounter/providers/player_provider.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

void main() {
  group('GamesPage', () {
    testWidgets('should render GamesPage with data', (tester) async {
      final games = [
        Game(name: 'Game 1', players: ['Player 1', 'Player 2']),
        Game(name: 'Game 2', players: ['Player 3', 'Player 4']),
      ];

      await tester.pumpWidget(MaterialApp(home: GamesPage(games: games)));

      expect(find.byType(GamesPage), findsOneWidget);
      expect(find.widgetWithText(CustomAppBar, 'Games Page'), findsOneWidget);

      // Verify game data
      for (final game in games) {
        expect(find.text(game.name), findsOneWidget);
        expect(find.text(game.players.join(', ')), findsOneWidget);
      }
    });

    testWidgets('should render loading indicator', (tester) async {
      await tester.pumpWidget(MaterialApp(home: GamesPage(isLoading: true)));
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('should render error message', (tester) async {
      await tester
          .pumpWidget(MaterialApp(home: GamesPage(error: 'Test Error')));
      expect(find.text('Test Error'), findsOneWidget);
    });

    testWidgets('should render no games message', (tester) async {
      await tester.pumpWidget(MaterialApp(home: GamesPage(games: [])));
      expect(find.text('No games found'), findsOneWidget);
    });

    testWidgets('Go back button pops the route', (tester) async {
      await tester.pumpWidget(MaterialApp(home: GamesPage()));
      await tester.tap(find.widgetWithText(CustomButton, 'Go back!'));
      await tester.pumpAndSettle();
      expect(find.byType(GamesPage), findsNothing);
    });
  });

  group('NewGamePage', () {
    testWidgets('NewGamePage displays correctly', (tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider(
          create: (_) => PlayerProvider(),
          child: MaterialApp(home: NewGamePage()),
        ),
      );

      expect(find.widgetWithText(CustomAppBar, 'New Game'), findsOneWidget);
      expect(find.text('Name'), findsOneWidget);
      expect(find.text('Number of Winnable Games'), findsOneWidget);
      expect(find.text('Select'), findsOneWidget);
      expect(find.widgetWithText(CustomButton, 'Add Player'), findsOneWidget);
      expect(find.widgetWithText(CustomButton, 'Go back!'), findsOneWidget);
    });

    testWidgets('Add Player dialog works correctly', (tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider(
          create: (_) => PlayerProvider(),
          child: MaterialApp(home: NewGamePage()),
        ),
      );

      // Open the dialog
      await tester.tap(find.widgetWithText(CustomButton, 'Add Player'));
      await tester.pumpAndSettle();

      // Enter a new player name
      await tester.enterText(find.byType(TextField), 'New Player');
      await tester.pump();

      // Tap the Add button
      await tester.tap(find.text('Add'));
      await tester.pumpAndSettle();

      expect(find.text('New Player'), findsOneWidget);

      // Test adding duplicate player.
      await tester.tap(find.widgetWithText(CustomButton, 'Add Player'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'New Player');
      await tester.pump();
      await tester.tap(find.text('Add'));
      await tester.pump();

      expect(find.byType(SnackBar), findsOneWidget);
      expect(find.text("Player already exists!"), findsOneWidget);
    });

    testWidgets('Switch toggles player selection', (tester) async {
      await tester.pumpWidget(ChangeNotifierProvider(
          create: (_) => PlayerProvider.withInitialPlayers(),
          child: MaterialApp(
            home: NewGamePage(),
          )));
      final playerProvider = Provider.of<PlayerProvider>(
          tester.element(find.byType(NewGamePage)),
          listen: false);
      final firstSwitch = find.byType(Switch).first;
      expect(playerProvider.players.isEmpty, isFalse);
      expect(playerProvider.players[0].selected, isFalse);
      await tester.tap(firstSwitch);
      await tester.pumpAndSettle();
      expect(playerProvider.players[0].selected, isTrue);
      expect(find.text("Start Game"), findsOneWidget);
    });

    testWidgets('Start Game button appears only with selected players',
        (tester) async {
      await tester.pumpWidget(ChangeNotifierProvider(
          create: (_) => PlayerProvider.withInitialPlayers(),
          child: MaterialApp(
            home: NewGamePage(),
          )));

      // Initially no players selected
      expect(find.text("Start Game"), findsNothing);

      // Select a player
      await tester.tap(find.byType(Switch).first);
      await tester.pumpAndSettle();
      expect(find.text("Start Game"), findsOneWidget);

      // Unselect the player
      await tester.tap(find.byType(Switch).first);
      await tester.pumpAndSettle();
      expect(find.text("Start Game"), findsNothing);
    });

    testWidgets('Delete player removes player', (tester) async {
      await tester.pumpWidget(ChangeNotifierProvider(
          create: (_) => PlayerProvider(),
          child: MaterialApp(home: NewGamePage())));
      final playerProvider = Provider.of<PlayerProvider>(
          tester.element(find.byType(NewGamePage)),
          listen: false);
      playerProvider.addPlayer("Test Player");
      await tester.pumpAndSettle();
      expect(find.text("Test Player"), findsOneWidget);
      await tester.tap(find.byIcon(Icons.delete).first);
      await tester.pumpAndSettle();
      expect(find.text("Test Player"), findsNothing);
    });

    testWidgets('Go back button pops the route', (tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider(
          create: (_) => PlayerProvider(),
          child: MaterialApp(home: NewGamePage()),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text("Go back!"), findsOneWidget);
      await tester.tap(find.widgetWithText(CustomButton, 'Go back!'));
      await tester.pumpAndSettle();
      expect(find.byType(NewGamePage), findsNothing);
    });
  });
}
