// producer.c
// Bài 5.4.4 – Viết dữ liệu 10 MB vào named pipe /tmp/my_fifo

#include <unistd.h>     // access, getpid, close, write, open
#include <stdio.h>      // printf, fprintf, stderr
#include <stdlib.h>     // exit
#include <fcntl.h>      // O_WRONLY, open
#include <limits.h>     // PIPE_BUF
#include <sys/stat.h>   // mkfifo, S_IRUSR, S_IWUSR
#include <sys/types.h>  // mode_t

#define FIFO_NAME   "/tmp/my_fifo"
#define BUFFER_SIZE PIPE_BUF
#define TEN_MEG     (1024 * 1024 * 10)

int main(void) {
    int pipe_fd, res, bytes_sent = 0;
    char buffer[BUFFER_SIZE];

    // Tạo named pipe nếu chưa tồn tại
    if (access(FIFO_NAME, F_OK) == -1) {
        res = mkfifo(FIFO_NAME, S_IRUSR | S_IWUSR);
        if (res != 0) {
            fprintf(stderr, "FIFO object not created [%s]\n", FIFO_NAME);
            exit(1);
        }
    }

    // Mở FIFO để ghi
    printf("Process %d starting to write on pipe\n", getpid());
    pipe_fd = open(FIFO_NAME, O_WRONLY);
    if (pipe_fd == -1) {
        perror("open");
        exit(1);
    }

    // Ghi liên tục cho đến khi đủ 10 MB
    while (bytes_sent < TEN_MEG) {
        res = write(pipe_fd, buffer, BUFFER_SIZE);
        if (res == -1) {
            fprintf(stderr, "Write error on pipe\n");
            close(pipe_fd);
            exit(1);
        }
        bytes_sent += res;
    }

    close(pipe_fd);
    printf("Process %d finished, %d bytes sent\n", getpid(), bytes_sent);
    exit(0);
}
