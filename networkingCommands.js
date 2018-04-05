/*
dig - looks up dns, tells you ip (more info than host)
host - looks up dns, tells you ip (better output than dig)
nslookup - query dns (kind of useless)
arp - query dns (kind of useless)

whois - lot of info about domain
ping - send a packet to a host telling you if it can be reached
traceroute - pings host but tells you how the packet got there.


ifconfig - info on computers networking parameters
ipconfig (windows - use ifconfig)
hostname - tells you the hostname for your computer

netstat - shows information on computer sockets
netstat -r - routing table
netstat -l - show listening sockets
netstat -a - show all sockets currently in use
lsof - show all open files (includes sockets)
nmap (linux - use netstat) - scans tcp ports of a server. can own computer via `nmap localhost`

nc - setup tcp ports and listen to them
telnet (linux - use nc in unix) - open socket to communicate with other hosts
openssl (linux) - like nc but with https
s_client - used with openssl
gnutls-cli (unix version of `openssl s_client`)

ssh - log into remote machine


python -m SimpleHTTPServer 8000
lsof -i:8000 (get pid)
lsof -Pan -p {pid} -i 

*/