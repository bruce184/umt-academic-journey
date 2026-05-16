#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

// Số đợt đóng hộp (ví dụ: 3 đợt)
#define BATCHES 3

// Semaphores
sem_t semApple;    // 2 lần mỗi đợt
sem_t semCherry;   // 2 lần mỗi đợt
sem_t semPackage;  // báo khi đủ 4 chai (1 tín hiệu)
sem_t semReset;    // báo reset đợt tiếp theo (4 tín hiệu)

// Mutex và biến đếm chia sẻ
pthread_mutex_t mutex;
// Biến để đối chiếu sau mỗi lần sản xuất 
int countApple = 0;
int countCherry = 0;

// Thread sản xuất Táo vàng
void* produce1GA(void *arg) {
    int id = *(int *)arg;  // lấy giá trị int được truyền vào thread khi mới tạo 
    for (int batch = 1; batch <= BATCHES; batch++) {
        sem_wait(&semApple);  // chờ còn quota Táo vàng
        printf("Apple thread %d: Produced a Golden Apple (batch %d)\n", id, batch);

        // Để trong mutex_lock (lock và unlock) để an toàn tăng giá trị 
        pthread_mutex_lock(&mutex); 
        countApple++;
        if (countApple == 2 && countCherry == 2) {
            sem_post(&semPackage);
        }
        pthread_mutex_unlock(&mutex);

        sem_wait(&semReset);  // chờ đợt đóng hộp xong
    }
    return NULL;
}

// Thread sản xuất Hoa anh đào
void* produce1CB(void *arg) {
    int id = *(int *)arg; 
    for (int batch = 1; batch <= BATCHES; batch++) {
        sem_wait(&semCherry);  // chờ còn quota Hoa anh đào
        printf("Cherry thread %d: Produced a Cherry Blossom (batch %d)\n", id, batch);

        pthread_mutex_lock(&mutex);
        countCherry++;
        if (countApple == 2 && countCherry == 2) {
            sem_post(&semPackage);
        }
        pthread_mutex_unlock(&mutex);

        sem_wait(&semReset);  // chờ đợt đóng hộp xong
    }
    return NULL;
}

// Thread đóng hộp
void* packing(void *arg) {
    for (int batch = 1; batch <= BATCHES; batch++) {
        sem_wait(&semPackage);  // chờ đủ 2&2
        printf("Packager: Packaging 2 Golden Apples + 2 Cherry Blossoms (batch %d)\n", batch);

        pthread_mutex_lock(&mutex);
        countApple = 0;
        countCherry = 0;
        pthread_mutex_unlock(&mutex);

        // Mở lại quyền sản xuất cho đợt mới
        sem_post(&semApple);
        sem_post(&semApple);
        sem_post(&semCherry);
        sem_post(&semCherry);

        // Đánh thức 4 thread sản xuất đang chờ
        for (int i = 0; i < 4; i++) {
            sem_post(&semReset);
        }
    }
    return NULL;
}

int main(void) {
    // 1. Khởi tạo semaphores
    sem_init(&semApple,   0, 2);
    sem_init(&semCherry,  0, 2);
    sem_init(&semPackage, 0, 0);
    sem_init(&semReset,   0, 0);

    // 2. Khởi tạo mutex
    pthread_mutex_init(&mutex, NULL);

    // 3. Tạo các thread sản xuất
    pthread_t apples[2], cherries[2];
    int idsA[2] = {1, 2}, idsC[2] = {1, 2};
    for (int i = 0; i < 2; i++) {
        // Chỉnh lại tên hàm: produce1GA và produce1CB
        pthread_create(&apples[i],  NULL, produce1GA,  &idsA[i]);
        pthread_create(&cherries[i], NULL, produce1CB, &idsC[i]);
    }

    // 4. Tạo thread đóng hộp, chỉnh tên hàm thành packing
    pthread_t packager;
    pthread_create(&packager, NULL, packing, NULL);

    // 5. Chờ tất cả thread kết thúc
    for (int i = 0; i < 2; i++) {
        pthread_join(apples[i],  NULL);
        pthread_join(cherries[i], NULL);
    }
    pthread_join(packager, NULL);

    // 6. Giải phóng semaphore và mutex
    sem_destroy(&semApple);
    sem_destroy(&semCherry);
    sem_destroy(&semPackage);
    sem_destroy(&semReset);
    pthread_mutex_destroy(&mutex);

    printf("All batches completed.\n");
    return 0;
}
