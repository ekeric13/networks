import os
from socket import *
serverName = 'localhost'
serverPort = 12000

# create tcp socket
clientSocket = socket(AF_INET, SOCK_STREAM)
# handshake. not included in udp
clientSocket.connect((serverName, serverPort))

while 1:
  # send data
  sentence = input('Input lowercase sentence:')
  encoded = sentence.encode()
  # sends message without including server or port (did handshake)
  clientSocket.send(encoded)

  # receive data
  modifiedSentence = clientSocket.recv(1024)
  decodedSentence = modifiedSentence.decode()
  print('from server', decodedSentence)
  if decodedSentence == 'kill you':
    clientSocket.close()
    os._exit(0)
  