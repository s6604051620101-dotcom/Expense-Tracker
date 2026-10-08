const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('list');
const formEl = document.getElementById('transaction-form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const categoryEl = document.getElementById('category');

// 5. ระบบบันทึกข้อมูล (LocalStorage)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let expenseChart = null;

function formatNumber(num) {
    return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 1. หน้า Dashboard สรุปยอด
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

    updateChart();
}

// 3. ตารางประวัติรายการ พร้อมปุ่มลบ
function addTransactionDOM(transaction) {
    const sign = transaction.type === 'income' ? '+' : '-';
    const classColor = transaction.type === 'income' ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600';

    const li = document.createElement('li');
    li.className = `flex justify-between items-center p-3 bg-white rounded-xl border-l-4 ${classColor} shadow-xs transition hover:shadow-md`;

    li.innerHTML = `
        <div>
            <div class="flex items-center space-x-2">
                <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">${transaction.category}</span>
                <span class="font-medium text-slate-800 text-sm">${transaction.text}</span>
            </div>
            <span class="text-xs text-slate-400 mt-1 block">${new Date(transaction.id).toLocaleDateString('th-TH')}</span>
        </div>
        <div class="flex items-center space-x-3">
            <span class="font-semibold text-sm ${classColor}">
                ${sign}฿${formatNumber(transaction.amount)}
            </span>
            <button onclick="removeTransaction(${transaction.id})" class="text-slate-400 hover:text-rose-500 text-xs px-1.5 py-1 rounded cursor-pointer transition">
                ✕
            </button>
        </div>
    `;

    listEl.appendChild(li);
}

// 4. กราฟสรุปสัดส่วน (Chart.js)
function updateChart() {
    // กรองเฉพาะรายการที่เป็นรายจ่ายมาคำนวณแยกตามหมวดหมู่
    const expenseItems = transactions.filter(item => item.type === 'expense');
    
    const categoryTotals = {};
    expenseItems.forEach(item => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const ctx = document.getElementById('expenseChart').getContext('2d');

    if (expenseChart) {
        expenseChart.destroy(); // ล้างกราฟเก่าก่อนวาดใหม่
    }

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length > 0 ? labels : ['ยังไม่มีรายจ่าย'],
            datasets: [{
                data: data.length > 0 ? data : [1],
                backgroundColor: ['#f43f5e', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#cbd5e1']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Prompt', size: 11 }
                    }
                }
            }
        }
    });
}

function init() {
    listEl.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

// 2. ฟอร์มบันทึกรายการ
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