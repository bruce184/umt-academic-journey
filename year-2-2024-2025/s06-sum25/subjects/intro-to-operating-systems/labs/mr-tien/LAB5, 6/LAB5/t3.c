// task3_two_way_pipe.c
// Bài 5.4.3 – Giao tiếp hai chiều qua 2 pipe; child chuyển ký tự thường thành hoa

#include <stdio.h>    // printf, perror, getchar, putchar
#include <unistd.h>   // pipe, fork, read, write, close
#include <ctype.h>    // isascii, islower, toupper
#include <stdlib.h>   // exit

/**
 * Tiến trình cha: đọc từ stdin, gửi vào pipe1,
 * nhận kết quả từ pipe2 và in ra.
 */
static void user_handler(int input_pipe[], int output_pipe[])
{
    char c; 
    int rc;

    close(input_pipe[1]);   // không ghi vào pipe đọc
    close(output_pipe[0]);  // không đọc từ pipe ghi

    while ((c = getchar()) > 0) {
        // Gửi ký tự đến child
        rc = write(output_pipe[1], &c, 1);
        if (rc == -1) {
            perror("user_handler: pipe write error");
            close(input_pipe[0]);
            close(output_pipe[1]);
            exit(1);
        }
        // Nhận ký tự đã xử lý từ child
        rc = read(input_pipe[0], &c, 1);
        if (rc <= 0) {
            perror("user_handler: read error");
            close(input_pipe[0]);
            close(output_pipe[1]);
            exit(1);
        }
        putchar(c);
    }

    close(input_pipe[0]);
    close(output_pipe[1]);
    exit(0);
}

/**
 * Tiến trình con: đọc từ pipe1, chuyển chữ thường → hoa,
 * gửi lại qua pipe2.
 */
static void translator(int input_pipe[], int output_pipe[])
{
    char c;
    int rc;

    close(input_pipe[1]);   // không ghi vào pipe đọc
    close(output_pipe[0]);  // không đọc từ pipe ghi

    while (read(input_pipe[0], &c, 1) > 0) {
        if (isascii(c) && islower(c)) {
            c = toupper(c);
        }
        rc = write(output_pipe[1], &c, 1);
        if (rc == -1) {
            perror("translator: write error");
            close(input_pipe[0]);
            close(output_pipe[1]);
            exit(1);
        }
    }

    close(input_pipe[0]);
    close(output_pipe[1]);
    exit(0);
}

int main(void)
{
    int user_to_translator[2];
    int translator_to_user[2];
    int pid;
    int rc;

    // Tạo pipe từ cha → con
    rc = pipe(user_to_translator);
    if (rc == -1) {
        perror("main: pipe user_to_translator error");
        return 1;
    }
    // Tạo pipe từ con → cha
    rc = pipe(translator_to_user);
    if (rc == -1) {
        perror("main: pipe translator_to_user error");
        return 1;
    }

    pid = fork();
    if (pid < 0) {
        perror("main: fork error");
        return 1;
    }
    if (pid == 0) {
        // Child process
        translator(user_to_translator, translator_to_user);
    } else {
        // Parent process
        user_handler(translator_to_user, user_to_translator);
    }

    return 0;
}
