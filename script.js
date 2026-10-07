// ดึง Element HTML ที่ต้องใช้งาน
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('list');
const formEl = document.getElementById('transaction-form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');

// โหลดข้อมูลเดิมจาก LocalStorage (ถ้ามี) หรือกำหนดให้เป็นอาร์เรย์ว่าง
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// ฟังก์ชันสำหรับจัดรูปแบบตัวเลขให้เป็นเงินบาท (เช่น 1,000.00)
function formatNumber(num) {
    return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ฟังก์ชันอัปเดตยอดรวมและแสดงผลบนหน้าจอ
function updateValues() {
    // แยกยอดรายรับและรายจ่าย
    const amounts = transactions.map(item => item.type === 'income' ? Number(item.amount) : -Number(item.amount));
    
    // คำนวณยอดรวมทั้งหมด
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    
    // คำนวณรายรับรวม
    const income = transactions
        .filter(item => item.type === 'income')
        .reduce((acc, item) => (acc += Number(item.amount)), 0)
        .toFixed(2);
        
    // คำนวณรายจ่ายรวม
    const expense = transactions
        .filter(item => item.type === 'expense')
        .reduce((acc, item) => (acc += Number(item.amount)), 0)
        .toFixed(2);

    // แสดงผลลงในหน้า HTML
    balanceEl.innerText = `฿${formatNumber(total)}`;
    totalIncomeEl.innerText = `฿${formatNumber(income)}`;
    totalExpenseEl.innerText = `฿${formatNumber(expense)}`;
}

// ฟังก์ชันแสดงรายการลงในตาราง/รายการย่อย
function addTransactionDOM(transaction) {
    const sign = transaction.type === 'income' ? '+' : '-';
    const classColor = transaction.type === 'income' ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600';
    const bgBadge = transaction.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50';

    const li = document.createElement('li');
    li.className = `flex justify-between items-center p-3 bg-white rounded-xl border-l-4 ${classColor} shadow-xs transition hover:shadow-md`;

    li.innerHTML = `
        <div>
            <span class="font-medium text-slate-800 text-sm block">${transaction.text}</span>
            <span class="text-xs text-slate-400">${new Date(transaction.id).toLocaleDateString('th-TH')}</span>
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

// ฟังก์ชันเริ่มต้นแอปพลิเคชัน
function init() {
    listEl.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

// ฟังก์ชันเพิ่มรายการใหม่เมื่อกด Submit ฟอร์ม
function addTransaction(e) {
    e.preventDefault(); // ป้องกันไม่ให้เว็บรีเฟรช

    if (textEl.value.trim() === '' || amountEl.value.trim() === '') {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const transaction = {
        id: Date.now(), // ใช้ Timestamp เป็น ID ที่ไม่ซ้ำกัน
        text: textEl.value,
        amount: +amountEl.value,
        type: typeEl.value
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();

    // ล้างค่าในฟอร์มหลังบันทึก
    textEl.value = '';
    amountEl.value = '';
}

// ฟังก์ชันลบรายการ
function removeTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    updateLocalStorage();
    init();
}

// ฟังก์ชันบันทึกข้อมูลลงใน LocalStorage ของบราวเซอร์
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ผูก Event Listener กับฟอร์ม
formEl.addEventListener('submit', addTransaction);

// รันโปรแกรมครั้งแรกเมื่อเปิดเว็บ
init();