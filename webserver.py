from pathlib import Path
from flask import Flask, Response, request, url_for
import sqlite3
import time

app = Flask(__name__, static_url_path='/static')

DATABASE = Path(
    "slidervals.db"
)


def getDB():
    return sqlite3.connect(DATABASE)


def addToDB(insertVals):
    conn = getDB()
    cursor = conn.cursor()
    cursor.execute("INSERT or replace INTO vals (timestamp, client, value) values (?,?,?)", insertVals)
    conn.commit()


@app.route('/', methods=['GET'])
def initiate():
    return app.send_static_file('index.html')

@app.route('/recentval', methods=['GET'])
def getvals():
    conn = getDB()
    cursor = conn.cursor()
    cursor.execute(f"SELECT MAX(timestamp) timestamp, value, client FROM vals group by client")
    rv = cursor.fetchall()
    cursor.close()
    res = {
        "values": [{
            "timestamp": ts,
            "client": cl,
            "value": vl
        } for (ts, vl, cl) in rv]
    }
    if len(res['values']) < 1:
        return {
            "values": [{
                "timestamp": None,
                "client": None,
                "value": 50
            }]
        }, 200
    else:
        return res, 200


@app.route('/clients', methods=['GET'])
def getclients():
    conn = getDB()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT(client) FROM vals")
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


@app.route('/clientremove', methods=['GET'])
def clientRemove():
    client = request.args.get('client')
    print(str(client))
    conn = getDB()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vals WHERE client = (?)", [client])
    conn.commit()
    return Response(), 200

if __name__ == '__main__':
    app.run()