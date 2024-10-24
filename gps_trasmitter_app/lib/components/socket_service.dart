import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:io';
import '../providers/button_state_provider.dart';

class SocketService {
  late IO.Socket _socket;
  late String platformId;
  final WidgetRef ref;
  SocketService(this.ref);

  Future<void> initPlatformID() async {
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    if (Platform.isAndroid) {
      AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
      platformId = androidInfo.id;
    } else if (Platform.isIOS) {
      IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
      platformId = iosInfo.identifierForVendor!;
    } else {
      platformId = 'unknown_platform';
    }
  }

  // 소켓 초기화 및 서버 연결
  void initSocket() async {
      initPlatformID();

    _socket = IO.io('http://192.168.0.34:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    _socket.on('connect', (_) {
      _socket.emit('setPlatformId', { 'platformId' : platformId });
      print('Connected to server with platformId: $platformId');
    });

    // 서버에 연결되었을 때
    _socket.on('registIdChange', (data) {
      Map<String, dynamic> jsonData = data;
      String mainClientId = jsonData['mainClientId'];
      String subClientId = jsonData['subClientId'];
      bool onMonitor = jsonData['onMonitor'];
      if (mainClientId.isEmpty){
        ref.read(requestButtonEnabled.notifier).state = 'setable';
        ref.read(responseButtonEnabled.notifier).state = 'disable';
        ref.read(monitorButtonEnabled.notifier).state = 'disable';
      } else {
        if (mainClientId == platformId){
          ref.read(requestButtonEnabled.notifier).state = 'removeable';
          if (subClientId.isNotEmpty){
            if (onMonitor) {
              ref.read(monitorButtonEnabled.notifier).state = 'removeable';
            } else {
              ref.read(monitorButtonEnabled.notifier).state = 'setable';
            }
          }
        } else {
          ref.read(requestButtonEnabled.notifier).state = 'disable';
        }

        if (subClientId.isEmpty){
          ref.read(responseButtonEnabled.notifier).state = 'setable';
          ref.read(monitorButtonEnabled.notifier).state = 'disable';
        } else {
          if (subClientId == platformId){
            ref.read(responseButtonEnabled.notifier).state = 'removeable';
          } else {
            ref.read(responseButtonEnabled.notifier).state = 'disable';
          }
        }
      }
    });

    // 연결이 끊어졌을 때
    _socket.onDisconnect((_) {
      print('Disconnected from server');
    });

    _socket.connect();
  }

  // 서버에 이벤트 전송
  void setMainClient() {
    _socket.emit('setMainClient');
  }

  void removeMainClient() {
    _socket.emit('removeMainClient');
  }

  void setSubClient() {
    _socket.emit('setSubClient');
  }

  void removeSubClient() {
    _socket.emit('removeSubClient');
  }

  void sendMonitor() {
    _socket.emit('monitor');
  }

  void sendMonitorOff() {
    _socket.emit('monitorOff');
  }

  void sendLocation(dynamic locationData) async {
    locationData['platformId'] = platformId;
    _socket.emit('setLocation', locationData);
  }


  // 소켓 연결 해제
  void disconnect() {
    _socket.disconnect();
  }
}
