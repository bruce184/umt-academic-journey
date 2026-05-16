#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/wait.h>

int main(){
    // Declare 2 pipes 
    int p1[2], p2[2];

    // Create p1, p2 
    if (pipe(p1) == -1) {
        perror("Cannot create pipe 1!");
        return 1;
    }
    if (pipe(p2) == -1) {
        perror("Cannot create pipe 2!");
        return 1;
    }

    // Fork a child process
    pid_t p = fork();
    // If fork fails 
    if (p < 0) {
        perror("Fork child fail");
        return 1;
    }  
    // If this is the child 
    else if (p == 0) {
        close(p1[1]);    // close write end of pipe1
        close(p2[0]);    // close read end of pipe2

        char buf[256];
        // Read message from parent
        read(p1[0], buf, sizeof(buf));
        // Modify message
        strncat(buf, " (modified by child)", sizeof(buf) - strlen(buf) - 1);
        // Send back to parent
        write(p2[1], buf, strlen(buf) + 1);

        printf("Child reads: %s\n", buf);

        close(p1[0]);    // close read end of pipe1
        close(p2[1]);    // close write end of pipe2
    }       
    // If this is the parent 
    else {
        close(p1[0]);    // close read end of pipe1
        close(p2[1]);    // close write end of pipe2

        const char *msg = "Hello from parent";
        // Send message to child
        write(p1[1], msg, strlen(msg) + 1);
        // Read modified message from child
        char buf[256];
        read(p2[0], buf, sizeof(buf));

        printf("Parent reads: %s\n", buf);

        close(p1[1]);    // close write end of pipe1
        close(p2[0]);    // close read end of pipe2

        wait(NULL);      // wait for child to finish
    }

    return 0;
}

