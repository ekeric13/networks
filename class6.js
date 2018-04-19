/*
in symmetric key systems, Alice’s and Bob’s keys are identical and are secret
public key systems, a pair of keys is use

symmetric key would be like a cipher.
basic cipher is caesar cipher, just move letters X letters over. and then move letters X letters back.
block cipher, the message to be encrypted is processed in blocks of k bits
if k = 64, then the message is broken into 64-bit blocks, each block encrypted independently.
uses a 1 to 1 mapping and maps each bit in a block to a different bit.
server and client both need to know the mapping.
mapping is just a permutation of all the possible inputs.
k = 3. 3 bits. since binary 2^3 = 8 possible inputs. 8 inputs can be permuted in 8! = 40,320 different ways
block cipher has a function that randomly creates a table which is one of the permutations.
popular block ciphers include DES and AES
add randomness to block chiper via Cipher Block Chaining (CBC)
makes it hard to guess what ciphertext maps to what cleartext.

plaintext message m
bob public key Kb+
bob private key Kb-

alice wants to write message only bob can read.

alice does Kb+(m) -> bob
bob does Kb-(Kb+(m)) = m

bob wants to write a message so that people know he really wrote it.

bob does Kb-(m)
alice does Kb+(Kb-(m)) = m
she knows bob really wrote it.

RSA is a way to encrypt messages. it uses modulo arithmetic.

To generate the public and private RSA keys:
1. choose two large prime numbers, p and q. larger the value the harder to break RSA,
but also longer it takes to encrypt and decrypt messages.
2. n = p*q.  z= (p-1)*(q-1)
3. choose e, so that e < n. and e / z != integer other than 1
e is used for encrpytion
4. choose d, so that e*d-1 is dividible by z. in other words (e*d) % z = 1
d is used for decrpytion
5. public key is (n,e). private key is (n, d)

to encrypt a message m, alice does Kb+(m) = m^e % n
to decrypt the encrypted message, bob does m = Kb+(m)^d % n
works as long as if you convert m to bits, convert bits to an integer, that
integer value is less than < n (the product of the two prime numbers you chose)

RSA takes a long time, so generally encode the data beforehand using a session key.
this way you are encrypting less data.
alice and bob must know session key. it is fine for the session key to be public.
hash algorithms are often used as session keys.


for message integrity use a hash function and authentication key.
authentication key has to be private between two people.

1. alice creates message m, uses authentican key s to do and hash H to do
H(m+s). this is called Message Authnetication Code (MAC)
2. alice sends message (m, MAC) to bob
3. bob also knows the authentican key s and the hash algo H.
he does H(m+s) and sees if it is equal to the MAC on the message he got.

MD5 and SHA-1 are both hashing algorithms.

when signing a message what might happen is
1. bob sending message m, uses has function H to create H(m). encrypts H(m) using
Kb-. sends signed has to alice Kb-(H(m)). also sends message m to alice!!
2. alice gets Kb-(H(m)) and uses public key Kb+ to get H(m) = Kb+(Kb-(H(m)))
runs message m through hash algorithm to get H(m). if decrypted hash message H(m) == hashed message H(m)
then we know bob really sent it.


it is important to verify that a public key belongs to a person.
if you say you are someone else, sign something with your private key, and give someone your public key saying it
is the piblic key to that someone else, then the receiver will successfully decrpyt the message, and since it is 
signed, assume that it really was that someone else, when really it was you.

Certification Authority (CA) bind a public key to a person.
when CA verifies the identity of the entity, CA creates a certificate that binds the public key of the entity to the identity.
certificate contains public key and identification about the owner of that certificate. (ip address, ssn, etc.)

Kca-  = certifcate private key
[Kb+, B] = bob and his public key
Kca-([Kb+, B]) = Bob's signed certificate. = Bca

bob sends encryptes message, Kb-(m), and his certificate, Bca
alice uses the certificate public key, Kca+, to get bob's public key
Kca+(Bca) = [Kb+, B]
Kb+(Kb-(m)) = m

AES is about confidentiality.
RSA and public and private keys are about authentication and confidentiality.
MAC's (and using SHA-1) are about Integrity.

A nonce is a number that a protocol will use only once in a lifetime
used in the following way
client -> server
hello
server -> client
nonce R
client -> server
used symmetric secret key, Ka-b to encrpyt nonce
sends Ka-b(R)
server
decrpyts Ka-b(R) and see if it equals R.
if it does than it knows client is authneticated.

When performing authentication over the network, need an authentication protocol.

cryptography can enhance TCP with security services.
enhanced TCP is known as SSL, and then eventually TLS.

SSL enhances TCP with confidentiality, data integrity, server authentication, and client authentication.

normally

app       transport          network
App -> tcp socket -> tcp -> ip 

with ssl

 app                           transport          network
app -> ssl socket -> ssl -> tcp socket -> tcp -> ip

ssl resides in application layer, but app interacts with it as if it were part of transport layer.

ssl has 3 phases
1. handshake
2. key derivation
3. data transfer

handshake
-establish tcp connection
-verify other host
-send other host master secret key used to generate all the symmetric keys needed for the ssl session

client -> server
tcp: syn
server -> client
tcp: syn, ack
client -> server
tcp: ack
client -> server
ssl hello
server->client 
certifcate containing server public key (Ks+)
client->sever
generate Master Secret (MS)
encrypt MS with server public key EMS = Ka+(MS)
send EMS to server
server
use private key to decrypt master secret
Ka-(MS) = MS

key derivation
use MS to create 4 keys. each client and server will have all 4 keys. keys are derivated from MS somehow.
Ec = session encryption key for data sent from client to server (data is confidential)
Mc = session MAC key for data sent from client to server (data has integrity)
Es = session encryption key for data sent server to client
Ms = session MAC key for data sent from server to client.

data transfer
ssl breaks data stream into records. appends a MAC to each record, and then encrypts message + MAC
MAC is created by using hash function H, record data r, and session mac key Mc
MAC = H(r + Mc)
then use encryption key Ec to encrypt data
Ec([m, MAC])
pass encrypted record to TCP, which turns it into a TCP segment.
tcp breaks records down into multiple tcp segments.
tls can be configured to compress the application data when putting it into records.

since tcp is not encrpyted, man in the middle can reverse the order of the packets by flipping the unencrypted
sequence numbers.
to avoid this, generally have sequence numbers for ssl as well. put them into the MAC
MAC = H(r+Mc+seq)
server keeps track of client's ssl sequence numbers, and makes sure it matches that in decrypted MAC so it
knows the integrity of the ordering.

ssl record:
type - indicate whether it is part of ssl handshake or application data. whether to close connection.
version
length - used to extract ssl records out of tcp byte stream
data - encrypted
MAC  - encrypted


real SSL handshake
client -> server
list of cryptographic algorithms it supports
a client nonce
server -> client 
chooses a symmetric algorithm (AES), a public key algorithm (RSA), and MAC algorithm
sends client those choices.
sends it's certificate
sends a server nonce
client -> server
verify certificate and extract server public key
creates a Pre-Master Secret (PMS), encrpyts the PMS with Ks-
sends Ks-(PMS)
get MS from PMS + client nonce + server nonce
use MS to the 2 encrpytion keys and 2 MAC keys and 2 initialization vectors.
use MS to get two Initialization Vectors, which are used for the CBC (AES)
server
get MS from PMS + client nonce + server nonce
use MS to the 2 encrpytion keys and 2 MAC keys and 2 initialization vectors.
use MS to get two Initialization Vectors, which are used for the CBC (AES)
client -> server
send MAC of all the handshake messages H(m+s). encrypted with symmetric key (AES)
server -> client
send MAC of all the handshake messages H(m+s). encrypted with symmetric key (AES)
client & server
compares MACs of handshake messages to make sure no pre-encrypted messages were tampered with.
if inconcistency terminate the connection.

nonces are used since if you sniff all the messages in a handshake, and then replay them back,
the server could think you are a different client.
nonces are unique. prevents playback attack.

prevent truncation attack, which sends a tcp fin, stopping the connection prematurely, have ssl type say
whether to terminate ssl session. after ssl session terminated will then react to a tcp fin.

TLS = transport Layer Security
provides security at the transport layer, between application.
most recent version is TLS1.2
TLS is used by HTTPS
TLS uses 4 ciphers. authenticate server with RSA. key exchange with RSA. 
symmetric confidentiality with AES. integrity with MAC/SHA-1

ethernet frame can contain multiple ssl records.
ethernet frame generally contains 1 complete http message, or part of 1 http message. never more than 1 http message.

Q: What is public key encryption, how is it used in TLS, and why is it so important in networking contexts?

Q: How does the TCP handshake differ from the TLS handshake?

Q: What information is exchanged in the TLS handshake? What is the purpose of the cipher-suite exchange?
What is the purpose of the hash function?


https://en.wikipedia.org/wiki/Rainbow_table


*/