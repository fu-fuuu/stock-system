import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./style.css";

const API_BASE = "https://stock-system-hs80.onrender.com";

export default function StockSystem() {
  const [menuOpen,setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const PLACEHOLDER = "__placeholder__";
  const [category, setCategory] = useState(PLACEHOLDER);

  useEffect(() => {
  fetch(`${API_BASE}/get-stock`)
    .then(res => res.json())
    .then(data => {
      const cats = [...new Set(
        data.map(p => p.category_name).filter(Boolean)
      )];

      setProducts(data);
      setFiltered(data);       
      setCategories(cats);      
      setShowTable(true);       
    })
    .catch(() => {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    });
}, []);

  const filterProducts = () => {
    let result = products;

    if (search.trim() !== "") {
      result = result.filter(p =>
        p.p_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "") {
      result = result.filter(p => p.category_name === category);
    }

    if (result.length === 0) {
      setFiltered([]);
      setShowTable(false);
      return;
    }

    setFiltered(result);
    setShowTable(true);
    setShowHint(false);
  };

  const changeQty = (id, change) => {
    setFiltered(prev =>
      prev.map(p =>
        p.id === id && p.qty + change >= 0
          ? { ...p, qty: p.qty + change }
          : p
      )
    );

    fetch(`${API_BASE}/update-qty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, change })
    });
  };

  return (
    <div>
      <button
  className="menu-btn"
  onClick={() => setMenuOpen(true)}
>
 ☰
</button>
      <h2>ระบบจัดการคลังสินค้า</h2>
  <div className="filter-bar">

    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="ค้นหารายการ"
        value={search}
        onChange={e => {
          const value = e.target.value;
          setSearch(value);

        if (value.trim() === "") {
          setSuggestions([]);
          return;
        }

        const match = products
          .filter(p =>
            p.p_name.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 5);

        setSuggestions(match);
      }}
    />

    {suggestions.length > 0 && (
      <div className="suggestion-box">
        {suggestions.map(p => (
          <div
            key={p.id}
            className="suggestion-item"
            onClick={() => {
              setSearch(p.p_name);
              setSuggestions([]);
              setFiltered([p]);
              setShowTable(true);
              setShowHint(false);
            }}
          >
            {p.p_name}
          </div>
        ))}
      </div>
    )}
  </div>


  <span className="or-text">หรือ</span>


  <select
  value={category}
  onChange={e => {
    const value = e.target.value;

    setCategory(value);
    setSearch("");
    setSuggestions([]);

    const result = products.filter(
      p => p.category_name === value
    );
    setFiltered(result);
    setShowTable(true);
    setShowHint(false);
  }}
>
  <option value="">
    หมวดหมู่
  </option>

  {categories.map(cat => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>



  <button onClick={filterProducts}>ค้นหา</button>
</div>



      {showHint && (
        <div className="hint-overlay" onClick={() => setShowHint(false)}>
          <div className="hint-box" onClick={e => e.stopPropagation()}>
            กรุณาค้นหาหรือเลือกหมวดหมู่
          </div>
        </div>
      )}

      {showTable && (
        <table>
          <thead>
            <tr>
              <th>ชื่อสินค้า</th>
              <th>หมวดหมู่</th>
              <th>จำนวน</th>
              <th>ลด/เพิ่ม</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{p.p_name}</td>
                <td>{p.category_name}</td>
                <td style={{ textAlign: "center" }}>{p.qty}</td>
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => changeQty(p.id, -1)}>➖</button>
                  <button onClick={() => changeQty(p.id, 1)}>➕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {menuOpen && (
  <>
    {/* overlay */}
    <div
      className="menu-overlay"
      onClick={() => setMenuOpen(false)}
    />

    {/* drawer */}
    <div className="slide-menu">
      <h3>เมนู</h3>

      <Link
        to="/status"
        onClick={() => setMenuOpen(false)}
        className="menu-link"
      >
        ประวัติการเปลี่ยนแปลงข้อมูล
      </Link>
    </div>
  </>
)}

    </div>
  );
}
