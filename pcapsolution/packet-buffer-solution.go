package main

import (
  "fmt"
  "io/ioutil"
  "encoding/binary"
  "sort"
  "os"
)

/**
  There are several sections of commented out code in this source file, especially
  in the specific header parsing functions.

  Commented out code is illustrative of parsing the rest of the header values.
  The students' task does not require any of this information, so the unused
  values have been commented out. I've left the code in so that it can be shown to
  students for illustrative purposes.
**/

// These lengths are assumptions based on the specifics of the provided net.cap file.
// A real parser would need to lookup at least the value for the link layer header
// after reading the pcap file global header.
const pcapFileHeaderLen = 24
const pcapPacketHeaderLen = 16
const ethernetHeaderLen = 14

/* These two type defs make some of our code a little more explicit */

// SequenceNumber is a TCP seq or ack number, a 32 bit unsigned int
type SequenceNumber uint32

// SequenceNumberArray is an array of sequence numbers
type SequenceNumberArray []SequenceNumber

// These are required for length and sorting
func (a SequenceNumberArray) Len() int           { return len(a) }
func (a SequenceNumberArray) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a SequenceNumberArray) Less(i, j int) bool { return a[i] < a[j] }


func main() {
  // Open the file, load all the bytes into memory.
  // In some cases it would be better to stream these bytes into memory using os.Open
  pcapBytes, err := ioutil.ReadFile("net.cap")
  if err != nil {
      panic(err)
  }

  // This is another assumption from the provided net.cap -- the HTTP data was being sent to this IP
  destinationOfInterest := []byte{192, 168, 0, 101}
  payloadMap := extractFromPcap(pcapBytes, int(binary.LittleEndian.Uint32(destinationOfInterest)))

  // Sort the sequence numbers
  sequenceNumbers := make([]SequenceNumber, len(payloadMap))
  sqnIdx := 0
  for sequenceNumber := range payloadMap {
    sequenceNumbers[sqnIdx] = sequenceNumber
    sqnIdx++
  }

  // Use our custom sorter
  sort.Sort(SequenceNumberArray(sequenceNumbers))

  // get the orderd bytes in one slice
  var orderedBytes []byte
  for _, sequenceNumber := range sequenceNumbers {
    orderedBytes = append(orderedBytes, payloadMap[sequenceNumber]...)
  }

  // Find the image section within the bytes
  i := 0
  for ; i < len(orderedBytes) - 4; i++ {
    if string(orderedBytes[i:i+4]) == "\r\n\r\n" {
      i += 4 // i needs to be advanced to the first location for data
      break
    }
  }

  // Write to disk
  f, err := os.Create("./theMan.jpg")
  defer f.Close()
  if err != nil {
    panic(err)
  }

  f.Write(orderedBytes[i:])
}

// To ease in building the parser I added a simple assert function
func assertEqual(a interface{}, b interface{}, message string) {
	if a != b {
		panic(fmt.Sprintf("%s: %v != %v", message, a, b))
	}
}

/*
  Provideda filepath to a pcap file and an ip address (as a 32 bit little endian integer)
  parse the pcap and return the TCP payload for that ip address as a
  map[sequenceNumber]payloadBytes
*/
func extractFromPcap(pcapBytes []byte, destIPAddress int) map[SequenceNumber][]byte {
  packets := make(map[SequenceNumber][]byte) // Maps sequence numbers to HTTP Payload data

  globalHeader := pcapBytes[0:pcapFileHeaderLen]
  verifyPcapHeader(globalHeader)

  // Note we have to update the packetStartLocation after reading it b/c packets are variable length
  for packetStartLocation := pcapFileHeaderLen; packetStartLocation <= len(pcapBytes); {
    pcapPacketHeader := pcapBytes[packetStartLocation:packetStartLocation + pcapPacketHeaderLen]
    packetLen := parsePcapHeader(pcapPacketHeader)

    if packetLen == 0 {
      return packets
    }

    // A slice of bytes
    etherStart := packetStartLocation + pcapPacketHeaderLen
    etherEnd := etherStart + packetLen
    ethernetPacket := pcapBytes[etherStart:etherEnd]
    ipDatagram := parseEtherFrame(ethernetPacket)
    ipDestination, tcpSegment := parseIPDatagram(ipDatagram)
    sequenceNumber, tcpPayload := parseTCPMessage(tcpSegment)

    ipDestInt := int(binary.LittleEndian.Uint32(ipDestination))
    if ipDestInt == destIPAddress {
      packets[sequenceNumber] = tcpPayload
    }

    packetStartLocation += (packetLen + pcapPacketHeaderLen)
  }

  return packets
}

/*
  Given a slice representing the global PCAP header file bytes, test against the known values for our
  particular capture. If something looks wrong, the assert function panics.
*/
func verifyPcapHeader(headerSlice []byte) {
  // TODO: this typecasting seems like it could be simpler...
  assertEqual(binary.LittleEndian.Uint32(headerSlice[0:4]), uint32(0xa1b2c3d4), "Pcap Endianness")
  assertEqual(binary.LittleEndian.Uint16(headerSlice[4:6]), uint16(2), "Pcap Major Version should be 2")
  assertEqual(binary.LittleEndian.Uint16(headerSlice[6:8]), uint16(4), "Pcap Minor Version should be 4")
  assertEqual(binary.LittleEndian.Uint32(headerSlice[8:12]), uint32(0), "TZ Offset should be zero")
  assertEqual(binary.LittleEndian.Uint32(headerSlice[12:16]), uint32(0), "Timestamp Accuracy should be zero")
  assertEqual(binary.LittleEndian.Uint32(headerSlice[20:24]), uint32(1), "Link Layer Header should be 1 (for ethernet)")
}

/*
  Given a slice represneting the bytes for a Pcap Packet Header (not a global header) check that the
  total length was captured (for our test file all packets were completely captured) and return the
  length of this packet
*/
func parsePcapHeader(headerSlice []byte) int {
  totalLength := binary.LittleEndian.Uint32(headerSlice[8:12])
  capturedLength := binary.LittleEndian.Uint32(headerSlice[12:16])
  assertEqual(totalLength, capturedLength, "Pcap Packet captured length didn't match total length -- misalignment may have occured")
  return int(totalLength)
}


func parseEtherFrame(etherFrameSlice []byte) []byte {
  headerBytes := etherFrameSlice[0:ethernetHeaderLen]
  etherType := headerBytes[12:14]
  assertEqual(int(binary.LittleEndian.Uint16(etherType)), 8, "Wrong ethernet type detected") // Ether IPv4

  // destMacAddress := headerBytes[0:6]
  // sourceMacAddress := headerBytes[6:12]

  return etherFrameSlice[ethernetHeaderLen:]
}


func parseIPDatagram(datagramBytes []byte) ([]byte, []byte) {
  ipVersion := datagramBytes[0] >> 4
  assertEqual(ipVersion, byte(4), "Wrong IP version parsed")

  ipHeaderLength := 4 * (datagramBytes[0] & 7) // Masking w/ 00001111, len provided in 32bit words
  ipDest := datagramBytes[16:20]
  // ipSource := datagramBytes[12:16]

  return ipDest, datagramBytes[ipHeaderLength:]
}


func parseTCPMessage(tcpBytes []byte) (SequenceNumber, []byte) {
  seqNumber := binary.BigEndian.Uint32(tcpBytes[4:8])
  reservedSection := tcpBytes[12] & 14        // Reserved is the 3 bits within the bottom half of a single byte
  assertEqual(int(reservedSection), 0, "Reserved section is not 0, misalignment is likely")
  tcpHeaderLength := 4 * (tcpBytes[12] >> 4)  // header-size is the top half of a byte, in 32bit words

  // sourcePort := binary.BigEndian.Uint16(tcpBytes[0:2])
  // destPort := binary.BigEndian.Uint16(tcpBytes[2:4])
  // ackNumber := binary.BigEndian.Uint32(tcpBytes[8:12])
  // flagBitfield := binary.BigEndian.Uint16(tcpBytes[12:14]) & 511
  // windowSize := binary.BigEndian.Uint16(tcpBytes[14:16])
  // tcpChecksum := binary.BigEndian.Uint16(tcpBytes[16:18])
  // Ignoring urgent pointer, not actually checking checksum

  // Extract from bitfields
  // flags := map[string]bool {
  //   "ns_flag" : (flagBitfield & 256) != 0,
  //   "cwr_flag" : (flagBitfield & 128) != 0,
  //   "ece_flag" : (flagBitfield & 64) != 0,
  //   "urg_flag" : (flagBitfield & 32) != 0,
  //   "ack_flag" : (flagBitfield & 16) != 0,
  //   "psh_flag" : (flagBitfield & 8) != 0,
  //   "rst_flag" : (flagBitfield & 4) != 0,
  //   "syn_flag" : (flagBitfield & 2) != 0,
  //   "fin_flag" : (flagBitfield & 1) != 0 }


  return SequenceNumber(seqNumber), tcpBytes[tcpHeaderLength:]
}
