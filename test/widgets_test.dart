import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

void main() {
  group("Test widgets", () {
    testWidgets('CustomAppBar displays correctly', (WidgetTester tester) async {
      const String appBarTitle = 'Test Title';

      await tester.pumpWidget(
        MaterialApp(
          // Wrap in MaterialApp for theme access
          home: Scaffold(
            appBar: CustomAppBar(title: appBarTitle),
          ),
        ),
      );

      // Verify the title text is displayed
      expect(find.text(appBarTitle), findsOneWidget);

      // Verify centerTitle is true
      final AppBar appBar = tester.widget<AppBar>(find.byType(AppBar));
      expect(appBar.centerTitle, isTrue);

      // Preferred Size (implicitly tested by the absence of errors, but can be explicit)
      final CustomAppBar customAppBar =
          tester.widget<CustomAppBar>(find.byType(CustomAppBar));
      expect(customAppBar.preferredSize.height, kToolbarHeight);
    });

    testWidgets('CustomButton renders correctly and handles taps',
        (WidgetTester tester) async {
      const String buttonText = 'Test Button';
      bool buttonPressed = false; // Track button press

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: CustomButton(
                text: buttonText,
                onPressed: () {
                  buttonPressed = true;
                },
              ),
            ),
          ),
        ),
      );

      // Verify the button text
      expect(find.text(buttonText), findsOneWidget);

      // Verify the text style (fontSize: 20)
      final Text textWidget = tester.firstWidget(find.text(buttonText));
      expect(textWidget.style!.fontSize, 20);

      // Verify the widthFactor (FractionallySizedBox)
      final FractionallySizedBox fractionallySizedBox = tester
          .widget<FractionallySizedBox>(find.byType(FractionallySizedBox));
      expect(fractionallySizedBox.widthFactor, 0.8);

      // Tap the button
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump(); // Ensure the onPressed callback is executed.

      // Verify that the onPressed callback was called
      expect(buttonPressed, isTrue);

      // Test with null onPressed (button should not be tappable)
      buttonPressed = false; // reset
      await tester.pumpWidget(MaterialApp(
        // new widget tree
        home: Scaffold(
          body: Center(
            child: CustomButton(
              text: buttonText,
              onPressed: () {}, // Null callback
            ),
          ),
        ),
      ));

      await tester
          .tap(find.byType(ElevatedButton)); // Tap the null-callback button
      await tester.pump();

      expect(
          buttonPressed, isFalse); // Should remain false if onPressed is null.
    });
  });
}
