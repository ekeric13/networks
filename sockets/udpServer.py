from socket import *
serverPort = 12000

serverSocket = socket(AF_INET, SOCK_DGRAM)
# bind port 12000 to our socket
serverSocket.bind(('', serverPort))

print("The server is ready to receive")

while 1:
  # receive client address. need to know where back to send it.
  message, clientAddress =  serverSocket.recvfrom(2048)
  print(f"received {clientAddress}")
  modifiedMessage = message.upper()
  serverSocket.sendto(modifiedMessage, clientAddress)