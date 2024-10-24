import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String label;
  final String enabledState;
  final VoidCallback onSet;
  final VoidCallback onRemove;

  const CustomButton({
    Key? key,
    required this.label,
    required this.enabledState,
    required this.onSet,
    required this.onRemove,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    bool isSetable = enabledState == 'setable';
    bool isDisabled = enabledState == 'disable';

    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: isSetable ? Colors.teal : isDisabled ? Colors.grey : Colors.teal[200],
        foregroundColor: isSetable ? Colors.white : isDisabled ? Colors.black54 : Colors.white70,
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15), // 버튼 크기
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12), // 둥근 모서리
        ),
        shadowColor: Colors.black45, // 그림자 추가
        elevation: 6, // 버튼 그림자 높이
      ),
      onPressed: isSetable ? onSet : isDisabled ? null : onRemove,
      child: Text(
        label,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }
}
