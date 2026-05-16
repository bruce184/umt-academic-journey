// server1.c  
// Bài 6.1.2.1 – Ví dụ máy chủ AF_UNIX:  
// Unlink tên cũ, tạo socket, bind, listen, accept,  
// read 1 byte, tăng giá trị, gửi lại và close.

#include <stdio.h>          // printf, perror
#include <sys/types.h>      // socket, bind, listen, accept
#include <sys/socket.h>     // AF_UNIX, SOCK_STREAM
#include <sys/un.h>         // struct sockaddr_un
#include <unistd.h>         // unlink, close, read, write
#include <string.h>         // strcpy

int main(void) {
    int server_fd, client_fd;
    int server_len, client_len;
    struct sockaddr_un server_address, client_address;
    char ch;

    // 1) Bỏ tên socket cũ nếu có
    unlink("server_socket");

    // 2) Tạo socket AF_UNIX STREAM
    server_fd = socket(AF_UNIX, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("socket");
        return 1;
    }

    // 3) Đặt tên cho socket
    server_address.sun_family = AF_UNIX;
    strcpy(server_address.sun_path, "server_socket");
    server_len = sizeof(server_address);
    if (bind(server_fd, (struct sockaddr *)&server_address, server_len) < 0) {
        perror("bind");
        close(server_fd);
        return 1;
    }

    // 4) Chuyển sang trạng thái listen backlog = 5
    if (listen(server_fd, 5) < 0) {
        perror("listen");
        close(server_fd);
        return 1;
    }

    // 5) Vòng lặp accept và xử lý từng client
    while (1) {
        printf("server waiting...\n");
        client_len = sizeof(client_address);
        client_fd = accept(server_fd,
                           (struct sockaddr *)&client_address,
                           &client_len);
        if (client_fd < 0) {
            perror("accept");
            continue;
        }

        // 6) Đọc 1 byte từ client
        if (read(client_fd, &ch, 1) != 1) {
            perror("read");
            close(client_fd);
            continue;
        }

        // 7) Tăng ký tự và gửi lại
        ch++;
        if (write(client_fd, &ch, 1) != 1) {
            perror("write");
        }

        // 8) Đóng kết nối với client
        close(client_fd);
    }

    // Không bao giờ đến đây
    close(server_fd);
    return 0;
}
