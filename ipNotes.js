/*
127.0.0.1 = localhost
"127.0.0.1 on the Local Address column, it means that port is ONLY listening for 
connections from your PC itself, not from the Internet or network."
0.0.0.0 = wildcard (*) that depends on the
bind address on local machine that other hosts connect to. the program is willing to accept connections coming from any interface
"0.0.0.0 on the Local Address column, it means that port is listening on all 'network interfaces'"


domain name = google.com
hostname = www.google.com
domain name = wikipedia.com
hostname = www.en.wikipedia.com
hostname is the name for a specific machine within a domain.

hostname.domain.com
hostname is the name given to the end-point 
domain is the name given to the 'network'

en0 = wifi


Everything in Unix is a file or a process. In Unix a file is just a destination for or a source of a stream of data. Thus a printer, for example, is a file and so is the screen.

A process is a program that is currently running.
"Everything is a file descriptor"
sockets:  a way to speak to other programs using standard Unix file descriptors.

|network prefix| hostnumber |
|network prefix | subnet number | hostnumber |
"subnet mask or netmask, which is the bitmask that when applied by a bitwise AND operation to any 
IP address in the network, yields the routing prefix"

wireshark seems to want my external ip address


dig -x 2607:f8b0:4005:809::200e CNAME
to find canonical hostname

tcp contains facebook
or look at 
packetbytes string facebook
*/