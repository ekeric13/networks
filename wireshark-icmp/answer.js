/*
1. What is the IP address of your host? What is the IP address of the destination host?
Source ip address: 192.168.1.101
Destination ip address: 143.89.14.34

2. Why is it that an ICMP packet does not have source and destination port numbers?
ICMP was designed to be read by the network layer. no need for port since application won't 
be reading it.

3. What are the ICMP type and code numbers? 
What other fields does this ICMP packet have? 
How many bytes are the checksum, sequence number and identifier fields?
type = 08 (ping - echo request)
code = 00 
header also has checksum, indentifier, and sequence number fields.
checksum is 2 bytes
identifier is 2 bytes
sequence number is 2 bytes

4. What are the ICMP type and code numbers?
What other fields does this ICMP packet have?
How many bytes are the checksum, sequence number and identifier fields?
type = 00 (ping - echo reply)
code = 00 
everything else is the same as request ping.

5. What is the IP address of your host? What is the IP address of the target destination host?
Source ip address: 192.168.1.101
Destination ip address: 138.96.146.2

6. If ICMP sent UDP packets instead (as in Unix/Linux), would the IP protocol number still be 01 for 
the probe packets? If not, what would it be?
no. the ip protocol number would be 17 (0x11) for udp

7. Examine the ICMP echo packet in your screenshot. Is this different from the
ICMP ping query packets in the first half of this lab?
icmp packet the same

8. Examine the ICMP error packet in your screenshot. 
It has more fields than the ICMP echo packet. What is included in those fields?
when there is an error, the header has type, code, and checksum.
but instead of the other fields has the ip header and icmp header for the datagram that was the failed request.

9. Examine the last three ICMP packets received by the source host. 
How are these packets different from the ICMP error packets? Why are they different?
the last 3 packets are type 0 (echo reply), rather than type 11 (time exceeded, ttl expired).
they are different since they arrived at their destination host before the ttl expired.

10. Within the tracert measurements, is there a link whose delay is significantly longer than others?
On the basis of the router names, can you guess the location of the two routers on the end of this link?
the link 9 and 10 is much longer.
this is probably the transatlantic link.

*/