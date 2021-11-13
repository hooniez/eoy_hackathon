import socket
import threading
import requests

HEADER = 64
PORT = 5050
# SERVER = socket.gethostbyname(socket.gethostname())
SERVER = socket.gethostbyname('localhost')
ADDR = (SERVER, PORT)
FORMAT = "utf-8"
DISCONNECTMSG = "!DISCONECT"

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(ADDR)

clientVals = {}

def closeConnection(conn, clientKey):
    req = requests.get(f'http://127.0.0.1:5000/clientremove?client={clientKey}')
    clientVals.pop(clientKey, None)
    conn.close()


def handleClient(conn, addr):
    print(f"NEW CONNECTION: {addr} connected.")
    clientKey = f"{addr[0].replace('.', '')}{addr[1]}"
    print(clientKey)
    clientVals[clientKey] = 50
    connected = True
    while connected:
        try:
            msgLen = conn.recv(HEADER).decode(FORMAT)
        except ConnectionResetError:
            closeConnection(conn, clientKey)
            return
        
        if msgLen:
            msgLen = int(msgLen)
            try:
                msg =  conn.recv(msgLen).decode(FORMAT)
            except ConnectionResetError:
                closeConnection(conn, clientKey)
                return
            

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
    
    closeConnection(conn, clientKey)



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