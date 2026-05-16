#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/wait.h>
#include <ctype.h>      // → thêm để dùng toupper()

#define BUF_SIZE 256   // → hằng kích thước buffer

int main(){
    int p1[2], p2[2];

    // Tạo 2 pipe
    if (pipe(p1) == -1) {
        perror("Cannot create pipe 1!");
        return 1;
    }
    if (pipe(p2) == -1) {
        perror("Cannot create pipe 2!");
        return 1;
    }

    pid_t pid = fork();
    if (pid < 0) {
        perror("Fork failed");
        return 1;
    }

    if (pid == 0) {
        // --- Child process ---
        close(p1[1]);    // đóng đầu ghi của pipe1
        close(p2[0]);    // đóng đầu đọc của pipe2

        char buf[BUF_SIZE];
        // Đọc dữ liệu từ parent
        ssize_t n = read(p1[0], buf, sizeof(buf)-1);
        if (n < 0) {
            perror("Child read");
            exit(1);
        }
        buf[n] = '\0';

        // Chuyển toàn bộ ký tự thành chữ HOA
        for (int i = 0; buf[i]; i++) {
            buf[i] = toupper((unsigned char)buf[i]);
        }

        // Gửi kết quả ngược lại cho parent
        if (write(p2[1], buf, strlen(buf)+1) < 0) {
            perror("Child write");
            exit(1);
        }

        close(p1[0]);
        close(p2[1]);
        exit(0);
    }
    else {
        // --- Parent process ---
        close(p1[0]);    // đóng đầu đọc của pipe1
        close(p2[1]);    // đóng đầu ghi của pipe2

        // Đọc chuỗi đầu vào từ người dùng (stdin)
        char msg[BUF_SIZE];
        printf("Enter a string: ");
        if (!fgets(msg, sizeof(msg), stdin)) {
            perror("fgets");
            exit(1);
        }
        // Loại bỏ newline nếu có
        msg[strcspn(msg, "\n")] = '\0';

        // Gửi chuỗi đến child
        if (write(p1[1], msg, strlen(msg)+1) < 0) {
            perror("Parent write");
            exit(1);
        }

        // Nhận kết quả từ child
        char buf[BUF_SIZE];
        ssize_t m = read(p2[0], buf, sizeof(buf)-1);
        if (m < 0) {
            perror("Parent read");
            exit(1);
        }
        buf[m] = '\0';
        printf("Parent reads: %s\n", buf);

        close(p1[1]);
        close(p2[0]);

        wait(NULL);  // chờ child kết thúc
    }

    return 0;
}
