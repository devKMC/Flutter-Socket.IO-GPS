const { createServer, request } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

var mainClientId = ''
var subClientId = ''
var latitude = null
var longitude = null

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {

    socket.emit('registIdChange', {
      mainClientId,
      subClientId
    })

    socket.on('setPlatformId', (data) => {
      const { platformId } = data;
      socket.platformId = platformId;
      console.log(`클라이언트 연결됨 굿 ㅋㅋ: ${platformId}`)
    })


    socket.on('setMainClient', () => {
      mainClientId = socket.platformId
      console.log('메인 클라 어서오고 ㅋㅋ', mainClientId, subClientId)
      io.emit('registIdChange', {
        mainClientId,
        subClientId
      })
    })

    socket.on('removeMainClient', () => {
      latitude = null
      longitude = null
      mainClientId = ''
      subClientId = ''
      console.log('메인 클라 퇴갤 ㅋㅋ', mainClientId, subClientId)
      io.emit('registIdChange', {
        mainClientId,
        subClientId
      })
    })

    socket.on('setSubClient', () => {
      subClientId = socket.platformId
      console.log('서브 클라 어서오고 ㅋㅋ', mainClientId, subClientId)
      io.emit('registIdChange', {
        mainClientId,
        subClientId
      })
    })

    socket.on('removeSubClient', () => {
      latitude = null
      longitude = null
      subClientId = ''
      console.log('서브 클라 퇴갤 ㅋㅋ', mainClientId, subClientId)
      io.emit('registIdChange', {
        mainClientId,
        subClientId
      })
    })

    socket.on('monitor', () => {
      const interval = setInterval(() => {
        if (latitude===null | longitude===null) {
          clearInterval(interval)
          io.to('webClient').emit('removeMobileLocate')
          console.log('interval 죽음')
          return;
        }
        lat = parseFloat(latitude).toFixed(6); + generateRandom()
        lon = parseFloat(longitude).toFixed(6); + generateRandom()
        io.to('webClient').emit('getMobileLocate', {latitude: `${lat}`, longitude: `${lon}`})
        console.log(`${lat}, ${lon}`)
      }, 1000)
      
    })

    const generateRandom = () => {
      randomValue = (Math.random() * 0.000001) - 0.0000005;
      return randomValue;
    }

    socket.on('joinWebClient', () => {
      socket.join('webClient')
    })

    socket.on('setLocation', (data) => {
      if (socket.platformId !== subClientId) {
        return
      }
      latitude = data.latitude
      longitude = data.longitude
    })

    socket.on('disconnect', () => {
      console.log(`클라이언트 퇴갤 ㅋㅋ: ${socket.platformId}`)
    })
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