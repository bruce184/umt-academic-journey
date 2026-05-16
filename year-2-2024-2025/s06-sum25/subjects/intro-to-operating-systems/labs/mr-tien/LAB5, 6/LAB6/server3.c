// server3.c
// Bài 6.3 – Server đa tiến trình phục vụ đồng thời nhiều client
// Mỗi client kết nối, server fork() thêm process để xử lý riêng, rồi tiếp tục accept().

#include <stdio.h>          // printf, perror
#include <stdlib.h>         // exit
#include <unistd.h>         // read, write, close, sleep
#include <signal.h>         // signal, SIGCHLD, SIG_IGN
#include <sys/types.h>      // socket, bind, listen, accept
#include <sys/socket.h>     // AF_INET, SOCK_STREAM
#include <netinet/in.h>     // struct sockaddr_in, htonl, htons, INADDR_ANY

int main(void) {
    int server_fd, client_fd;
    int server_len, client_len;
    struct sockaddr_in server_addr, client_addr;
    char ch;

    // 1) Tạo socket IPv4, TCP
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("socket");
        return 1;
    }

    // 2) Gán địa chỉ: lắng nghe mọi interface, port 9734
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    server_addr.sin_port = htons(9734);
    server_len = sizeof(server_addr);

    // 3) Bind socket với địa chỉ
    if (bind(server_fd, (struct sockaddr *)&server_addr, server_len) < 0) {
        perror("bind");
        close(server_fd);
        return 1;
    }

    // 4) Chuyển sang trạng thái listen, backlog = 5
    if (listen(server_fd, 5) < 0) {
        perror("listen");
        close(server_fd);
        return 1;
    }

    // 5) Bỏ qua SIGCHLD để tránh zombie process
    signal(SIGCHLD, SIG_IGN);

    // 6) Vòng lặp chính: accept và fork để phục vụ từng client
    while (1) {
        printf("Server waiting...\n");

        client_len = sizeof(client_addr);
        client_fd = accept(server_fd,
                           (struct sockaddr *)&client_addr,
                           &client_len);
        if (client_fd < 0) {
            perror("accept");
            continue;  // thử accept client kế tiếp
        }

        // 7) Tạo tiến trình con để xử lý client
        if (fork() == 0) {
            // --- Tiến trình con ---
            // Đọc 1 byte từ client
            if (read(client_fd, &ch, 1) != 1) {
                perror("read");
                close(client_fd);
                return 1;
            }

            // Giả lập xử lý trong 3 giây
            sleep(3);

            // Tăng giá trị byte và gửi lại
            ch++;
            if (write(client_fd, &ch, 1) != 1) {
                perror("write");
                close(client_fd);
                return 1;
            }

            close(client_fd);
            return 0;  // chỉ kết thúc tiến trình con
        }

        // --- Tiến trình cha ---
        close(client_fd);  // đóng socket bên cha
    }

    // Không bao giờ tới đây
    close(server_fd);
    return 0;
}
