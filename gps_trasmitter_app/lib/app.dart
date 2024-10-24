import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart'; // Riverpod 사용

import 'components/socket_service.dart'; // 소켓 서비스 임포트
import 'providers/button_state_provider.dart';
import 'providers/location_provider.dart';
import 'components/location_service.dart';

class LocationApp extends ConsumerStatefulWidget  {
  const LocationApp({super.key});

  @override
  ConsumerState<LocationApp> createState() => _LocationAppState();
}

class _LocationAppState extends ConsumerState<LocationApp> {
  late final LocationService _locationService = LocationService();
  late final SocketService _socketService;

  @override
  void initState() {
    super.initState();
    _socketService = SocketService(ref);
    _locationService.initialize(ref, _socketService.sendLocation); 
    _socketService.initSocket();
    _initializeAndStartLocationTracking();
  }

  void _initializeAndStartLocationTracking() async {
    await _locationService.startBackgroundLocation();
  }

  @override
  void dispose() {
    super.dispose();
    _locationService.stopBackgroundLocation();
  }


  @override
  Widget build(BuildContext context) {
    final String isRequestEnabled = ref.watch(requestButtonEnabled);
    final String isResponseEnabled = ref.watch(responseButtonEnabled);
    final String isMonitorEnabled = ref.watch(monitorButtonEnabled);
    final String? _latitude = ref.watch(latitude);
    final String? _longitude = ref.watch(longitude);

    return Scaffold(
      appBar: AppBar(
        title: const Text('실시간 위치 업데이트'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('위도: ${_latitude??'연결중'}, 경도: ${_longitude??'연결중'}'),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isRequestEnabled == 'setable' ? Colors.blue : isRequestEnabled == 'disable' ? Colors.grey : Colors.blue[300],
                foregroundColor: isRequestEnabled == 'setable' ? Colors.white : isRequestEnabled == 'disable' ? Colors.black : Colors.white70,
              ),
              onPressed: isRequestEnabled == 'setable' ? _socketService.setMainClient : isRequestEnabled == 'disable' ? null : _socketService.removeMainClient,
              child: const Text('Send Request'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isResponseEnabled == 'setable' ? Colors.blue : isResponseEnabled == 'disable' ? Colors.grey : Colors.blue[300],
                foregroundColor: isResponseEnabled == 'setable' ? Colors.white : isResponseEnabled == 'disable' ? Colors.black : Colors.white70,
              ),
              onPressed: isResponseEnabled == 'setable' ? _socketService.setSubClient : isResponseEnabled == 'disable' ? null : _socketService.removeSubClient,
              child: const Text('Send Response'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isMonitorEnabled == 'setable' ? Colors.blue : isMonitorEnabled == 'disable' ? Colors.grey : Colors.blue[300],
                foregroundColor: isMonitorEnabled == 'setable' ? Colors.white : isMonitorEnabled == 'disable' ? Colors.black : Colors.white70,
              ),
              onPressed: isMonitorEnabled == 'setable'? _socketService.sendMonitor : null, // 소켓 서비스 사용
              child: const Text('Send Monitor'),
            ),
          ],
        )
      ),
    );
  }
}
