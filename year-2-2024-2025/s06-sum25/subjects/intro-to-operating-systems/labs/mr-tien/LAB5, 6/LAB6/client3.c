// client3.c
// Kết nối tới server3 trên 127.0.0.1:9734, gửi 1 byte và nhận 1 byte phản hồi

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>

int main(void) {
    int sockfd;
    struct sockaddr_in serv_addr;
    char ch = 'A';

    // 1) Tạo socket IPv4, TCP
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return 1;
    }

    // 2) Thiết lập địa chỉ server: localhost:9734
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port   = htons(9734);
    serv_addr.sin_addr.s_addr = inet_addr("127.0.0.1");

    // 3) Kết nối
    if (connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
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

    // 5) Nhận 1 byte phản hồi
    if (read(sockfd, &ch, 1) != 1) {
        perror("read");
        close(sockfd);
        return 1;
    }

    // 6) In kết quả và đóng socket
    printf("Response from server: %c\n", ch);
    close(sockfd);
    return 0;
}
