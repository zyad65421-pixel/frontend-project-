// --- Theme Setup ---
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon();

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
    if(expenseChartInstance) updateChartTheme();
});

function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

// --- Elements ---
const expenseForm = document.getElementById('expenseForm');
const expenseTitle = document.getElementById('expenseTitle');
const expenseAmount = document.getElementById('expenseAmount');
const expenseCategory = document.getElementById('expenseCategory');
const expensesList = document.getElementById('expensesList');
const filterCategory = document.getElementById('filterCategory');
const exportCSVBtn = document.getElementById('exportCSV');
const triggerClearData = document.getElementById('triggerClearData');
const currentDateEl = document.getElementById('currentDate');

// Summary elements
const todayTotalEl = document.getElementById('todayTotal');
const utilitiesTotalEl = document.getElementById('utilitiesTotal');
const purchasesTotalEl = document.getElementById('purchasesTotal');
const monthTotalEl = document.getElementById('monthTotal');

// Budget elements
const editBudgetBtn = document.getElementById('editBudgetBtn');
const budgetInput = document.getElementById('budgetInput');
const budgetProgressBar = document.getElementById('budgetProgressBar');
const totalBudgetDisplay = document.getElementById('totalBudgetDisplay');
const spentBudgetDisplay = document.getElementById('spentBudgetDisplay');
const remainingBudgetDisplay = document.getElementById('remainingBudgetDisplay');
const budgetStatusEmoji = document.getElementById('budgetStatusEmoji');
const budgetTextMessage = document.getElementById('budgetTextMessage');

// Modals
const confirmModal = document.getElementById('confirmModal');
const cancelClearBtn = document.getElementById('cancelClearBtn');
const confirmClearBtn = document.getElementById('confirmClearBtn');
const budgetModal = document.getElementById('budgetModal');
const cancelBudgetBtn = document.getElementById('cancelBudgetBtn');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');

// --- Initialization ---
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;

// Category Info mapping
const categoryIcons = {
    utilities: { icon: 'fa-bolt', color: '#eab308', bg: 'rgba(234, 179, 8, var(--icon-bg-adjust))', label: 'الكهرباء والمياه' },
    groceries: { icon: 'fa-basket-shopping', color: '#10b981', bg: 'rgba(16, 185, 129, var(--icon-bg-adjust))', label: 'مشتريات وبقالة' },
    housing: { icon: 'fa-house', color: '#3b82f6', bg: 'rgba(59, 130, 246, var(--icon-bg-adjust))', label: 'سكن وإيجار' },
    transportation: { icon: 'fa-car', color: '#8b5cf6', bg: 'rgba(139, 92, 246, var(--icon-bg-adjust))', label: 'مواصلات وبنزين' },
    entertainment: { icon: 'fa-film', color: '#ec4899', bg: 'rgba(236, 72, 153, var(--icon-bg-adjust))', label: 'ترفيه وفسح' },
    health: { icon: 'fa-kit-medical', color: '#ef4444', bg: 'rgba(239, 68, 68, var(--icon-bg-adjust))', label: 'صحة وأدوية' },
    other: { icon: 'fa-layer-group', color: '#64748b', bg: 'rgba(100, 116, 139, var(--icon-bg-adjust))', label: 'أخرى' }
};

// --- Custom Toasts ---
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    
    let icon = 'fa-check-circle';
    if(type === 'error') icon = 'fa-circle-xmark';
    if(type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon} toast-icon ${type}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400); // Wait for animation
    }, 3500);
}

// Set Current Date
function setDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerHTML = `<i class="fa-regular fa-calendar-days" style="margin-left: 5px;"></i> ${new Date().toLocaleDateString('ar-EG', options)}`;
}

// Generate Random ID for expenses
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// --- Add Expense ---
function addExpense(e) {
    e.preventDefault();

    if (expenseTitle.value.trim() === '' || expenseAmount.value.trim() === '') {
        showToast('برجاء إدخال الوصف والمبلغ بشكل صحيح.', 'error');
        return;
    }

    const expense = {
        id: generateID(),
        title: expenseTitle.value,
        amount: parseFloat(expenseAmount.value),
        category: expenseCategory.value,
        date: new Date().toISOString()
    };

    expenses.unshift(expense); // Add to beginning
    updateLocalStorage();
    init();

    showToast('تمت إضافة المصروف بنجاح!', 'success');

    // Reset Form
    expenseTitle.value = '';
    expenseAmount.value = '';
    
    // Animation for button
    const btn = document.querySelector('.btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> تم!';
    btn.style.background = 'var(--success-color)';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 1500);
}

// --- Render Expenses List ---
function renderExpenses(filter = 'all') {
    expensesList.innerHTML = '';
    
    let filteredExpenses = expenses;
    if(filter !== 'all') {
        filteredExpenses = expenses.filter(exp => exp.category === filter);
    }

    if(filteredExpenses.length === 0) {
        expensesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-regular fa-folder-open"></i></div>
                <p>لا توجد مصاريف مطابقة.</p>
                <small>لم تقم بتسجيل أي مصروفات في هذا التصنيف.</small>
            </div>
        `;
        return;
    }

    // Sort by date (newest first)
    const sortedExpenses = [...filteredExpenses].sort((a,b) => new Date(b.date) - new Date(a.date));

    // Display max 50 recent items to keep UI snappy
    sortedExpenses.slice(0, 50).forEach(expense => {
        const expenseEl = document.createElement('div');
        expenseEl.classList.add('expense-item');
        
        const cat = categoryIcons[expense.category] || categoryIcons['other'];
        const expenseDate = new Date(expense.date);
        
        const today = new Date().toDateString();
        let timeString = '';
        if (expenseDate.toDateString() === today) {
            timeString = 'اليوم • ' + expenseDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        } else {
            timeString = expenseDate.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
        }

        expenseEl.innerHTML = `
            <div class="expense-item-info">
                <div class="expense-item-icon" style="background: ${cat.bg}; color: ${cat.color}">
                    <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div class="expense-item-details">
                    <h4>${expense.title}</h4>
                    <p>${cat.label} • ${timeString}</p>
                </div>
            </div>
            <div class="expense-item-price">
                ${expense.amount.toFixed(2)} ج.م
                <button class="delete-btn" onclick="removeExpense(${expense.id})" title="حذف">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        expensesList.appendChild(expenseEl);
    });
}

// --- Calculations & Updates ---
function updateValues() {
    const today = new Date().toDateString();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter todays and monthly expenses
    const todaysExpenses = expenses.filter(exp => new Date(exp.date).toDateString() === today);
    const monthsExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const todayTotal = todaysExpenses.reduce((acc, item) => (acc += item.amount), 0);
    const monthTotal = monthsExpenses.reduce((acc, item) => (acc += item.amount), 0);
    
    const utilitiesTotal = monthsExpenses
        .filter(item => item.category === 'utilities' || item.category === 'housing')
        .reduce((acc, item) => (acc += item.amount), 0);
        
    const purchasesTotal = monthsExpenses
        .filter(item => item.category !== 'utilities' && item.category !== 'housing')
        .reduce((acc, item) => (acc += item.amount), 0);

    // Animate summary counters
    animateValue(todayTotalEl, extractNum(todayTotalEl), todayTotal, 600);
    animateValue(utilitiesTotalEl, extractNum(utilitiesTotalEl), utilitiesTotal, 600);
    animateValue(purchasesTotalEl, extractNum(purchasesTotalEl), purchasesTotal, 600);
    animateValue(monthTotalEl, extractNum(monthTotalEl), monthTotal, 600);

    // Update Budget Tracker
    updateBudgetDisplay(monthTotal);
}

function extractNum(el) {
    return parseFloat(el.innerText.replace(/[^\d.-]/g, '')) || 0;
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = (progress * (end - start) + start).toFixed(2) + ' ج.م';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateBudgetDisplay(monthSpent) {
    totalBudgetDisplay.innerText = monthlyBudget.toFixed(2) + ' ج.م';
    spentBudgetDisplay.innerText = monthSpent.toFixed(2) + ' ج.م';
    
    if (monthlyBudget <= 0) {
        remainingBudgetDisplay.innerText = 'غير محدد';
        budgetProgressBar.style.width = '0%';
        budgetProgressBar.style.backgroundColor = 'var(--text-muted)';
        budgetTextMessage.innerText = 'يرجى تحديد الميزانية لمراقبة مصاريفك.';
        budgetStatusEmoji.innerText = '👀';
        return;
    }

    const remaining = monthlyBudget - monthSpent;
    remainingBudgetDisplay.innerText = remaining.toFixed(2) + ' ج.م';
    
    let percentage = (monthSpent / monthlyBudget) * 100;
    if (percentage > 100) percentage = 100;
    
    budgetProgressBar.style.width = percentage + '%';

    // Update colors and text based on spending
    if (percentage < 50) {
        budgetProgressBar.style.backgroundColor = 'var(--success-color)';
        remainingBudgetDisplay.style.color = 'var(--success-color)';
        budgetTextMessage.innerText = 'أنت تدير مصاريفك بشكل ممتاز!';
        budgetStatusEmoji.innerText = '😎';
    } else if (percentage < 85) {
        budgetProgressBar.style.backgroundColor = 'var(--warning-color)';
        remainingBudgetDisplay.style.color = 'var(--warning-color)';
        budgetTextMessage.innerText = 'انتبه! بدأت تقترب من الحد الأقصى للميزانية.';
        budgetStatusEmoji.innerText = '⚠️';
    } else {
        budgetProgressBar.style.backgroundColor = 'var(--danger-color)';
        remainingBudgetDisplay.style.color = 'var(--danger-color)';
        if(percentage === 100) {
            budgetTextMessage.innerText = 'تحذير: لقد تجاوزت الميزانية المحددة!';
            budgetStatusEmoji.innerText = '🚨';
        } else {
            budgetTextMessage.innerText = 'خطر: أوشكت মيزانيتك على النفاد تماماً!';
            budgetStatusEmoji.innerText = '😨';
        }
    }
}

// Remove expense by ID
window.removeExpense = function(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    updateLocalStorage();
    init();
    showToast('تم حذف المصروف.', 'warning');
};

// Update Local Storage
function updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('monthlyBudget', monthlyBudget.toString());
}

// --- Modals Logic ---
// Clear Data Modal
triggerClearData.addEventListener('click', () => {
    if(expenses.length === 0) {
        showToast('لا توجد بيانات لمسحها', 'warning');
        return;
    }
    confirmModal.classList.remove('hidden');
});

cancelClearBtn.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
});

confirmClearBtn.addEventListener('click', () => {
    expenses = [];
    updateLocalStorage();
    init();
    confirmModal.classList.add('hidden');
    showToast('تم مسح جميع البيانات نهائياً.', 'success');
});

// Budget Modal
editBudgetBtn.addEventListener('click', () => {
    budgetInput.value = monthlyBudget || '';
    budgetModal.classList.remove('hidden');
    budgetInput.focus();
});

cancelBudgetBtn.addEventListener('click', () => {
    budgetModal.classList.add('hidden');
});

saveBudgetBtn.addEventListener('click', () => {
    const newVal = parseFloat(budgetInput.value);
    if(isNaN(newVal) || newVal < 0) {
        showToast('برجاء إدخال مبلغ صحيح.', 'error');
        return;
    }
    monthlyBudget = newVal;
    updateLocalStorage();
    updateValues(); // Update budget UI
    budgetModal.classList.add('hidden');
    showToast('تم حفظ الميزانية الجديدة!', 'success');
});

// Filter
filterCategory.addEventListener('change', (e) => {
    renderExpenses(e.target.value);
});


// Export CSV
exportCSVBtn.addEventListener('click', () => {
    if(expenses.length === 0) {
        showToast('لا توجد بيانات لتصديرها.', 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for arabic
    csvContent += "التاريخ,الوقت,الوصف,التصنيف,المبلغ\n";
    
    expenses.forEach(function(row) {
        const dateObj = new Date(row.date);
        const dateStr = dateObj.toLocaleDateString('ar-EG');
        const timeStr = dateObj.toLocaleTimeString('ar-EG');
        const catLabel = categoryIcons[row.category] ? categoryIcons[row.category].label : categoryIcons['other'].label;
        
        let rowStr = `"${dateStr}","${timeStr}","${row.title}","${catLabel}",${row.amount}`;
        csvContent += rowStr + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "سجل_المصاريف.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('تم تحميل ملف البيانات بنجاح!', 'success');
});

// --- Chart.js Integration ---
let expenseChartInstance = null;

function updateChartTheme() {
    if(expenseChartInstance) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? '#f8fafc' : '#0f172a';
        expenseChartInstance.options.plugins.legend.labels.color = color;
        expenseChartInstance.update();
    }
}

function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Calculate Monthly breakdown by category
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthsExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const categoryTotals = {};
    monthsExpenses.forEach(exp => {
        if(!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
        categoryTotals[exp.category] += exp.amount;
    });

    const labels = [];
    const data = [];
    const backgroundColor = [];

    for(let cat in categoryTotals) {
        labels.push(categoryIcons[cat].label);
        data.push(categoryTotals[cat]);
        backgroundColor.push(categoryIcons[cat].color);
    }

    if(expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    if(data.length === 0) {
        labels.push('لا توجد بيانات هذا الشهر');
        data.push(1);
        backgroundColor.push('rgba(150, 150, 150, 0.2)');
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';

    expenseChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 10 },
            plugins: {
                legend: {
                    position: window.innerWidth < 600 ? 'bottom' : 'right',
                    rtl: true,
                    labels: { color: textColor, font: { family: 'Cairo', size: 13, weight: '600' }, padding: 15 }
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDark ? '#fff' : '#000',
                    bodyColor: isDark ? '#cbd5e1' : '#475569',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            if(context.label === 'لا توجد بيانات هذا الشهر') return ' 0 ج.م';
                            let value = context.raw || 0;
                            return ' ' + value.toFixed(2) + ' ج.م';
                        }
                    },
                    titleFont: { family: 'Cairo', size: 14 },
                    bodyFont: { family: 'Cairo', size: 14, weight: 'bold' },
                }
            }
        }
    });
}

// Init App
function init() {
    setDate();
    renderExpenses(filterCategory.value);
    updateValues();
    updateChart();
}

// Event Listeners
expenseForm.addEventListener('submit', addExpense);

window.addEventListener('resize', () => {
    if(expenseChartInstance) {
        const newPos = window.innerWidth < 600 ? 'bottom' : 'right';
        if(expenseChartInstance.options.plugins.legend.position !== newPos) {
            expenseChartInstance.options.plugins.legend.position = newPos;
            expenseChartInstance.update();
        }
    }
});

// Start
init();
