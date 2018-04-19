import os
import sys

PCAP_FILE_HEADER_LEN = 24
PCAP_PACKET_HEADER_LEN = 16
ETHERNET_HEADER_LEN = 14


def main():
    filepath = 'net.cap'
    host_of_interest = (192, 168, 0, 101)

    if len(sys.argv) == 3:
        filepath = sys.argv[1]
        host_of_interest = tuple(int(p) for p in sys.argv[2].split('.'))

    print(filepath, host_of_interest, sys.argv)
    extract_from_dump(filepath, host_of_interest)


def extract_from_dump(binary_file_path, dest_ip_tuple):
    data = {}
    with open(binary_file_path, 'rb') as f:
        global_header = f.read(PCAP_FILE_HEADER_LEN)
        verify_header(global_header)

        # The rest of the bytes will be Ethernet Frames
        while True:
            packet_header = f.read(PCAP_PACKET_HEADER_LEN)
            if not packet_header:
                break;

            packet_len = parse_pcap_header(packet_header)
            print("Handling packet, len: {}".format(packet_len))

            packet_bytes = f.read(packet_len)
            ip_datagram = parse_ether_frame(packet_bytes)
            ip_source, ip_dest, tcp_segment = parse_ip_datagram(ip_datagram)
            seq_number, tcp_payload = parse_tcp_message(tcp_segment)

            if tuple(ip_dest) == dest_ip_tuple and len(tcp_payload) > 0:
                data[seq_number] = tcp_payload

    ordered_data = [d for _, d in sorted(data.items())]
    binary_string = b''.join(ordered_data)
    relevant_data = binary_string.split(b'\r\n\r\n', 1)[1] # Everything before the split is HTTP header data

    with open('result.jpg', 'wb') as output:
        output.write(relevant_data)
    print('done')


def btoi(bs):
    return int.from_bytes(bs, 'little')


def verify_header(header_bytes):
    assert header_bytes[0:4] == bytes.fromhex('d4c3b2a1')
    assert btoi(header_bytes[4:6]) == 2
    assert btoi(header_bytes[6:8]) == 4
    assert btoi(header_bytes[8:12]) == 0
    assert btoi(header_bytes[12:16]) == 0
    print('Snapshot max size: {}'.format(btoi(header_bytes[16:20])))
    print('Link Layer Header Type: {}'.format(btoi(header_bytes[20:24])))


def parse_pcap_header(header_bytes):
    # We just make sure we got the whole packet
    total_len = btoi(header_bytes[8:12])
    captured_len = btoi(header_bytes[12:16])
    assert total_len == captured_len
    return captured_len


def parse_ether_frame(ether_frame_bytes):
    header_bytes = ether_frame_bytes[0:ETHERNET_HEADER_LEN]
    dest_mac = header_bytes[0:6]
    source_mac = header_bytes[6:12]
    ether_type = header_bytes[12:14]
    print( bytes.hex(source_mac), bytes.hex(dest_mac))
    assert ether_type == bytes.fromhex('0800') # Ether IPv4
    return ether_frame_bytes[ETHERNET_HEADER_LEN:]


def parse_ip_datagram(datagram_bytes):
     ip_version = datagram_bytes[0] >> 4
     assert ip_version == 4
     ip_header_len = 4 * (datagram_bytes[0] & 7) # Masking w/ 00001111, len provided in 32bit words

     ip_source = datagram_bytes[12:16]
     ip_dest = datagram_bytes[16:20]

     print("  src:  ", tuple(ip_source))
     print("  dest: ", tuple(ip_dest))
     print("  ip header len: ", ip_header_len)

     return ip_source, ip_dest, datagram_bytes[ip_header_len:]


def parse_tcp_message(tcp_bytes):
    source_port = big_btoi(tcp_bytes[0:2])
    dest_port = big_btoi(tcp_bytes[2:4])
    seq_number = big_btoi(tcp_bytes[4:8])
    ack_number = big_btoi(tcp_bytes[8:12])
    reserved_section = tcp_bytes[12] & 14      # Reserved is the 3 bits within the bottom half of a single byte
    tcp_header_len = 4 * (tcp_bytes[12] >> 4)  # header-size is the top half of a byte, in 32bit words
    flag_bitfield = big_btoi(tcp_bytes[12:14]) & 511
    window_size = big_btoi(tcp_bytes[14:16])
    tcp_checksum = big_btoi(tcp_bytes[16:18])
    # Ignoring urgent pointer

    # Extract from bitfields
    flags = {
        'ns_flag' : (flag_bitfield & 256) != 0,
        'cwr_flag' : (flag_bitfield & 128) != 0,
        'ece_flag' : (flag_bitfield & 64) != 0,
        'urg_flag' : (flag_bitfield & 32) != 0,
        'ack_flag' : (flag_bitfield & 16) != 0,
        'psh_flag' : (flag_bitfield & 8) != 0,
        'rst_flag' : (flag_bitfield & 4) != 0,
        'syn_flag' : (flag_bitfield & 2) != 0,
        'fin_flag' : (flag_bitfield & 1) != 0
    }

    assert reserved_section == 0

    print("  source port: ", source_port)
    print("  dest port: ", dest_port)
    print("  seq number: ", seq_number)
    print("  ack num: ", ack_number)
    print("  tcp header len: ", tcp_header_len)
    print("  window size: ", window_size)
    print("  checksum: ", tcp_checksum)

    for name, val in flags.items():
        if val:
            print("  {} set".format(name))

    return seq_number, tcp_bytes[tcp_header_len:]


def big_btoi(bs):
    return int.from_bytes(bs, 'big')

if __name__ == '__main__':
    main()
