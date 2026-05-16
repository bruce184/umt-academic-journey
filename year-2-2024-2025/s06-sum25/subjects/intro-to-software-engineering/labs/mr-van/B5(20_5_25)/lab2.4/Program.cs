bool check_i;
Console.Write("Danh sach cac so nguyen tu 2-100: ");


for (int i = 2; i <= 100; i++)
{
    check_i = true; // giả sử i là số nguyên tố 
    for (int j = 2; j <= i / 2; j++) { // duyệt từ 2-i/2 
        if (i % j == 0)
        {
            check_i = false; // kết luận không phải số nguyên tố 
            break;
        }
    }
}