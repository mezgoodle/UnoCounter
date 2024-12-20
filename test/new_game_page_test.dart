import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:provider/provider.dart';
import 'package:unocounter/models/player.dart';
import 'package:unocounter/pages/new_game.dart';
import 'package:unocounter/providers/player_provider.dart';
import 'package:unocounter/repositories/player_repository.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class MockPlayerRepository extends Mock implements PlayerRepository {}

void main() {
  group('NewGamePage', () {
    late MockPlayerRepository mockPlayerRepository;
    final playerMaps = <String, PlayerSerializer>{
      'id1': PlayerSerializer(name: 'Player 1', winnableGames: 0, id: 'id1'),
      'id2': PlayerSerializer(name: 'Player 2', winnableGames: 2, id: 'id2'),
    };
    final player = playerMaps.values.first;

    setUp(() {
      mockPlayerRepository = MockPlayerRepository();
    });

    group("Player List Display", () {
      testWidgets('NewGamePage displays correctly with empty player list',
          (tester) async {
        // Mock the getAll to return an empty stream
        when(mockPlayerRepository.getAll())
            .thenAnswer((_) => Stream.value(<String, PlayerSerializer>{}));

        await tester.pumpWidget(
          ChangeNotifierProvider(
            create: (_) => PlayerProvider(mockPlayerRepository),
            child: MaterialApp(home: NewGamePage()),
          ),
        );
        expect(find.byType(CircularProgressIndicator),
            findsOneWidget); // Expect loading indicator
        await tester.pump(); // Use pump() to trigger rebuild
        verify(mockPlayerRepository.getAll()).called(1);

        expect(find.byType(CircularProgressIndicator),
            findsNothing); // Expect loading indicator to be removed

        expect(find.text("No players found"), findsOneWidget);
      });

      testWidgets('NewGamePage displays correctly with player list',
          (tester) async {
        when(mockPlayerRepository.getAll())
            .thenAnswer((_) => Stream.value(playerMaps));

        await tester.pumpWidget(
          ChangeNotifierProvider(
            create: (_) => PlayerProvider(mockPlayerRepository),
            child: MaterialApp(home: NewGamePage()),
          ),
        );
        await tester.pump();

        expect(find.widgetWithText(CustomAppBar, 'New Game'), findsOneWidget);
        expect(find.text('Player 1'), findsOneWidget);
        expect(find.text('Player 2'), findsOneWidget);
        verify(mockPlayerRepository.getAll()).called(1);
        expect(find.text('Name'), findsOneWidget);
        expect(find.text('Number of Winnable Games'), findsOneWidget);
        expect(find.text('Select'), findsOneWidget);
        expect(find.widgetWithText(CustomButton, 'Add Player'), findsOneWidget);
        expect(find.widgetWithText(CustomButton, 'Go back!'), findsOneWidget);
      });
    });

    group("Player Management", () {
      testWidgets('Add Player dialog works correctly', (tester) async {
        // Mock the getAll to return an empty stream
        when(mockPlayerRepository.getAll())
            .thenAnswer((_) => Stream.value(playerMaps));
        when(mockPlayerRepository.add(player)).thenAnswer((_) async {
          return Future<void>.value();
        });
        await tester.pumpWidget(
          ChangeNotifierProvider(
            create: (_) => PlayerProvider(mockPlayerRepository),
            child: MaterialApp(home: NewGamePage()),
          ),
        );
        await tester.pumpAndSettle();

        // // Open the dialog
        await tester.tap(find.widgetWithText(CustomButton, 'Add Player'));
        await tester.pumpAndSettle();

        // // Enter a new player name
        await tester.enterText(find.byType(TextField), 'New Player');
        await tester.pump();

        // // Tap the Add button
        await tester.tap(find.text('Add'));
        await tester.pumpAndSettle();
      });

      testWidgets('Add Player dialog works correctly with duplicates',
          (tester) async {
        // Mock the getDocumentsStream to return an empty stream
        when(mockPlayerRepository.getAll())
            .thenAnswer((_) => Stream.value(playerMaps));
        await tester.pumpWidget(
          ChangeNotifierProvider(
            create: (_) => PlayerProvider(mockPlayerRepository),
            child: MaterialApp(home: NewGamePage()),
          ),
        );
        await tester.pumpAndSettle();

        // // Open the dialog
        await tester.tap(find.widgetWithText(CustomButton, 'Add Player'));
        await tester.pumpAndSettle();

        // // Enter a new player name
        await tester.enterText(find.byType(TextField), 'Player 1');
        await tester.pump();

        // // Tap the Add button
        await tester.tap(find.text('Add'));
        await tester.pump();

        expect(find.byType(SnackBar), findsOneWidget);
        expect(find.text("Player already exists!"), findsOneWidget);
      });

      testWidgets('Delete player removes player', (tester) async {
        // Mock the getDocumentsStream to return an empty stream
        when(mockPlayerRepository.getAll())
            .thenAnswer((_) => Stream.value(playerMaps));
        when(mockPlayerRepository.delete('id1')).thenAnswer((_) async {});
        await tester.pumpWidget(ChangeNotifierProvider(
            create: (_) => PlayerProvider(mockPlayerRepository),
            child: MaterialApp(home: NewGamePage())));
        await tester.pumpAndSettle();

        expect(find.text("Player 1"), findsOneWidget);
        await tester.tap(find.byIcon(Icons.delete).first);
        await tester.pumpAndSettle();
      });
    });

    group('Player Selection', () {
      testWidgets('Start Game button appears only with selected players',
          (tester) async {
        // Mock the getDocumentsStream to return an empty stream
        when(mockPlayerRepository.getAll())
            .thenAnswer((_) => Stream.value(playerMaps));
        await tester.pumpWidget(ChangeNotifierProvider(
            create: (_) => PlayerProvider(mockPlayerRepository),
            child: MaterialApp(
              home: NewGamePage(),
            )));
        await tester.pumpAndSettle();

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

      testWidgets('Switch toggles player selection', (tester) async {
        // Mock the getDocumentsStream to return an empty stream
        when(mockPlayerRepository.getAll())
            .thenAnswer((_) => Stream.value(playerMaps));
        await tester.pumpWidget(ChangeNotifierProvider(
            create: (_) => PlayerProvider(mockPlayerRepository),
            child: MaterialApp(
              home: NewGamePage(),
            )));
        await tester.pumpAndSettle();

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
    });

    group('Navigation', () {
      testWidgets('Go back button pops the route', (tester) async {
        // Mock the getDocumentsStream to return an empty stream
        when(mockPlayerRepository.getAll())
            .thenAnswer((_) => Stream.value(playerMaps));
        await tester.pumpWidget(
          ChangeNotifierProvider(
            create: (_) => PlayerProvider(mockPlayerRepository),
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
  });
}
