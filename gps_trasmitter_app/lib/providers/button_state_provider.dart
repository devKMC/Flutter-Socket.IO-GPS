import 'package:flutter_riverpod/flutter_riverpod.dart';

// 상태를 관리할 CounterProvider 정의
final requestButtonEnabled = StateProvider<String>((ref) => 'setable');
final responseButtonEnabled = StateProvider<String>((ref) => 'disable');
final monitorButtonEnabled = StateProvider<String>((ref) => 'disable');