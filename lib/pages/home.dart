import 'package:flutter/material.dart';
import 'package:unocounter/constants/assets.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Uno Counter'),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.3,
              child: Image(
                image: AssetImage(Assets.logoPath),
              ),
            ),
            SizedBox(height: MediaQuery.of(context).size.height * 0.04),
            CustomButton(
              text: "See all games!",
              onPressed: () => Navigator.pushNamed(context, '/games'),
            ),
            SizedBox(height: 15),
            CustomButton(
              text: 'Create new game!',
              onPressed: () => Navigator.pushNamed(context, '/new-game'),
            ),
          ],
        ),
      ),
    );
  }
}
