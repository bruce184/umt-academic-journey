#include <unistd.h> 
#include <stdlib.h>
#define ONE_K (1024) 

int main(){
    char *some_memory; 
    char *scane_ptr; 
    some_memory = (char *)malloc(ONE_K);            // Cấp phát 1KB bộ nhớ
    if (some_memory == NULL) exit(EXIT_FAILURE);    // Kiểm tra cấp phát thành công
    scane_ptr = some_memory;                        // Trỏ đến vùng nhớ đã cấp phát
    while (1) {
        *scan_ptr = "\0";
        scan_ptr++;
    }
    exit(EXIT_SUCCESS);
}