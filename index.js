const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5500",
    methods: ["GET", "POST"]
  }
});
const redis = require("ioredis");
const client = redis.createClient(6379);
const { RedisDeviceStore } = require("./storage");
const storage = new RedisDeviceStore(client);
const deviceNs = io.of("/device");
const appNs = io.of("/app");

deviceNs.use(async (socket, next) => {
  const info = socket.handshake.query;
  const key = socket.handshake.auth.key;
  
  const isCreated = await storage.addDevice(key, {
    version: info.version,
    lowerLimit: info.lowerLimit,
    upperLimit: info.upperLimit,
    lastOnline: (new Date()).toString(),
    status: "Online"
  });
  if(isCreated)
    appNs.emit("device:append", key);
  socket.info = info;
  socket.key = key;
  next();
});

deviceNs.on("connection", async socket => {
  console.log(`Device ${socket.key} connected!`);
  appNs.to(`device:sub:${socket.key}`).emit('device:info', await storage.getDeviceInfo(socket.key));

  socket.on("data:append", async (data) => {
    // data : array of string.
    // format: [timestamp, timeElapsed, speed]
    await storage.addDeviceData(socket.key, data.join(";"));
    appNs.to(`device:sub:${socket.key}`).emit('data:append', data);
  });

  socket.on("disconnect", async () => {
    await Promise.all([
      storage.setDeviceInfo(socket.key, "lastOnline", (new Date()).toString()),
      storage.setDeviceInfo(socket.key, "status", "Offline")
    ]);
    appNs.to(`device:sub:${socket.key}`).emit('device:info', await storage.getDeviceInfo(socket.key));
    console.log(`Device ${socket.key} disconnected!`)
  });
});

appNs.use(async (socket, next) => {
  const key = socket.handshake.query.key;
  await setSocketToSub(socket, key || null);
  next();
});

async function setSocketToSub(socket, key){
  if(socket.key != key && await storage.isDeviceValid(key)){
    if (socket.key != null)
      socket.leave(`device:sub:${socket.key}`);
    socket.join(`device:sub:${key}`);
    socket.key = key;
    socket.emit("device:info", await storage.getDeviceInfo(key));
    socket.emit("data:list", await storage.getDeviceDataAll(key));
  }
}

appNs.on("connection", async socket => {
  socket.emit("device:list", await storage.getDevices());
  socket.on("device:sub", async (res) => {
    await setSocketToSub(socket, res);
  })
});
