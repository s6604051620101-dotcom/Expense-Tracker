// ดึง Element HTML ที่ต้องใช้งาน
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('list');
const formEl = document.getElementById('transaction-form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const categoryEl = document.getElementById('category');

// ระบบบันทึกข้อมูล (LocalStorage) โหลดข้อมูลเดิมถ้ามี
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let expenseChart = null;

// ฟังก์ชันจัดรูปแบบตัวเลขให้เป็นเงินบาท (เช่น 1,000.00)
function formatNumber(num) {
    return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 1. หน้า Dashboard สรุปยอด (คำนวณและอัปเดตผลลัพธ์)
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

    // อัปเดตกราฟทุกครั้งที่ยอดเงินเปลี่ยนแปลง
    updateChart();
}

// 3. ตารางประวัติรายการ พร้อมปุ่มลบ
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

// 4. กราฟสรุปสัดส่วนรายจ่าย (Chart.js - โทนสีมินิมอล)
function updateChart() {
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
                // ชุดสีสไตล์มินิมอล (Earth Tone / Pastel)
                backgroundColor: [
                    '#D4A373', // Warm Sand
                    '#CCD5AE', // Sage
                    '#E9EDC9', // Soft Green
                    '#FAEDCD', // Soft Yellow
                    '#F4A261', // Terracotta
                    '#E76F51', // Burnt Orange
                    '#E4E4E7'  // Light Zinc
                ],
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
                    labels: {
                        font: { family: "'Prompt', sans-serif", size: 11 },
                        color: '#71717a', // สีเทาเข้มมินิมอล
                        padding: 15
                    }
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

// ฟังก์ชันเริ่มต้นแอปพลิเคชัน
function init() {
    listEl.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

// 2. ฟอร์มบันทึกรายการ
function addTransaction(e) {
    e.preventDefault(); // ป้องกันเว็บรีเฟรช

    if (textEl.value.trim() === '' || amountEl.value.trim() === '') {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const transaction = {
        id: Date.now(), // สร้าง ID ไม่ซ้ำกันด้วย Timestamp
        text: textEl.value,
        amount: +amountEl.value,
        type: typeEl.value,
        category: categoryEl.value
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();

    // เคลียร์ค่าในฟอร์มหลังกดบันทึก
    textEl.value = '';
    amountEl.value = '';
}

// ฟังก์ชันลบรายการ
function removeTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    updateLocalStorage();
    init();
}

// 5. ระบบบันทึกข้อมูลลงใน LocalStorage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ผูก Event ฟังชั่นตอนกด Submit ฟอร์ม
formEl.addEventListener('submit', addTransaction);

// เริ่มต้นรันโปรแกรม
init();
