import socket
import sys

# You'll have to construct this, but it can be the same for every ping you send
# because the header contains the TTL, the payload can always be the same
PING_PAYLOAD = None

def ping(dest, ttl):
    '''
    ping should return a Promise that resolves if it recieves an ICMP message
    and rejects if an error occurs. A TTL packet drop is not an error.

    We have created a socket that uses the ICMP protocol for you.
    '''
    s = socket.socket(socket.AF_INET,socket.SOCK_RAW,socket.IPPROTO_ICMP)
    s.setsockopt(socket.SOL_IP, socket.IP_HDRINCL, 1)

    # TODO: Add a mechanism for handling timeout
    # TODO: Complete this function such that it sends a single
    # ping request to the provided destination, with the supplied TTL
    # and returns the ICMP message data it recieves for that ping request

def main():
    target = sys.argv[2] or '216.58.195.238'
    max_hops = 64

    # TODO: send a series of ping requests with ever increasing TTL
    # And print the IP address of the router that drops the packet

if __name__ == '__main__':
    main()
