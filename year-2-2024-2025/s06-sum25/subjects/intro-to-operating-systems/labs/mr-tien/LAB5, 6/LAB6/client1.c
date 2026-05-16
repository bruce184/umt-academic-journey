// client1.c  
// Bài 6.1.2.2 – Ví dụ khách hàng AF_UNIX:  
// Tạo socket vô danh, connect tới “server_socket”,  
// gửi 1 byte, đọc lại 1 byte và in ra.

#include <stdio.h>          // printf, perror
#include <sys/types.h>      // socket, connect
#include <sys/socket.h>     // AF_UNIX, SOCK_STREAM
#include <sys/un.h>         // struct sockaddr_un
#include <unistd.h>         // close, read, write
#include <string.h>         // strcpy

int main(void) {
    int sockfd, result, len;
    struct sockaddr_un address;
    char ch = 'A';

    // 1) Tạo socket AF_UNIX STREAM
    sockfd = socket(AF_UNIX, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return 1;
    }

    // 2) Thiết lập tên socket server
    address.sun_family = AF_UNIX;
    strcpy(address.sun_path, "server_socket");
    len = sizeof(address);

    // 3) Kết nối tới server
    result = connect(sockfd, (struct sockaddr *)&address, len);
    if (result == -1) {
        perror("connect");
        close(sockfd);
        return 1;
    }

    // 4) Gửi 1 byte
    if (write(sockfd, &ch, 1) != 1) {
        perror("write");
        close(sockfd);
        return 1;
    }

    // 5) Đọc 1 byte phản hồi
    if (read(sockfd, &ch, 1) != 1) {
        perror("read");
        close(sockfd);
        return 1;
    }

    // 6) In kết quả và đóng socket
    printf("char from server: %c\n", ch);
    close(sockfd);
    return 0;
}
