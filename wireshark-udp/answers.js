/*
1. how many fields there are in the UDP header?
4
source port
desintation port
length
checksum

2. determine the length (in bytes) of each of the UDP header fields
request length is 43 bytes
response length is 59 bytes

3. The value in the Length field is the length of what? 
the number of bytes in the UDP segment (header plus data)
header is 8 bytes. 
request payload is 35 bytes.
so 8 + 35 = 43 bytes

4. What is the maximum number of bytes that can be included in a UDP payload?
2 bytes allocated for length
length is 16 bits long.
so 2^16 -1 = 65,535 bytes
maxDataSize - udpHeader = max bytes
65,535 - 8 = 65,527 bytes


5. What is the largest possible source port number? 
2 bytes allocated for source port.
length is 16 bites
2^16 -1 = 65,535 bytes

6. What is the protocol number for UDP?
within the ip header it specifics the transport layer is udp.
hex 0x11 = decimal 17

7. describe the relationship between the port numbers in the two packets, one being a udp request and the other being the udp response.
in the udp request, the source port is the same as the destination port in the udp response.
in the udp request, the destination port is the same as the source port in the udp response.
*/