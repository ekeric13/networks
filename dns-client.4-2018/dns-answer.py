import socket
import sys
import random

UDP_SEND_IP = "8.8.8.8"  # Googles Open DNS
UDP_SEND_PORT = 53       # DNS expects port 53

UDP_RECV_IP = "0.0.0.0" # This computer
UDP_RECV_PORT = 1337    # Because we are haxorz


def main(name, q_type):
    print("Name: {}, Type: {}".format(name, q_type))
    message = create_dns_req(name, q_type)
    resp = send_dns_message(message)
    parse_response(resp)


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

    sock.sendto(message, remote_dns) # Send

    data, addr = sock.recvfrom(1024) # buffer size is 1024 bytes
    return data


def create_dns_req(name, dns_q_type):
    message = b''

    # Random 2 bytes for ID
    id = (random.randrange(0, 2**15)).to_bytes(2, 'big')
    message += id

    # Flags, 2 bytes, all 8 for our case (just recursive is set)
    # "standard query" with no flags set
    flags = (0x0100).to_bytes(2, 'big')
    message += flags

    questions = (1).to_bytes(2, 'big')
    answers = (0).to_bytes(2, 'big')
    authority = (0).to_bytes(2, 'big')
    additional = (0).to_bytes(2, 'big')
    message += questions + answers + authority + additional

    # Split name on dots to create the name parameter
    dns_name_value = b''
    name_sections = name.split('.')
    for section in name_sections:
        l = (len(section)).to_bytes(1, 'big')
        n = bytes(section, 'ascii')
        dns_name_value = l + n
        message += dns_name_value

    message += (0).to_bytes(1, 'big') # Last 0 indicates end of name

    q_type = None
    if(dns_q_type == 'NS'):
        q_type = (2).to_bytes(2, 'big')
    elif(dns_q_type == 'A'):
        q_type = (1).to_bytes(2, 'big')
    else:
        raise Error("Unsupported query type")

    message += q_type
    message += (1).to_bytes(2, 'big') # type -- internet

    return message

def parse_response(resp):
    transaction_id = resp[:4]
    questions = int.from_bytes(resp[4:6], 'big')
    answers = int.from_bytes(resp[6:8], 'big')
    authority = int.from_bytes(resp[8:10], 'big')
    additional = int.from_bytes(resp[10:12], 'big')

    idx = 12
    print("\nQuestions:")
    for _ in range(questions):
        name, bytes_consumed = parse_name_section(resp, idx)
        idx += bytes_consumed

        # Type, class, 2 bytes each
        dns_type = int.from_bytes(resp[idx:idx+2], 'big')
        dns_class = int.from_bytes(resp[idx+2:idx+4], 'big')
        idx += 4

        print("{}, {}, {}".format(name, dns_type, dns_class))

    print("\nAnswers:")
    for _ in range(answers):
        if idx >= len(resp):
            break

        idx = parse_response_record(resp, idx)

    print("\nAuthority:")
    for _ in range(authority):
        if idx >= len(resp):
            break

        idx = parse_response_record(resp, idx)

    print("\nAuthority:")
    for _ in range(answers + authority + additional):
        if idx >= len(resp):
            break

        idx = parse_response_record(resp, idx)



def parse_response_record(dns_response, record_start_location):
    idx = record_start_location  # For compactness/readability
    name, bytes_consumed = parse_name_section(dns_response, idx)
    idx += bytes_consumed

    # Type, class, TTL 2 bytes each
    dns_type = int.from_bytes(dns_response[idx:idx+2], 'big')
    dns_class = int.from_bytes(dns_response[idx+2:idx+4], 'big')
    ttl = int.from_bytes(dns_response[idx+4:idx+8], 'big')
    idx += 8

    # Data Len:
    length = int.from_bytes(dns_response[idx:idx+2], 'big')
    idx += 2
    data = dns_response[idx:idx+length]
    idx += length

    # We only know how to specially handle A and NS records in this client
    if dns_type == 1:
        # A Record
        data = [str(int(b)) for b in data]
        data = '.'.join(data)
    elif dns_type == 2:
        # NS Record
        data, _ = parse_name_section(dns_response, idx - length)

    print("{}, {}, {}, {}, {}".format(name, dns_type, dns_class, ttl, data))
    return idx


def parse_name_section(dns_response, name_section_start):
    part_len = dns_response[name_section_start]

    name = []
    bytes_consumed = 0

    while part_len != 0:
        pointer_bits = part_len >> 6

        if pointer_bits == 3:
            pointer_total = dns_response[name_section_start:name_section_start+2]
            pointer_val = int.from_bytes(pointer_total, 'big') & 0x3fff # masking off the 2 bit pointer indicator
            name_part, _ = parse_name_section(dns_response, pointer_val)
            bytes_consumed += 1 # Would be two, but prior to returning we always add one
            name.append(name_part)
            break

        name_part_start = name_section_start + 1
        name_part_end = name_part_start + part_len
        name_part = dns_response[name_part_start:name_part_end]
        name.append(name_part.decode('ascii')) # DNS uses ascii
        name_section_start = name_part_end
        bytes_consumed += part_len + 1
        part_len = dns_response[name_section_start]

    bytes_consumed += 1 # Account for consuming the null terminator
    return '.'.join(name), bytes_consumed

if __name__ == '__main__':
    n = sys.argv[1]
    t = sys.argv[2]
    main(n, t)