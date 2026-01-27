from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import psycopg2

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)

def get_db():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        port=int(os.environ.get("DB_PORT", 5432)),
        sslmode="require"
    )

@app.route("/stock-log", methods=["GET"])
def stock_log():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            product_name,
            category_name,
            qty_change,
            created_at
        FROM stock_log
        ORDER BY created_at DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    data = [
        {
            "name": r[0],
            "category": r[1],
            "qty": r[2],
            "time": r[3].strftime("%H:%M")
        }
        for r in rows
    ]

    return jsonify(data)


@app.route("/update-qty", methods=["POST"])
def update_qty():
    data = request.get_json()
    product_id = data["id"]
    change = data["change"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT p.p_name, c.category_name
        FROM products p
        LEFT JOIN category c ON p.category = c.c_id
        WHERE p.id = %s
    """, (product_id,))
    row = cur.fetchone()

    if not row:
        conn.close()
        return jsonify({"error": "product not found"}), 404

    product_name, category_name = row
    cur.execute("""
        UPDATE products
        SET qty = GREATEST(qty + %s, 0)
        WHERE id = %s
    """, (change, product_id))


    cur.execute("""
        INSERT INTO stock_log
        (product_name, category_name, qty_change)
        VALUES (%s, %s, %s)
    """, (product_name, category_name, change))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": "ok"})


@app.route("/stock-log", methods=["GET"])
def get_stock_log():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            product_name,
            category_name,
            qty_change,
            to_char(created_at, 'HH24:MI')
        FROM stock_log
        ORDER BY created_at DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    data = [
        {
            "name": r[0],
            "category": r[1],
            "qty": r[2],
            "time": r[3]
        }
        for r in rows
    ]

    return jsonify(data)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
