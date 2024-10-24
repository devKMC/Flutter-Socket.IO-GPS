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
var onMonitor = false

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {

    socket.emit('registIdChange', {
      mainClientId,
      subClientId,
      onMonitor,
    })

    socket.on('setPlatformId', (data) => {
      const { platformId } = data;
      socket.platformId = platformId;
      console.log(`mobile client connect! ID: ${platformId}`)
    })

    socket.on('setMainClient', () => {
      mainClientId = socket.platformId
      console.log('set main client [', mainClientId, subClientId, ']')
      io.emit('registIdChange', {
        mainClientId,
        subClientId,
        onMonitor,
      })
    })

    socket.on('removeMainClient', () => {
      latitude = null
      longitude = null
      onMonitor = false;
      mainClientId = ''
      subClientId = ''
      console.log('remove main client [', mainClientId, subClientId, ']')
      io.emit('registIdChange', {
        mainClientId,
        subClientId,
        onMonitor,
      })
    })

    socket.on('setSubClient', () => {
      subClientId = socket.platformId
      console.log('set sub client [', mainClientId, subClientId, ']')
      io.emit('registIdChange', {
        mainClientId,
        subClientId,
        onMonitor,
      })
    })

    socket.on('removeSubClient', () => {
      latitude = null
      longitude = null
      onMonitor = false;
      subClientId = ''
      console.log('remove sub client [', mainClientId, subClientId, ']')
      io.emit('registIdChange', {
        mainClientId,
        subClientId,
        onMonitor,
      })
    })

    socket.on('monitor', () => {
      onMonitor = true;
      io.emit('registIdChange', {
        mainClientId,
        subClientId,
        onMonitor,
      })
      const interval = setInterval(() => {
        if ((latitude===null && longitude===null) || !onMonitor) {
          clearInterval(interval)
          io.to('webClient').emit('removeMobileLocate')
          console.log('mobile gps monitor on')
          return;
        }
        lat = (parseFloat(latitude) + generateRandom()).toFixed(6); 
        lon = (parseFloat(longitude) + generateRandom()).toFixed(6);
        io.to('webClient').emit('getMobileLocate', {latitude: `${lat}`, longitude: `${lon}`})
        console.log(`${lat}, ${lon}`)
      }, 1000)
    })

    socket.on('monitorOff', () => {
      onMonitor = false;
      io.emit('registIdChange', {
        mainClientId,
        subClientId,
        onMonitor,
      })
      console.log('mobile gps monitor off')
    })

    const generateRandom = () => {
      randomValue = (Math.random() * 0.000006) - 0.000003;
      return randomValue;
    }

    socket.on('joinWebClient', () => {
      socket.join('webClient')
      console.log(`mobile client connect! ID: ${socket.id}`)
    })

    socket.on('setLocation', (data) => {
      if (socket.platformId !== subClientId) {
        return
      }
      latitude = data.latitude
      longitude = data.longitude
    })

    socket.on('disconnect', () => {
      console.log(`client disconnect: ${socket.platformId || socket.id}`)
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