import 'package:flutter_riverpod/flutter_riverpod.dart';

// 상태를 관리할 CounterProvider 정의
final requestButtonEnabledProvider = StateProvider<String>((ref) => 'setable');
final responseButtonEnabledProvider = StateProvider<String>((ref) => 'disable');
final monitorButtonEnabledProvider = StateProvider<String>((ref) => 'disable');