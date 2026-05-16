// consumer.c
// Bài 5.4.4 – Đọc dữ liệu từ named pipe /tmp/my_fifo đến hết và in tổng số byte đọc được

#include <unistd.h>     // access, getpid, close, read, open
#include <stdio.h>      // printf, fprintf, stderr, perror
#include <stdlib.h>     // exit
#include <fcntl.h>      // O_RDONLY, open
#include <limits.h>     // PIPE_BUF
#include <sys/stat.h>   // (for completeness)
#include <sys/types.h>  // (for completeness)

#define FIFO_NAME   "/tmp/my_fifo"
#define BUFFER_SIZE PIPE_BUF

int main(void) {
    int pipe_fd, res, bytes_read = 0;
    char buffer[BUFFER_SIZE];

    // Mở FIFO để đọc
    printf("Process %d starting to read on pipe\n", getpid());
    pipe_fd = open(FIFO_NAME, O_RDONLY);
    if (pipe_fd == -1) {
        perror("open");
        exit(1);
    }

    // Đọc đến khi hết dữ liệu (write end đóng)
    while ((res = read(pipe_fd, buffer, BUFFER_SIZE)) > 0) {
        bytes_read += res;
    }
    if (res == -1) {
        fprintf(stderr, "Read error on pipe\n");
        close(pipe_fd);
        exit(1);
    }

    close(pipe_fd);
    printf("Process %d finished, %d bytes read\n", getpid(), bytes_read);
    exit(0);
}
