import socket
import threading

HOST = '0.0.0.0'  # Lắng nghe trên tất cả các địa chỉ
PORT = 12345

# Danh sách các client đang kết nối với server
danh_sach_khach = []

def xu_ly_khach(conn, dia_chi):
    """
    Hàm chạy trên mỗi luồng để xử lý tin nhắn từ từng client.
    """
    print(f"[KẾT NỐI MỚI] {dia_chi} đã kết nối.")
    try:
        while True:
            # Nhận tin nhắn từ client
            tin_nhan = conn.recv(1024)
            if not tin_nhan:
                # Client ngắt kết nối
                print(f"[NGẮT KẾT NỐI] {dia_chi} đã ngắt kết nối.")
                break
            
            # Server in ra để kiểm soát (debug)
            print(f"Nhận được tin nhắn từ {dia_chi}: {tin_nhan.decode('utf-8')}")

            # Phát (broadcast) tin nhắn này tới tất cả các client khác
            phat_tin_nhan(tin_nhan, conn)
    except Exception as loi:
        print(f"[LỖI] {dia_chi}: {loi}")
    finally:
        # Ngắt kết nối và xóa client khỏi danh sách
        conn.close()
        if conn in danh_sach_khach:
            danh_sach_khach.remove(conn)

def phat_tin_nhan(tin_nhan, nguoi_gui):
    """
    Gửi (broadcast) tin_nhan đến tất cả client khác (ngoại trừ người gửi).
    """
    for khach in danh_sach_khach:
        if khach != nguoi_gui:
            try:
                khach.sendall(tin_nhan)
            except Exception as loi:
                print(f"[LỖI GỬI TIN] {loi}")

def chay_server():
    # Tạo socket server TCP
    server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((HOST, PORT))
    server_sock.listen(5)
    print(f"Server đang lắng nghe tại {HOST}:{PORT} ...")

    while True:
        # Chấp nhận kết nối từ client
        conn, dia_chi_khach = server_sock.accept()
        danh_sach_khach.append(conn)
        
        # Tạo luồng mới xử lý client này
        thread = threading.Thread(target=xu_ly_khach, args=(conn, dia_chi_khach))
        thread.start()

if __name__ == "__main__":
    chay_server()
