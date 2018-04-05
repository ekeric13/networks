/*
overthewire ssh -p 2220 bandit0@bandit.labs.overthewire.org
The authenticity of host '[bandit.labs.overthewire.org]:2220 ([176.9.9.172]:2220)' can't be established.
ECDSA key fingerprint is SHA256:98UL0ZWr85496EtCRkKlo20X3OPnyPSB5tB5RPbhczc.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '[bandit.labs.overthewire.org]:2220,[176.9.9.172]:2220' (ECDSA) to the list of known hosts.
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

/tmp/mysupersecretname

find all directories
ls *\/

cat all the files in directory
find . -type f -exec cat {} +;

bandit4
human readable
find . -type f -exec file {} + | grep -w text;
find . (find all)
find -type f (find files)
find -exec file {} (execute command file on what is found)

bandit 5
find . -size 1033c
find . -size 1033c -type f -not -executable -exec file {} + | grep text
find . -size 1033c -type f -not -executable -exec ls -l {} \;

bandit6
find . -size 33c -exec ls -l {} + | grep 33 | grep bandit6

bandit 7
sort data.txt | uniq -u

bandit 9
strings data.txt  | grep =

bandit 11
cat data.txt | tr '[a-z]' '[n-za-m]' | tr '[A-Z]' '[N-ZA-M]'

bandit 12
file [filename] (get info on the file)
gzip -d [file].gz (unzip file)
tar -xvf [file] (get contents of tar)
bzip2 -d [file] (unzip file)

bandit 13
ssh -p 2220 -l bandit13 bandit.labs.overthewire.org

Host name is bandit.labs.overthewire.org 
User: bandit13
password: 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL

ssh -i ./key -l bandit14 localhost
4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e 

bandit 14
echo 4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e | nc localhost 30000
BfMYroe26WYalil77FoDi9qh59eK5xNr

bandit 15
https://www.feistyduck.com/library/openssl-cookbook/online/ch-testing-with-openssl.html
https://www.openssl.org/docs/manmaster/man1/s_client.html

echo BfMYroe26WYalil77FoDi9qh59eK5xNr | openssl s_client -ign_eof -connect localhost:30001
cluFn7wTiGryunymYOu4RcffSxQluehd

bandit 16
nmap localhost -p31000-32000
echo hello | nc localhost [port found]
> should return ssl error if ssl. hello if not ssl

echo BfMYroe26WYalil77FoDi9qh59eK5xNr | openssl s_client -ign_eof -connect localhost:[port no.]

get key

mkdir /tmp/mysupersecretname16
echo "[key]" > sshkey.private
ssh -i ./sshkey.private -l bandit17 localhost
chmod 600 sshkey.private
ssh -i ./sshkey.private -l bandit17 localhost

bandit 17
diff file1 fil2

kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd

bandit 18
ssh -p 2220 -l bandit18 bandit.labs.overthewire.org /bin/sh
-> open remote server in bash, instead of the default user shell
IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x

bandit 19
-rwsr-x---  1 bandit20 bandit19 7408 Dec 28 14:34 bandit20-do
That is the "setuid" bit, which tells the OS to execute that program with the userid of its owner.
./bandit20-do cat /etc/bandit_pass/bandit20
execute "cat /etc/bandit_pass/bandit20" as user 20

GbKksEFF4yrVs6il55v6gwY5aVje5f0j

bandit 20
echo "GbKksEFF4yrVs6il55v6gwY5aVje5f0j" | nc -l 12345
echo "GbKksEFF4yrVs6il55v6gwY5aVje5f0j" | nc -l 12345 & (to run in background)
listen for connection on port 12345
when there is a connection on that port, "echo "GbKksEFF4yrVs6il55v6gwY5aVje5f0j""
and then write our current password to standard-in.

gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr

bandit 21
@reboot bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
run on reboot, as user bandit22. run "/usr/bin/cronjob_bandit22.sh" and redirect output to /dev/null
#!/bin/bash
chmod 644 /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
cat /etc/bandit_pass/bandit22 > /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv

chmod 644 /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
user has rw access
group and everybody has read access to this file

cat /etc/bandit_pass/bandit22 > /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
take contents of this file and put it in tmp file

cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
give us pw.
Yk7owGAcWjwMVRwrTesJEwB7WVOiILLI

bandit 22
#!/bin/bash

myname=$(whoami)
mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)

echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"

cat /etc/bandit_pass/$myname > /tmp/$mytarget

creates a file of /tmp/whatever
that has the password
get whatever by

echo I am user bandit23 | md5sum | cut -d ' ' -f 1

jc1udXuA1tiHqjIsL8yaapX5XIAI6i0n

bandit 24
/usr/bin/cronjob_bandit24.sh

#!/bin/bash

myname=$(whoami)

cd /var/spool/$myname
echo "Executing and deleting all scripts in /var/spool/$myname:"
for i in * .*;
do
    if [ "$i" != "." -a "$i" != ".." ];
    then
  echo "Handling $i"
  timeout -s 9 60 ./$i
  rm -f ./$i
    fi
done


executes the scripts in /var/spool/bandit24, and then deletes them
do not have read access of /var/spool/bandit24, but do have write and execute access

ls /etc/bandit_pass/
ls -la /etc/bandit_pass/bandit24
-r-------- 1 bandit24 bandit24 33 Dec 28 14:34 /etc/bandit_pass/bandit24

to put script into  
/var/spool/bandit24/myscript.sh

chmod 777 /tmp/anothersecret
create a directory that everyone can do stuff to

touch myscript.sh
chmod 777 myscript.sh

nano myscript.sh

cp myscript.sh  /var/spool/bandit24/script.sh
cp myscript.sh  /var/spool/bandit24/

#!/bin/bash

cat /etc/bandit_pass/bandit24 > /tmp/anothersecret/mysecretpassword.txt

ls -la
drwxr-xr-x  2 root root 4096 Dec 28 14:34 .

no write ability. just read and execute.
script.sh


UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ

bandit 25

*/