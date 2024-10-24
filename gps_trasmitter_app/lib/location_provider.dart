import 'package:flutter_riverpod/flutter_riverpod.dart';

// 상태를 관리할 CounterProvider 정의
final latitude = StateProvider<String?>((ref) => null);
final longitude = StateProvider<String?>((ref) => null);