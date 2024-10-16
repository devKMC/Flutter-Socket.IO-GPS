const { createServer, request } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== "production";
const hostname = "192.168.0.34";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(`클라이언트 연결됨 굿 ㅋㅋ: ${socket.id}`);

    socket.on('request', () => {
      console.log('요청 계정 입갤 ㅋㅋ');
      io.emit('onRequest'); // 이벤트 이름 수정
    });
    socket.on('response', () => {
      console.log('응답 계정 입갤 ㅋㅋ');
      io.emit('onResponse'); // 이벤트 이름 수정
    });
    socket.on('monitor', () => {
      console.log('ㅈ댐 monitor 요청 옴;;');
      io.emit('onMonitor'); // 이벤트 이름 수정
    });
    socket.on('disconnect', () => {
      console.log(`클라이언트 퇴갤 ㅋㅋ: ${socket.id}`);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
