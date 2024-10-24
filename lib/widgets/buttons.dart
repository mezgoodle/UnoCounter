import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String _text;
  final VoidCallback? _onPressed;

  const CustomButton({
    Key? key,
    required String text,
    required VoidCallback onPressed,
  })  : _text = text,
        _onPressed = onPressed,
        super(key: key);

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      widthFactor: 0.8,
      child: ElevatedButton(
        onPressed: _onPressed,
        child: Text(
          _text,
          style: const TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
