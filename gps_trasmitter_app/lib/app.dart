import 'dart:async'; // Timer를 사용하기 위한 패키지
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart'; // Geolocator (위치 서비스용 패키지)
import 'dart:convert'; // JSON 데이터를 인코딩/디코딩하기 위한 내장 라이브러리

import 'socket_service.dart'; // 소켓 서비스 임포트

class LocationApp extends StatefulWidget {
  const LocationApp({super.key});

  @override
  State<LocationApp> createState() => _LocationAppState();
}

class _LocationAppState extends State<LocationApp> {
  Position? _currentPosition;
  Timer? _timer;

  final SocketService _socketService = SocketService();

  @override
  void initState() {
    super.initState();
    _startLocationUpdates(); // 타이머로 주기적 위치 업데이트
    _socketService.initSocket();
  }

  void _startLocationUpdates() {
    // 0.3초마다 위치 정보를 가져오는 타이머 설정
    _timer = Timer.periodic(const Duration(milliseconds: 1000), (Timer t) {
      _getCurrentPosition(); // 0.3초마다 위치 가져오기 함수 호출
    });
  }

  Future<void> _getCurrentPosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('위치 서비스가 비활성화되었습니다.');
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print('위치 권한이 거부되었습니다.');
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      print('위치 권한이 영구적으로 거부되었습니다.');
      return;
    }

    // 현재 위치 가져오기
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high, // 높은 정확도로 위치 요청
    );

    setState(() {
      _currentPosition = position;
    });

    if (_currentPosition != null) {
      final locationData = jsonEncode({
        'latitude': _currentPosition!.latitude,
        'longitude': _currentPosition!.longitude,
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel(); // 타이머 종료
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('실시간 위치 업데이트'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _currentPosition != null
            ? Text('위도: ${_currentPosition!.latitude}, 경도: ${_currentPosition!.longitude}')
            : const Text('위치를 가져오는 중...'),
            ElevatedButton(
              onPressed: _socketService.sendRequest, // 소켓 서비스 사용
              child: Text('Send Request'),
            ),
            ElevatedButton(
              onPressed: _socketService.sendResponse, // 소켓 서비스 사용
              child: Text('Send Response'),
            ),
            ElevatedButton(
              onPressed: _socketService.sendMonitor, // 소켓 서비스 사용
              child: Text('Send Monitor'),
            ),
          ],
        )
      ),
    );
  }
}
