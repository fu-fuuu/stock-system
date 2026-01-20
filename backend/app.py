import os
import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_db():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        port=int(os.environ.get("DB_PORT", 5432)),
        sslmode="require"
    )

@app.route("/get-stock", methods=["GET"])
def get_stock():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.id,
            p.p_name,
            p.qty,
            c.category_name
        FROM products p
        LEFT JOIN category c
            ON p.category = c.c_id
        ORDER BY p.id DESC
    """)

    rows = cur.fetchall()

    data = [
        {"id": r[0], "p_name": r[1], "qty": r[2], "category_name": r[3]}
        for r in rows
    ]

    cur.close()
    conn.close()
    return jsonify(data)

@app.route("/update-qty", methods=["POST"])
def update_qty():
    data = request.get_json()
    product_id = data["id"]
    change = data["change"]

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE products SET qty = qty + %s WHERE id = %s",
        (change, product_id)
    )
    conn.commit()

    cur.close()
    conn.close()
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)