// client2.c
// Bài 6.2.8 – Ví dụ khách AF_INET: kết nối tới 127.0.0.1:9734, gửi/nhận 1 byte

#include <stdio.h>          // printf, perror
#include <sys/types.h>      // socket, connect
#include <sys/socket.h>     // AF_INET, SOCK_STREAM
#include <unistd.h>         // read, write, close
#include <netinet/in.h>     // struct sockaddr_in, htons
#include <arpa/inet.h>      // inet_addr

int main(void) {
    int sockfd, result, len;
    struct sockaddr_in address;
    char ch = 'A';

    // 1) Tạo socket IPv4, TCP
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return 1;
    }

    // 2) Thiết lập địa chỉ server: 127.0.0.1:9734
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr("127.0.0.1");
    address.sin_port = htons(9734);
    len = sizeof(address);

    // 3) Kết nối
    result = connect(sockfd, (struct sockaddr *)&address, len);
    if (result == -1) {
        perror("Oops: client2 problem");
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

    // 6) In và đóng socket
    printf("char from server: %c\n", ch);
    close(sockfd);
    return 0;
}
