import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'components/socket_service.dart';
import 'providers/button_state_provider.dart';
import 'providers/location_provider.dart';
import 'components/location_service.dart';
import 'components/custom_button.dart';

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
        title: const Text('실시간 위치 업데이트', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.teal[400],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [

              Container(
                margin: const EdgeInsets.only(bottom: 30),
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.teal[50],
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 6,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [

                    Column(
                      children: [
                        Icon(Icons.location_on, color: Colors.teal[400], size: 30),
                        const SizedBox(height: 8),
                        Text(
                          '위도',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.teal[800],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _latitude ?? '연결중',
                          style: const TextStyle(fontSize: 16, color: Colors.black87),
                        ),
                      ],
                    ),

                    Column(
                      children: [
                        Icon(Icons.location_on_outlined, color: Colors.teal[400], size: 30),
                        const SizedBox(height: 8),
                        Text(
                          '경도',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.teal[800],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _longitude ?? '연결중',
                          style: const TextStyle(fontSize: 16, color: Colors.black87),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              CustomButton(
                label: 'Set Main Client',
                enabledState: isRequestEnabled,
                onSet: _socketService.setMainClient,
                onRemove: _socketService.removeMainClient,
              ),
              const SizedBox(height: 15),
              CustomButton(
                label: 'Set Sub Client',
                enabledState: isResponseEnabled,
                onSet: _socketService.setSubClient,
                onRemove: _socketService.removeSubClient,
              ),
              const SizedBox(height: 15),
              CustomButton(
                label: 'Send Monitor',
                enabledState: isMonitorEnabled,
                onSet: _socketService.sendMonitor,
                onRemove: _socketService.sendMonitorOff,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
