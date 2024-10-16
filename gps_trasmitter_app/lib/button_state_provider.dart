import 'package:flutter_riverpod/flutter_riverpod.dart';

// 상태를 관리할 CounterProvider 정의
final counterProvider = StateProvider<int>((ref) => 0);
