import os
import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        database=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        port=os.environ.get("DB_PORT", 5432)
    )

@app.route("/get-stock")
def get_stock():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, p_name, qty, category
        FROM products
        ORDER BY created_at DESC
    """)

    rows = cur.fetchall()

    data = []
    for r in rows:
        data.append({
            "id": r[0],
            "p_name": r[1],
            "qty": r[2],
            "category": r[3]
        })

    cur.close()
    conn.close()
    return jsonify(data)

@app.route("/update-qty", methods=["POST"])
def update_qty():
    data = request.json
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
    app.run(debug=True)
