/*
1. Open this capture file in Wireshark.
filter using dns.
2. Draw a diagram representing each request/response -- what servers were queried?
127.0.0.53:53 (internal resolver) points to f.root-servers.net
127.0.0.1:36649 (loopback address)
response IP address is 192.5.5.241 for tld

client router is 192.168.1.62:52246 (private address space. can also be 10.x.x. external ip address for 127.0.0.1)
dns server (tld server of google.com) is 192.5.6.30:53
response is ip address for authoirative

client router is 192.168.1.62:52246
dns server (google.com) is 216.239.34.10:53
response is ip address for google.com

3. Describe in English what question and answer was for each request and response.
  * What is the difference between a DNS "answer" and the Authority & Additional Information sections?
  A: answer is the answer to the query. Authority & Additional information are relevant information to get you the answer.
  * The first response contains an "answer" what does the answer tell us?
  A: it tells us the IP address of the root dns server, f.root-servers.net
  * The second response does not contain an "answer" what information DOES it provide and how is it useful?
  A: it contains names of servers and their ip addresses that we can find the ip address of google.com
4. Recreate a similar capture file using wireshark and `dig`, but pick a new URL besides google.com




*/