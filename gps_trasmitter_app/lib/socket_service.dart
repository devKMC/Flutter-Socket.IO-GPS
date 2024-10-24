import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  late IO.Socket _socket;

  // 소켓 초기화 및 서버 연결
  void initSocket(
    Function setRequestButtonEnabled, 
    Function setResponseButtonEnabled, 
    Function setMonitorButtonEnabled) {
    _socket = IO.io('http://192.168.0.34:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    _socket.connect();

    // 서버에 연결되었을 때
    _socket.on('registIdChange', (data) {
      Map<String, dynamic> jsonData = data;
      String mainClientId = jsonData['mainClientId'];
      String subClientId = jsonData['subClientId'];
      if (mainClientId.isEmpty){
        setRequestButtonEnabled('setable');
        setResponseButtonEnabled('disable');
        setMonitorButtonEnabled('disable');
      } else {
        if (mainClientId == _socket.id){
          setRequestButtonEnabled('removeable');
          if (subClientId.isNotEmpty){
            setMonitorButtonEnabled('setable');
          }
        } else {
          setRequestButtonEnabled('disable');
        }

        if (subClientId.isEmpty){
          setResponseButtonEnabled('setable');
          setMonitorButtonEnabled('disable');
        } else {
          if (subClientId == _socket.id){
            setResponseButtonEnabled('removeable');
          } else {
            setResponseButtonEnabled('disable');
          }
        }
      }
      

    });

    // 연결이 끊어졌을 때
    _socket.onDisconnect((_) {
      print('Disconnected from server');
    });
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

  // 소켓 연결 해제
  void disconnect() {
    _socket.disconnect();
  }
}
