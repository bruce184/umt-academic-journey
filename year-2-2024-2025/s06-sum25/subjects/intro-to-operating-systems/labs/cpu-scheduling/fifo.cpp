#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <pthread.h>

// Biến dữ liệu toàn cục có thể truy xuất bởi 2 tuyến
int global_var;
// Khai báo biến mutex toàn cục
pthread_mutex_t a_mutex;

// Khai báo các hàm dùng thực thi tuyến
void* do_thread1(void* data) {
    int i;
    pthread_mutex_lock(&a_mutex); // Khóa mutex
    for (i = 1; i <= 5; i++) {
        printf("Thread 1 count: %d with global value %d \n", i, global_var++);
        sleep(1);
    }
    pthread_mutex_unlock(&a_mutex); // Tháo khóa mutex
    printf("Thread 1 completed!\n");
    return NULL;
}
void* do_thread2(void* data) {
    int i;
    pthread_mutex_lock(&a_mutex); // Khóa
    for (i = 1; i <= 5; i++) {
        printf("Thread 2 count: %d with global value %d \n", i, global_var--);
        sleep(2);
    }
    pthread_mutex_unlock(&a_mutex);
    printf("Thread 2 completed!\n");
    return NULL;
}

// Chương trình chính
int main() {
    int res, i;
    pthread_t p_thread1;
    pthread_t p_thread2;

    // Khởi tạo mutex;
    res = pthread_mutex_init(&a_mutex, NULL);

    if (res != 0) {
        perror("Mutex create error");
        exit(EXIT_FAILURE);
    }

    // Tạo tuyến thứ nhất
    res = pthread_create(&p_thread1, NULL, do_thread1, NULL);
    if (res != 0) {
        perror("Thread 1 create error");
        exit(EXIT_FAILURE);
    }

    // Tạo tuyến thứ hai
    res = pthread_create(&p_thread2, NULL, do_thread2, NULL);
    if (res != 0) {
        perror("Thread 2 create error");
        exit(EXIT_FAILURE);
    }

    // Đợi các tuyến kết thúc
    pthread_join(p_thread1, NULL);
    pthread_join(p_thread2, NULL);

    // Tuyến chính của chương trình
    for (i = 1; i < 20; i++) {
        printf("Main thread waiting %d second ... \n", i);
        sleep(1);
    }

    pthread_mutex_destroy(&a_mutex);
    return 0;
}