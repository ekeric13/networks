from socket import *
serverName = 'localhost'
serverPort = 12000

# socket using ipv4 and udp
clientSocket = socket(AF_INET, SOCK_DGRAM)
while 1:
  message = input('Input lowercase sentence:')
  encodedMessage = message.encode()
  print(f"hey there: {encodedMessage}")
  # send message including serverPort and serverName. part of udp
  clientSocket.sendto(encodedMessage, (serverName, serverPort))

  # receive from a buffer size of 2048. also receive serverAddress. part of udp
  modifiedMessage, serverAddress = clientSocket.recvfrom(2048)
  decodedMessage = modifiedMessage.decode()
  print(modifiedMessage)


clientSocket.close()