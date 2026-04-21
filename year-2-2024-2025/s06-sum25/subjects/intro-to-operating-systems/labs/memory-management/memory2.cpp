#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#define A_MEGABYTE (1024*1024) // 1MB bộ nhớ

int main(){
    char *some_memory;
    size_t size_to_allocate = A_MEGABYTE; // Kích thước cần cấp phát
    int meg_obtained = 0; 
    while (meg_obtained < 512){
        some_memory = (char *)malloc(size_to_allocate); // Cấp phát 1MB bộ nhớ
        if (some_memory != NULL) {
            meg_obtained++;
            sprintf(some_memory, "Hello Word\n");
            printf("%s - now allocated %d Megabytes\n", some_memory, meg_obtained);
        } else exit (EXIT_FAILURE);
    }
    exit (EXIT_SUCCESS);
}