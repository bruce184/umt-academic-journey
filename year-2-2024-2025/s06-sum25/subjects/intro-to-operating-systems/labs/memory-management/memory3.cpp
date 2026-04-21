#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#define ONE_K (1024)

int main(){
    char *some_memory; 
    int size_to_allocate = ONE_K; // Kích thước cần cấp phát
    int meg_obtained = 0;
    int ks_obtained = 0; 

    while (1) {
        for (ks_obtained = 0; ks_obtained < 1024; ks_obtained++) {
            some_memory = (char *)malloc(size_to_allocate); // Cấp phát 1KB bộ nhớ
            if (some_memory = NULL) exit(EXIT_FAILURE);
            sprintf(some_memory, "Hello World\n");
        }
        meg_obtained++;
        printf("Now allocated %d Megabytes\n", meg_obtained);
    }
    exit(EXIT_SUCCESS);
}