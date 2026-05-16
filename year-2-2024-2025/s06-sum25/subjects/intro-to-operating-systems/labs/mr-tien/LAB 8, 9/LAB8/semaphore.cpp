#include <stdio.h> 
#include <unistd.h> 
#include <stdlib.h> 
#include <pthread.h> 
#include <semaphore.h> 
int product_val = 2;    // Sản phẩm ban đầu trong kho  
sem_t semaphore;        // Khai báo đối tượng semaphore

// Hàm thực thi tuyến 
void* do_thread (void* data){
    printf ("Consumer thread function is running ... \n");
    while (1){
        sem_wait (&semaphore);
        product_val--;
        printf ("Consumer produc_val = %d \n", product_val);
        sleep(1);
    }
    pthread_exit(NULL);
}

// Chương trình chính 
int main(){
    int res, i; 
    pthread_t a_thread; 
    void* thread_result;

    // Khởi tạo đối tượng semaphore - Ở đây ta đặt giá trị cho semaphore là 2
    res = sem_init (&semaphore, 0, 2); // sửa sem_innit -> sem_init
    if (res != 0){
        perror ("Semaphore init error"); // sửa inint -> init
        exit (EXIT_FAILURE);
    }

    // Khởi tạo tuyến đóng vai trò người tiêu thụ - consumer
    res = pthread_create (&a_thread, NULL, do_thread, NULL); // sửa a_threa -> a_thread
    if (res != 0){
        perror ("Thread create error");
        exit (EXIT_FAILURE);
    }

    // Tuyến chính đóng vai trò người sản xuất 
    for (i = 0; i < 5; i++){
        product_val++;
        printf ("Producer_product_val = %d \n\n", product_val);
        sem_post (&semaphore);
        sleep(2);
    }

    printf ("All done\n");
    exit (EXIT_SUCCESS); // thêm dấu chấm phẩy
    return 0; 
}