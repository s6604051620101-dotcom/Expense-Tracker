const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('list');
const formEl = document.getElementById('transaction-form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const categoryEl = document.getElementById('category');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let incomeChart = null;
let expenseChart = null;

function formatNumber(num) {
    return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateValues() {
    const income = transactions
        .filter(item => item.type === 'income')
        .reduce((acc, item) => (acc += Number(item.amount)), 0);
        
    const expense = transactions
        .filter(item => item.type === 'expense')
        .reduce((acc, item) => (acc += Number(item.amount)), 0);

    const total = income - expense;

    balanceEl.innerText = `฿${formatNumber(total)}`;
    totalIncomeEl.innerText = `฿${formatNumber(income)}`;
    totalExpenseEl.innerText = `฿${formatNumber(expense)}`;

    updateCharts();
}

function addTransactionDOM(transaction) {
    const sign = transaction.type === 'income' ? '+' : '-';
    const textColor = transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600';
    const badgeBg = transaction.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-700';

    const li = document.createElement('li');
    li.className = `flex justify-between items-center p-4 bg-zinc-50/50 rounded-2xl border border-zinc-200/60 transition hover:bg-white hover:shadow-xs`;

    li.innerHTML = `
        <div class="space-y-1">
            <div class="flex items-center gap-2">
                <span class="text-xs px-2.5 py-0.5 rounded-md font-medium ${badgeBg}">${transaction.category}</span>
                <span class="font-medium text-zinc-900 text-sm">${transaction.text}</span>
            </div>
            <span class="text-[11px] text-zinc-400 block">${new Date(transaction.id).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div class="flex items-center gap-3">
            <span class="font-semibold text-sm ${textColor} tracking-tight">
                ${sign}฿${formatNumber(transaction.amount)}
            </span>
            <button onclick="removeTransaction(${transaction.id})" class="text-zinc-300 hover:text-rose-500 p-1 rounded-lg transition cursor-pointer">
                ✕
            </button>
        </div>
    `;

    listEl.appendChild(li);
}

function updateCharts() {
    // --- 1. กราฟรายรับ ---
    const incomeItems = transactions.filter(item => item.type === 'income');
    const incomeTotals = {};
    incomeItems.forEach(item => {
        incomeTotals[item.category] = (incomeTotals[item.category] || 0) + Number(item.amount);
    });
    const incomeLabels = Object.keys(incomeTotals);
    const incomeData = Object.values(incomeTotals);

    const ctxIncome = document.getElementById('incomeChart').getContext('2d');
    if (incomeChart) incomeChart.destroy();

    incomeChart = new Chart(ctxIncome, {
        type: 'doughnut',
        data: {
            labels: incomeLabels.length > 0 ? incomeLabels : ['ยังไม่มีรายรับ'],
            datasets: [{
                data: incomeData.length > 0 ? incomeData : [1],
                backgroundColor: ['#34D399', '#6EE7B7', '#10B981', '#059669', '#A7F3D0', '#E4E4E7'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: "'Prompt', sans-serif", size: 11 }, color: '#71717a', padding: 12 }
                },
                tooltip: {
                    backgroundColor: 'rgba(24, 24, 27, 0.9)',
                    titleFont: { family: "'Prompt', sans-serif" },
                    bodyFont: { family: "'Prompt', sans-serif" },
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            cutout: '72%'
        }
    });

    // --- 2. กราฟรายจ่าย ---
    const expenseItems = transactions.filter(item => item.type === 'expense');
    const expenseTotals = {};
    expenseItems.forEach(item => {
        expenseTotals[item.category] = (expenseTotals[item.category] || 0) + Number(item.amount);
    });
    const expenseLabels = Object.keys(expenseTotals);
    const expenseData = Object.values(expenseTotals);

    const ctxExpense = document.getElementById('expenseChart').getContext('2d');
    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(ctxExpense, {
        type: 'doughnut',
        data: {
            labels: expenseLabels.length > 0 ? expenseLabels : ['ยังไม่มีรายจ่าย'],
            datasets: [{
                data: expenseData.length > 0 ? expenseData : [1],
                backgroundColor: ['#D4A373', '#CCD5AE', '#E9EDC9', '#FAEDCD', '#F4A261', '#E76F51', '#E4E4E7'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: "'Prompt', sans-serif", size: 11 }, color: '#71717a', padding: 12 }
                },
                tooltip: {
                    backgroundColor: 'rgba(24, 24, 27, 0.9)',
                    titleFont: { family: "'Prompt', sans-serif" },
                    bodyFont: { family: "'Prompt', sans-serif" },
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            cutout: '72%'
        }
    });
}

function init() {
    listEl.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

function addTransaction(e) {
    e.preventDefault();

    if (textEl.value.trim() === '' || amountEl.value.trim() === '') {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const transaction = {
        id: Date.now(),
        text: textEl.value,
        amount: +amountEl.value,
        type: typeEl.value,
        category: categoryEl.value
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();

    textEl.value = '';
    amountEl.value = '';
}

function removeTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

formEl.addEventListener('submit', addTransaction);
init();
