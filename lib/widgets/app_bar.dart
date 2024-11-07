import 'package:flutter/material.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;

  const CustomAppBar({required this.title, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title, style: Theme.of(context).primaryTextTheme.titleLarge),
      centerTitle: true,
      backgroundColor: Theme.of(context).primaryColor,
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight);
}
