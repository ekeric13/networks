/*
DNS servers are often UNIX machines running the Berkeley Internet Name
Domain (BIND) software. The DNS protocol runs over UDP and uses port 53.

DNS is a wonderful example of how a distributed database can be implemented in the Internet

a single DNS would lead to
-single point of failure
-too much traffic volume
-latency issues for locations not near dns server
-downtime issues for maintenance.

3 types of dns servers
-root server
-top level domain server (TLD)
-authoritative servers

want ip address for hostname: www.amazon.com
go to root server to find out location of TLD server (.com)
go to TLD server to find out location of authoritative server (amazon)
go to authoritative server which returns IP address for hostname (www.amazon.com)

authoritative servers can have authoritative servers themselves... subdomains.
root(.) -> .edu -> stanford -> www.
                   |
                   cs.

13 root server locations, 200+ root servers total

tld servers responsible for .com, .org. edu. .jp, .uk

local DNS server that ISP has. also called resolver
for residential ISP, usually it is on the same LAN (local area network) or a few hosts away.
when  a host makes a DNS query, query sent to the local DNS server, which acts a proxy, 
forwarding the query into the DNS server hierarchy

computer -> local dns (www.google.com)
local dns -> root dns (where is .com?)
root dns -> local dns (list of .com tld servers)
local dns -> tld dns (where google?)
tld dns -> local dns (list of all google authoritative servers, or just the one server if a smaller site)
local dns -> authoritative dns (what is ip address for www?)
authoritative dns -> local dns (ip address of google.com)
local dns -> computer (ip address of google.com)

type A
host, ip, type
(relay1.bar.foo.com, 145.37.93.126, A)

type NS
domain, hostname of an authoritative DNS server, type
(foo.com, dns.foo.com, NS)

type CNAME
alias hostname, canonical hostname, type
(foo.com, relay1.bar.foo.com, CNAME)

type MX
mail server alias hostname, mail server canonical hostname, type
(foo.com, mail.bar.foo.com, MX)

by using the MX record, a company can have the same aliased name for its mail server and for one of its other servers 


authoritative servers for a hostname have type A records.
non-authoritative servers for a hostname have type NS records for the domain that includes the hostname,
and type A records for the value in the corresponding NS record.

ex:
looking for host gaia.cs.umass.edu
tld server for .edu
get (umass.edu, dns.umass.edu, NS)
and get (dns.umass.edu, 128.119.40.111, A).

application protocol and tcp port
|
http://cs.144.scs.standford.edu/labs/sc.html
        |                       |
        host                    file


DNS db focus:
read mostly (infrequent writes)
loose consistently (can be slightly out of date)

recursive query asks the dns query it contacts to do everything, little use of local dns server.

dns info represented as Resource Records (RR)

name [TTL] [class] type rdata

name = stanford.edu
ttl = 500 seconds
class = IN 1 (address class for internt)
type = A, NS, etc.
rdata = depends on type

type A is for an ipv4 address
type NS is for a name server

DNS structure

header (what's in the message)
question (what's the question for: query or response)
answer (empty in queries)
authorities
additional

dig www.stanford.edu

www.stanford.edu. 1020  IN  CNAME stanfordhs17.wpengine.com.
CNAME is canonical name


DNS header

ID (pair query and response)
QR flag (quer or response) | op code | authoritative answer flag | recursion flag | error flag 
qcount (how many resource records are there in the query section)
answerCount
authorityCount
additionalCount

DNS Question

name (depends on the type. DNS name) 
type (A or NS or etc) 
class (IN for internet) 
ttl 
RDlength (length of record data) 
RDdata (record data) 

DNS name compression
www.stanford.edu
3www
8stanford
3edu
length(in binary)Text(in ascii)
3www = 0x0377 0x7777
3 bytes of 77


DNS A answer

name (depends on the type. DNS name) ex: market.scs.stanford.edu
type (A or NS or etc) ex: 1
class (IN for internet) ex: 1 
ttl ex: 3600
RDlength (length of record data) ex: 4
RDdata (record data) ex: 0xab 0x42 0x03 0x0a (171.66.3.10)

local name server has root cache file, which has locations of root servers.

dig name @server type
name = host to look for
@server is a specific server if you want to test out different locations
type is what type of record (NS / A / etc)

dig stanford.edu
dig ns stanford.edu
dig +norec www.scs.stanford.edu @a.root-servers.net
dig +norec www.scs.stanford.edu @a.edu-servers.net
dig +norec www.scs.stanford.edu @argus.stanford.edu
dig +norec www.scs.stanford.edu @ns1.fs.net

dig www.stanford.edu returns CNAME. that is the real hostname
stanford is an alias hostname.

name [ttl] [class] CNAME

CNAME tells canonical name


Q: What is the DNS hierarchy and why was a hierarchical model chosen for DNS?
dns hiearchy is distributed. dns super frequently used and widespread. didn't want single point of failure 
and wanted little latency

Q: What are the differences between a local, root, top level domain, and authoritative servers?
local is kind of like a controller for the dns request.
root server tells you where to find tld servers
tld servers tell you where to find authoritattive servers
authoritative servers tell you the ip address of the hostname

Q: If you query a root DNS server for an A record for “www.google.com”, 
what will it send you in return? (use nslookup or dig to check your answer)
get 
(google.com, .com,NS)
(.com,ip,A)

dig google.com @a.root-servers.net
com.      172800  IN  NS  e.gtld-servers.net.

dig a.root-servers.net
a.root-servers.net. 513156  IN  A 198.41.0.4

dig a.root-servers.net
get ip address
dig @198.41.0.4 google.com
get NS records of the tld servers. and their corresponding ip address

dig @192.5.6.30 google.com

Q: What is the difference between an SMTP server and a POP/IMAP client? how are they related?
SMTP is pushed based. POP/IMAP is pop based. so the receiving client can pull from their corresponding 
mail server when they want to look at their email.


recursive vs iterartive requests

browser -> A record -> local dns resolver (when i have the answer i will give you A record) -> root

browser -> local dns resolver
is a recursive query. finish everything and then return it.
local dns -> root
is an iterative query. do it and then return.


recursive query pops back after it gets the answer to the query.

DNS

question
answer
authoritative
additional

if get exact question we are asking answered, then asnwered section filled out.
otherwise additional and auothitative.

browser -> tld (for google.com)
authoritative section with NS records of authoratitive google servers
additional section with A records for the corresponding NS records.


differences between HTTP, DNS, SMTTP

all depend on a transport protocol

smtp and HTTP are tcp

dns is udp.

dns is compressed. if url too long, instead of url in bytes, has a byte that says url is compressed, and a byte that is an offset to where full url is
http2 is compressed
http can be compressed

http and smtp depend on dns.

dns needs to know 1 ip address (a local dns server, or a root dns server)

http1.x and smtp is text based

smtp and http2 is pushed based.
http and dns is pull based



when write in email using eric@gmail.com, send it to kennedy@yahoo.com
what protocols are used? how many servers? 

client -> our mail server
client -> dns for our server (local -> root -> tld -> authoritatiev (now we have ip address for eric@gmail.com))

http

our mail server -> their mail server
4 more dns lookup.
smtp

their mail server -> their client
http

from client to their mail server.
3 protocols.
10 servers
2 mail server
4 part dns lookup 2 times.

if going from gmail to gmail, do we need to a dns lookup? maybe, but possibly not.


client -> dnslookup for gmail.com -> gmail.com (done over http)
gmail.com -> google smtp server (done over http or smtp)
google mail server -> dns lookup for yahoo.com -> yahoo smtp server (done over smtp)

yahoo server <- dns lookup for yahoo.com -> yahoo.com (over http)


TLS is encryption on transport layer
IPsec is encryption on network layer
network layer exposes IP address to everyone you make a request to.


DNS message
query, response

query format
header
question (Resource record)
answer (RR)
authority (RR)
additional (RR)

question - A record for host
answer - [] (empty, as dns doesn't know answer yet)

A/AAAA returns ip address
NS tells you where to go to find ip address. where the authority is. url of another dns server.
CNAME tells you the canonnical name. to find out if you have an alias. have example.com, want dev.example.com. cname record maps dev.example.com to example.com
MX is for mail.
TXT is arbitrary text. side case uses. prove if you have authority over a domain.
CAA certificate authority authorizataion. can see if certificates are legits. maps names of certificates authorities to ip addre
SOA - start of authority


why heirarchial?
separation of concerns.
gives us a framework to distribute records elsewhere.
makes it easier to administer servers.




*/