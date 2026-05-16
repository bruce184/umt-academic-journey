import sys
import socket
import threading
import re
from PyQt6 import QtCore, QtGui, QtWidgets

def parse_rename_message(msg):
    pattern = r"Phòng '(.+)' đã được đổi tên thành '(.+)'"
    match = re.search(pattern, msg)
    if match:
        return match.group(1), match.group(2)
    return None, None

class MessengerClient(QtWidgets.QMainWindow):
    new_message_signal = QtCore.pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.client_socket = None
        self.server_ip = None
        self.server_port = 5555
        self.username = None

        self.initUI()
        self.new_message_signal.connect(self.append_message)

    def initUI(self):
        self.setWindowTitle("Messenger Client (PyQt6)")
        self.resize(800, 600)

        central_widget = QtWidgets.QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QtWidgets.QHBoxLayout(central_widget)

        # ---------------- CỘT TRÁI: Danh sách phòng và các nút chức năng ----------------
        left_frame = QtWidgets.QFrame()
        left_layout = QtWidgets.QVBoxLayout(left_frame)

        room_label = QtWidgets.QLabel("Danh sách phòng:")
        left_layout.addWidget(room_label)

        self.room_list = QtWidgets.QListWidget()
        self.room_list.addItem("General")
        self.room_list.addItem("Tech")
        self.room_list.addItem("Game")
        left_layout.addWidget(self.room_list)

        self.join_room_button = QtWidgets.QPushButton("Tham gia phòng")
        self.join_room_button.clicked.connect(self.join_room)
        left_layout.addWidget(self.join_room_button)

        self.set_topic_button = QtWidgets.QPushButton("Đặt chủ đề")
        self.set_topic_button.clicked.connect(self.set_topic)
        left_layout.addWidget(self.set_topic_button)

        self.choose_leader_button = QtWidgets.QPushButton("Chọn Leader")
        self.choose_leader_button.clicked.connect(self.choose_leader)
        left_layout.addWidget(self.choose_leader_button)

        self.rename_room_button = QtWidgets.QPushButton("Đổi Tên Phòng")
        self.rename_room_button.clicked.connect(self.rename_room)
        left_layout.addWidget(self.rename_room_button)

        self.history_button = QtWidgets.QPushButton("Xem Lịch Sử")
        self.history_button.clicked.connect(self.view_history)
        left_layout.addWidget(self.history_button)

        self.mute_button = QtWidgets.QPushButton("Mute")
        self.mute_button.clicked.connect(self.mute_user)
        left_layout.addWidget(self.mute_button)

        self.unmute_button = QtWidgets.QPushButton("Unmute")
        self.unmute_button.clicked.connect(self.unmute_user)
        left_layout.addWidget(self.unmute_button)

        self.ban_button = QtWidgets.QPushButton("Ban")
        self.ban_button.clicked.connect(self.ban_user)
        left_layout.addWidget(self.ban_button)

        self.unban_button = QtWidgets.QPushButton("Unban")
        self.unban_button.clicked.connect(self.unban_user)
        left_layout.addWidget(self.unban_button)

        self.remove_button = QtWidgets.QPushButton("Remove (Kick)")
        self.remove_button.clicked.connect(self.remove_user)
        left_layout.addWidget(self.remove_button)

        self.readd_button = QtWidgets.QPushButton("Re-add")
        self.readd_button.clicked.connect(self.readd_user)
        left_layout.addWidget(self.readd_button)

        self.nickname_button = QtWidgets.QPushButton("Nickname")
        self.nickname_button.clicked.connect(self.change_nickname)
        left_layout.addWidget(self.nickname_button)

        left_layout.addStretch()
        main_layout.addWidget(left_frame, 1)

        # ---------------- CỘT PHẢI: Khung chat và nhập tin ----------------
        right_frame = QtWidgets.QFrame()
        right_layout = QtWidgets.QVBoxLayout(right_frame)

        self.chat_display = QtWidgets.QTextEdit()
        self.chat_display.setReadOnly(True)
        right_layout.addWidget(self.chat_display, 5)

        bottom_layout = QtWidgets.QHBoxLayout()
        self.message_input = QtWidgets.QLineEdit()
        bottom_layout.addWidget(self.message_input, 4)

        self.send_button = QtWidgets.QPushButton("Gửi")
        self.send_button.clicked.connect(self.send_message)
        bottom_layout.addWidget(self.send_button, 1)

        right_layout.addLayout(bottom_layout)
        main_layout.addWidget(right_frame, 3)

        self.connectToServer()

    def connectToServer(self):
        ip, ok = QtWidgets.QInputDialog.getText(self, "Nhập IP Server", "Server IP:", text="127.0.0.1")
        if not ok or not ip.strip():
            QtWidgets.QMessageBox.warning(self, "Cảnh báo", "Chưa nhập IP. Thoát ứng dụng.")
            sys.exit(0)
        self.server_ip = ip.strip()

        username, ok = QtWidgets.QInputDialog.getText(self, "Đăng nhập", "Tên của bạn:")
        if not ok or not username.strip():
            QtWidgets.QMessageBox.warning(self, "Cảnh báo", "Chưa nhập tên. Thoát ứng dụng.")
            sys.exit(0)
        self.username = username.strip()

        try:
            self.client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.client_socket.connect((self.server_ip, self.server_port))
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Lỗi kết nối", f"Không thể kết nối {self.server_ip}:{self.server_port}\n{e}")
            sys.exit(1)

        self.client_socket.send(self.username.encode('utf-8'))
        t = threading.Thread(target=self.receive_messages, daemon=True)
        t.start()

    def receive_messages(self):
        while True:
            try:
                data = self.client_socket.recv(4096)
                if not data:
                    break
                message = data.decode('utf-8')
                self.new_message_signal.emit(message)
            except:
                break
        self.new_message_signal.emit("Mất kết nối đến server.\n")
        self.client_socket.close()

    @QtCore.pyqtSlot(str)
    def append_message(self, message):
        # Ví dụ: định dạng cơ bản, bạn có thể tùy chỉnh HTML để căn trái/phải
        self.chat_display.append(message)
        if "đã được đổi tên thành" in message:
            old_name, new_name = parse_rename_message(message)
            if old_name and new_name:
                self.update_room_list(old_name, new_name)

    def update_room_list(self, old_name, new_name):
        found_index = None
        for i in range(self.room_list.count()):
            if self.room_list.item(i).text() == old_name:
                found_index = i
                break
        if found_index is not None:
            self.room_list.takeItem(found_index)
        existing = [self.room_list.item(i).text() for i in range(self.room_list.count())]
        if new_name not in existing:
            self.room_list.addItem(new_name)

    def send_message(self):
        text = self.message_input.text().strip()
        if text:
            try:
                self.client_socket.send(text.encode('utf-8'))
                # Bạn có thể thêm định dạng HTML căn phải nếu muốn
                self.chat_display.append(f"{self.username}: {text}")
                self.message_input.clear()
            except Exception as e:
                QtWidgets.QMessageBox.critical(self, "Lỗi", f"Không thể gửi tin.\n{e}")

    def send_command(self, command):
        if self.client_socket:
            try:
                self.client_socket.send(command.encode('utf-8'))
            except Exception as e:
                QtWidgets.QMessageBox.critical(self, "Lỗi", f"Không thể gửi lệnh.\n{e}")

    # ---------------- Các nút chức năng ----------------
    def join_room(self):
        item = self.room_list.currentItem()
        if item:
            room_name = item.text()
            cmd = f"/join {room_name}"
            self.send_command(cmd)
        else:
            QtWidgets.QMessageBox.information(self, "Thông báo", "Vui lòng chọn phòng chat.")

    def set_topic(self):
        topic, ok = QtWidgets.QInputDialog.getText(self, "Đặt chủ đề", "Chủ đề:")
        if ok and topic.strip():
            cmd = f"/settopic {topic.strip()}"
            self.send_command(cmd)

    def choose_leader(self):
        target, ok = QtWidgets.QInputDialog.getText(self, "Chọn Leader", "Tên thành viên:")
        if ok and target.strip():
            cmd = f"/leader {target.strip()}"
            self.send_command(cmd)

    def rename_room(self):
        new_name, ok = QtWidgets.QInputDialog.getText(self, "Đổi Tên Phòng", "Nhập tên mới:")
        if ok and new_name.strip():
            cmd = f"/renameroom {new_name.strip()}"
            self.send_command(cmd)

    def view_history(self):
        date_str, ok = QtWidgets.QInputDialog.getText(self, "Xem Lịch Sử", "Nhập ngày (YYYY-MM-DD):")
        if ok and date_str.strip():
            cmd = f"/history {date_str.strip()}"
            self.send_command(cmd)

    def mute_user(self):
        target, ok = QtWidgets.QInputDialog.getText(self, "Mute Thành viên", "Tên thành viên:")
        if ok and target.strip():
            cmd = f"/mute {target.strip()}"
            self.send_command(cmd)

    def unmute_user(self):
        target, ok = QtWidgets.QInputDialog.getText(self, "Unmute Thành viên", "Tên thành viên:")
        if ok and target.strip():
            cmd = f"/unmute {target.strip()}"
            self.send_command(cmd)

    def ban_user(self):
        target, ok = QtWidgets.QInputDialog.getText(self, "Ban Thành viên", "Tên thành viên:")
        if ok and target.strip():
            cmd = f"/ban {target.strip()}"
            self.send_command(cmd)

    def unban_user(self):
        target, ok = QtWidgets.QInputDialog.getText(self, "Unban Thành viên", "Tên thành viên:")
        if ok and target.strip():
            cmd = f"/unban {target.strip()}"
            self.send_command(cmd)

    def remove_user(self):
        target, ok = QtWidgets.QInputDialog.getText(self, "Remove Thành viên", "Tên thành viên:")
        if ok and target.strip():
            cmd = f"/remove {target.strip()}"
            self.send_command(cmd)

    def readd_user(self):
        target, ok = QtWidgets.QInputDialog.getText(self, "Re-add Thành viên", "Tên thành viên:")
        if ok and target.strip():
            cmd = f"/readd {target.strip()}"
            self.send_command(cmd)

    def change_nickname(self):
        """
        Chỉ cho phép leader đổi nickname cho người khác.
        Yêu cầu nhập: 'target newNick'
        """
        input_str, ok = QtWidgets.QInputDialog.getText(self, "Đổi Nickname", "Nhập 'target newNick':")
        if ok and input_str.strip():
            parts = input_str.strip().split()
            if len(parts) < 2:
                QtWidgets.QMessageBox.information(self, "Lỗi", "Cú pháp: 'target newNick'")
                return
            target = parts[0]
            newNick = parts[1]
            cmd = f"/nickname {target} {newNick}"
            self.send_command(cmd)

    def closeEvent(self, event: QtGui.QCloseEvent):
        if self.client_socket:
            try:
                self.client_socket.close()
            except:
                pass
        event.accept()

def main():
    app = QtWidgets.QApplication(sys.argv)
    window = MessengerClient()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
