import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app,app, resources={r"/*": {"origins": "*"}})

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="stock_system"
    )

@app.route('/get-stock')
def get_stock():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""SELECT id, p_name, category, qty
        FROM products""")
    
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(result)


@app.route('/update-qty', methods=['POST'])
def update_qty():
    data = request.json
    product_id = data['id']
    change = data['change']

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE products SET qty = qty + %s WHERE id = %s",
        (change, product_id)
    )
    conn.commit()

    cursor.close()
    conn.close()
    return jsonify({"status": "ok"})
import os

def get_db():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        database=os.environ.get("DB_NAME"),
        port=int(os.environ.get("DB_PORT", 3306))
    )



if __name__ == '__main__':
    app.run(debug=True)