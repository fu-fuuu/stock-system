const API_BASE = "https://stock-system-hs80.onrender.com";

let products = [];

fetch(`${API_BASE}/get-stock`)
    .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
    })
    .then(data => {
        products = data;
        loadCategories(products);
    })
    .catch(() => {
        document.getElementById("stock-list").innerText = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
    });

function loadCategories(data) {
    const select = document.getElementById("categorySelect");
    select.innerHTML = '<option value="" selected hidden>หมวดหมู่</option>';

    const categories = [...new Set(
        data.map(p => p.category_name).filter(Boolean)
    )];

    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function filterProducts() {
    const search = document.getElementById("searchInput").value.trim().toLowerCase();
    const category = document.getElementById("categorySelect").value;

    let filtered = products;

    if (search !== "") {
        filtered = filtered.filter(p =>
            p.p_name.toLowerCase().includes(search)
        );
    }

    if (category !== "") {
        filtered = filtered.filter(p =>
            p.category_name === category
        );
    }

    if (filtered.length === 0) {
        document.getElementById("stock-list").innerHTML = "ไม่พบข้อมูล";
        document.getElementById("table-wrapper").style.display = "none";
        return;
    }

    renderStock(filtered);
}

function renderStock(data) {
    const table = document.getElementById("productTable");
    const wrapper = document.getElementById("table-wrapper");

    wrapper.style.display = "block";
    table.innerHTML = "";

    data.forEach(p => {
        table.innerHTML += `
            <tr>
                <td>${p.p_name}</td>
                <td>${p.category_name}</td>
                <td style="text-align:center">
                    <span id="qty-${p.id}">${p.qty}</span>
                </td>
                <td style="text-align:center">
                    <button onclick="changeQty(${p.id}, -1)">➖</button>
                    <button onclick="changeQty(${p.id}, 1)">➕</button>
                </td>
            </tr>
        `;
    });
}

function changeQty(id, change) {
    const el = document.getElementById(`qty-${id}`);
    const current = parseInt(el.textContent);

    if (current + change < 0) return;

    el.textContent = current + change;

    fetch(`${API_BASE}/update-qty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, change })
    }).catch(() => {
        el.textContent = current;
    });
}

function searchByCategory() {
    document.getElementById("searchInput").value = "";
    filterProducts();
}
