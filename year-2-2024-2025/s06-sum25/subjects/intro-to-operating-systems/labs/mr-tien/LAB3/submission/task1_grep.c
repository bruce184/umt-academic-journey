#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <pattern> <filename>\n", argv[0]);
        return 1;
    }

    if (fork() == 0) {
        // Child: replace with grep
        execlp("grep", "grep", argv[1], argv[2], NULL);
        // If exec fails:
        perror("grep");
        return 1;
    }

    // Parent: wait for child and return its exit code
    int status;
    wait(&status);
    return WIFEXITED(status) ? WEXITSTATUS(status) : 1;
}

