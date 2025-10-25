// AML Pro - Fraud Detection Application (Corrected Version)

// --- Global State Management ---
let currentScreen = 'dashboard';
let transactions = [];
let alerts = [];
let filters = {
    riskLevel: 'all',
    searchTerm: ''
};

// --- Theme Management ---
// Listen for theme changes and screen changes from parent window
window.addEventListener('message', (event) => {
    // Verify the origin for security
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'THEME_CHANGE') {
        const theme = event.data.theme;
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    if (event.data.type === 'SCREEN_CHANGE') {
        const screen = event.data.screen;
        if (screen) {
            switchScreen(screen);
        }
    }
});

// Check for initial theme on load
function checkInitialTheme() {
    // Request theme from parent window
    if (window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_THEME' }, window.location.origin);
    }
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', function() {
    checkInitialTheme();
    initializeApp();
});

async function initializeApp() {
    console.log('Initializing application...');
    
    // Fetch existing data from the backend on page load
    try {
        const response = await fetch('https://yield-aml-detector.onrender.com/transactions/');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        transactions = await response.json(); 
        console.log(`Successfully fetched ${transactions.length} transactions from backend.`);
        
    } catch (error) {
        console.error("Could not fetch transactions:", error);
        showToast('error', 'Connection Failed', 'Could not load data from the backend.');
    }
    
    // Setup all event listeners
    setupNavigation();
    setupFileUpload();
    setupFilters();
    setupSearch();
    // Add other setup calls here if needed, e.g., setupSliders();
    
    // Render the initial screen with the fetched data
    renderDashboard();
    renderTransactions();
    renderAnalysisScreen();
    renderAlerts();
    // renderAlerts(); // You can uncomment this when you have alert logic
    
    console.log('AML Pro application initialized successfully');
}

// --- Navigation System ---
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchScreen(item.dataset.screen));
    });
}

function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenName)?.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.screen === screenName);
    });
    currentScreen = screenName;
}

// --- Dashboard ---
function renderDashboard() {
    renderDashboardMetrics(); 
    renderRecentActivity();
}
function renderDashboardMetrics() {
    // Calculate stats from your live 'transactions' array
    const totalTransactionsToday = transactions.filter(tx => isToday(tx.transaction_date)).length;
    const riskAlerts = transactions.filter(tx => tx.risk_level === 'high').length;

    // A simple compliance score calculation
    const complianceScore = transactions.length > 0
        ? Math.round((1 - (riskAlerts / transactions.length)) * 100)
        : 100; // Default to 100% if there are no transactions

    // Update the HTML elements on the dashboard
    const totalEl = document.getElementById('totalTransactions');
    const alertsEl = document.getElementById('riskAlerts');
    const complianceEl = document.getElementById('complianceScore');

    if (totalEl) totalEl.textContent = totalTransactionsToday.toLocaleString();
    if (alertsEl) alertsEl.textContent = riskAlerts.toLocaleString();
    if (complianceEl) complianceEl.textContent = `${complianceScore}%`;
}

function renderRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    const recent = transactions.slice(0, 5); // Show the 5 most recent transactions
    activityList.innerHTML = recent.map(tx => {
        const riskClass = tx.risk_level.toLowerCase();
        return `
            <div class="activity-item">
                <div class="activity-icon ${riskClass}-risk"><i class="fas fa-exchange-alt"></i></div>
                <div class="activity-content">
                    <div class="activity-title">${tx.transaction_id}</div>
                    <div class="activity-subtitle">${tx.customer_id} → ${tx.counterparty_name}</div>
                </div>
                <div class="activity-meta">
                    <span class="activity-time">${formatTimeAgo(tx.transaction_date)}</span>
                    <div class="activity-amount">$${tx.amount.toLocaleString()}</div>
                </div>
            </div>`;
    }).join('');
}


// --- File Upload ---
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    
    if (!uploadArea || !fileInput || !selectFileBtn) return;
    
    const openFileDialog = () => fileInput.click();
    selectFileBtn.addEventListener('click', openFileDialog);
    uploadArea.addEventListener('click', openFileDialog);
    
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    if (files.length === 0) return;
    const formData = new FormData();
    formData.append("file", files[0]);

    showLoadingOverlay('Processing with AI...');

    fetch('hhttps://yield-aml-detector.onrender.com/analyze-transactions/', { method: 'POST', body: formData })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.detail || 'Server error') });
        return response.json();
    })
    .then(newlyAnalyzed => {
        if (!Array.isArray(newlyAnalyzed) || newlyAnalyzed.length === 0) {
             showToast('info', 'No New Data', 'The uploaded file contains no new transactions.');
             hideLoadingOverlay();
             return;
        }

        transactions = [...newlyAnalyzed, ...transactions];
        hideLoadingOverlay();
        showToast('success', 'Analysis Complete', `Analyzed ${newlyAnalyzed.length} new transactions.`);
    
        const summary = {
            total: newlyAnalyzed.length,
            high: newlyAnalyzed.filter(t => t.risk_level === 'high').length,
            medium: newlyAnalyzed.filter(t => t.risk_level === 'medium').length,
            low: newlyAnalyzed.filter(t => t.risk_level === 'low').length
        };
        setTimeout(() => {
    showResultsModal(summary);
}, 50);

        
        // Refresh the current view
        if (currentScreen === 'dashboard') renderDashboard();
        if (currentScreen === 'monitor') renderTransactions();
        renderAnalysisScreen();
        renderAlerts();
    })
    .catch(error => {
        console.error('Error:', error);
        hideLoadingOverlay();
        showToast('error', 'Processing Failed', error.message);
    });
}

// --- Transaction Monitoring ---
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filters.riskLevel = btn.dataset.filter;
            renderTransactions();
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('transactionSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        filters.searchTerm = e.target.value;
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(renderTransactions, 300);
    });
}

function renderTransactions() {
    const transactionList = document.getElementById('transactionList');
    if (!transactionList) return;
    
    let filtered = [...transactions];
    if (filters.riskLevel !== 'all') {
        filtered = filtered.filter(t => t.risk_level === filters.riskLevel);
    }
    if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(t => 
            t.transaction_id.toLowerCase().includes(term) ||
            t.customer_id.toLowerCase().includes(term) ||
            t.counterparty_name.toLowerCase().includes(term)
        );
    }
    
    transactionList.innerHTML = filtered.length > 0 
        ? filtered.map(createTransactionCard).join('')
        : `<p style="text-align:center; color: var(--gray);">No transactions found.</p>`;
}

function renderAnalysisScreen() {
    // If there's no data, show a default empty state
    if (!transactions || transactions.length === 0) {
        document.getElementById('insightsGrid').innerHTML = '<p style="text-align:center; color: var(--gray);">Upload data to generate analysis.</p>';
        return;
    }

    const total = transactions.length;
    const highRiskCount = transactions.filter(t => t.risk_level === 'high').length;
    const mediumRiskCount = transactions.filter(t => t.risk_level === 'medium').length;

    // --- 1. Calculate and Update Overall Risk Score ---
    const overallScore = Math.round(((highRiskCount * 100) + (mediumRiskCount * 50)) / total) || 0;
    const indicatorEl = document.getElementById('overallRiskIndicator');
    const scoreEl = document.getElementById('overallRiskScore');
    const labelEl = document.getElementById('overallRiskLabel');

    scoreEl.textContent = overallScore;
    indicatorEl.className = 'risk-indicator'; // Reset class
    if (overallScore >= 75) {
        indicatorEl.classList.add('high-risk');
        labelEl.textContent = 'High Risk';
    } else if (overallScore >= 40) {
        indicatorEl.classList.add('medium-risk'); // You may need to add this style in style.css
        labelEl.textContent = 'Medium Risk';
    } else {
        indicatorEl.classList.add('low-risk'); // You may need to add this style
        labelEl.textContent = 'Low Risk';
    }

    // --- 2. Calculate and Update Risk Breakdown ---
    const velocityPercent = Math.round((highRiskCount / total) * 100);
    const amountPercent = Math.round((transactions.filter(t => t.flags.includes("High Amount Flag")).length / total) * 100);
    const behavioralPercent = Math.round((transactions.filter(t => t.flags.includes("ML Anomaly Detected")).length / total) * 100);
    const riskyCounterparties = ["darkweb-market-gamma", "offshore-svc-ltd"];
    const networkPercent = Math.round((transactions.filter(t => riskyCounterparties.includes(t.counterparty_name)).length / total) * 100);

    document.getElementById('velocityFill').style.width = `${velocityPercent}%`;
    document.getElementById('velocityScore').textContent = `${velocityPercent}%`;
    document.getElementById('amountFill').style.width = `${amountPercent}%`;
    document.getElementById('amountScore').textContent = `${amountPercent}%`;
    document.getElementById('behavioralFill').style.width = `${behavioralPercent}%`;
    document.getElementById('behavioralScore').textContent = `${behavioralPercent}%`;
    document.getElementById('networkFill').style.width = `${networkPercent}%`;
    document.getElementById('networkScore').textContent = `${networkPercent}%`;

    // --- 3. Generate and Display Dynamic AI Insights ---
    let insightsHtml = '';
    const sortedByRisk = [...transactions].sort((a, b) => b.risk_score - a.risk_score);
    
    // Insight 1: Highest Risk Transaction
    if (sortedByRisk.length > 0) {
        const highestRisk = sortedByRisk[0];
        insightsHtml += `
            <div class="insight-card">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Highest Risk Transaction (${highestRisk.transaction_id})</h3>
                <p>${highestRisk.ai_analysis}</p>
                <div class="confidence-score">Risk Score: ${highestRisk.risk_score}</div>
            </div>`;
    }

    // Insight 2: ML Anomaly
    const mlAnomaly = transactions.find(t => t.flags.includes("ML Anomaly Detected"));
    if (mlAnomaly) {
        insightsHtml += `
            <div class="insight-card">
                <i class="fas fa-robot"></i>
                <h3>Behavioral Anomaly Detected</h3>
                <p>Transaction ${mlAnomaly.transaction_id} was flagged by the ML model as a statistical outlier based on its amount compared to normal patterns.</p>
                <div class="confidence-score">Model Flag</div>
            </div>`;
    }

    // Insight 3: Risky Network
    const networkRisk = transactions.find(t => riskyCounterparties.includes(t.counterparty_name));
    if (networkRisk) {
         insightsHtml += `
            <div class="insight-card">
                <i class="fas fa-network-wired"></i>
                <h3>High-Risk Network Connection</h3>
                <p>Transaction ${networkRisk.transaction_id} involves a known high-risk counterparty: <strong>${networkRisk.counterparty_name}</strong>.</p>
                <div class="confidence-score">Network Flag</div>
            </div>`;
    }

    document.getElementById('insightsGrid').innerHTML = insightsHtml || '<p style="text-align:center; color: var(--gray);">No significant insights found in this data set.</p>';
}

// In app.js, ADD this new function

function renderAlerts() {
    const highPriorityAlerts = transactions.filter(tx => tx.risk_level === 'high');
    const mediumPriorityAlerts = transactions.filter(tx => tx.risk_level === 'medium');

    // --- 1. Update the Stat Counts ---
    const highEl = document.getElementById('highPriorityCount');
    const mediumEl = document.getElementById('mediumPriorityCount');
    
    if (highEl) highEl.textContent = highPriorityAlerts.length;
    if (mediumEl) mediumEl.textContent = mediumPriorityAlerts.length;
    // For now, "Under Review" and "Resolved" are static
    document.getElementById('underReviewCount').textContent = 0;
    document.getElementById('resolvedCount').textContent = 0;

    // --- 2. Build and Display the Alert Cards ---
    const alertListEl = document.getElementById('alertList');
    if (!alertListEl) return;

    // Combine and sort alerts, high priority first
    const allAlerts = [...highPriorityAlerts, ...mediumPriorityAlerts];

    if (allAlerts.length === 0) {
        alertListEl.innerHTML = `<p style="text-align:center; color: var(--gray);">No active alerts.</p>`;
        return;
    }

    alertListEl.innerHTML = allAlerts.map(tx => {
        const isHigh = tx.risk_level === 'high';
        const priorityClass = isHigh ? 'high-priority' : 'medium-priority';
        const priorityText = isHigh ? 'High' : 'Medium';

        return `
            <div class="alert-card ${priorityClass}">
                <div class="alert-header">
                    <div>
                        <div class="alert-title">Suspicious Activity Detected</div>
                        <div class="alert-description">Transaction ID: <strong>${tx.transaction_id}</strong></div>
                    </div>
                    <div class="alert-priority ${tx.risk_level}">${priorityText}</div>
                </div>
                <div class="alert-details">
                    <div class="alert-detail">
                        <span class="alert-detail-label">Amount</span>
                        <span class="alert-detail-value">$${tx.amount.toLocaleString()}</span>
                    </div>
                    <div class="alert-detail">
                        <span class="alert-detail-label">Risk Score</span>
                        <span class="alert-detail-value">${tx.risk_score}</span>
                    </div>
                    <div class="alert-detail">
                        <span class="alert-detail-label">Customer</span>
                        <span class="alert-detail-value">${tx.customer_id}</span>
                    </div>
                </div>
                <div class="alert-actions">
                    <button class="btn-secondary btn--sm">Mark as Resolved</button>
                    <button class="btn-primary btn--sm">Investigate</button>
                </div>
            </div>
        `;
    }).join('');
}

function createTransactionCard(transaction) {
    const time = formatDateTime(transaction.transaction_date);
    const riskClass = transaction.risk_level.toLowerCase();
    const isDeepAnalyzed = transaction.flags.includes("Deep AI Analyzed");
    const cardClass = isDeepAnalyzed ? 'transaction-card deep-analyzed' : 'transaction-card';
    const flagsHtml = transaction.flags.filter(f => f !== "Deep AI Analyzed").map(flag => `<span class="flag-tag">${flag}</span>`).join('');
    
    return `
        <div class="${cardClass}" data-transaction-id="${transaction.transaction_id}">
            <div class="transaction-header">
                <div>
                    <div class="transaction-id">${transaction.transaction_id}</div>
                    <div class="transaction-time">${time}</div>
                </div>
                <div class="risk-badge ${riskClass}">
                    ${isDeepAnalyzed ? '<i class="fas fa-brain"></i> ' : ''} ${transaction.risk_level.toUpperCase()}
                </div>
            </div>
            <div class="transaction-details">
                <div class="detail-group">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value transaction-amount">$${transaction.amount.toLocaleString()} ${transaction.currency}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Risk Score</span>
                    <div class="risk-score ${riskClass}" style="--score: ${transaction.risk_score}">${transaction.risk_score}</div>
                </div>
                <div class="detail-group">
                    <span class="detail-label">From</span>
                    <span class="detail-value">${transaction.customer_id}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">To</span>
                    <span class="detail-value">${transaction.counterparty_name}</span>
                </div>
            </div>
            ${flagsHtml ? `<div class="transaction-flags">${flagsHtml}</div>` : ''}
            <div class="ai-analysis">
                <h4><i class="fas fa-robot"></i> AI Analysis</h4>
                <p>${transaction.ai_analysis}</p>
            </div>
        </div>`;
}

// --- Modals, Toasts, and Overlays ---
function showLoadingOverlay(message) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.add('active');
    }
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay')?.classList.remove('active');
}

// In app.js, REPLACE the old showResultsModal function with this one

function showResultsModal(summary) {
    const resultsModal = document.getElementById('resultsModal');
    const summaryList = document.getElementById('resultsSummaryList');
    const modalOverlay = resultsModal.querySelector('.modal-overlay'); // Get the overlay element

    if (resultsModal && summaryList && modalOverlay) {
        // 1. Temporarily disable clicks on the overlay
        modalOverlay.classList.add('is-opening');

        // 2. Populate the summary and make the modal visible
        summaryList.innerHTML = `
            <li><span>Total Transactions Analyzed:</span><span>${summary.total}</span></li>
            <li><span>High-Risk Transactions:</span><span class="summary-high">${summary.high}</span></li>
            <li><span>Medium-Risk Transactions:</span><span class="summary-medium">${summary.medium}</span></li>
            <li><span>Low-Risk Transactions:</span><span class="summary-low">${summary.low}</span></li>`;
        resultsModal.classList.add('active');

        // 3. After a safe delay, re-enable clicks on the overlay
        setTimeout(() => {
            modalOverlay.classList.remove('is-opening');
        }, 100); // 100ms is a very safe delay
    }
}
function hideResultsModal() {
    document.getElementById('resultsModal')?.classList.remove('active');
}

function viewResultsAndCloseModal() {
    hideResultsModal();
    switchScreen('monitor');
}

function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toastId = 'toast-' + Date.now();
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = toastId;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast('${toastId}')"><i class="fas fa-times"></i></button>`;
    container.appendChild(toast);
    setTimeout(() => removeToast(toastId), 5000);
}

function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }
}

// --- Utility Functions ---
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
}

function formatTimeAgo(isoString) {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
}

function isToday(isoString) {
    const date = new Date(isoString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// --- Expose functions to global scope for HTML onclick handlers ---
window.hideResultsModal = hideResultsModal;
window.viewResultsAndCloseModal = viewResultsAndCloseModal;
window.removeToast = removeToast;

// --- Add dynamic CSS for animations ---
const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes slideOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }`;
document.head.appendChild(styleSheet);