import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:unocounter/main.dart';

void main() {
  group('Main Test', () {
    testWidgets('should render MyApp', (tester) async {
      await tester.pumpWidget(MyApp());
      expect(find.byType(MyApp), findsOneWidget);
    });

    testWidgets('should render MaterialApp', (tester) async {
      await tester.pumpWidget(MyApp());
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('should render MyHomePage', (tester) async {
      await tester.pumpWidget(MyApp());
      expect(find.byType(MyHomePage), findsOneWidget);
    });
  });
}
