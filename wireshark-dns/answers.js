/*
1. dig baidu.com
111.13.101.208

2. dig ox.ac.uk NS
ox.ac.uk.   86400 IN  NS  dns0.ox.ac.uk.
ox.ac.uk.   86400 IN  NS  dns1.ox.ac.uk.
ox.ac.uk.   86400 IN  NS  dns2.ox.ac.uk.
ox.ac.uk.   86400 IN  NS  ns2.ja.net.

3. dig mail.yahoo.com dns1.ox.ac.uk
fd-geoycpi-uno.gycpi.b.yahoodns.net. 177 IN A 69.147.88.7

4. dns is sent over udp.

5. for dns query desintation port: 53
for dns response source port: 53

6. dns query ip destination: 2001:558:feed::1
cat /etc/resolv.conf 
domain hsd1.ca.comcast.net.
nameserver 2001:558:feed::1
nameserver 2001:558:feed::2
nameserver 75.75.75.75
nameserver 75.75.76.76

gives us-> nameserver 2001:558:feed::1

so destination is the same as our local dns server

7. in dns query, under queries we can see it is type A
query message has no "answers"

8. in dns response, 3 anwers
first is CNAME (have cannonical hostname), the other two are type A (have ip addresses)
A records also have ttl, class, data length.

9. first syn sent to destination ip address: 2400:cb00:2048:1::6814:55
I have two dns query, and two responses. one for ipv4, one for ipv6
destination ip address corresponds to response of ipv6, the first A record has an ip address of 2400:cb00:2048:1::6814:55
the 2nd A record has an ip address of 2400:cb00:2048:1::6814:155. so not used.

10. dns not issued again when getting images.



11. destination port for query, src port for response: 53

12. ip address sent to: 2001:558:feed::1
local dns server is: nameserver 2001:558:feed::1
so it is the same

13. dns query is of type A. no answers

14. 3 answers given in DNS response. 2 CNAME, 1 A
contains: name, type, class, ttl, data length, 
ip address for type A
CNAME for type CNAME



dig mit.edu NS

16. dns query sent to ip: 2001:558:feed::1
local dns server: 2001:558:feed::1

17. dns query is type NS. no answers.

18. dns responses has these servers in the answer:
mit.edu.    1800  IN  NS  ns1-173.akam.net.
mit.edu.    1800  IN  NS  asia1.akam.net.
mit.edu.    1800  IN  NS  eur5.akam.net.
mit.edu.    1800  IN  NS  use2.akam.net.
mit.edu.    1800  IN  NS  ns1-37.akam.net.
mit.edu.    1800  IN  NS  use5.akam.net.
mit.edu.    1800  IN  NS  asia2.akam.net.
mit.edu.    1800  IN  NS  usw2.akam.net.

also has the corresponding ip addresses of these servers in additional section:
use2.akam.net.    31262 IN  A 96.7.49.64
ns1-37.akam.net.  89299 IN  A 193.108.91.37
use5.akam.net.    72312 IN  A 2.16.40.64
use5.akam.net.    18131 IN  AAAA  2600:1403:a::40
asia2.akam.net.   24611 IN  A 95.101.36.64
usw2.akam.net.    72493 IN  A 184.26.161.64
ns1-173.akam.net. 88121 IN  A 193.108.91.173
asia1.akam.net.   62185 IN  A 95.100.175.64
eur5.akam.net.    66153 IN  A 23.74.25.64



dig www.aiit.or.kr bitsy.mit.edu

20.  dns query sent to ip address: 2001:558:feed::1
local dns server: nameserver 2001:558:feed::1

21. type A query. no answers.

22. 1 answer in each of the responses. type A response.

*/