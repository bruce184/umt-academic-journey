#include <stdlib.h> 
#define ONE_K (1024) // 1KB bộ nhớ

int main(){
    char *some_memory;
    int exit_code = EXIT_FAILURE;
    some_memory = (char *)malloc(ONE_K); // Cấp phát 1KB bộ nhớ
    if (some_memory != NULL) {
       free(some_memory);
       exit_code = EXIT_SUCCESS;
    }
    exit(exit_code);; 
}