import socket
import threading
import sqlite3
import os
from datetime import datetime

# -------------------- Cấu hình --------------------
HOST = '0.0.0.0'
PORT = 5555
DB_FILE = os.path.join(os.getcwd(), 'messenger.db')

# -------------------- Khởi tạo CSDL --------------------
def init_db():
    """
    Khởi tạo cơ sở dữ liệu: tạo bảng Messages nếu chưa tồn tại.
    Bảng Messages: ID, Username, Room, Message, Timestamp.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Messages (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                Username TEXT NOT NULL,
                Room TEXT NOT NULL,
                Message TEXT NOT NULL,
                Timestamp TEXT NOT NULL
            )
        ''')
        conn.commit()
        print(f"[DEBUG] Database initialized at {DB_FILE}")
    except sqlite3.Error as e:
        print("[DEBUG] DB init error:", e)
    finally:
        conn.close()

# -------------------- Cấu trúc lưu client & phòng --------------------
# clients: { client_socket: {'username': str, 'display_name': str, 'room': str or None, 'muted': bool} }
clients = {}
# chat_rooms: { room_name: {'topic': str, 'leader': str or None, 'members': [client_socket, ...], 'banned': set()} }
chat_rooms = {}

# -------------------- Hàm CSDL --------------------
def save_message(username, room, message):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute('''
            INSERT INTO Messages (Username, Room, Message, Timestamp)
            VALUES (?, ?, ?, ?)
        ''', (username, room, message, timestamp))
        conn.commit()
    except sqlite3.Error as e:
        print("Database error in save_message:", e)
    finally:
        conn.close()

def get_history(room, date_str):    
    results = []
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        query = """
            SELECT Username, Message, Timestamp
            FROM Messages
            WHERE Room = ? AND substr(Timestamp, 1, 10) = ?
            ORDER BY Timestamp
        """
        cursor.execute(query, (room, date_str))
        rows = cursor.fetchall()
        for row in rows:
            results.append(f"[{row[2]}] {row[0]}: {row[1]}")
    except sqlite3.Error as e:
        print("Database error in get_history:", e)
    finally:
        conn.close()
    return results

def rename_room_in_db(old_name, new_name):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE ChatRooms SET RoomName = ? WHERE RoomName = ?
        """, (new_name, old_name))
        conn.commit()
    except sqlite3.Error as e:
        print("Database error in rename_room_in_db:", e)
    finally:
        conn.close()

# -------------------- Hàm hỗ trợ --------------------
def broadcast(message, room, sender_socket):
    for sock, info in clients.items():
        if info.get('room') == room and sock != sender_socket:
            try:
                sock.send(message.encode('utf-8'))
            except Exception as e:
                print("Broadcast error:", e)

def find_socket_by_name(name, room=None):
    for sock, info in clients.items():
        if room and info.get('room') != room:
            continue
        if info.get('username') == name or info.get('display_name') == name:
            return sock
    return None

# -------------------- Hàm xử lý client --------------------
def handle_client(client_socket):
    try:
        username = client_socket.recv(1024).decode('utf-8').strip()
        clients[client_socket] = {
            'username': username,
            'display_name': username,
            'room': None,
            'muted': False
        }
        welcome = f"Welcome {username} to Messenger Server!"
        client_socket.send(welcome.encode('utf-8'))
    except Exception as e:
        print("Login error:", e)
        client_socket.close()
        return

    while True:
        try:
            data = client_socket.recv(4096)
            if not data:
                break
            message = data.decode('utf-8').strip()
            if clients[client_socket]['muted'] and not message.startswith('/'):
                client_socket.send("You are muted and cannot send messages.\n".encode('utf-8'))
                continue
            if message.startswith('/'):
                process_command(message, client_socket)
            else:
                room = clients[client_socket]['room']
                if room:
                    disp_name = clients[client_socket]['display_name']
                    full_msg = f"{disp_name}: {message}"
                    broadcast(full_msg, room, client_socket)
                    save_message(disp_name, room, message)
                else:
                    client_socket.send("Join a room first: /join <RoomName>\n".encode('utf-8'))
        except Exception as e:
            print("Error processing client:", e)
            break

    cleanup_client(client_socket)

def cleanup_client(client_socket):
    if client_socket in clients:
        room = clients[client_socket].get('room')
        if room and room in chat_rooms and client_socket in chat_rooms[room]['members']:
            chat_rooms[room]['members'].remove(client_socket)
        del clients[client_socket]
    try:
        client_socket.close()
    except:
        pass
    print("Client disconnected.")

# -------------------- Xử lý lệnh --------------------
def process_command(message, client_socket):
    tokens = message.split()
    cmd = tokens[0].lower()
    user_info = clients[client_socket]
    username = user_info['username']
    disp_name = user_info['display_name']

    if cmd == '/join':
        if len(tokens) < 2:
            client_socket.send("Usage: /join <RoomName>\n".encode('utf-8'))
            return
        room_name = tokens[1]
        if room_name not in chat_rooms:
            chat_rooms[room_name] = {'topic': '', 'leader': None, 'members': [], 'banned': set()}
            client_socket.send(f"Room {room_name} created. No leader yet.\n".encode('utf-8'))
        else:
            client_socket.send(f"Joined room {room_name}.\n".encode('utf-8'))
        if username in chat_rooms[room_name]['banned']:
            client_socket.send("You are banned from this room.\n".encode('utf-8'))
            return
        user_info['room'] = room_name
        if client_socket not in chat_rooms[room_name]['members']:
            chat_rooms[room_name]['members'].append(client_socket)
        broadcast(f"{disp_name} has joined room {room_name}.", room_name, client_socket)

    elif cmd == '/leader':
        if len(tokens) < 2:
            client_socket.send("Usage: /leader <username>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room:
            client_socket.send("Join a room first.\n".encode('utf-8'))
            return
        target_name = tokens[1]
        target_socket = find_socket_by_name(target_name, room)
        if not target_socket:
            client_socket.send(f"User {target_name} not found in room {room}.\n".encode('utf-8'))
            return
        current_leader = chat_rooms[room]['leader']
        if current_leader is None or current_leader == username:
            chat_rooms[room]['leader'] = target_name
            broadcast(f"{target_name} is now the leader of room {room}.", room, None)
        else:
            client_socket.send("Room already has a leader. Cannot change leader.\n".encode('utf-8'))

    elif cmd == '/settopic':
        if len(tokens) < 2:
            client_socket.send("Usage: /settopic <TopicName>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if room:
            if chat_rooms[room]['leader'] == username:
                new_topic = " ".join(tokens[1:])
                chat_rooms[room]['topic'] = new_topic
                broadcast(f"Topic changed to: {new_topic}", room, client_socket)
            else:
                client_socket.send("You are not the leader.\n".encode('utf-8'))
        else:
            client_socket.send("Join a room first.\n".encode('utf-8'))

    elif cmd == '/mute':
        if len(tokens) < 2:
            client_socket.send("Usage: /mute <username>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room or chat_rooms[room]['leader'] != username:
            client_socket.send("You are not the leader.\n".encode('utf-8'))
            return
        target_name = tokens[1]
        target_socket = find_socket_by_name(target_name, room)
        if target_socket:
            clients[target_socket]['muted'] = True
            client_socket.send(f"{target_name} muted.\n".encode('utf-8'))
            target_socket.send("You have been muted by the leader.\n".encode('utf-8'))
        else:
            client_socket.send(f"User {target_name} not found.\n".encode('utf-8'))

    elif cmd == '/unmute':
        if len(tokens) < 2:
            client_socket.send("Usage: /unmute <username>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room or chat_rooms[room]['leader'] != username:
            client_socket.send("You are not the leader.\n".encode('utf-8'))
            return
        target_name = tokens[1]
        target_socket = find_socket_by_name(target_name, room)
        if target_socket:
            clients[target_socket]['muted'] = False
            client_socket.send(f"{target_name} unmuted.\n".encode('utf-8'))
            target_socket.send("You have been unmuted.\n".encode('utf-8'))
        else:
            client_socket.send(f"User {target_name} not found.\n".encode('utf-8'))

    elif cmd == '/ban':
        if len(tokens) < 2:
            client_socket.send("Usage: /ban <username>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room or chat_rooms[room]['leader'] != username:
            client_socket.send("You are not the leader.\n".encode('utf-8'))
            return
        target_name = tokens[1]
        chat_rooms[room].setdefault('banned', set()).add(target_name)
        target_socket = find_socket_by_name(target_name, room)
        if target_socket:
            if target_socket in chat_rooms[room]['members']:
                chat_rooms[room]['members'].remove(target_socket)
            clients[target_socket]['room'] = None
            target_socket.send("You have been banned from the room.\n".encode('utf-8'))
            client_socket.send(f"{target_name} banned from room {room}.\n".encode('utf-8'))
        else:
            client_socket.send(f"{target_name} will be banned from room {room}.\n".encode('utf-8'))

    elif cmd == '/unban':
        if len(tokens) < 2:
            client_socket.send("Usage: /unban <username>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room or chat_rooms[room]['leader'] != username:
            client_socket.send("You are not the leader.\n".encode('utf-8'))
            return
        target_name = tokens[1]
        if target_name in chat_rooms[room].get('banned', set()):
            chat_rooms[room]['banned'].remove(target_name)
            client_socket.send(f"{target_name} unbanned from room {room}.\n".encode('utf-8'))
        else:
            client_socket.send(f"{target_name} is not banned.\n".encode('utf-8'))

    elif cmd == '/remove':
        if len(tokens) < 2:
            client_socket.send("Usage: /remove <username>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room or chat_rooms[room]['leader'] != username:
            client_socket.send("You are not the leader.\n".encode('utf-8'))
            return
        target_name = tokens[1]
        target_socket = find_socket_by_name(target_name, room)
        if target_socket:
            chat_rooms[room]['members'].remove(target_socket)
            clients[target_socket]['room'] = None
            target_socket.send("You have been removed from the room.\n".encode('utf-8'))
            broadcast(f"{target_name} has been removed by the leader.", room, client_socket)
        else:
            client_socket.send(f"User {target_name} not found in room {room}.\n".encode('utf-8'))

    elif cmd == '/readd':
        if len(tokens) < 2:
            client_socket.send("Usage: /readd <username>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room or chat_rooms[room]['leader'] != username:
            client_socket.send("You are not the leader.\n".encode('utf-8'))
            return
        target_name = tokens[1]
        target_socket = find_socket_by_name(target_name)
        if not target_socket:
            client_socket.send(f"User {target_name} is not online.\n".encode('utf-8'))
            return
        old_room = clients[target_socket].get('room')
        if old_room and old_room in chat_rooms and target_socket in chat_rooms[old_room]['members']:
            chat_rooms[old_room]['members'].remove(target_socket)
        clients[target_socket]['room'] = room
        if target_socket not in chat_rooms[room]['members']:
            chat_rooms[room]['members'].append(target_socket)
        target_socket.send(f"You have been re-added to room {room}.\n".encode('utf-8'))
        broadcast(f"{target_name} has been re-added to room {room}.", room, target_socket)

    elif cmd == '/nickname':
        # /nickname <newNick> (self-change) OR /nickname <target> <newNick> (leader-change)
        if len(tokens) == 1:
            client_socket.send("Usage: /nickname <newNick> or /nickname <target> <newNick>\n".encode('utf-8'))
            return
        elif len(tokens) == 2:
            new_nick = tokens[1]
            old_nick = user_info['display_name']
            user_info['display_name'] = new_nick
            client_socket.send(f"Your nickname changed from '{old_nick}' to '{new_nick}'.\n".encode('utf-8'))
        else:
            room = user_info.get('room')
            if not room:
                client_socket.send("You are not in a room.\n".encode('utf-8'))
                return
            if chat_rooms[room]['leader'] != username:
                client_socket.send("You are not the leader; cannot change others' nickname.\n".encode('utf-8'))
                return
            target_name = tokens[1]
            new_nick = tokens[2]
            target_socket = find_socket_by_name(target_name, room)
            if target_socket:
                old_nick = clients[target_socket]['display_name']
                clients[target_socket]['display_name'] = new_nick
                broadcast(f"Leader changed {target_name}'s nickname from '{old_nick}' to '{new_nick}'.", room, None)
            else:
                client_socket.send(f"User {target_name} not found in room {room}.\n".encode('utf-8'))

    elif cmd == '/history':
        if len(tokens) < 2:
            client_socket.send("Usage: /history YYYY-MM-DD\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room:
            client_socket.send("You are not in a room.\n".encode('utf-8'))
            return
        date_str = tokens[1]
        msgs = get_history(room, date_str)
        if msgs:
            client_socket.send(f"History for {date_str}:\n".encode('utf-8'))
            for line in msgs:
                client_socket.send((line + "\n").encode('utf-8'))
        else:
            client_socket.send(f"No messages for {date_str} in room {room}.\n".encode('utf-8'))

    elif cmd == '/renameroom':
        if len(tokens) < 2:
            client_socket.send("Usage: /renameroom <NewRoomName>\n".encode('utf-8'))
            return
        room = user_info.get('room')
        if not room:
            client_socket.send("You are not in a room.\n".encode('utf-8'))
            return
        if chat_rooms[room]['leader'] != username:
            client_socket.send("You are not the leader, cannot rename room.\n".encode('utf-8'))
            return
        new_room_name = tokens[1]
        if new_room_name in chat_rooms:
            client_socket.send(f"Room '{new_room_name}' already exists.\n".encode('utf-8'))
            return
        chat_rooms[new_room_name] = chat_rooms[room]
        del chat_rooms[room]
        for sock in chat_rooms[new_room_name]['members']:
            clients[sock]['room'] = new_room_name
        rename_room_in_db(room, new_room_name)
        broadcast(f"Room '{room}' has been renamed to '{new_room_name}'.", new_room_name, None)
        client_socket.send(f"Room renamed to '{new_room_name}'.\n".encode('utf-8'))

    else:
        client_socket.send("Invalid command.\n".encode('utf-8'))

def start_server():
    init_db()
    try:
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind((HOST, PORT))
        server.listen(5)
        print(f"Server running on {HOST}:{PORT}")
    except Exception as e:
        print("Server init error:", e)
        return

    while True:
        try:
            client_socket, addr = server.accept()
            print(f"Client {addr} connected.")
            threading.Thread(target=handle_client, args=(client_socket,), daemon=True).start()
        except Exception as e:
            print("Accept error:", e)

if __name__ == '__main__':
    start_server()
