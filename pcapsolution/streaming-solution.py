#!/usr/bin/env python3
"""
Parse the purported HTTP response image out of the net.cap packet capture.

Uses a single pass to parse all the segments, sorts them, then uses another
pass of just the HTTP message to write the file.
"""

import os


def btoi(bs):
    return int.from_bytes(bs, 'little')


def htob(hx):
    return bytes.fromhex(hx)


def parse_pcap_global(f):
    """
    Confirm expected global header values and progress reader to end of header
    """
    assert f.read(4) == htob('d4c3b2a1')  # little-endian pcap
    assert btoi(f.read(2)) == 2  # major version 2
    assert btoi(f.read(2)) == 4  # minor version 4
    f.seek(12, os.SEEK_CUR)  # skip tz offset, ts accuracy and snapshot length
    assert btoi(f.read(4)) == 1  # LINKTYPE_ETHERNET ie IEEE 802.3


def parse_pcap_packet(f):
    """
    Progress reader to start of ethernet frame and return its size
    """
    f.seek(8, os.SEEK_CUR)  # skip timestamp
    length = btoi(f.read(4))  # length of captured data
    assert btoi(f.read(4)) == length  # no truncation
    return length


def parse_ethernet_frame(f):
    """
    Confirm expected header values and progress reader to payload datagram
    """
    f.seek(12, os.SEEK_CUR)  # skip mac addresses
    assert f.read(2) == htob('0800')  # IPv4 EtherType


def parse_ip_datagram(f):
    """
    Return the source and destination IP addresses and header length in bytes,
    and progress the reader to the start of the payload segment
    """
    b1 = btoi(f.read(1))
    assert b1 >> 4 == 4  # IPv4
    ihl = b1 & 7
    f.seek(11, os.SEEK_CUR)  # skip up to addresses
    source = f.read(4)
    destination = f.read(4)
    f.seek((ihl - 5) * 4, os.SEEK_CUR)  # skip any options
    return source, destination, ihl * 4


def parse_tcp_segment(f):
    """
    Return the sequence number and TCP header length in bytes, and progress the
    reader to the start of the payload message fragment
    """
    f.seek(4, os.SEEK_CUR)  # skip ports
    seq = int.from_bytes(f.read(4), byteorder='big')  # sequence number
    f.seek(4, os.SEEK_CUR)  # skip ack number
    offset = btoi(f.read(1)) >> 4
    f.seek(offset * 4 - 13, os.SEEK_CUR)
    return seq, offset * 4


if __name__ == '__main__':
    segments = {}
    with open('net.cap', 'rb') as f:
        parse_pcap_global(f)
        while True:
            frame_length = parse_pcap_packet(f)
            if not frame_length:
                break
            parse_ethernet_frame(f)
            source, destination, ihl = parse_ip_datagram(f)
            seq, thl = parse_tcp_segment(f)
            data_length = frame_length - 14 - ihl - thl
            data = f.read(data_length)
            if tuple(destination) == (192, 168, 0, 101) and data_length > 2:
                segments[seq] = data

    everything = b''.join(d for _, d in sorted(segments.items()))
    with open('out.jpg', 'wb') as f:
        f.write(everything.split(b'\r\n\r\n', 1)[1])
    print('done')
