import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:unocounter/pages/games.dart';
import 'package:unocounter/repositories/player_repository.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class MockPlayerRepository extends Mock implements PlayerRepository {}

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
}
