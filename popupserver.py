import socket
import threading
import requests

HEADER = 64
PORT = 5050
SERVER = socket.gethostbyname(socket.gethostname())
ADDR = (SERVER, PORT)
FORMAT = "utf-8"
DISCONNECTMSG = "!DISCONECT"

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(ADDR)

clientVals = {}

def handleClient(conn, addr):
    print(f"NEW CONNECTION: {addr} connected.")
    clientKey = f"{addr[0].replace('.', '')}{addr[1]}"
    print(clientKey)
    clientVals[clientKey] = 50
    connected = True
    while connected:
        msgLen = conn.recv(HEADER).decode(FORMAT)
        if msgLen:
            msgLen = int(msgLen)
            msg =  conn.recv(msgLen).decode(FORMAT)
            if msg == DISCONNECTMSG:
                connected = False
            else:
                clientVals[clientKey] = msg

            sendVals = {
                "client": clientKey,
                "value": clientVals[clientKey]
            }

            req = requests.post('http://127.0.0.1:5000/datadump', data=sendVals)
            print(f"[{addr}] {msg}")
            
    clientVals.pop(clientKey, None)
    conn.close()


def start():
    server.listen()
    print(f"listening on {SERVER}")
    while True:
        conn, addr = server.accept()
        thread = threading.Thread(target=handleClient, args=(conn, addr))
        thread.start()
        print(f"ACTIVE CONNECTIONS: {threading.active_count() - 1}")


if __name__ == "__main__":
    print("Server is starting")
    start()