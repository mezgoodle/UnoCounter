import 'package:flutter/material.dart';
import 'package:unocounter/widgets/app_bar.dart';
import 'package:unocounter/widgets/buttons.dart';

class NewGamePage extends StatefulWidget {
  const NewGamePage({super.key});

  @override
  State<NewGamePage> createState() => _NewGamePageState();
}

class _NewGamePageState extends State<NewGamePage> {
  List<Map<String, dynamic>> data = [
    {'name': 'John Doe', 'winnableGames': 10},
    {'name': 'Jane Doe', 'winnableGames': 20},
    {'name': 'Bob Smith', 'winnableGames': 30},
  ];

  @override
  void initState() {
    super.initState();
    _initializeSelected();
  }

  void _initializeSelected() {
    setState(() {
      data = data.map((row) {
        row['selected'] = false;
        return row;
      }).toList();
    });
  }

  void _onCheckboxChanged(int index, bool? value) {
    setState(() {
      data[index]['selected'] = value ?? false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'New Game Page'),
      body: Column(
        children: [
          DataTable(
            columns: [
              DataColumn(label: Text('Name')),
              DataColumn(label: Text('Number of Winnable Games')),
              DataColumn(label: Text('Select')),
            ],
            rows: data.asMap().entries.map((entry) {
              int index = entry.key;
              Map<String, dynamic> row = entry.value;
              return DataRow(
                cells: [
                  DataCell(Text(row['name'])),
                  DataCell(Text(row['winnableGames'].toString())),
                  DataCell(Switch(
                    value: row['selected'],
                    onChanged: (bool value) {
                      _onCheckboxChanged(index, value);
                    },
                  )),
                ],
              );
            }).toList(),
          ),
          Center(
            child: CustomButton(
              text: 'Go back!',
              onPressed: () {
                Navigator.pop(context);
              },
            ),
          ),
        ],
      ),
    );
  }
}
