import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  late IO.Socket _socket;

  // 소켓 초기화 및 서버 연결
  void initSocket() {
    _socket = IO.io('http://192.168.0.34:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    _socket.connect();

    // 서버에 연결되었을 때
    _socket.onConnect((_) {
      print('Connected to the server');
    });

    // 서버로부터 받은 이벤트 처리
    _socket.on('onRequest', (_) { // 이벤트 이름 수정
      print('Request event received from the server');
    });

    _socket.on('onResponse', (_) { // 이벤트 이름 수정
      print('Response event received from the server');
    });

    _socket.on('onMonitor', (_) { // 이벤트 이름 수정
      print('Monitor event received from the server');
    });

    // 연결이 끊어졌을 때
    _socket.onDisconnect((_) {
      print('Disconnected from server');
    });
  }

  // 서버에 이벤트 전송
  void sendRequest() {
    _socket.emit('request');
  }

  void sendResponse() {
    _socket.emit('response');
  }

  void sendMonitor() {
    _socket.emit('monitor');
  }

  // 소켓 연결 해제
  void disconnect() {
    _socket.disconnect();
  }
}
