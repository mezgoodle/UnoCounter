import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String _text;
  final VoidCallback _onPressed;
  final dynamic widthFactor;

  const CustomButton({
    Key? key,
    required String text,
    required VoidCallback onPressed,
    this.widthFactor = 0.8,
  })  : _text = text,
        _onPressed = onPressed,
        super(key: key);

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      widthFactor: widthFactor ?? 0.8,
      child: ElevatedButton(
        onPressed: _onPressed,
        style: Theme.of(context).elevatedButtonTheme.style,
        child: Text(
          _text,
          style: const TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
