/*
What is the difference between the terms “internet” and “intranet”?
internet is public. intranet uses same internet technology but privately within a corporation.

Is the Internet one single network?
internet is made up of many networks that connect many many devices.
the devices it connects are known as end systems or hosts.

What is the difference between the “network edge” and the “network core”?
end system = host
called "host" since it "hosts"  application-level programs 
called "end system" since sits on the "edge" of the internet
hosts = clients and servers

network core involve packet switching devices(routers) that route a packet from client to server

What are the most important factors in determining the speed of network applications?
how many hops it needs to take
time per hop.
how far away something is (leads to more hops)
how good routing algorithm is (leads to most efficient hops)
how busy network is relative to network bandwith (leads to latency if network is focused on other packets)

what are types of delay?
nodal processing delay: time required to examine a packets header and determine where to direct packet
queuing delay: time it takes to be transmitted onto the link, depends on number of packets in queue
transmission delay: amount of time it takes to transmit all of packet's bits onto link. depends on transmission rate of link and packets length.
propagation delay: distance between two routers and progrogation speed of the link (fiber faster than copper wire)

Dnodal = Dprocess + Dqueue + Dtransmission + Dpropogation

Dproc often negligible, but does strongly influence router's maximum throughput.
Dtrans is negligible for transmission rates > 10MPS
Dprop negibile for a link connecting two routers on college campus, dominant factor for satellite link.

Dqueue depends on rate of arriving traffic (how many packets), transmission rate, and 
nature of traffic (arrive in bursts or steadily)

a = packets / sec (number of packets arriving)
R = bits / sec (transmission rate)
L = bits / packet (packet size)
traffic intensity = (L * a) / R
La/R > 1 is bad.

if queue is full, packet is dropped.

queueing delay meaures delay and packet dropped rate

without traffic congestion
Q = number of routers
Dend2end = Q*(Dprocess + Dtransmission + Dpropogation)

round trip time = end to end time = latency.
bandwith = throughput of link. bits/seconds.

netflix might focus on bandwith. latency on netflix might be 4 sec. but once it is going we want no buffer events.
so bandwith would be important.
netflix can see if their connection is slow, so buffer a lot out as it takes a while to receive new data.

phone call is good round trip and bandwith (don't want huge delay and don't want to miss words)

what wants low latency?
dns. chat. monitoring.

vpns make things slower, but browsing history private.

progogation delay - amount of time spent on the wire. if copper wire, 1/3rd Speed of light * distance
transmission delay - how fast you can put packets on the wire.
queueing delay - process packet, go into queue, wait while other packets get transmissed. limiting factor is the speed of the router cpu.
router needs to read the header to determine what the packet is trying to do. looks at routing table to see if there is a match for the ip address in the header.
sends it to the correct router. queue has to fit in RAM.
process delay is usually set to how fast transmission delay is.


application layer (session, presentation, application layers)
transport layer 
network layer
link layer
physical layer

what are critical pieces of hardware devices?
routers (network layer)
switches (link layer)
coax, copperwire, ethernet, radiowaves (copper wire is physical layer, writing to wire is link layer). ethernet knows about mac address, nothing about ip address.
modem (connect home network to isp network)
computer (os determines what processes get what info)

internet -> (ISP network) -> modem/router -> (LAN/WAN) -> switcher (tells which mac address that are connected to the modem/router) -> mac
difference between internal and external IP address is due to network translation
ifconfig is internal IP address - 10.0.1.24 (10 block is for only local network)
google ip address is external address - reserved per person.
when change wifi external ip address changes, as well as internal ip address
when hit modem we care about internal ip address.
localhost is an alias for 127.0.0.1 (is an ip address for servers on computer)

switch from "rebellious amish men" to "rebellious amish men 5g"
internal ip address might change.
external ip address will be the same since within the same wifi network (same modem/router)

how does software layering protocols play into different physical systems on the internet?
why layer?
easier to write code, easier to debug code. 
makes a client of better innovation, as a layer is reliable. only have to reinvent one part of the layer.
every http (application) needs to support all the below layers.
link layer only needs to support physical layer

i am going to make an http request, how does it packetize things.
http get which consist of ascii. headers know about the ascii data. info about host -> "Host: en.wikipedia.org:8080"
tcp breaks packets that are too big, and makes them into the tcp bodies, with tcp headers that include ip address and port.


POST JPEG data.
this happens after dns lookup.
happens before TCP handshake
                                                                                                                          do tcp handshake with server. -> send out packets at a certain rate to not flood routers.
                                                                                                                             ^
                                                                                                                             |
_______________ 
| http header | -> |tcp header | payload | -> |ip header | payload | -> | ethernet header | payload | ethernet footer | (still in ram on computer) -> goes along wire -> 
_______________
|data (100kb) | -> |tcp header | payload |
|_____________|
|data chunk   |
_______________

tcp layer on webserver, waits for all segmenents. when gets them all, puts them in the right order.

different tcp protocols chunk body differently. operating system is doing chunking.
tcp headers: source port, destination port, destination ip address
ethernet footer: contains checksum. ethernet is done in hardware.
number of different checksums you might use in different cases.
tcp checksum is 1s compliment addition rolling sum.
ethernet checksum is very complicated.
sha-256 is a checksum if you are more concerned about people maliciously corrupting your data.

compression is application level concern.
gzip http data.

tcp, ip, and ethernet don't compress information.

tls is a transport layer protocol.

tcp handshake.
1. i would like to open connection (round trip time, you can send me this much info)   = syn
2. server says you can open connection, you can send me this much info       = syn, ack
3. client sends info over to server   = ack. can piggyback payload data in this request.


any layer 2 device peels off layer 2 information, and replaces it with new layer 2 info.
so each hop, new layer 2 and layer 3 information.
layer 4 and 5 (tcp and http) aren't changed until reach the other host.

networking is big endian.
pcap is made by the computer, so it is in little endian though.
there is also a global pcap header. 24 bytes of info.
every single packet starts with a pcap header.

global pcap header. n packets.
each of the n packets have a pcap header.


000000001 00000000
little endian: 2^0 + 0
big endian : 2^8

header1: flip 4 bytes
header2: flip 3 bytes
____________________
| 32 bits | 24 bits |


*/