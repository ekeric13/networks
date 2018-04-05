/*
https://softwareengineering.stackexchange.com/questions/171734/difference-between-a-socket-and-a-port
socket = ip address + port
a server listens on port 80 for incoming connections.
when it sees one it opens a new socket for that connection.
so it would open that connection with the client on a new socket. but still on the same port. 



dig www.linkedin.com
gives us the ip address

request header
origin (if a client set by browser, if a server can be spoofed?)
reseponse header
Access-Control-Allow-Origin header (cors) - says what domains can access the site


when scraping a site
the server is making requests but the client (or web server?) is now giving response (Access-Control-Allow-Origin comes into play)??

ifconfig

en1 = wifi (wireless)
inet is internal ip address


http request
method | url | http version \r\n
header field name | value \r\n
header field name | value \r\n
\r\n
body

if-modified-since header tells server to only give document if it has been modified since that time.
if it has been modified, responds with 200 ok and the document.
if not modified responds with a 304, telling the browser to use the cache of the page.

http response
http version | status code | phrase \r\n
header field name | value \r\n
header field name | value \r\n
\r\n
body

telnet sing.stanford.edu 80
GET /fullduplex/index.html HTTP/1.0

http1.0 is all in ascii text. human readable
request:
get / http/1.1
response:
http/1.1 200 ok


HTTP 1.0
-open connection
-issue get
-server closes connection after response

HTTP 1.1
-adds more http request headers
-keep-alive request header: tells server keep this connection open (no longer needs to make
hand shake for additional documents, like images)
-keep-alive/close response header: tells client if it will keep connection open

latency: 50ms
request size: 1 segment
response size: 2 segments
segment packetization delay: 10ms
max connections: 2, teardown instant.

single page
syn: 50ms
syn, ack: 50ms
ack + request: 60ms  (50ms + 10ms for packet)
server response. ack + response: 70ms (50ms + 20ms for both packets)
so 230ms

load 2 images from that page
syn: 50ms
syn, ack: 50ms
at 100ms (2/3rds of handshake)
110ms send ack for image1
120ms send ack for image2
server gets request for page at 160ms
at 170ms - server gets request for image. server sends response1 for image1.
at 180ms - server sends response2 for image1
190ms - server sends response1 for image2
200ms - server sends response2 for image2

220ms response1 for image1 arrives
230ms response2 for image1 arrives
240ms response1 for image2 arrives
250ms response2 for image2 arrives

so single page + load 2 images from that page
230ms + 250ms = 480ms


latency: 20ms
request: 1 segment
response: 2 segments
segmentation delay: 5ms
max connections: 2

single page
syn 20ms
syn, ack: 20ms
ack + request: 20ms + 5ms = 25ms
response: 20ms + 5ms + 5ms = 30ms
95ms total

page that load 1 image

syn + syn,ack = 40ms
ack + request = 25ms
response: 30ms
95ms for image
so total is 190ms

page that loads 5 images

syn + syn,ack = 40ms
45ms for image 1
50ms for image 2
65ms image 1 arriaves.
70ms image 2 arrives. segment image1 part1 
75ms segment image1 part2
80ms segment image2 part1
85ms segment image2 part2
95ms image1 part1 arraives. syn
105ms image2 part2 arrives syn


95ms for image 1, 95ms for image 3, 95ms for image 5
105ms for image 2, 105ms for image 4, 105ms for image 6

latency: 20ms
request size: 1 segment
response size: 2 segments
segment packetization delay: 1ms
max connections: 2, teardown instant.


http1.0
setup (syn + syn,ack) = 100ms
ack and server response = 103ms
11 images
(6 * (100 + 103)) + 203 = 1421

http1.1
setup (syn + syn,ack) = 100ms
page request/response: 103ms
11 images
1ms segementization telling server we want 11 images
1ms + 50ms to get to server
22ms segmentization, have to send 2 parts of 11 images
22 + 50ms to get back to client
51 + 72 = 123ms
100+103+123 = 326ms



url has two parts.
hostname of the server that holds the objects, and the pathname that locates the object on the server.
http://www.someschool.edu/someDepartment/picture.gif
host: http://www.someschool.edu
path: /someDepartment/picture.gif

browser and server processes access tcp through their socket interface.
tcp is reliable, each http request message sent from client will eventually reach server.

http server contains no information about clients, so it is stateless.
if the same client keeps asking for object, server resends object.
web server is on a fixed IP address.

each request and response pair made on separate tcp connection: non-persistent connection
each request and response pair made on same tcp connection: persistent connection

non-persistent connection need to do the handshake each time.
generally we can have 5-10 parllel tcp connections though.

round-trip time (RTT) - time it takes for packet to go from client to server to back to client.
RTT inclues packet propogation delays, packet queueing delays, and packet processing delays.

GET /somedir/page.html HTTP/1.1
Host: www.someschool.edu
request header includes the name of the host it is requesting from.
url field: /somedir/page.html
method field: get, post, put, patch, delete, head
host + url field is full path. www.someschool.edu/somedir/page.html

host feels a bit unnecessary since we already know where we are sending this to. ip address + port

telnet cis.poly.edu 80
opens tcp connection on port 80 to host cis.poly.edu


http servers are stateless, but want to identify users at times, so they use cookies.


Q: HTTP 1.0 and 1.1 are called “text based protocols”, HTTP 2 is a “binary protocol”, what is the difference?
http - the order client requests resources is the same order that the server responds
http1.1 - allows for pipelining (on one tcp connection client can make multiple requests without waiting for each response)
http2 - be able to avoid sending the same header again and again, such as the browser type
http2 is
-binary instead of textual
-fully multiplxed, instead of blocking (request more than 1 asset per connection, so like pipelining, plus receive data in any order)
-use one connection for parallelism
-use header compression to reduce overhead (headers are plain text. cookies make headers really big)
-allow servers to proactively push (usually server needs to wait for client to parse html documen,t instead
server can guess what the client might want and send the client resources before the client 
finishes parsing the root document. sends resources to the browser (client cache), not to application code)
-one tcp connection (modern sites using http open 30 connections) tcp handshakes are expensive. cpu is maintaining less sockets
-can send headers and body(data) independently

websocket is
-full duplex (the client and server can send data at the same time. server doesn't have to wait until request received )
-one connection

http2 better not to concatenate js
requesting a lot of resources is no longer a big deal. small requests aren't bad.
concatenation leads to bad cacheing, and have to wait for all the js to come over the wire, 
instead of just most essential parts


Q: HTTP specifies that the TCP transport protocol be used for HTTP data. Does that mean it is not possible to 
send HTTP data over UDP?  What is an example of an HTTP header that requires TCP to work?
udp is unreliable. connecting to a random client isn't something we can rely on.
Being able to have a persistent connection greatly speeds up the process.
only tcp allows for persistent connection.

Q: What are cookies, and how are they typically used by web applications?
Cookies are ways to identify users.
They are part of the http header fields.
client: http request container user information -> server.
server creates a user.
server: response with "set-cookie: userId` -> client
client stores cookie information. host: cookie
client: http requesting asking for upvotes. has field "cookie: userId" -> server

Q: How are cookies transmitted? What is their format?
Cookies are sent as http headers. They are ascii based.

Q: In loading a single web page, how many cookies might be sent?
1. userId
2. expires
3. max-age
so at least 3 cookies

Q: Why might the designers of HTTP specified a particular transport protocol? (and why pick TCP?)
Http wants to choose a stateful protocol to make sure it arrives correctly, has http does not want to 
worry about state.
specifically chose tcp since it knows it is stateful.



*/