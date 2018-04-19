/*
forwarding and routing functions of the network layer. 

Forwarding involves the transfer of a packet from incoming link to an outgoing link within a single router
Routing involves all of a network’s routers, and determines the paths a packet takes


datagram networks are connectionless
virtual-circuit networks are connection oriented, and have a host to host handshake, as well as router to router handshakes.

in datagram network, an end system puts the ip headers on a packet, and then pops it into the network.
goes through a series of routers, with each router using the destination address and its forwarding table to determine
what router the packet goes to next.
forwarding table  maps destination addresses to link interfaces

router matches a prefix of the packet’s destination address with the entries in the forwarding table.
last entry in table is if no prefixes were matched.
if there are multiple prefix matches, go with the longest prefix matched.

since for a computer network, there are complicated end systems, internet chose a datagram network.
since internet has no service guarantees, it is easier to interconnect it with different link layer technology.

forwarding and switching are interchangeable terms, means transfering packet from one link to another via router.

input port is where the packets come in to.  the lookup function (prefix matching) is performed in the input port.
control packets are sent to the routing processor. checksum also occurs in input port.
switching fabric connects the router’s input ports to its output ports
An output port stores packets received from the switching fabric and transmits these packets on the outgoing link
routing processor executes the routing protocols by maintaining routing tables, and computing the forwarding table for the router.

input port, outport, and fabric switching are all hardware and are called the router forwarding plane.
for input ports, in firewalls, if a packet doesn't match specific criteria it is not forwarded.
also in NATs, the port number is rewritten before forwarding

queues grow large, the router’s memory can eventually be exhausted and packet loss will occur

IPv4 datagram:
-version number | 4 bits | specify ip version
-header length | 4 bites | the length of the ip header. in length of 32 bit words.
-type of service (TOS) | 1 byte | type of ip datagram (used for real time communication or non real time traffic)
-datagram length | 2 bytes | length of header + data within ip datagram. theoretically can be 65,535 bytes, generally datagrams are 1,500 bytes.
-identifer | 2 bytes
-flags | 3 bits
-fragmentation | 13 bites
-ttl | 1 byte | decrement this nunber for each router hit
-protocol | 1 byte | transport layer protocol (tcp or udp)
-checksum | 2 bytes | aids a router in detecting bit errors (if error found discard datagram)
-source IP address | 4 bytes
-destination IP address | 4 bytes
-options | variable length 

receive an IP packet from one link that has a larger MTU than the outgoing link.
IP datagram is now too big. solution is too fragment the datagram.
Fragments need to be reassembled before they reach the transport layer 
TCP and UDP are expecting to receive complete, unfragmented segments from the network layer
datagram reassembly in the end systems 
identification, flag, and fragmentation offset fields help with reassembly.
the last fragment has a flag bit set to 0. need to know if we got the last fragment.

IPv6, does away with fragmentation altogether

The boundary between the host and the physical link is called an interface
an IP address is technically associated with an interface, rather than a host or router.

223.1.1.0/24, where the /24 notation, sometimes known as a subnet mask
The subnet 223.1.1.0/24 thus consists of the three host interfaces (223.1.1.1, 223.1.1.2, and 223.1.1.3) and one router interface (223.1.1.4)
other subnets might be 223.1.2.0/24 and 223.1.3.0/24.

The Internet’s address assignment strategy is known as Classless Interdomain Routing  (CIDR)

ISP’s block 200.23.16.0/20 11001000 00010111 00010000 00000000
Organization 0 200.23.16.0/23 11001000 00010111 00010000 00000000
Organization 1 200.23.18.0/23 11001000 00010111 00010010 00000000
Organization 7 200.23.30.0/23 11001000 00010111 00011110 00000000

if there is 
192.168.0.x  netmask 255.255.255.0
192.168.0.y  netmask 255.255.255.0
than these IP addresses are on the same network. don't need to go to a router

if a & netmask == b & netmask
then a and b are in the same network.

ip addresses broken up into 3 classes: A B and C
Ip address in two parts: network and host
network specifies administrative domain like MIT, stanford, etc.
host specifies what device on that network
class A: 0 | 7 bits of network | 24 bits of host. (128 networks, 16 million computers)
class B: 10 | 14 bits network | 16 bits host. (65,536 computers)
class C: 110 | 21 bits network | 8 bits host (256 computers)

got rid of 3 classes. use CIDR instead today.
171.64.0.0/16 means any address from 171.64.0.0 to 171.64.255.255
/24 describes 256 addresses
/20 describes 4096 addresses

Dynamic Host Configuration Protocol (DHCP) allows a host to obtain (be allocated) an IP address automatically
when connect to network get ip address from DHCP server.
client -> server
src ip: 0.0.0.0.:68
dest ip: 255.255.255.255:67 
udp 

ICMP is used by hosts and routers to communicate network-layer information to each other

IPv6 datagram (40 byte header):
-version | 4 bites
-traffic class | 1 byte | similar to TOS
-flow label | 2 bytes | identify flow of datagrams
-payload length | 2 bytes | size of payload. doesn't include header
-next header | 1 byte | identifies transport protocol (TCP or UDP)
-hop limit | 1 byte | decrement this nunber for each router hit
-source IP address | 16 bytes
-destination IP Address | 16 bytes

If an IPv6 datagram received by a router is too large to be forwarded over the outgoing link, 
the router simply drops the datagram and sends a “Packet Too Big” ICMP error message

use routing protocols (also called routing algorithms) to calculate routes. algos generally
calculate the minimum cost spanning tree.

Q: What is a routing table, and how do routers use them?
A: routing table includes both the router’s distance vector and the router’s forwarding table
fowarding table matches prefixes to links/other routers.

Q: Why was IPv6 needed? How do its responsibilities relate to those of Network Address Translation?
A: ran out of IP addresses. NAT's were a short-term solution. gave local subnets their own ip addreses.

Q: What is the difference between “intranet” routing and “internet” routing? How does this relate to 
“subnets” and “autonomous systems”, and how are IP addresses used in this context?
A: interet uses pbg to find other networks. intranet is routing within a subnet.
in subnet you have private ip address. use ARP to get private ip.
router =  “autonomous systems”
wifi access point = "subnet"
subnet is within an autonomous system
local home network is autonomous system. next autonomous system would be comcast, since that is what i connect to.
connect to another network through bgp router.

router does ip level stuff. router can think about where i should give packet to.
switch does link layer stuff. switch has one outbound link.
switch ties links together.

router

ip
___
ethernet


switch 
ethernet


route -n
netstat -nr (get routing table)

destination 
0.0.0.0 (default) -> if nothing matches, send it to x gateway
a range of gateways
tells us what gateway to use.

gateway
link to the next nearest node

10.1.10/24 is the same as netmask of 255.255.255.0
first 24 bits identify subnet. last 8 bit identify the host.

ip address         ethernet address (MAC)
10.1.10.1          16:98:7d:2a:f9:20 


netif expire
they are different nics (network interface cards) -> you can make interfaces. 
     destination | gateway. | netmask
ex: 127.0.0.2    | 127.0.0.1. | 255.255.255.0

lo (loopback, localhost is run on this)
en0 (wifi - changes based on machine )


wireshark (hard time getting computer to tell you what link connection you have)
wireless card talking to ethernet card.
ethernet card talks to wireless card.
looks like traffic is on ethernet but really could be anywhere.


Border Gateway Protocol (BGP)
1. Obtain subnet reachability information from neighboring ASs.
2. Propagate the reachability information to all routers internal to the AS.
3. Determine “good” routes to subnets based on the reachability information and on AS policy


MAC maps to IP address.
so if connected via wifi and ethernet, then you have 2 ip addresses.
outside computers like NAT only give you an ip address for a MAC if it is actually connected.


when connecting to router, before you even have IP address, you communicate using link layer information (MAC address).
router lets you connect to its network, gives you an ip address for the wifi MAC address.


ARP is used as part of DHCP.
ARP router know your MAC address. which helps you get an ip address.
ARP lets you translate MAC address to IP address.
DHCP gives you an ip address


within an autonoms circuit you have 3 subnets
10.0.1.x
10.0.2.x
10.0.3.x
each of these subnets can allow for 255 hosts.
netmask determines which subnet you are looking at.
when host on local network

google's autonoms circuit have subnets all over the world.


what is the network layer?
delivers host to host.


could have had:
-reliability
-security
-anonymous
-order

IP is dynamic, when a packet arrives, then you determine where you send it.

jitter tolerance
jitter is space between source and destination.

responsible for routing. how something gets from place A to B. IP doesn't offer very
many guarantees.


internet routing vs intranet routing.
different priorities. internet cares about policy and scale.
intranet makes more guarantees about how routers communicate to each other. so cares
more about performance.

how autonomus circuits communicate are governed by internet routing.
BGP sets the rules for how routing must be done between autonomous systems.
through BGP node keeps track of all outbound internets.
each gateway connecting two AS, there is an always open TCP connection.
internal BGP - when learn about a new router, update all the nodes within the AS about sending packets to the 
gateway router.
those nodes send external BGP to another AS, which then sends internal BGP messages to all the nodes in the AS
about to send packets with a specific ip address to the gateway node.


each router has a graph of all the nodes within the AS.
runs a shortest past algo to find the fastest way is to go from x->y->z
so it its forwarding table associated z ip address with w outbound link.
how often do you update the forwarding table? depends on system administrator.
open shortest path first (OSPF) - periodically ask these routers what is going on.
x pings y.
x now knows how fast y is.
x asks y to ping z. 
x now know how fast z is.
pings pretty fast, default for one algo is to update forwarding table every 30 seconds.
this is done through a separate queue and separate processor that is different from the rest of the normal 
packet queue.


can test how fast website latency is via ping from my computer?
lets say i have a lot of europeans using my site. want to know if i want to pay for cdn.
is there a way to ping a site from a different location? pay for a proxy server. ssh into server.
geo-lookup - ping site from around the world
see site that maps traceroute to gogole earth.


iBGP vs OSPF
iBGP - let each router know about all the accessbile internets from a border gateway node.
RIP and OSPF - update routing tables on where to send information in order to reach a border gateway

all these routing protocols boil down to how to fill out a forwarding table


to get AS number
dig stanford.edu
nc whois.cymru.com 43
{stanford ip address}
*/