#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
  pid_t pid = fork();
  if (pid < 0) {
    fprintf(stderr, "Cannot create child process!cif the fork() function returns -1\n");
    return 1;
  }
  if (pid == 0) {
    // child
    for (int i = 0; i < 5; i++)
      printf("This is a child process!\n");
  } else {
    // parent
    for (int i = 0; i < 3; i++)
      printf("This is a parent process!\n");
    wait(NULL);  // wait for child if you want ordering
  }
  return 0;
}

