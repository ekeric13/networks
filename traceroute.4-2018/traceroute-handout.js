// Docs: https://github.com/stephenwvickers/node-raw-socket
const raw = require('raw-socket'); // npm install raw-socket
const net = require('net');

// You'll have to construct this, but it can be the same for every ping you send
// because the header contains the TTL, the payload can always be the same
const pingPayload = null;



/*
  ping should return a Promise that resolves if it recieves an ICMP message
  and rejects if an error occurs. A TTL packet drop is not an error.

  We have created a socket that uses the ICMP protocol for you.
*/
const ping = (dest, ttl) => {
 return new Promise((resolve, reject) => {
   const socket = raw.createSocket({ protocol: raw.Protocol.ICMP });

   // Just incase, we always timeout after 5 seconds, which rejects the promise
   const timeout = setTimeout(() => {
     reject(err('timeout'))
   }, 5000)

   // Complete this such that the socket sends a ping message with the specified ttl
   // listens for inbound messages, and resolves the promise if it gets one
   socket.on("message", function (buffer, source) {
    console.log ("received " + buffer.length + " bytes from " + source);
    console.log('what is the buffer', buffer);
    resolve(buffer);
    socket.close()
  });

   const buffer = new Buffer ([
        0x08, 0x00,  // request
        0x43, 0x52,  // checksum
        0x00, 0x01,  // identifer
        0x0a, 0x09,  // sequence
        0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
        0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70,
        0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x61,
        0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69]);
   // const buffer = Buffer.from(icmp);
  var socketLevel = raw.SocketLevel.IPPROTO_IP
  var socketOption = raw.SocketOption.IP_TTL;

  function beforeSend () {
    // setting an ip field/option for ttl
    socket.setOption(socketLevel, socketOption, ttl);
  }

  function afterSend (error, bytes) {
    if (error)
        console.log(error.toString ());
    else
        console.log("sent " + bytes + " bytes");
    
    // console.log('do i get here???', ttl, socket);
    // if (socket) socket.setOption(socketLevel, socketOption, ttl);    
  }
   socket.send(buffer, 0, buffer.length, dest, beforeSend, afterSend);
  });
};

const ttl = async (dest, ttl) => {
  var pingInfo = []
  for (let i = 0; i < ttl; i++) {
    console.log('here first', i);
    try {
      var info = await ping(dest, i);
      console.log('getting right here', info);
      pingInfo.push(info);
    } catch (e) {
      console.log('what is the error', e);
    }
  }
  return pingInfo;
};

// run -- self executing async function
;(async () => {
 const target = process.argv[2] || '216.58.195.238' // ip address for google
 const maxHops = 64

 // Send ping requests with increasing TTL, and handle their responses
 // ping(target, 4);
 var pings = ttl(target, 3);
 // Promise.all(pings).then((results)=>{
 //   console.log('results', results);
 // })
 // var results = await Promise.all(pings);
 // console.log('results', results);

})()
