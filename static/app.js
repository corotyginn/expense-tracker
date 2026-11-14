const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const filterButtons = document.querySelectorAll("#filters button");

let currentCategory = "";
let chart = null;

const LABELS = {
    food: "Еда",
    transport: "Транспорт",
    housing: "Жильё",
    entertainment: "Развлечения",
    health: "Здоровье",
    other: "Другое",
};

async function loadExpenses() {
    const url = currentCategory
        ? `/api/expenses?category=${encodeURIComponent(currentCategory)}`
        : "/api/expenses";
    const res = await fetch(url);
    const expenses = await res.json();
    renderList(expenses);
}

async function loadStats() {
    const res = await fetch("/api/stats");
    const stats = await res.json();
    totalEl.textContent = `${stats.total.toLocaleString("ru-RU")} ₽`;
    renderChart(stats.by_category);
}

function renderList(expenses) {
    if (expenses.length === 0) {
        list.innerHTML = `<li class="empty">Пока нет расходов</li>`;
        return;
    }
    list.innerHTML = expenses
        .map(e => `
        <li>
            <div class="info">
                <span class="title">${escapeHtml(e.title)}</span>
                <span class="meta">${LABELS[e.category] || e.category} · ${e.created_at}</span>
            </div>
            <span class="amount">${e.amount.toLocaleString("ru-RU")} ₽</span>
            <button class="delete" data-id="${e.id}">✕</button>
        </li>`)
        .join("");

    list.querySelectorAll("button.delete").forEach(btn => {
        btn.addEventListener("click", async () => {
            await fetch(`/api/expenses/${btn.dataset.id}`, { method: "DELETE" });
            refresh();
        });
    });
}

function renderChart(byCategory) {
    const ctx = document.getElementById("chart").getContext("2d");
    const labels = byCategory.map(r => LABELS[r.category] || r.category);
    const data = byCategory.map(r => r.total);
    const colors = [
        "#6c5ce7", "#00b894", "#e17055",
        "#0984e3", "#fdcb6e", "#b2bec3",
    ];

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
            }],
        },
        options: {
            plugins: { legend: { position: "right" } },
            cutout: "60%",
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;",
    })[c]);
}

function refresh() {
    loadExpenses();
    loadStats();
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    if (!title || isNaN(amount) || amount <= 0) return;

    await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount, category }),
    });

    form.reset();
    document.getElementById("category").value = "other";
    refresh();
});

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentCategory = btn.dataset.category;
        filterButtons.forEach(b => b.classList.toggle("active", b === btn));
        loadExpenses();
    });
});

refresh();
