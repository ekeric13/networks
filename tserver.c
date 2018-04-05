// http://www.cs.rpi.edu/~moorthy/Courses/os98/Pgms/socket.html
/* A simple server in the internet domain using TCP
   The port number is passed as an argument */
// gcc -o tserver tserver.c && ./tserver 51717
// gcc tserver.c -lsocket
// gcc -o tserver tserver.c
// cc tserver.c -o tserver.out
// gcc vs cc? cc is a pointer to gcc
// tclient vs tclient.out
// cheerios not working. how do i get the hostname?
// which cc
// ls -la filePath
// .out is ignored by the os (both just executable object files)

// linux find hostname
// ./tclient `hostname` 51717
// `` executes child process in c on the command line
// pgrep tserver
// lsof -i:51717
// kill -9 pid

#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>
#include "tsocket.h"

void communicateWithClient(int);
void error(char *msg)
{
  perror(msg);
  exit(1);
}

int main(int argc, char *argv[])
{
   int sockfd, newsockfd, portno, clilen, pid;
   struct sockaddr_in serv_addr, cli_addr;

   if (argc < 2) {
       fprintf(stderr,"ERROR, no port provided\n");
       exit(1);
   }
   // socket is a sys call
   // first arg is domain. two possible domains.
   // address domain: AF_UNIX/PF_UNIX
   // internet domain: AF_INET/PF_INET
   // second arg is socket type.
   // tcp stream: SOCK_STREAM
   // udp datagram: SOCK_DGRAM
   sockfd = socket(AF_INET, SOCK_STREAM, 0);
   if (sockfd < 0) {
      error("ERROR opening socket");
   }

   // serv_addr is 16 bytes
   // bzero((char *) &serv_addr, sizeof(serv_addr));
   // convert bzero to memset
   // set all values in buffer (serv_addr) to 0
   memset((char *) &serv_addr, 0, sizeof(serv_addr));
   // convert string to int. getting the port number
   portno = atoi(argv[1]);

   // fill out structure of server address
   serv_addr.sin_family = AF_INET;
   // get the port number but make sure it is in big endian
   serv_addr.sin_port = htons(portno);
   // ip address of the host. since on server then this is the ip address of this machine
   serv_addr.sin_addr.s_addr = INADDR_ANY;

   // bind is a sys call that binds a socket to an address
   // want to give it the port number and host that socket file descripter is bound to
   // port no and host is located within sockaddr
   // why struct sockaddr * instead of char * like above??
   if (bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) {
      error("ERROR on binding");
   }
   // listen for incoming socket connections. listen for max of 5
   listen(sockfd,5);

   clilen = sizeof(cli_addr);

   printf("My main process ID : %d\n", getpid());
   while (1) {
      // accept is syscall that blocks processes until client connects.
      // when client connects create a new file descriptor.
      newsockfd = accept(sockfd, (struct sockaddr *) &cli_addr, &clilen);
      if (newsockfd < 0) {
         error("ERROR on accept");
      }

      // create a new process
      pid = fork();
      printf("procecss id %d\n", pid);
      if ( pid < 0 ) {
        error("ERROR on fork");
      } else if (pid == 0) {
        // close unused socket file desccriptor
        close(sockfd);
        // communite with client on new socket that the client bound to
        communicateWithClient(newsockfd);
        // after done talking to client, exit process
        exit(0);
      } else {
        // parent process closes new socket so that it can cleanly create another socket
        // if another client wants to connect
        close(newsockfd);
      }
      
   }

   // never get here
   return 0;
}

void communicateWithClient(int sockfd) {
  // number of characters written in read and write calls
  int n;
  char buffer[256];
  while (1) {
    // bzero(buffer,256);
    // zero out the buffer
    memset(buffer, 0, 256);
    // read is a syscall that blocks until client executes write() and there is data.
    n = read(sockfd,buffer,255);
    if (n < 0) error("ERROR reading from socket");
    printf("Here is the message process %d: %s\n", getpid(), buffer);

    // look for a magic string, and write back that magic string if found
    if (strncmp(KILL_STRING, buffer, KILL_STR_LEN) == 0) {
      n = write(sockfd, KILL_STRING, KILL_STR_LEN);
    } else {
      // write back to the client
      n = write(sockfd,"I got your message",18);
    }
    if (n < 0) error("ERROR writing to socket");
  }
}