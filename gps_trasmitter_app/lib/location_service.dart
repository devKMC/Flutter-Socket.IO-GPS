import 'package:background_location_2/background_location.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'location_provider.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  late WidgetRef ref;
  late void Function(dynamic data) sendLocation;
  bool _isServiceRunning = false;

  LocationService._internal();

  factory LocationService() {
    return _instance;
  }

  void initialize(WidgetRef ref, void Function(dynamic data) sendLocation) {
    this.ref = ref;
    this.sendLocation = sendLocation;
  }

  Future<bool> checkLocationPermission() async {
    PermissionStatus status = await Permission.locationAlways.status;

    if (status.isGranted) {
      return true;
    } else {
      // 권한 요청
      PermissionStatus requestStatus = await Permission.locationAlways.request();
      return requestStatus.isGranted;
    }
  }

  Future<void> startBackgroundLocation() async {
    if (_isServiceRunning) {
      print('이미 위치 서비스가 실행 중입니다.');
      return;
    }
    bool permissionGranted = await checkLocationPermission();
    if (!permissionGranted) {
      print('위치 권한이 허용되지 않았습니다.');
      return;
    }
    _isServiceRunning = true;
    await BackgroundLocation.startLocationService(
      interval: 900
    );

    BackgroundLocation.getLocationUpdates((location) {
      String latStr = location.latitude.toString();
      String lonStr = location.longitude.toString(); 
      ref.read(latitude.notifier).state = latStr;
      ref.read(longitude.notifier).state = lonStr;
      sendLocation({'latitude': latStr, 'longitude': lonStr, 'platformId': ''});
      print('Latitude: ${latStr}, Longitude: ${lonStr}');
    });
  }
  void stopBackgroundLocation() {
    BackgroundLocation.stopLocationService();
    _isServiceRunning = false;
  }
}
