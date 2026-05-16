// handle_sigint.c
// Bài 5.4.1 – Bắt và chặn tín hiệu SIGINT (Ctrl+C)

#include <stdio.h>
#include <unistd.h>
#include <signal.h>
#include <stdlib.h>    /* cho exit() */

/**
 * Hàm xử lý tín hiệu SIGINT: in cảnh báo và đăng ký lại handler
 */
static void catch_int(int sig) {
    // Đăng ký lại handler để vẫn bắt được Ctrl+C lần sau
    if (signal(SIGINT, catch_int) == SIG_ERR) {
        perror("signal");
        exit(1);
    }
    printf("Do not press Ctrl+C\n");
}

int main(void) {
    int count = 0;

    // Đặt bẫy tín hiệu SIGINT
    if (signal(SIGINT, catch_int) == SIG_ERR) {
        perror("signal");
        exit(1);
    }

    // Vòng lặp vô hạn: mỗi giây in "Counting … X"
    while (1) {
        printf("Counting … %d\n", count++);
        sleep(1);
    }

    // (Không bao giờ đến đây; dùng exit(0) thay vì return)
    exit(0);
}
