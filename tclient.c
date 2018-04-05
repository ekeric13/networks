#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h> 
#include <string.h>
#include <unistd.h>
#include "tsocket.h"

// gcc -o tclient tclient.c 
// ./tclient cheerios 51717
// ./tclient localhost 51717
// cc tclient.c -o tclient.out

// localhost is mapped to my own device -> 0.0.0.0 -> 127.0.0.1
// ./tclient localhost 51717
// for ipc on another computer. ifconfig to find ip address
// ./tclient ipaddress 51717
void communicateWithServer(int);

void error(char *msg)
{
  perror(msg);
  exit(0);
}

int main(int argc, char *argv[])
{
  int sockfd, portno;

  struct sockaddr_in serv_addr;
  // will hold info about server host
  struct hostent *server;
  
  if (argc < 3) {
     fprintf(stderr,"usage %s hostname port\n", argv[0]);
     exit(0);
  }

  sockfd = socket(AF_INET, SOCK_STREAM, 0);
  if (sockfd < 0) 
      error("ERROR opening socket");

  // given a host, return a pointer to the hostent structure (which contains info about the host)
  // in order to get this info has to to do a dns lookup
  server = gethostbyname(argv[1]);
  if (server == NULL) {
      fprintf(stderr,"ERROR, no such host\n");
      exit(0);
  }

  // bzero((char *) &serv_addr, sizeof(serv_addr));
  memset((char *) &serv_addr, 0, sizeof(serv_addr));
  serv_addr.sin_family = AF_INET;
  portno = atoi(argv[2]);
  serv_addr.sin_port = htons(portno);

  // copy len bytes of s1 to s2. takes pointer to s1, poitner to s2, and number of bytes to copy
  bcopy((char *)server->h_addr, 
       (char *)&serv_addr.sin_addr.s_addr,
       server->h_length);

  // try to connect to this socket to a server
  // server_addr has info on server port number, and host's ip address
  if (connect(sockfd,(struct sockaddr *)&serv_addr,sizeof(serv_addr)) < 0)  {
    error("ERROR connecting");
  }

  // talk to server
  communicateWithServer(sockfd);
  // never get here
  return 0;
}

void communicateWithServer(int sockfd) {
  int n;
  char buffer[256];
  while (1) {
    printf("Please enter the message: ");
    // takes a stream (in this case standard input), and copies n characters to a string
    // buffer is a pointer to a character array
    memset(buffer, 0, 256);
    fgets(buffer,255,stdin);

    n = write(sockfd,buffer,strlen(buffer));
    if (n < 0) {
     error("ERROR writing to socket");
    }

    memset(buffer, 0, 256);
    n = read(sockfd,buffer,255);
    if (n < 0) {
      error("ERROR reading from socket");
    }
    // printf("%s\n",buffer);
    write(STDOUT_FILENO, buffer, sizeof(buffer) - 1);
    putchar(10);
    // if found magic string, kill process
    if (strncmp(KILL_STRING, buffer, KILL_STR_LEN) == 0) {
      exit(0);
    }
  }
}
