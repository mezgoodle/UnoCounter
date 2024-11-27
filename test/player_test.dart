import 'package:flutter_test/flutter_test.dart';
import 'package:unocounter/models/player.dart';

void main() {
  group('PlayerSerializer', () {
    late PlayerSerializer player;
    setUp(() {
      player = PlayerSerializer(
        id: '123',
        name: 'John Doe',
        winnableGames: 10,
        selected: true,
      );
    });
    test('should serialize player data to map', () {
      final expectedMap = {
        'name': 'John Doe',
        'winnableGames': 10,
      };

      final map = player.toMap();
      expect(map['name'], equals('John Doe'));
      expect(map['winnableGames'], equals(10));
      expect(map, equals(expectedMap));
    });

    test('should not include id in serialized map', () {
      final map = player.toMap();
      final excludedFields = ['id', 'selected', 'isDealer'];
      for (final field in excludedFields) {
        expect(map.containsKey(field), isFalse,
            reason: '$field should not be included in serialized map');
      }
    });

    test('should throw error if name is null', () {
      expect(
        () => PlayerSerializer.fromMap({
          "id": '123',
          "name": null,
          "winnableGames": 10,
          "selected": true,
        }),
        throwsA(isA<ArgumentError>().having(
            (e) => e.message, 'message', 'Invalid or missing name in map')),
      );
    });

    test('should throw error if winnableGames is negative', () {
      expect(
        () => PlayerSerializer.fromMap({
          "id": '123',
          "name": 'John Doe',
          "winnableGames": -1,
          "selected": true,
        }),
        throwsA(isA<ArgumentError>().having(
            (e) => e.message, 'message', 'WinnableGames cannot be negative')),
      );
    });
    test('should throw error if winnableGames is null', () {
      expect(
        () => PlayerSerializer.fromMap({
          "id": '123',
          "name": 'John Doe',
          "winnableGames": null,
          "selected": true,
        }),
        throwsA(isA<ArgumentError>().having((e) => e.message, 'message',
            'Invalid or missing winnableGames in map')),
      );
    });

    test('should throw error if name is empty', () {
      expect(
        () => PlayerSerializer.fromMap({
          "id": '123',
          "name": '',
          "winnableGames": 10,
          "selected": true,
        }),
        throwsA(isA<ArgumentError>()
            .having((e) => e.message, 'message', 'Name cannot be empty')),
      );
    });
  });
}
