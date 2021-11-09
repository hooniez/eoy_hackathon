from pathlib import Path
from flask import Flask, Response, request, url_for
import sqlite3
import time

app = Flask(__name__, static_url_path='/static')

DATABASE = Path(
    "slidervalues.db"
)


def getDB():
    return sqlite3.connect(DATABASE)


def addToDB(insertVals):
    conn = getDB()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO slidervals (timestamp, client, value) values (?,?,?)", insertVals)
    conn.commit()


@app.route('/', methods=['GET'])
def initiate():
    return app.send_static_file('index.html')

@app.route('/recentval', methods=['GET'])
def getvals():
    conn = getDB()
    cursor = conn.cursor()
    cursor.execute(f"SELECT MAX(timestamp) timestamp, value, client FROM slidervals group by client")
    rv = cursor.fetchall()
    cursor.close()
    res = {"values": [{
        "timestamp": ts,
        "client": cl,
        "value": vl
    } for (ts, cl, vl) in rv]}
    return res, 200


@app.route('/clients', methods=['GET'])
def getclients():
    conn = getDB()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT(client) FROM slidervals")
    rv = cursor.fetchall()
    cursor.close()
    clients = [cl[0] for cl in rv]
    return {"clients": clients}, 200


@app.route('/datadump', methods=['POST'])
def dataDump():
    form = request.form
    insertVals = (str(time.time()), form.get('client'), form.get('value'))
    print(insertVals)
    addToDB(insertVals)
    return Response(), 200


if __name__ == '__main__':
    app.run(debug=True)