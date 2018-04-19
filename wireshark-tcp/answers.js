/*
1. What is the IP address and TCP port number used by the client computer ?
IP: 192.168.1.102
port: 1161

2. What is the IP address of gaia.cs.umass.edu?
On what port number is it sending and receiving TCP segments for this connection?
IP: 128.119.245.12
port: 80

3. What is the IP address and TCP port number used by your client computer (source) to transfer the file to gaia.cs.umass.edu?
IP: 192.168.0.14
port: 52664

4. What is the sequence number of the TCP SYN segment that is used to initiate the TCP connection between 
the client computer and gaia.cs.umass.edu? 
0 (relative sequence number)

What is it in the segment that identifies the segment as a SYN segment?
within flags section, the syn flag is set to 1.

5. What is the sequence number of the SYNACK segment sent by gaia.cs.umass.edu to the
client computer in reply to the SYN?
0 (relative sequence number)

What is the value of the Acknowledgement field in the SYNACK segment? 
ackNumber is 1 (relative)

How did gaia.cs.umass.edu determine that value?
since the sequence number of the syn was 0. we are add 1 to it, as that is the expected next byte.

What is it in the segment that identifies the segment as a SYNACK segment?
within flags, there is a 1 for syn. 1 for ack.

6. What is the sequence number of the TCP segment containing the HTTP POST command?
sequence number is 1. the syn-ack has a seq number of 0. so the response to syn-ack 
will have a sequence number of 1, as that is the next expected byte.

7. starting at the post segment, what are the sequence numbers of the first 6 tcp segmenents?
8. what is the length of each of the first 6 segments?

ERTT = 0.875 * EstimatedRTT + 0.125 * SampleRTT

client -> server  | server -> client
1. seq: 1, len: 565, time: .026 | ack: seq: 1, ack num: 566, time: .0539  | RTT: 0.02746 | ERTT: 0.02746
2. seq: 556, len: 1460, time: .042 | ack: seq: 1, ack num: 2026, time: .0772 | RTT: 0.035557 | ERTT: 0.0337 = 0.875 * 0.02746 + 0.125 * 0.03555
3. seq: 2026, len: 1460, time: .0540 | ack: seq: 1, ack num: 3486, time: .1240 | RTT: .07 | ERTT: 0.0337
4. seq: 3486, len: 1460, time: .0546 | ack: seq: 1, ack num: 4946, time: .1691 | RTT: .114 | ERTT: .0438
5. seq: 4946, len: 1460, time: .0774 | ack: seq: 1, ack num: 6406, time: .217 | RTT: .139 | ERTT: .0558
6. seq: 6406, len: 1460, time: .078 | ack: seq: 1, ack num: 7866, time: .2678 | RTT: .189 | ERTT: .0725


9. What is the minimum amount of available buffer space advertised at the received for the entire trace?
in othere words, what is the window size of the server?
5840 bytes (on the syn-ack). so it is never throttled.

10. Are there any retransmitted segments in the trace file?
no retransmitted segments.
know this since there would be repeating sequence numbers

11. How much data does the receiver typically acknowledge in an ACK?
1460 bytes. that is the MSS size, 1500, minus the tcp header size and ip header, 1500-(20+20) = 1460

12. What is the throughput (bytes transferred per unit time) for the TCP connection?
total byes transferred = 164090 = 164091 (seq number of last ack) - 1 (seq number of first post ack)
total tranmission time = 5.43  = 5.65 - .0267
average throughput = 30KB/sec = 164090 / 5.43


13.  identify where TCP’s slowstart phase begins and ends, and where congestion avoidance takes over?
slow start and congestion avoidance seem to happen continously.
slow start starts at .305, end at .309.
starts at .5767, ends at .5811


*/