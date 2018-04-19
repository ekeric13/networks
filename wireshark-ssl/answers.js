/*
https://www.cisco.com/c/en/us/support/docs/security-vpn/secure-socket-layer-ssl/116181-technote-product-00.html
http://www.technologydwell.com/2012/05/securesockets-layer-ssl-is-internet.html

1. For each of the first 8 Ethernet frames, specify the source of the frame (client or server), 
determine the number of SSL records that are included in the frame, 
and list the SSL record types that are included in the frame.
include a timing diagram between client and server

not sure about record type? maybe it is "record layer: [record type]"
not sure how to find number of ssl records? maybe it is number of different record types...


103-105 syn, syn-ack, ack
frame and ssl record type
client -> server
src: 128.238.38.162 | dst: 216.75.194.220
1. | 106 | client hello | time: 0 | 1 ssl record (pt.1 list of all the different ciphers, client nonce)
server -> client
src: 216.75.194.220 | dst: 128.238.38.162
2. | 108 | server hello | time: .0244 | 1 ssl record (pt. 2 the chosen cipher, server nonce)
3. | 109 | ?? (certificate?) | time: .0245 | 1 ssl record (pt. 2 certificate?)
4. | 111 | ?? (server hello done?) | time: .0478 | 1 ssl record 
client -> server
5. | 112 | client key exchange, change cipher spec, encrypted handshake message | time: .0704 | 3 ssl records  (pt. 3 encrypted PMS, pt. 4 encrypted handshak messages)
server -> client
6. | 113 | change cipher spec, encrpyed handshake message | time: .139 | 2 ssl records (pt. 5 encrypted handshake messages)
client -> server
7. | 114 | application data | time: .148 | 1 ssl record (data - probably http request)
8. | 122 | application data | time: 1.674 | 1 ssl record (data - response to http request, begins with headers.)

change cipher spec indicates it will start using the new session keys for hashing and encrypting message.

2. Each of the SSL records begins with the same three fields. list all 3 fields and their length
length, 2 bytes
content type / ssl record type, 1 byte
ssl version, 2 bytes

3. What is the value of the content type of the client hello record?
for the handshake message, handshake is type of 01.
not sure what content-type is??

4. Does the ClientHello record contain a nonce (also known as a “challenge”)? 
yes: 66 df 78 4c 04 8c d6 04 35 dc 44 89 89 46 99 09  

5. Does the ClientHello record advertise the cyber suites it supports? 
yes.
what are the public-key algorithm, the symmetric-key algorithm, and the hash algorithm for the first cipher suite?
TLS_RSA_WITH_RC4_128_MD5 (0x000004)
public-key: RSA
symmetric-key: RC4
hash: MD5

6. does the serverHello record specify a chosen cipher suite? What are the algorithms in the chosen cipher suite?
yes.
TLS_RSA_WITH_RC4_128_MD5 (0x0004)
it chose the first one. RSA, RC4, MD5

7. server hello include a nonce? how long is it? What is the purpose of the client and server nonces in SSL?
yes. it is labelled random this time though. it includes a time stamp and then random numbers. 
32 bytes total. 4 byte time stamp, 28 byte random number.
00 00 00 00 -> Dec 31, 1969 16:00:00.000000000 PST
42:db:ed:24:8b:88:31:d0:4c:c9:8c:26:e5:ba:dc:4e:26:7c:39:19:44:f0:f0:70:ec:e5:77:45
Nonces are used to prevent against a playback attack. They are always unique. Shouldn't ever see the same one again.
Nonces are used to calculated common master secret


8. Does this record include a session ID? What is the purpose of the session ID?
session id is included. 1b:ad:05:fa:ba:02:ea:92:c6:4c:54:be:45:47:c3:2f:3e:3c:a6:3d:3a:0c:86:dd:ad:69:4b:45:68:2d:a2:2f
used to confirm if in current handshake or resuming a handshake.

9. Does this record contain a certificate, or is the certificate included in a separate record? Does the certificate fit into a single Ethernet frame?
This record does not contain certificate.
certificate is in the next record. It does fit within 1 ethernet frame.

10. Locate the client key exchange record. Does this record contain a pre-master secret?
What is this secret used for? Is the secret encrypted? If so, how? How long is the encrypted secret?
yes.
bc:49:49:47:29:aa:25:90:47:7f:d0:59:05:6a:e7:89:56:c7:7b:12:af:08:b4:7c:60:9e:61:f1:04:b0:fb:f8:3e:41:c0:8d:c9:10:93:9c:ad:1e:ce:82:e0:dd:e2:50:b9:9b:4b:51:c7:3f:bd:ee:cd:92:c4:27:5d:ff:dd:fb:95:42:3d:a4:b7:71:ee:c0:ff:c3:ce:b2:ed:60:90:6c:d7:04:6e:5a:00:98:2e:52:ee:b5:bc:d1:c4:f5:63:f0:e3:44:29:f1:c6:ba:64:58:79:46:9e:3e:c4:fd:d7:9b:7a:02:04:09:32:f6:1d:7a:a1:2d:cf:d2:1a:18:64:29
the secret is used for deriving other keys, that we use to sign and encrypt our data for integrity and confidential reasons.
the secret is encrypted with the public key of the server. got the public key through the certificate.
the secret is 128 bytes long

11. What is the purpose of the Change Cipher Spec record? How many bytes is the record in your trace?
change cipher record lets you know the next record is encrypted with the keys derived from the MS.
6 bytes long.

12. In the encrypted handshake record, what is being encrypted? How?
All the data of the previous client messages are encrypted through the derived keys of the MS. specifically the session key.

13. Does the server also send a change cipher record and an encrypted handshake record to the client? 
How are those records different from those sent by the client?
Yes. 
These encrypted handshake messages are all the messages the server sent. the client sent encrypted client messages.

14. How is the application data being encrypted? Do the records containing application data include a MAC? 
Does Wireshark distinguish between the encrypted application data and the MAC?
encrypted with the symmetric encryption algo decided upon, in this case RC4.
All the messages will contain a MAC, which is also encrypted.
MAC in this case is an MD5 hash of the data being sent, and the a session MAC key. 
wireshark sees the data and the MAC as part of the same thing.


*/