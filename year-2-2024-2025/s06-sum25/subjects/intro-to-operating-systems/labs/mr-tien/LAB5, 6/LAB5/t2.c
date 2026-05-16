// task2_pipe.c
// Bài 5.4.2 – Pipe một chiều giữa parent và child
// Parent: đọc từ stdin và ghi vào pipe
// Child: đọc từ pipe và in ra màn hình

#include <stdio.h>
#include <stdlib.h>   // cho hàm exit()
#include <unistd.h>   // cho pipe, fork, read, write, close

/**
 * Tiến trình con chỉ đọc từ pipe và in ra stdout.
 */
static void do_child(int data_pipes[]) {
    int c, rc;

    // Đóng đầu ghi, child chỉ đọc
    close(data_pipes[1]);

    // Đọc từng byte cho đến khi hết (EOF)
    while ((rc = read(data_pipes[0], &c, 1)) > 0) {
        putchar(c);
    }
    if (rc < 0) {
        perror("Child: read error");
        // nếu có lỗi thì thoát báo lỗi
        exit(1);
    }

    close(data_pipes[0]);
    // kết thúc con bình thường
    exit(0);
}

/**
 * Tiến trình cha chỉ ghi dữ liệu từ stdin vào pipe.
 */
static void do_parent(int data_pipes[]) {
    int c, rc;

    // Đóng đầu đọc, parent chỉ ghi
    close(data_pipes[0]);

    // Đọc ký tự từ stdin, ghi vào pipe
    while ((c = getchar()) != EOF) {
        rc = write(data_pipes[1], &c, 1);
        if (rc != 1) {
            perror("Parent: write error");
            close(data_pipes[1]);
            exit(1);
        }
    }

    // Đóng đầu ghi để báo EOF cho child
    close(data_pipes[1]);
    // kết thúc cha bình thường
    exit(0);
}

int main(void) {
    int data_pipes[2];
    pid_t pid;

    // Tạo pipe
    if (pipe(data_pipes) == -1) {
        perror("pipe");
        return 1;
    }

    // Tạo tiến trình con
    pid = fork();
    if (pid < 0) {
        perror("fork");
        return 1;
    }

    if (pid == 0) {
        // Child
        do_child(data_pipes);
    } else {
        // Parent
        do_parent(data_pipes);
    }

    // không bao giờ đến đây
    return 0;
}
