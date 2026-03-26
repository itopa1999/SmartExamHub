const accessToken = CookieManager.get("access_token");
if (!accessToken) {
    window.location.href = "auth.html";
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Load dashboard stats
    loadDashboardStats();

    // Create particles
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});
async function loadDashboardStats() {
    try {        
        const response = await fetch(`${CORE_URL}/dashboard/stats/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.data) {
            updateDashboardUI(data.data);
        } else {
            console.error('Failed to load dashboard stats:', data.message);
            // If unauthorized, redirect to login
            if (response.status === 401 || response.status === 403) {
                CookieManager.clearAuth();
                window.location.href = 'auth.html';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Update dashboard UI with fetched data
 */
function updateDashboardUI(stats) {
    // Update Total Students
    if (stats.total_students) {
        const studentsValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
        const studentsTrend = document.querySelector('.stat-card:nth-child(1) .stat-trend span');
        const studentsTrendIcon = document.querySelector('.stat-card:nth-child(1) .stat-trend');
        
        if (studentsValue) {
            studentsValue.textContent = stats.total_students.count.toLocaleString();
        }
        if (studentsTrend) {
            studentsTrend.textContent = `${Math.abs(stats.total_students.percentage_change)}% ${stats.total_students.trend === 'up' ? 'increase' : 'decrease'}`;
        }
        if (studentsTrendIcon) {
            studentsTrendIcon.className = `stat-trend trend-${stats.total_students.trend}`;
        }
    }
    
    // Update Active Exams
    if (stats.active_exams) {
        const examsValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
        const examsTrend = document.querySelector('.stat-card:nth-child(2) .stat-trend span');
        
        if (examsValue) {
            examsValue.textContent = stats.active_exams.count;
        }
        if (examsTrend) {
            examsTrend.textContent = `${stats.active_exams.new_today} new today`;
        }
    }
    
    // Update Pending Results
    if (stats.pending_results) {
        const pendingValue = document.querySelector('.stat-card:nth-child(3) .stat-value');
        const pendingTrend = document.querySelector('.stat-card:nth-child(3) .stat-trend span');
        
        if (pendingValue) {
            pendingValue.textContent = stats.pending_results.count;
        }
        if (pendingTrend) {
            pendingTrend.textContent = `${stats.pending_results.processed_today} processed`;
        }
    }
    
    // Update System Status
    if (stats.system_status) {
        const statusValue = document.querySelector('.stat-card:nth-child(4) .stat-value');
        const statusMessage = document.querySelector('.stat-card:nth-child(4) .stat-trend span');
        
        if (statusValue) {
            statusValue.textContent = stats.system_status.status.charAt(0).toUpperCase() + stats.system_status.status.slice(1);
        }
        if (statusMessage) {
            statusMessage.textContent = stats.system_status.message;
        }
    }
}