/*
1. What is the IP address of your computer?
192.168.1.102

2. Within the IP packet header, what is the value in the upper layer protocol field?
01 = IMPC

3. How many bytes are in the IP header? How many bytes are in the payload of the IP datagram?
header length = 0101 = 5 32 bit words.
5 * 4 = 20 bytes
total length = 84 bytes.
so payload is 64 bytes.

4. Has this IP datagram been fragmented?
fragment flag is 0. so no fragmentation.

5. Which fields in the IP datagram always change from one datagram to the next within this series of ICMP messages sent by your computer?
ttl increments by 1 each datagram.
identification number also increases by 1 each datagram.
because these number change, the checksum also changes

6. Which fields stay constant? Which of the fields must stay constant? why must some change?
ip version stays the same
fragment related fields stay the same.
protocol specifying impc stay the same.
source and destination ip address stay the same.

traceroute increases ttl each request so that it gets a further and further router.
fields related to this change.
all the other fields stay the same. 

7. Describe the pattern you see in the values in the Identification field of the IP datagram
identification number also increases by 1 each datagram.

8. What is the value in the Identification field and the TTL field?
ttl is 246. identification is 0

9.  Do these values remain unchanged for all of the ICMP TTL-exceeded replies sent
to your computer by the nearest (first hop) router? Why?
they remain unchanged. since the ttl for all of them are the same, they all give up at the same time.
the identification number is 0, i am guessing that is standard for failed packets.

10.Has that message been fragmented across more than one IP datagram?
yes, it has been fragmented

11. What information in the IP header indicates that the datagram been fragmented? What information in the IP header 
indicates whether this is the first fragment versus a latter fragment? How long is this IP datagram?
ip datagram is 2008 bytes (1480 + 528).
you can tell it is fragmented since it has a fragment offset.
if there is a header, then this would be the first fragment. so it would start with the version 4 ip.

12. What information in the IP header indicates that this is not the first datagram fragment?
the last fragment has a flag bit set to 0.

13. What fields change in the IP header between the first and second fragment?
fragment offset. flag bit.

14. How many fragments were created from the original datagram?
3, frame 216, 217 and 218

15. What fields change in the IP header among the fragments?
the fragment offset changes. the flag bit changes.

*/