import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

client_address = '0.0.0.0'
client_rcv_port = 1337

print("This socket identified by: " + client_address + ":" + str(client_rcv_port))

server_ip = '0.0.0.0'
server_port = 1338
forward_ip = '0.0.0.0'
forward_port = 1339

while True:
    message = input('Enter a string to be echoed: ')
    complete_message = (message, (forward_ip, forward_port))
    sock.sendto(bytes(str(complete_message), "utf-8"), (server_ip, server_port))
    print("sent: " + str(complete_message))
