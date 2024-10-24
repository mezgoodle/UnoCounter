import 'package:flutter/material.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class NewGamePage extends StatelessWidget {
  const NewGamePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'New Game Page'),
      body: Center(
        child: CustomButton(
          text: 'Go back!',
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
    );
  }
}
