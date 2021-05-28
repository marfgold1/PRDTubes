const io = require("socket.io-client");

const socket = io("ws://localhost:3000/device", {   
  auth: {
    key: "tol-cirebon-km10"
  },
  query: {
    version: "1.1.1",
    lowerLimit: 30,
    upperLimit: 60
  }
});

socket.onAny((event, ...args) => {
  console.log(args);
});

setInterval(()=>{
  const mockElapsed = (Math.random() * 0.1)+0.02; // second
  // patokan 1 meter, jadinya v = 1/mockElapsed m/s = 3.6/mockElapsed km/h
  socket.emit("data:append", [(new Date()).toString(), mockElapsed.toFixed(5), (3.6/mockElapsed).toFixed(2)]);
}, 5000);
