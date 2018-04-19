/*

transport-layer protocols are implemented in the end systems but not in network routers
 transport-layer protocol: logical communication between processes running on different hosts
network-layer protocol provides logical communication between hosts.

UDP (User Datagram Protocol) -  unreliable, connectionless service
TCP (Transmission Control Protocol) - reliable, connection-oriented service 

tcp extends  IP’s delivery service between two end systems to two processes.
going from host to process is called  transport-layer multiplexing/demultiplexing

tcp is reliable via: flow control, sequence numbers, acknowledgments, and timers 
TCP provides congestion control as well.

transport layer examines fields to identify the receiving socket and then directs the segment to that socket
delivering data to the correct socket is demultiplexing

gathering data chunks at the source host from different sockets, encapsulating each data chunk with 
header information ) to create segments, and passing the segments to the network layer is called multiplexing

when a UDP socket is created  the transport layer automatically assigns a port number to the socket.

a UDP socket is fully identified by a two-tuple consisting  of a destination IP address and a destination port number

a TCP socket is identified by a four-tuple: source IP address, source port number, destination IP address, destination port number).

upd very lightweight. multiplexing/demultiplexing, and light error checking.

UDP there is no handshaking. so connectionless.

in udp if you get no reply, either try again and inform user there was no reply.

UDP allows for Finer application-level control over what data is sent, and when. TCP takes control. does
congestion control. 
if we want less delay and can tolerate data loss UDP is better.
upd has no connection establishment. no 3 way handshake.
udp has no connection state.
upd has less overhead. 8 byte headers vs 20 byte headers

dns chooses udp to avoid delays.
SNMP chooses udp since it runs on a stressed network, as reliablility is hard to achieve in that state.
real-time applications, like Internet phone and video conferencing, react very poorly to TCP’s congestion control
TCP is increasingly being used for streaming media transport. 75% streaming use TCP.
UDP is sometimes blocked for security reasons.

udp can be reliable if the reliability factor is built into the application layer.

udp header is 4 fields, 2 bytes each.
source port
destination port
length - the number of bytes in the UDP segment (header plus data)
checksum

if error either discard the damaged segment, or pass segment on with error.

use sequence number to determine if packet is retransmission or not. if same sequence number a re-transmission.
new sequence number is a new packet.
when get corrupted packet send a NAK, instead of an ACK.
instead of sending a NAK, in reality we send another ACK but with the same sequence number of the last packet 
that was not corrupted.

so sequence number is used for error detection communication (if a checksum failed) and needs to be 
resent, know if a packet is a retransmission, know if a packet is a duplicate.

sender has a timer. if has received no ack after a time, send packet again. can lead to duplicate packets.
sequence number handle duplicate packets.

sender is allowed to send multiple packets without waiting for ACKs. this is called pipelining.
to do pipelining need to increase number of sequence numbers.
sender needs to buffer packets that have been transmitted but not acknowledged (so that they can transmit them
again if need be).

Go-Back-N (GBN) protocol - lets you transmit many packets without waiting for an acknowledgment, up to N packets.
"base" to be the sequence number of the oldest unacknowledged, "nextseqnum" to be the smallest unused sequence number 
[0,base-1] = packets that have already been transmitted and acknowledged
[base,nextseqnum-1] = packets that have not been acknowledged
 [nextseqnum,base+N-1] = packets in queue to be sent.
[base,nextseqnum-1] + [nextseqnum,base+N-1] = window size.
slide the window as we get Acks back.
GBN protocol itself as a sliding-window protocol

k is the number of bits in the packet sequence number field
range of sequence numbers is [0,2k – 1]

TCP has a 32-bit sequence number

in GBN if a timeout occurs, the sender resends all packets that have been previously sent but that have 
not yet been acknowledged.
GBN has  cumulative acknowledgment, meaning for packet with sequence number n, all packets with 
a sequence number up to and including n have been correctly received.
packet is in order if it has sequence number n, and last packet has sequence number n-1.
if receiver gets bad packet with sequence number n, sends back ack packet with sequence number n-1
GBN  discards out-of-order packets

Selective Repeat (SR) protocol -  avoid unnecessary retransmissions by having the sender retransmit 
only those packets that is suspects received an error.
out of ordered packets are buffered until missing packets with lower sequence numbers are received, 
and then delivered in order to upper layer.

since sequence numbers are reused. need enough sequence numbers to last 3 minutes (after 3 minutes tcp no old 
packet will arrive. assumed packet lost.)


TCP is said to be connection-oriented. two processes must first “handshake” 
TCP connection provides a full-duplex service: data can go from A->B at that same time as B->A
http is not duplex. second request not sent until first response, underneath though duplex is happening.
web sockets is duplex. not waiting for requests or responses. 
tcp is point to point. single sender and single receiver.
3 way handshake to establish tcp connection between processes. first 2 segments carry no payload. 3rd can
carry application data.

client process passes a stream of data through the socket. TCP directs this data to the connection’s send buffer.
TCP will grab chunks of data from the send buffer and pass the data to the network layer.
max amount of data that can be placed in segment is called maximum segment size (MSS)
MSS set by determining the length of the largest link-layer frame that can be sent by the local sending host (MTU - 
maximum transmission unit). makes sure MSS and tcp and ip headers (40 bytes combined) can fit in frame.
ethernet MSS is 1,500 bytes.
TCP segment = tcp header + chunk of client data

tcp header is at least 9 parts. at least 20 bytes
source port  | 16 bit
destination port | 16 bit
sequence number | 32 bit (used for reliability)
ack number | 32 bit
header length | 4 bit
flags | 6 bit (indicates where within handshake you are, and to look at sequence or ack number)
receive window | 16 bit (used for flow control.  indicate the number of bytes that a receiver )
checksum | 16 bit
urgent data pointer | 16 bit (offset to where there is urgent data to send to application immediately)
options | x bits (used to negotiate MSS)


process on host A sending 500,000 bytes to host B.
MSS 1,000 bytes
TCP constructs 500 segments of 1,000 bytes
TCP on host A labels first segment with sequence number 0.
second segment gets sequence number 1,000

acknowledgment number that Host A puts in its segment is the sequence number 
of the next byte Host A is expecting from Host B

host A receives segment from host B with sequence number 0. it knows segment has 1000 bytes.
so host A now wants byte 1001. when host A sends a segment to host B, that segment has 
an acknowledgement number of 1001.

because TCP is  cumulative acknowledgments
if host A receives segment with bytes 0-535. and another segment with bytes 900-1,100
then host A next segment to host B will have ack number of 536.
TCP only acknowledges bytes up to the first missing byte.

in practice, first initial sequence number is not 0, but a random number.


there is an echo server. telnet based application (like ssh but unsecure.)
client initial sequence number is 42
server initial sequence number is 79.
after tcp connection is established.
client will have its ack number as 79. (ack number is byte number it is waiting to receive.)
and server will have its ack number as 42.

type "CAT"

send over ascii C
client -> server
seq: 42. ack: 79. data: C
server -> client
seq: 79. ack: 43. data: C (ack is 43, since next byte will be byte 43.)
client acknowledges it received data.
client -> server
seq: 43.  ack: 80. no data.

retransmission based on timer. timeout based on round trip time.
TCP measures rtt of one segment, called sample-rtt.
weighted average sample-rtt to get estimated-rtt. (weighted in favor of most recent samples).
also meassure dev-rtt, aka measurement of variance. measure how much sample-rtt deviate from estimated-rtt.
timeout interval = estimated-rtt + 4 * dev-rtt
initial Timeout Interval is usually 1 second
when 1 timeout occurs, timeout interval doubled.

when get 3 duplicate acks, even if timeout hasn't occured, assumed that a packet was lost. so retransmit.

TCP provides a flow-control service - rate sender sends is matched to rate receiver reads.
TCP sender can also be throttled if need be - for congestion control

receiver
receive buffer >= lastByteReceived - lastByteRead
lastByteRead = last byte read from buffer
lastByteReceived = last byte arrived from network

receiveWindow = receiveBuffer - lastByteReceived - lastByteRead
receive window = how much spare room in buffer
receieveWindow is part of tcp segment header.

sender
LastByteSent = last byte sent to network
LastByteAcked = last byte acknowledged that other host received.
LastByteSent – LastByteAcked = amount of unacknowledged data that has been sent over the wire.
receiveWindow >= LastByteSent – LastByteAcked 


when receiveWindow is 0, sender still sends data, but 1 byte. since it doesn't know whether
the receiver's buffer has cleared up or not.

tcp connection via
1. client -> server
syn bit is set to 1 (that's why it is called syn.)
chooses a random initial sequence number for the sequence number field. (client_isn)
2. server -> client
server allocates buffer
syn bit is set to 1.
ack number is set to seq number + 1 of request. (ack number is relevant now. and syn is set. so syn-ack.)
chooses a random initial sequence number for the sequence number field. (server_isn)
3. client -> server
client allocates buffer.
want to acknowledge server connection, so send a segment back to server.
syn bit is now set to 0. as connection established.
ack number is set to seq number + 1 of response.

tcp closing connection
1. client -> server
fin bit is set to 1
2. server -> client
ack

3. server -> client
fin bit is set to 1

4. client
ack
wait period (usually 30 seconds)
dellocate buffer

5. server
receive ack.
deallocate buffer.


how nmap works
send syn segment to port on another host.
if gets back tcp synack, then the port is open.
if gets back tcp rst, then the port is closed. (segment with rst flag bit set to 1)
if gets back nothing, then there is a firewall and host was never reached


packet retransmission treats sympton of network congestion (packet loss), not the cause of congestion
to treat cause of congestion, need to throttle senders.

a congested network—large queuing delays are experienced as the packet arrival rate nears the link capacity.
the sender must perform retransmissions in order to compensate for dropped (lost) packets due to buffer overflow.
unneeded retransmissions by the sender in the face of large delays may cause a router to use its
link bandwidth to forward unneeded copies of a packet.
when a packet is dropped along a path, the transmission capacity

TCP congestion control mechanism:TCP is to have each sender limit the rate at which it 
sends traffic into its connection as a function of perceived network congestion.
So if tcp thinks there is little traffic, transmits a lot. if it thinks there is a lot of traffic, transmits little.

Math.min(congestionWindow, receiveWindow) >= LastByteSent – LastByteAcked

sender’s send rate is roughly min(cwnd, rwnd)/RTT bytes/sec

knows there is congestion if there is a loss event (timeout or 3 duplicate acks).
decrease congestionWindow size if this happens

when tcp gets successful acks back, will increase congestionWindow size.
the faster the acks arrive, faster congestionWindow is increased. (this is called self-clocking)

slow start
congestionWindow starts at 1 MSS
so sender sends at a rate of MSS/RTT
MSS = 500 bytes. RTT = 200milliseconds
sending rate is 20 kilobytes per second.
for each ack getting back, increase window by 1 MSS.
grows exponentially.
if loss congestionWindow set back to 1 MSS.
if get 3 duplicate acks, enter into fast recovery

Congestion Avoidance
increase 1 MSS per RTT. if send 10 segments, increase by 1 MSS after get 10 acks.
when timeout occurs, congestionWindow set to 1 MSS.
when get 3 duplicate acks, congestionWindow halved.

fast recovery
increase congestionWindow by 1 MSS for each duplicate ack.
when missing ack arrives, go into congestion avoidance mode.
if timeout event occurs first, go into slow start state.

average throughput = (.75 * congestionWindow) / RTT


using multiple tcp connections gives you more bandwith since each one is throttled individually.


Q: How are UDP and TCP different? How do their respective headers reflect their differences?
A: tcp is connection oriented. 3 way handshake. is based on destination port and ip as well as source port and ip.
tcp is just desintation port and ip.

Q: What kinds of applications might prefer UDP to TCP? Why?
A: applications prefer udp if they want to be fast as possible. can tolerate data loss.
want to be simple (not a big need for state)

Q: What information is exchanged during TCP’s “Three way handshake”? How are these pieces of information used?
A: sequence number, ack number, syn flag, ack flag.
source port, source ip address when binding to a socket.

Q: What is a checksum and how can it be used to detect corrupt data?
A: checksum is taking the non-checksum bits in the packet and adding them together in a methodology
that should be equal to the checksum bits so you know if any bits have been flipped.

QUIC is another transport layer protocol.

other checksums algos: md5, crc
why is tcp checksum so weak?

tcp checksum is 16 bits
2^16 = 65,000 possibilities
so 1/65k collision.
way more than 65k segments.
over 1 tcp connection won't have very many matches.
it is protecting against electrical interference.
not designed to protect against man in the middle attack.
if we want to do that, will do something on the app layer.

take 4g of code, run it through sha3.
sha3 -> 1024 bytes.
published on another website the 1024 bytes.
check if 1024 bytes are the same.

then you can sign the sha3 hash.


public and private key encryption. encrypt something with private key, and decrypt with public key.
generate keys in pairs.
created public key and private key.
never tell private key.
messages encrypted with public key can be decrypted with private key.
anybody can send message to microsfot that only MSTF can open.
MSTF can send encrypted messages to anyone who has the public key.

instead of Selective repeat, can have selective acknowledge.
acknowlege each packet individually.

when get 3 duplicate acks, then things are getting through, but one thing was dropped.
so go to fast mode and do a fast transmit.

for dropped acks, can wait for timeout, and get an ack greater than the one you are looking for.

tcp vegas = all 3
tcp reno = only slow start and congestion avoidance.
what algo you have depends on the OS, so what algo you have depends on what OS version you have.

additive increase
multiplitive decrease

slow start
send one MSS. one packet.
if get an ack, then send 2 packets.
if 3 duplicate acks -> fast recovery
if get a timeout -> restart slow start to beginning.

ssthresh = slow start threshold = number of packets on the wire.
computed during the tcp handshake.
if at ssthresh -> congestion avoidance

congestion avoidance
if we get 4 acks back we increase packets by 1. now every ack we get back increases MTU by 1/5.
if we get 5 acks back, we increase packets by 1
timeout -> slow start
3 duplicate acks -> fast recovery

fast recovery
ack 1
ack 1
ack 1
increase number of packets sending out by 1.
so many duplicate acks means they are getting our acks.
going to fast recovery means we lower our ssthresh
fast retransmit.
if we get a new ack, like ack 5.
then we go to congestion avoidance.
new ack -> congestion avoidance.
timeout -> slow start ending out 1 packet.


tcp checksum
1's compliment: 2's compliment but carry goes around the horn.

1's compliment
00001
11110
2's compliment
00001
11111


tcp check sum
1011001001001010
1000110111110111+
0100000010000010
+next data
+next data
and finally invert
10111111110111101
+checksum
=1111111111111111=0

so we invert it so when we add it to the checksum, we know it is 0.

if we get a corrupted, then we send a duplicate ack asking for a retransmission.


2d parity check detects corruption and fixes it.

1101 0100 1000 1111

1101 | 1 (odd number)
0100 | 1
1000 | 1
1111 | 0 (event number)
________
1110

send
1101 0100 1000 1111   1110 1110

        x (corrupted)
1101 0100 1000 1111
1101 0101 1000 1111


1101 | 1 (odd number)
0101 | 0
1000 | 1
1111 | 0 (event number)
________
1111

 1110 1110
 1111 1010

so we see that 2nd row, 4rd column is broken. flip that bit.

crc=cyclical redunacy check. based on hamming code.

ethernet checksum is more advance, since better to catch corruption sooner (on the link), checksum is done in hardware


*/