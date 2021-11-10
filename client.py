import socket


class Client:
    HEADER = 64
    PORT = 5050
    SERVER = socket.gethostbyname(socket.gethostname())
    # SERVER = socket.gethostbyname('localhost')
    FORMAT = "utf-8"
    ADDR = (SERVER, PORT)
    DISCONNECTMSG = "!DISCONECT"

    def __init__(self) -> None:
        self.client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.client.connect(self.ADDR)

    def send(self, msg):
        message = msg.encode(self.FORMAT)
        sendLen = str(len(message)).encode(self.FORMAT)
        sendLen += b" " * (self.HEADER - len(sendLen))
        self.client.send(sendLen)
        self.client.send(message)