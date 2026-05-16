#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define CYCLES 3   // Số lần lặp chu kỳ (task1→...→task6) 

sem_t semA;  
sem_t semB;  
sem_t semC;  

void* processA(void *arg) {
    for (int i = 0; i < CYCLES; i++) {
        // Lượt 1 của A: task1
        sem_wait(&semA);
        printf("A: task1\n");
        sem_post(&semB);

        // Lượt 2 của A: task4
        sem_wait(&semA);
        printf("A: task4\n");
        sem_post(&semB);
    }
    return NULL;
}

void* processB(void *arg) {
    for (int i = 0; i < CYCLES; i++) {
        // Lượt 1 của B: task2
        sem_wait(&semB);
        printf("B: task2\n");
        sem_post(&semC);

        // Lượt 2 của B: task5
        sem_wait(&semB);
        printf("B: task5\n");
        sem_post(&semC);
    }
    return NULL;
}

void* processC(void *arg) {
    for (int i = 0; i < CYCLES; i++) {
        // Lượt 1 của C: task3
        sem_wait(&semC);
        printf("C: task3\n");
        sem_post(&semA);

        // Lượt 2 của C: task6
        sem_wait(&semC);
        printf("C: task6\n");
        sem_post(&semA);
    }
    return NULL;
}

int main(void) {
    // 1. Khởi tạo semaphores:
    sem_init(&semA, 0, 1);  // semA=1 để A chạy ngay
    sem_init(&semB, 0, 0);  // semB=0 để B chờ
    sem_init(&semC, 0, 0);  // semC=0 để C chờ

    // 2. Tạo 3 thread (A, B, C)
    pthread_t thrA, thrB, thrC;
    pthread_create(&thrA, NULL, processA, NULL);
    pthread_create(&thrB, NULL, processB, NULL);
    pthread_create(&thrC, NULL, processC, NULL);

    // 3. Chờ cả 3 thread kết thúc
    pthread_join(thrA, NULL);
    pthread_join(thrB, NULL);
    pthread_join(thrC, NULL);

    // 4. Giải phóng semaphores
    sem_destroy(&semA);
    sem_destroy(&semB);
    sem_destroy(&semC);

    return 0;
}
