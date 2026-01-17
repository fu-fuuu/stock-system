const API_BASE = "https://stock-system.up.railway.app";
let selectedIndex = -1;
let products = [];
fetch(`${API_BASE}/get-stock`)
    .then(response => response.json())
    .then(data =>{
        const list = document.getElementById("stock-list");
        list.innerHTML ="";

        if(data.length === 0){
            list.innerHTML = "ไม่มีข้อมูลสินค้า";
            return;
        }

        products = data;
        loadCategories(products);

    })
    .catch(err =>{
        document.getElementById("stock-list").innerText =
        "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
        console.error(err);
    })
function loadCategories(data){
    const select = document.getElementById("categorySelect");

    if (!select) {
        console.error("ไม่พบ element id='categorySelect'");
        return;
    }
    select.innerHTML = '<option value="" disabled selected hidden>หมวดหมู่</option>';
    const categories = [...new Set(data.map(p => p.category))];

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}
function showSuggestions(){
    const inputEl = document.getElementById("searchInput");
    const box = document.getElementById("suggestion-box");

    if (!box || !inputEl) return;

    const input = inputEl.value.trim().toLowerCase();
    box.innerHTML = "";

    document.getElementById("categorySelect").value = "";

    if (input === "") {
        box.style.display = "none";
        return;
    }

    const matches = products.filter(p =>
        p.p_name.toLowerCase().includes(input)
    );

    if (matches.length === 0) {
        box.style.display = "none";
        return;
    }

    matches.forEach(p => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = p.p_name;

        div.onclick = () => {
            inputEl.value = p.p_name;
            box.style.display = "none";
        };

        box.appendChild(div);
    });

    box.style.display = "block"; 
    selectedIndex = -1;
}


function filterProducts(){
    const search = document.getElementById("searchInput").value.trim().toLowerCase();
    const category = document.getElementById("categorySelect").value;

    const info = document.getElementById("stock-list");
    const tableWrapper = document.getElementById("table-wrapper");
    const table = document.getElementById("productTable");

    if(search === "" && category === ""){
        info.innerHTML = "<i>กรุณาค้นหาหรือเลือกหมวดหมู่</i>";
        table.innerHTML = "";
        tableWrapper.style.display = "none";
        return;
    }

     let filtered = [];

    if (search !== "") {
        filtered = products.filter(p =>
            p.p_name.toLowerCase().includes(search)
        );
    }

    if (category !== "") {
        filtered = products.filter(p =>
            p.category === category
        );
    }

    if (filtered.length === 0) {
        info.innerHTML = "ไม่พบข้อมูล";
        table.innerHTML = "";
        tableWrapper.style.display = "none";
        return;
    }

    renderStock(filtered);
}

function renderStock(data){
    const tableWrapper = document.getElementById("table-wrapper");
    const table = document.getElementById("productTable");
    const info = document.getElementById("stock-list");

    info.innerHTML = "";
    tableWrapper.style.display = "block";
    table.innerHTML = "";

    data.forEach(p =>{
        table.innerHTML += `
            <tr>
                <td>${p.p_name}</td>
                <td>${p.category}</td>
                 <td style="text-align:center">
                    <span id="qty-${p.id}">
                        ${p.qty}
                    </span>
                </td>

                <td style="text-align:center">
                    <button onclick="changeQtyUI(${p.id}, -1)">➖</button>
                    <button onclick="changeQtyUI(${p.id}, 1)">➕</button>
                </td>
            </tr>
        `;
    });
}
document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) {
        console.error("ไม่พบ searchInput");
        return;
    }

   searchInput.addEventListener("keyup", function (event) {

    if (event.isComposing) return;

    const items = document.querySelectorAll(".suggestion-item");

    if (event.key === "ArrowDown") {
        if (items.length === 0) return;

        selectedIndex = (selectedIndex + 1) % items.length;
        updateActiveSuggestion();
        return;
    }

    if (event.key === "ArrowUp") {
        if (items.length === 0) return;

        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateActiveSuggestion();
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();

        if (selectedIndex >= 0 && items[selectedIndex]) {
            searchInput.value = items[selectedIndex].textContent;
            document.getElementById("suggestion-box").style.display = "none";
        }

        filterProducts();
    }
});

});
function updateActiveSuggestion() {
    const items = document.querySelectorAll(".suggestion-item");

    items.forEach((item, index) => {
        item.classList.toggle("active", index === selectedIndex);
    });
}
function searchByCategory() {
    document.getElementById("searchInput").value = "";
    document.getElementById("suggestion-box").style.display = "none";
    filterProducts();
}
function changeQtyUI(id, change) {
    const qtyEl = document.getElementById(`qty-${id}`);
    let currentQty = parseInt(qtyEl.textContent);

    if (currentQty + change < 0) return;

    const newQty = currentQty + change;
    qtyEl.textContent = newQty;

    fetch(`${API_BASE}/update-stock`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, change })
    })
    .then(res => {
        if (!res.ok) throw new Error("update failed");
        return res.json();
    })
    .catch(err => {
        console.error(err);
        qtyEl.textContent = currentQty; 
        alert("อัปเดตสต๊อกไม่สำเร็จ");
    });
}
