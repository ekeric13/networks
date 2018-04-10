import os
import signal
from socket import *
serverPort = 12000

serverSocket = socket(AF_INET, SOCK_STREAM)
serverSocket.bind(('', serverPort))

# listen for tcp connection requests from client. handle max 1 connection
serverSocket.listen(1)

print("the server is ready to receive")

while 1:
  # open up a new socket for a specific client and handshake. not included in udp. receive client address but not used anywhere
  connectionSocket, clientAddress = serverSocket.accept()
  newpid = os.fork()
  if newpid == 0:
    while 1:
      childPid = os.getpid()  
      # receive from connection socket, not initial server socket
      sentence = connectionSocket.recv(1024)
      print(f"received from client {sentence}  child: {childPid} useless: {newpid}")
      decodedSentence = sentence.decode()
      if decodedSentence == 'end this':
        connectionSocket.send('kill you'.encode())
        connectionSocket.close()
        os.kill(childPid, signal.SIGKILL)
      else:
        capitalizedSentence = sentence.upper()
        # send message without specifiyng client address, already know client address via handshake
        connectionSocket.send(capitalizedSentence)

  else:
    pids = (os.getpid(), newpid)
    print("parent: %d, child: %d\n" % pids)
