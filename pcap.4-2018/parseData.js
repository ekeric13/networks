/*
ask for image data
receive image data in response
http://3.bp.blogspot.com/-ePLaAbGzOz8/Ubrd-lcPWqI/AAAAAAAAAWE/kzRR8y9Pkwc/s1600/10.png
server opens port on 80 (http)
client opens port on x

http://www.tcpdump.org/manpages/pcap-savefile.5.html

hexdump -C net.cap | head

00000000  d4 c3 b2 a1 02 00 04 00  00 00 00 00 00 00 00 00  |................|

since magic number is 0xd4c3b2a1, and not 0xa1b2c3d4, 
than we know the host that wrote the file has opposite byte order of the computer that 
we are on. so we need to do byte swapping.

major version: 02 00 (correctly is 2)
minor version: 04 00 (correctly is 4)
time zone offset: 00 00 00 00 (correctly is 0)
accuracy of time stamps: 00 00 00 00 (correctly is 0)


00000010  ea 05 00 00 01 00 00 00  40 98 d0 57 0a 1f 03 00  |........@..W....|

snapshot length: ea 05 00 00  
a = 10
e = 16 * 14
5 = 16^2 * 5
length = 10 + 224 + 1280 = 1514 bytes (anything more and we lose it)
we don't have any truncated packets in this exercise.

link layer header: 01 00 00 00
tells use we are using ethernet II


Read the captured and total length of each packet
Verify that for every packet the captured length and total length are equal. (this is true for the file we provided, but not in general)
This will also tell you where the next packet header starts.
Verify that there are 99 Packets represented in this data. (Again, this is true in the provided data, not generally)


40 98 d0 57 0a 1f 03 00

time stamp in seconds: 40 98 d0 57
time stamp in microseconds: 0a 1f 03 00

4e 00 00 00 4e 00 00 00

length of pacekt: 4e 00 00 00
e = 14
4 = 16 * 4 
length = 64 + 14 = 78 bytes

untrancated length: 4e 00 00 00
this will always be the same of the truncated length in this exercise.


skip first 24 bytes.
read next 16 bytes and find size of packet.
jump x bytes after end of pcap header
read 16 bytes and find that packet size.
keep going until run out of data, then know you are at the end.

ethernet header

destination mac address: c4e9 8487 6028

source mac address: a45e 60df 2e1b

ether type: 0800


destination mac address <Buffer c4 e9 84 87 60 28> 6
source mac address <Buffer a4 5e 60 df 2e 1b> 6
etherType <Buffer 08 00> 2


so it looks like the client is having a hard time receiving messages by the server. 
it is sending "tcp retransmission", which is when after a certain period of time, if it has not received a "syn ack", 
will send out the "syn" again. and also "tcp dup ack", 
which is telling the server to send previous packets as some packets were dropped as the sequence number is out of order.

*/


const fs = require('fs');
const path = require('path');

function readXBytesFromFile(startingPosition, totalBytes) {
  return new Promise((res, rej)=> {
    const filePath = path.join(__dirname, 'net.cap');
    fs.open(filePath, 'r', function(err, fd){
      if (err) return rej(err);
      fs.fstat(fd, (err, stats)=> {
        if (err) return rej(err);
        // console.log('what are the stats', stats);
        let buffer = new Buffer(totalBytes);
        let bytesRead = 0;
        const read = (chunkSize) => {
          // fd, buffer to read into, offset within buffer, bytes to read, position within file
          fs.read(fd, buffer, bytesRead, chunkSize, startingPosition+bytesRead, function(err, numBytes, bufRef) {
            bytesRead += numBytes;
            // console.log('in here', bufRef);
            if (bytesRead < totalBytes && numBytes !== 0) {
              return read(Math.min(512, totalBytes - bytesRead));
            }
            fs.closeSync(fd);
            res(bufRef);
          }) 
        };
        read(Math.min(512, totalBytes - bytesRead));
      })
    })
  });
}

function parseData(destinationBuffer, sourceBuffer, targetStart, sourceStart, goalAmountToParse, amountCanParse) {
  var amountToParse = Math.min(goalAmountToParse, amountCanParse);
  var sourceEnd = sourceStart + amountToParse;
  // returns amountParsed
  return sourceBuffer.copy(destinationBuffer, targetStart, sourceStart, sourceEnd);
}

// pas = activity state
// ls = layer state
function parseLayer(nameOfActivity, numBytesForActivity, pas, ls, desination, source, sourceSize) {
  pas.currentActivityLeft = (numBytesForActivity) - pas.currentTargetOffset;
  var amountParsed = parseData(desination, source, pas.currentTargetOffset, pas.currentPacketOffset, pas.currentActivityLeft, sourceSize-pas.currentPacketOffset);
  pas.currentTargetOffset += amountParsed;
  pas.currentPacketOffset += amountParsed;
  pas.currentActivityLeft -= amountParsed;
  if (pas.currentActivityLeft === 0) {
    console.log(nameOfActivity, desination, desination.length)
    ls.subStage++;
    pas.currentTargetOffset = 0;
    return 'completed'
  }
}

function parseSubBits(buffer, ...args) {
  var bufferInBits = buffer.readUIntBE(0, buffer.length).toString('2').padStart(buffer.length*8,'0');
  // console.log('buffer', bufferInBits);
  var bits;
  var prevArg = 0;
  var pieces = args.map((arg)=>{
    bits = bufferInBits.slice(prevArg, arg).toString('2');
    prevArg = arg;
    // console.log('what are these', bits);
    return parseInt(bits, 2);
  });
  var lastBit = bufferInBits.slice(prevArg).toString('2');
  pieces = pieces.concat(parseInt(lastBit, 2));
  return pieces
}

function convertHexToIp(buffer) {
  return Array.from(buffer).map((hex)=>{
    return hex;
  }).join('.');
}

function combineHttpData(httpObj) {
  var orderedBuffers = Object.keys(httpObj).sort((a,b)=> +(a) - +(b)).map((seqNum)=>{
    return httpObj[seqNum]
  });
  return Buffer.concat(orderedBuffers);
}

function findContentLength(headerStr) {
  var contentLengthLine = headerStr.split('\n').filter((str)=>str.includes('Content-Length'))[0];
  return +(contentLengthLine.split(' ')[1]);
}


const pcapGlobalHeaderSize = 24;
const pcapFileHeaderSize = 16;
const ethernetHeaders = 'ethernetHeaders';
const destinationMacAddressKey = 'destinationMacAddress';
const sourceMacAddressKey = 'sourceMacAddress';
const etherTypeKey = 'etherType';

const ipHeaders = 'ipHeaders';
const ipVersionAndHeaderLengthKey = 'ipVersionAndHeaderLength';
const DSCPandECNkey = 'DSCPandECN';
const ipLengthKey = 'ipLength';
const ipIdentificationKey = 'ipIdentification';
const ipFlagsAndFragmentOffsetKey = 'ipFlagsAndFragmentOffset';
const ipTimeToLiveKey = 'ipTimeToLive';
const ipProtocolKey = 'ipProtocol';
const ipHeaderChecksumKey = 'ipHeaderChecksum';
const ipSourceAddressKey = 'ipSourceAddress'
const ipDestinationAddressKey = 'ipDestinationAddress';
const ipOptionsKey = 'ipOptions';

const transportHeaders = 'transportHeaders';
const sourcePortKey = 'sourcePort';
const destinationPortKey = 'destinationPort';
const sequenceNumberKey = 'sequenceNumber';
const acknowledgementNumberKey = 'acknowledgementNumber';
const tcpHeaderLengthAndReservedAndFlagKey = 'tcpHeaderLengthAndReservedAndFlag';
const tcpFlagsKey = 'tcpFlags';
const windowSizeKey = 'windowSize';
const tcpChecksumKey = 'tcpChecksum';
const tcpUrgentPointerKey = 'tcpUrgentPointer';
const tcpOptionsKey = 'tcpOptions';

const appHeaders = 'appHeaders';
const httpDataKey = 'httpData';

const layers = {
  [ethernetHeaders]: [destinationMacAddressKey, sourceMacAddressKey, etherTypeKey],
  [ipHeaders]: [
    ipVersionAndHeaderLengthKey, DSCPandECNkey, ipLengthKey, ipIdentificationKey, 
    ipFlagsAndFragmentOffsetKey, ipTimeToLiveKey, ipProtocolKey, ipHeaderChecksumKey,
    ipSourceAddressKey, ipDestinationAddressKey, ipOptionsKey
  ],
  [transportHeaders]: [
    sourcePortKey, destinationPortKey, sequenceNumberKey, acknowledgementNumberKey,
    tcpHeaderLengthAndReservedAndFlagKey, tcpFlagsKey, windowSizeKey, tcpChecksumKey,
    tcpUrgentPointerKey, tcpOptionsKey
  ],
  [appHeaders]: [httpDataKey]
}
async function main() {
  var destinationMacAddress = Buffer.alloc(6);
  var sourceMacAddress = Buffer.alloc(6);
  var etherType = Buffer.alloc(2);

  var ipVersionAndIpLength = Buffer.alloc(1);
  var ipHeaderLengthInBytes = 0;
  var DSCPandECN = Buffer.alloc(1);
  var ipLength = Buffer.alloc(2);
  var ipDatagramPayloadLength = 0;
  var ipIdentification = Buffer.alloc(2);
  var ipFlagsAndFragmentOffset = Buffer.alloc(2);
  var ipTimeToLive = Buffer.alloc(1);
  var ipProtocol = Buffer.alloc(1);
  var ipHeaderChecksum = Buffer.alloc(2);
  var ipSourceAddress = Buffer.alloc(4);
  var ipDestinationAddress = Buffer.alloc(4);
  var ipOptions;
  var ipOptionsLength = 0;

  var sourcePort = Buffer.alloc(2);
  var sourcePortDecimal = 0;
  var desinationPort = Buffer.alloc(2);
  var desinationPortDecimal = 0;
  var sequenceNumber = Buffer.alloc(4);
  var seqNumberDecimal = 0;
  var acknowledgementNumber = Buffer.alloc(4);
  var ackNumberDecimal = 0;
  var tcpHeaderLengthAndReservedAndFlag = Buffer.alloc(1);
  var tcpHeaderLengthInBytes = 0;
  var tcpDatagramPayloadLength = 0;
  var tcpFlags = Buffer.alloc(1);
  var windowSize = Buffer.alloc(2);
  var tcpChecksum = Buffer.alloc(2);
  var tcpUrgentPointer = Buffer.alloc(2);
  var tcpOptions;
  var tcpOptionsLength = 0;

  var clientPort;
  var serverPort;
  var httpData;

  var storeHttpData = {};

  var skipAmount = pcapGlobalHeaderSize
  var readAmount = pcapFileHeaderSize;

  var numPackets = 0;
  
  // layer state
  var ls = {
    layer: ethernetHeaders,
    subStage: 0
  }

  // packet/activity state
  var pas = {
    currentTargetOffset: 0,
    currentPacketOffset: 0,
    currentActivityLeft: 0
  };

  // while the packetSize is not 0
  while (true) {
    var headerData = await readXBytesFromFile(skipAmount, readAmount);

    var packetSize = headerData.slice(8,12).readUInt32LE();
    if (packetSize === 0) break;

    skipAmount += readAmount;
    readAmount = packetSize;
    var packetData = await readXBytesFromFile(skipAmount, readAmount);
    console.log('packet length', packetData.length);
    console.log('');

    // reset source offset
    pas.currentPacketOffset = 0;
    ls.layer = ethernetHeaders;
    ls.subStage = 0;

    console.log('ETHERNET', numPackets);
    // ethernet
    if (ls.layer === ethernetHeaders) {
      var ethernetLayer = layers[ls.layer];
      if (ethernetLayer[ls.subStage] === destinationMacAddressKey) {
        var completed = parseLayer('destination mac', 6, pas, ls, destinationMacAddress, packetData, packetSize);
      }
      if (ethernetLayer[ls.subStage] === sourceMacAddressKey) {
        var completed = parseLayer('source mac', 6, pas, ls, sourceMacAddress, packetData, packetSize);
      }
      if (ethernetLayer[ls.subStage] === etherTypeKey) {
        var completed = parseLayer('etherType', 2, pas, ls, etherType, packetData, packetSize);
      }
      ls.layer = ipHeaders;
      ls.subStage = 0;
    }
    console.log('');

    console.log('IP', numPackets);
    // ip 
    if (ls.layer === ipHeaders) {
      var ipLayer = layers[ls.layer];
      if (ipLayer[ls.subStage] === ipVersionAndHeaderLengthKey) {
        var completed = parseLayer('ip version and length', 1, pas, ls, ipVersionAndIpLength, packetData, packetSize);
        if (completed) {
          var [version, length] = parseSubBits(ipVersionAndIpLength, 4);
          ipHeaderLengthInBytes = length * 4;
          ipOptionsLength = ipHeaderLengthInBytes-20;
          ipOptions = Buffer.alloc(ipOptionsLength);
          console.log('ip version should be four', version);
          console.log('ip header length', ipHeaderLengthInBytes);
        }
      }
      if (ipLayer[ls.subStage] === DSCPandECNkey) {
        var completed = parseLayer('DSCPandECN', 1, pas, ls, DSCPandECN, packetData, packetSize);
      }
      if (ipLayer[ls.subStage] === ipLengthKey) {
        var completed = parseLayer('ipLength', 2, pas, ls, ipLength, packetData, packetSize);
        if (completed) {
          ipDatagramPayloadLength = ipLength.readInt16BE() - ipHeaderLengthInBytes;
          console.log('***ipDatagramPayloadLength', ipDatagramPayloadLength);
        }
      }
      if (ipLayer[ls.subStage] === ipIdentificationKey) {
        var completed = parseLayer('ipIdentification', 2, pas, ls, ipIdentification, packetData, packetSize);
      }
      if (ipLayer[ls.subStage] === ipFlagsAndFragmentOffsetKey) {
        var completed = parseLayer('ipFlagsAndFragmentOffset', 2, pas, ls, ipFlagsAndFragmentOffset, packetData, packetSize);
        if (completed) {
          var [flags, fragmentOffset] = parseSubBits(ipFlagsAndFragmentOffset, 3);
          console.log('ip flags', flags.toString('2').padStart(3, '0'));
          console.log('fragment offset', fragmentOffset);
        }
      }
      if (ipLayer[ls.subStage] === ipTimeToLiveKey) {
        var completed = parseLayer('ipTimeToLive', 1, pas, ls, ipTimeToLive, packetData, packetSize);
      }
      if (ipLayer[ls.subStage] === ipProtocolKey) {
        var completed = parseLayer('ipProtocol should be 6 (tcp)', 1, pas, ls, ipProtocol, packetData, packetSize);
      }
      if (ipLayer[ls.subStage] === ipHeaderChecksumKey) {
        var completed = parseLayer('ipHeaderChecksum', 2, pas, ls, ipHeaderChecksum, packetData, packetSize);
      }
      if (ipLayer[ls.subStage] === ipSourceAddressKey) {
        var completed = parseLayer('ipSourceAddress', 4, pas, ls, ipSourceAddress, packetData, packetSize);
        console.log('source ip', convertHexToIp(ipSourceAddress))
      }
      if (ipLayer[ls.subStage] === ipDestinationAddressKey) {
        var completed = parseLayer('ipDestinationAddress', 4, pas, ls, ipDestinationAddress, packetData, packetSize);
        console.log('destination ip', convertHexToIp(ipDestinationAddress))
      }
      if (ipHeaderLengthInBytes > 20 && ipLayer[ls.subStage] === ipOptionsKey) {
        var completed = parseLayer('ipOptions', ipOptionsLength, pas, ls, ipOptions, packetData, packetSize);
      }
      ls.layer = transportHeaders;
      ls.subStage = 0;
    }
    console.log('');

    console.log('TRANSPORT', numPackets);
    // transport
    if (ls.layer === transportHeaders) {
      var transportLayer = layers[ls.layer];
      var nsFlag;
      if (transportLayer[ls.subStage] === sourcePortKey) {
        var completed = parseLayer('sourcePort', 2, pas, ls, sourcePort, packetData, packetSize);
        sourcePortDecimal = sourcePort.readUInt16BE();
        if (numPackets === 0) clientPort = sourcePortDecimal;
        console.log('source port decimal', sourcePortDecimal);
      }
      if (transportLayer[ls.subStage] === destinationPortKey) {
        var completed = parseLayer('desinationPort', 2, pas, ls, desinationPort, packetData, packetSize);
        desinationPortDecimal = desinationPort.readUInt16BE();
        if (numPackets === 0) serverPort = desinationPortDecimal;
        console.log('destination port decimal', desinationPortDecimal);
      }
      if (transportLayer[ls.subStage] === sequenceNumberKey) {
        var completed = parseLayer('sequenceNumber', 4, pas, ls, sequenceNumber, packetData, packetSize);
        seqNumberDecimal = sequenceNumber.readUInt32BE();
        console.log('seq', seqNumberDecimal);
      }
      if (transportLayer[ls.subStage] === acknowledgementNumberKey) {
        var completed = parseLayer('acknowledgementNumber', 4, pas, ls, acknowledgementNumber, packetData, packetSize);
        ackNumberDecimal = acknowledgementNumber.readUInt32BE();
        console.log('ack', ackNumberDecimal);
      }
      if (transportLayer[ls.subStage] === tcpHeaderLengthAndReservedAndFlagKey) {
        var completed = parseLayer('tcpHeaderLengthAndReservedAndFlag', 1, pas, ls, tcpHeaderLengthAndReservedAndFlag, packetData, packetSize);
        if (completed) {
          var [tcpHeaderLength, reserved, nsFlag] = parseSubBits(tcpHeaderLengthAndReservedAndFlag, 4, 7);
          tcpHeaderLengthInBytes = tcpHeaderLength * 4;
          tcpOptionsLength = tcpHeaderLengthInBytes-20;
          tcpDatagramPayloadLength = ipDatagramPayloadLength - tcpHeaderLengthInBytes
          tcpOptions = Buffer.alloc(tcpOptionsLength);
          httpData = Buffer.alloc(tcpDatagramPayloadLength);
          console.log('tcp header length', tcpHeaderLengthInBytes);
          console.log('***tcpDatagramPayloadLength', tcpDatagramPayloadLength);
        }
      }
      if (transportLayer[ls.subStage] === tcpFlagsKey) {
        var completed = parseLayer('tcpFlags', 1, pas, ls, tcpFlags, packetData, packetSize);
        if (completed) {
          var tcpFlagsInBits = tcpFlags.readUIntBE(0, 1).toString('2').padStart(8,'0');
          console.log('tcp flags in bits', nsFlag+tcpFlagsInBits);
        }
      }
      if (transportLayer[ls.subStage] === windowSizeKey) {
        var completed = parseLayer('windowSize', 2, pas, ls, windowSize, packetData, packetSize);
      }
      if (transportLayer[ls.subStage] === tcpChecksumKey) {
        var completed = parseLayer('tcpChecksum', 2, pas, ls, tcpChecksum, packetData, packetSize);
      }
      if (transportLayer[ls.subStage] === tcpUrgentPointerKey) {
        var completed = parseLayer('tcpUrgentPointer', 2, pas, ls, tcpUrgentPointer, packetData, packetSize);
      }
      if (tcpHeaderLengthInBytes > 20 && transportLayer[ls.subStage] === tcpOptionsKey) {
        var completed = parseLayer('tcpOptions', tcpOptionsLength, pas, ls, tcpOptions, packetData, packetSize);
      }

      ls.layer = appHeaders;
      ls.subStage = 0;
    }
    console.log('');

    console.log('APP', numPackets);
    if (ls.layer === appHeaders) {
      var appLayer = layers[ls.layer];
      // make sure there is data
      // make sure port is right && sourcePortDecimal === serverPort
      // make sure on right stage
      if (tcpDatagramPayloadLength > 0 && sourcePortDecimal === serverPort  && appLayer[ls.subStage] === httpDataKey ) {
        var completed = parseLayer('httpData', tcpDatagramPayloadLength, pas, ls, httpData, packetData, packetSize);
        if (completed) {
          storeHttpData[seqNumberDecimal] = httpData;
          // return;
        }
      }      
    }
    console.log('');
    
    if (numPackets === 1) return;

    numPackets++;
    skipAmount += readAmount;
    readAmount = pcapFileHeaderSize;
  }
  console.log('num packets', numPackets);
  // console.log('http data', storeHttpData);

  var httpDataCombinedBuffer = combineHttpData(storeHttpData);
  console.log('large buffer', httpDataCombinedBuffer);
  var endOfHeader = httpDataCombinedBuffer.indexOf('\r\n\r\n');
  var headerBuffer = httpDataCombinedBuffer.slice(0, endOfHeader);
  var headerString = headerBuffer.toString('ascii');
  console.log('string of data:\n'+ headerBuffer);
  var contentLength = findContentLength(headerString);
  console.log('contentLength', contentLength);
  var dataBuffer = httpDataCombinedBuffer.slice(endOfHeader+4, endOfHeader+4+ contentLength);
  console.log('data buffer', dataBuffer.length)
  const writeFilePath = path.join(__dirname, 'image.jpg');
  fs.writeFile(writeFilePath, dataBuffer, (err)=> {
    if (err) throw err;
  })
}

main();

// var buffer = new Buffer()

// packet 15 is the request
// packet 16 is response with image data


// client
// source port  59295
// destination port  80

// server
// source port  80
// destination port  59295

// sequenceNumber <Buffer 5e ab 22 65> 
// syn 1588273765
// acknowledgementNumber <Buffer 00 00 00 00> 
// ack 0

// sequenceNumber <Buffer 08 fc 83 16> 
// syn 150766358
// acknowledgementNumber <Buffer 5e ab 22 66> 
// ack 1588273766

// sequenceNumber <Buffer 5e ab 22 65> 
// syn 1588273765
// acknowledgementNumber <Buffer 00 00 00 00> 
// ack 0

// sequenceNumber <Buffer 08 fc 83 16> 
// syn 150766358
// acknowledgementNumber <Buffer 5e ab 22 66> 
// ack 1588273766

// sequenceNumber <Buffer 5e ab 22 65>
// syn 1588273765
// acknowledgementNumber <Buffer 00 00 00 00>
// ack 0


// client syn (cSeq = x)
// sequenceNumber <Buffer 5e ab 22 65> 
// seq 1588273765
// acknowledgementNumber <Buffer 00 00 00 00> 
// ack 0

// server syn, ack (sAck = cSeq+1, sSeq = y)
// sequenceNumber <Buffer 08 fc 83 16>
// seq 150766358
// acknowledgementNumber <Buffer 5e ab 22 66>
// ack 1588273766

// client request (ack + data)  (cSeq = sAck, cAck = sSeq+1)
// sequenceNumber <Buffer 5e ab 22 66>
// seq 1588273766
// acknowledgementNumber <Buffer 08 fc 83 17>
// ack 150766359
// http data


// server response 1 (sSeq = cAck+a, sAck = cSeq+b)
// sequenceNumber <Buffer 08 fc 88 a7>
// seq 150767783
// acknowledgementNumber <Buffer 5e ab 22 b6>
// ack 1588273846
// http data

// server response 2 (sSeq = sSeq1+c, sAck = sAck1)
// sequenceNumber <Buffer 08 fc 8e 37> 
// seq 150769207
// acknowledgementNumber <Buffer 5e ab 22 b6> 
// ack 1588273846

// server response 3
// sequenceNumber <Buffer 08 fc 93 c7>
// seq 150770631
// acknowledgementNumber <Buffer 5e ab 22 b6>
// ack 1588273846



