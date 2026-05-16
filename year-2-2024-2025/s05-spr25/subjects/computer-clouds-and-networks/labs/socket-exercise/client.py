import socket
import threading
import sys

# Địa chỉ và cổng của máy chủ
HOST = '127.0.0.1'  # Thay đổi nếu server chạy trên máy khác
PORT = 12345        # Phải trùng với cổng của server

def nhan_tin(sock):
    """
    Lắng nghe tin nhắn từ server và in ra màn hình.
    - sock: kết nối socket của client với server.
    """
    while True:
        try:
            tin_nhan = sock.recv(1024)
            if not tin_nhan:
                print("Server đã ngắt kết nối.")
                break
            print(">>", tin_nhan.decode('utf-8'))
        except Exception as loi:
            print("Lỗi khi nhận tin:", loi)
            break

def chay_client():
    # Tạo socket theo giao thức TCP
    ket_noi_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    # Kết nối tới server
    try:
        ket_noi_client.connect((HOST, PORT))
        print(f"Đã kết nối tới server {HOST}:{PORT}")
    except Exception as loi:
        print("Không kết nối được với server:", loi)
        sys.exit()

    # Tạo luồng riêng để lắng nghe tin nhắn từ server
    luong_nhan = threading.Thread(target=nhan_tin, args=(ket_noi_client,))
    luong_nhan.start()

    # Vòng lặp gửi tin nhắn từ bàn phím
    while True:
        tin_gui = input()
        if tin_gui.lower() == 'quit':
            break
        try:
            ket_noi_client.sendall(tin_gui.encode('utf-8'))
        except Exception as loi:
            print("Lỗi khi gửi tin:", loi)
            break

    # Đóng kết nối khi thoát
    ket_noi_client.close()
    print("Client đã thoát.")

if __name__ == "__main__":
    chay_client()
