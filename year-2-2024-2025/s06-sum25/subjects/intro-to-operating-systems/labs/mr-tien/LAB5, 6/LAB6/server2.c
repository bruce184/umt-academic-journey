// server2.c
// Bài 6.2.8 – Ví dụ chủ AF_INET: lắng nghe 127.0.0.1:9734, accept, xử lý 1 byte

#include <stdio.h>          // printf, perror
#include <sys/types.h>      // socket, bind, listen, accept
#include <sys/socket.h>     // AF_INET, SOCK_STREAM
#include <unistd.h>         // read, write, close
#include <netinet/in.h>     // struct sockaddr_in, htons
#include <arpa/inet.h>      // inet_addr
#include <string.h>         // memset

int main(void) {
    int server_fd, client_fd;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len;
    char ch;

    // 1) Tạo socket IPv4, TCP
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("socket");
        return 1;
    }

    // 2) Thiết lập địa chỉ: 127.0.0.1:9734
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    server_addr.sin_port = htons(9734);

    // 3) Gán tên với socket
    if (bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind");
        close(server_fd);
        return 1;
    }

    // 4) Chuyển sang listen với backlog = 5
    if (listen(server_fd, 5) < 0) {
        perror("listen");
        close(server_fd);
        return 1;
    }

    // 5) Vòng lặp accept và xử lý
    while (1) {
        printf("server waiting...\n");
        client_len = sizeof(client_addr);
        client_fd = accept(server_fd,
                           (struct sockaddr *)&client_addr,
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

        // 7) Tăng byte và gửi lại
        ch++;
        if (write(client_fd, &ch, 1) != 1) {
            perror("write");
        }

        // 8) Đóng kết nối với client
        close(client_fd);
    }

    // không bao giờ đến đây
    close(server_fd);
    return 0;
}
