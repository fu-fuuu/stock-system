import { Link } from "react-router-dom";
import "./style.css";

export default function StatusPage() {
  const today = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="status-page">
      <div className="status-header">
        <div className="status-date">{today}</div>
      </div>
      <h2 className="status-title">ประวัติการเปลี่ยนแปลงข้อมูล</h2>
      <h3 className="status-subtitle">รายการที่เพิ่ม</h3>

      <table className="status-table">
        <thead>
          <tr>
            <th>สินค้า</th>
            <th>หมวดหมู่</th>
            <th>จำนวนที่เพิ่ม</th>
            <th>เวลา</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <Link to="/">
          <button className="back-btn">← กลับหน้าหลัก</button>
        </Link>
      </div>
    </div>
  );
}
