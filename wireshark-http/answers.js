/*
1. client runing version http1.1
1. server running http 1.1
2. what data languages the client can accept. we know server's choice by the "content-type" field
2. would prefer to accept english, this is a preference. server can override
3?? What is the IP address of your computer? Of the gaia.cs.umass.edu server?
3. forwarded displays information about client's ip address
3. domain name of server we are requesting. can find ip address through host. 128.119.245.12
3. ip address of computer and host located in IP headers, not in http headers. (source: 192.168.0.14, destination: 128.119.245.12)
4. status code is 200 OK
5. text/html that client is receiving was last modified right before downloading. 
seven hour offset between PST and GMT. so 6-7=11am. (when this was downloaded.)
6. returning 128 bytes
7??By inspecting the raw data in the packet content window, do you see any headers within the data that are not displayed in the packet-listing window?


8. no IF-MODIFIED-SINCE header
9. server explicitly returned response since there is a body and got 200 ok
10. have "if-modified-since" header. so request is conditional. has a date
if have been modified since date given, give a 200 ok and a body
if not modified since the date given, get a 304 and no body.
11. 304 not modified on cached response, no body for this type of response


12. browser sent 1 http get request. first packet has the get request
13. packet 2 has the response to the GET request.
14. status code and response is 200 OK
15. 5 segments in total for the http response. 1 for header, 4 for body.

16. 4 http get requests. 
1 for html - /wireshark-labs/HTTP-wireshark-file4.html, gaia.cs.umass.edu, 128.119.245.12
1 for image1 - /pearson.png, gaia.cs.umass.edu, 128.119.245.12
1 for image2 attempt1 - /~kurose/cover_5th_ed.jpg, manic.cs.umass.edu (alias for caite.cs.umass.edu), 128.119.240.90
1 for image2 attemp2 - /~kurose/cover_5th_ed.jpg, caite.cs.umass.edu, 128.119.240.90

attempt might be the wrong word. the request for image2 might hit a server that then goes to another server for the image.
http://manic.cs.umass.edu/~kurose/cover_5th_ed.jpg gives a 302 FOUND, which is a redirect.
gives another URL in the location field, browser makes a request to that url

17. images may have been downloaded in parallel.
http request for image 2 has a seq # of 1. ack # of 1.
http response for image 2 has seq # 1, ack of 418.
rest of http responses for image 2 have seq # > 1, and ack of 418.

this is a sign of another tcp connection. so while image 1 was downloading, opened a connection
for image 2.
due to the fact that 2nd image is on another server, we are almost defintily going to open a second connection.

wireshark. right click on http get. select folow->tcp stream
see everything about that tcp connection



18. 401 unauthorized
19. an authorization field is sent the second time
Authorization: Basic d2lyZXNoYXJrLXN0dWRlbnRzOm5ldHdvcms=
value is the username and password encoded in base 64
u=d2lyZXNoYXJrLXN0dWRlbnRz
p=Om5ldHdvcms=

`
https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#timing
Queueing-> The browser queues requests when:
There are higher priority requests.
There are already six TCP connections open for this origin, which is the limit. Applies to HTTP/1.0 and HTTP/1.1 only.
The browser is briefly allocating space in the disk cache
Stalled-> The request could be stalled for any of the reasons described in Queueing.
DNS Lookup-> The browser is resolving the request's IP address.
Proxy negotiation-> The browser is negotiating the request with a proxy server.
Request sent-> The request is being sent.
ServiceWorker Preparation-> The browser is starting up the service worker.
Request to ServiceWorker-> The request is being sent to the service worker.
Waiting (TTFB)-> The browser is waiting for the first byte of a response. TTFB stands for Time To First Byte. This timing includes 1 round trip of latency and the time the server took to prepare the response.
Content Download-> The browser is receiving the response.
Receiving Push-> The browser is receiving data for this response via HTTP/2 Server Push.
Reading Push-> The browser is reading the local data previously received.
`

to get more resoueces in parallel for http 1.1, use domain sharding to have multiple subdomains.
in http2, we can request many resources on 1 tcp connection, so no need.
only 6 concurrent downloads per domain.
YouTube splits images and script resources across two domains: i.ytimg.com and s.ytimg.com.
so when referencing an image. instead of src="/whatever.png"
do src="s1.site.com" and src="s2.site.com" with s1 and s2 being different subdomains.

*/