import socket
import sys
import random
import binascii
from functools import reduce

# python3 simple-dns.py google.com A
# dig equivalent: dig @8.8.8.8 google.com A
# implementing something like: socket.gethostbyname(hostname)
# http://www.fauser.edu/~fuligni/files/classi5/sistemi-reti/project1-primer%20(DNS%20message%20structure).pdf
# https://routley.io/tech/2017/12/28/hand-writing-dns-messages.html

UDP_SEND_IP = "8.8.8.8"  # Google's Open DNS
UDP_SEND_PORT = 53       # DNS expects port 53

UDP_RECV_IP = "0.0.0.0" # This computer
UDP_RECV_PORT = 1337    # Because we are haxorz

# q_type is like NS, A
# name is host
# python3 simple-dns.py google.com A


def writeUInt16BE(num):
    return (num).to_bytes(2, 'big')

def readUIntBE(str):
    return int.from_bytes(str, 'big')

def main(name, q_type):
    print("Name: {}, Type: {}".format(name, q_type))
    message = create_dns_req(name, q_type)
    data = send_dns_message(message)
    parse_response(data)


def send_dns_message(message):
    '''
    This function uses the socket interface to send a UDP request to a DNS root server.
    You should not need to modify this function.
    '''
    print("UDP target IP:", UDP_SEND_IP)
    print("UDP target port:", UDP_SEND_PORT)

    remote_dns = (UDP_SEND_IP, UDP_SEND_PORT)
    client_dns = (UDP_RECV_IP, UDP_RECV_PORT)

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # Internet, UDP
    sock.bind(client_dns) # Listen
    print("listening on ", sock.getsockname())
    print(f"message {message}", binascii.hexlify(message))
    print(f"type of message {type(message)}")
    # encodedMessage = hex(int(message,16))
    sock.sendto(message, remote_dns) # Send

    data, addr = sock.recvfrom(1024) # buffer size is 1024 bytes

    sock.close()
    return data


def create_dns_req(name, dns_q_type='A'):
    '''
    This function accepts a valid DNS name (www.google.com for example) and a DNS query type
    (Start by supporting only A, then add NS, then add more if you wish). You may also wish to
    add support for some DNS flags, like the recursive flag.
    '''
    # Your code here
    # 65535 = Math.pow(2,16)-1 aka largest num you can represent with 2 bytes
    identification = random.randint(0, 65535)
    # flags = 0 (query) 0000 (op code) 0 (answer) 0 (no truncation) 1 (recursive query) 1 (recursion available)  0 (reserved) 1 (authentic data) 0 (checking disabled) 0000 (reserved)
    # flags = 0x0120 
    # bin(0x0120)[2:].zfill(16)
    flagString = '0 0000 0 0 1 0 0 1 0 0000'.replace(' ', '')
    flags = int(flagString, 2)
    numQuestions = 1
    numAnswers = 0
    numAuthority = 0
    numAdditional = 0
    byteString = writeUInt16BE(identification) + writeUInt16BE(flags) + writeUInt16BE(numQuestions) \
            + writeUInt16BE(numAnswers) + writeUInt16BE(numAuthority) + writeUInt16BE(numAdditional)
    print('message so far',byteString, binascii.hexlify(byteString))
    if dns_q_type == 'A':
        # follow the protocol, and send in binary data. exactly for A record. for header and question.
        # good practice to make identification number random.

        def add_urls(acc, curr):
            acc += len(curr).to_bytes(1, 'big') + curr.encode('ascii')
            return acc

        question_name = reduce(add_urls, name.split('.'), b'') + (0).to_bytes(1, 'big')
   
        print('question name', question_name, binascii.hexlify(question_name))
        question_type = 1
        question_class = 1
        byteString += question_name + writeUInt16BE(question_type) + writeUInt16BE(question_class)
        return byteString
    else:
        return name

def parse_response(resp):
    '''
    This function expects a DNS response as bytes. You can make this function as
    simple or complex as you want, as you parse the responses in more and more detail
    but you should start by expecting the response to contain an ANSWER to an A or
    an NS record, and parse out the IP address (A) or the name of the server (NS)
    '''
    hexResponse = binascii.hexlify(resp)
    asciiResponse = hexResponse.decode('ascii')
    # Your code here
    print("received message:", resp, hexResponse)
    print('string slice', resp[4:6], hexResponse[8:12])
    idNum = readUIntBE(resp[0:2])
    print("id number", idNum)
    flags = bin(readUIntBE(resp[2:4]))[2:].zfill(16)
    print("flags", flags)
    numQuestions = readUIntBE(resp[4:6])
    print('num questions', numQuestions)
    numAnswers = readUIntBE(resp[6:8])
    print('num answers', numAnswers)
    numAuthority = readUIntBE(resp[8:10])
    print('num authority', numAuthority)
    numAdditional = readUIntBE(resp[10:12])
    print('num additional', numAdditional)
    offset = 12

    def readHostHelper(offset):
        hostLength = readUIntBE(resp[offset:offset+1])
        offset += 1
        if (hostLength == 0): return ['', offset]
        if (hostLength == 192 and bin(hostLength)[2:4] == '11'): 
            newOffset = readUIntBE(resp[offset:offset+1])
            offset += 1
            host, _ = readHostHelper(newOffset)
            return [host, offset]

        partOfHost = resp[offset: offset+hostLength].decode('ascii')
        offset += hostLength
        nextHost, newOffset = readHostHelper(offset)
        return [partOfHost + '.' + nextHost, newOffset]

    def readHost(offset):
        host, offset = readHostHelper(offset)
        host = host[:-1]
        return [host, offset]

    if (numQuestions):
        host, offset = readHost(offset)
        print('host', host)

        questionType = readUIntBE(resp[offset:offset+2])
        offset += 2
        print('q type', questionType)

        questionClass = readUIntBE(resp[offset:offset+2])
        offset += 2
        print('q class', questionClass)
        print('in here', offset)

    if (numAnswers):
        host, offset = readHost(offset)
        print('host', host)

        answerType = readUIntBE(resp[offset:offset+2])
        offset += 2
        print('a type', answerType)

        answerClass = readUIntBE(resp[offset:offset+2])
        offset += 2
        print('a class', answerClass)

        timeToLive = readUIntBE(resp[offset:offset+4])
        offset += 4
        print('a ttl', timeToLive)

        lengthOfIp = readUIntBE(resp[offset:offset+2])
        offset += 2
        print('data length', lengthOfIp)

        ipAddress = ''
        for x in range(0, lengthOfIp):
            intIpAddress = readUIntBE(resp[offset+x:offset+x+1])
            ipAddress += str(intIpAddress) + '.'

        ipAddress = ipAddress[:-1]
        offset += lengthOfIp
        print('address', ipAddress)
    


if __name__ == '__main__':
    n = sys.argv[1]
    t = sys.argv[2]
    main(n, t)
