// Initial data structure
const initialData = {
  overallProgress: 0,
  currentStatus: "لم يبدأ",
  lastUpdated: new Date().toISOString(),
  categories: [
    { name: "نقل العملاء", progress: 0, status: "لم يبدأ" },
    { name: "ربط أودو", progress: 0, status: "لم يبدأ" },
    { name: "ربط بوابات الدفع", progress: 0, status: "لم يبدأ" },
    { name: "إعداد المواقع الجغرافية", progress: 0, status: "لم يبدأ" },
    { name: "تطوير القالب", progress: 0, status: "لم يبدأ" },
    { name: "الاختبارات", progress: 0, status: "لم يبدأ" }
  ],
  updates: []
};

// Load data from localStorage
function loadData() {
  const saved = localStorage.getItem('migrationData');
  if (saved) {
    const savedData = JSON.parse(saved);
    // Check if old data (4 categories) - if so, use new structure
    if (savedData.categories && savedData.categories.length === 4) {
      return initialData;
    }
    return savedData;
  }
  return initialData;
}

// Save data to localStorage
function saveData(data) {
  localStorage.setItem('migrationData', JSON.stringify(data));
}

// Format date in Arabic
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('ar-EG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get status class
function getStatusClass(status) {
  switch (status) {
    case 'مكتمل': return 'status-complete';
    case 'جاري العمل': return 'status-in-progress';
    default: return 'status-not-started';
  }
}

// Get update class
function getUpdateClass(type) {
  return `update-${type}`;
}

// Calculate overall progress
function calculateOverallProgress(categories) {
  const total = categories.reduce((sum, cat) => sum + cat.progress, 0);
  return Math.round(total / categories.length);
}

// Load Status Page
function loadStatusPage() {
  const data = loadData();
  
  // Update overall progress
  document.getElementById('progressText').textContent = data.overallProgress + '%';
  document.getElementById('overallProgress').style.width = data.overallProgress + '%';
  document.getElementById('lastUpdate').textContent = 'آخر تحديث: ' + formatDate(data.lastUpdated);
  
  const statusBadge = document.getElementById('statusBadge');
  statusBadge.textContent = data.currentStatus;
  statusBadge.className = 'status-badge ' + getStatusClass(data.currentStatus);
  
  // Load updates
  const updatesContainer = document.getElementById('updatesContainer');
  if (data.updates.length === 0) {
    updatesContainer.innerHTML = '<p class="empty-state">لا توجد تحديثات بعد</p>';
  } else {
    updatesContainer.innerHTML = data.updates.map(update => `
      <div class="update-card ${getUpdateClass(update.type)}">
        <div class="update-header">
          <svg class="update-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="update-content">
            <div class="update-title-row">
              <h3 class="update-title">${update.title}</h3>
              <span class="update-time">${formatDate(update.timestamp)}</span>
            </div>
            ${update.description ? `<p class="update-description">${update.description}</p>` : ''}
            
            <div class="comments-divider"></div>
            <div class="comments-section">
              <div class="comments-header">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span>التعليقات (${update.comments?.length || 0})</span>
              </div>
              
              ${update.comments && update.comments.length > 0 ? `
                <div class="comments-list">
                  ${update.comments.map(comment => `
                    <div class="comment">
                      <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-time">${formatDate(comment.timestamp)}</span>
                      </div>
                      <p class="comment-text">${comment.text}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              <div class="comment-form">
                <input type="text" placeholder="اسمك (اختياري)" class="input" id="commenterName_${update.id}">
                <div style="display: flex; gap: 0.5rem;">
                  <input type="text" placeholder="أضف تعليقاً..." class="input" id="commentText_${update.id}" style="flex: 1; margin-bottom: 0;">
                  <button onclick="addComment(${update.id})" class="btn btn-primary">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Load categories
  const categoriesGrid = document.getElementById('categoriesGrid');
  categoriesGrid.innerHTML = data.categories.map(category => `
    <div class="category-card">
      <div class="category-header">
        <h3 class="category-name">${category.name}</h3>
        <span class="category-status ${getStatusClass(category.status)}">${category.status}</span>
      </div>
      <div class="category-progress-bar">
        <div class="category-progress-fill" style="width: ${category.progress}%"></div>
      </div>
      <div class="category-progress-text">${category.progress}%</div>
    </div>
  `).join('');
}

// Add comment
function addComment(updateId) {
  const commentText = document.getElementById('commentText_' + updateId).value.trim();
  const commenterName = document.getElementById('commenterName_' + updateId).value.trim() || 'مجهول';
  
  if (!commentText) {
    alert('الرجاء إدخال تعليق');
    return;
  }
  
  const data = loadData();
  data.updates = data.updates.map(update => {
    if (update.id === updateId) {
      return {
        ...update,
        comments: [
          ...(update.comments || []),
          {
            id: Date.now(),
            text: commentText,
            author: commenterName,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
    return update;
  });
  
  saveData(data);
  loadStatusPage();
}

// Dashboard Functions
function initDashboard() {
  checkAuth();
}

function handleLogin() {
  const password = document.getElementById('passwordInput').value;
  if (password === 'admin123') {
    localStorage.setItem('isAuthenticated', 'true');
    showDashboard();
  } else {
    alert('كلمة المرور غير صحيحة');
  }
}

function checkAuth() {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  if (isAuth) {
    showDashboard();
  }
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.remove('hidden');
  loadDashboard();
}

function loadDashboard() {
  const data = loadData();
  
  // Load category controls
  const categoryControls = document.getElementById('categoryControls');
  categoryControls.innerHTML = data.categories.map((category, index) => `
    <div class="category-control">
      <div class="category-label">${category.name}</div>
      <input type="range" min="0" max="100" value="${category.progress}" 
             onchange="updateCategoryProgress(${index}, this.value)" 
             class="category-slider">
      <div class="category-value">${category.progress}%</div>
      <select onchange="updateCategoryStatus(${index}, this.value)" class="select" style="width: 150px; margin-bottom: 0;">
        <option ${category.status === 'لم يبدأ' ? 'selected' : ''}>لم يبدأ</option>
        <option ${category.status === 'جاري العمل' ? 'selected' : ''}>جاري العمل</option>
        <option ${category.status === 'مكتمل' ? 'selected' : ''}>مكتمل</option>
      </select>
    </div>
  `).join('');
  
  // Load updates management
  const updatesManagement = document.getElementById('updatesManagement');
  if (data.updates.length === 0) {
    updatesManagement.innerHTML = '<p class="empty-state">لا توجد تحديثات</p>';
  } else {
    updatesManagement.innerHTML = data.updates.map(update => `
      <div class="update-item">
        <div class="update-info-text">
          <h3 class="update-item-title">${update.title}</h3>
          <p class="update-item-desc">${update.description || ''}</p>
          <div class="update-item-meta">
            <span>${formatDate(update.timestamp)}</span>
            <span>${update.comments?.length || 0} تعليق</span>
          </div>
        </div>
        <button onclick="deleteUpdate(${update.id})" class="delete-btn">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    `).join('');
  }
}

function updateCategoryProgress(index, value) {
  const data = loadData();
  data.categories[index].progress = parseInt(value);
  
  // Recalculate overall progress
  data.overallProgress = calculateOverallProgress(data.categories);
  
  // Update status
  if (data.overallProgress === 0) {
    data.currentStatus = "لم يبدأ";
  } else if (data.overallProgress === 100) {
    data.currentStatus = "مكتمل";
  } else {
    data.currentStatus = "جاري العمل";
  }
  
  data.lastUpdated = new Date().toISOString();
  saveData(data);
  loadDashboard();
}

function updateCategoryStatus(index, status) {
  const data = loadData();
  data.categories[index].status = status;
  data.lastUpdated = new Date().toISOString();
  saveData(data);
  loadDashboard();
}

function handleAddUpdate() {
  const title = document.getElementById('updateTitle').value.trim();
  const description = document.getElementById('updateDescription').value.trim();
  const type = document.getElementById('updateType').value;
  
  if (!title) {
    alert('الرجاء إدخال عنوان التحديث');
    return;
  }
  
  const data = loadData();
  const newUpdate = {
    id: Date.now(),
    title,
    description,
    type,
    timestamp: new Date().toISOString(),
    comments: []
  };
  
  data.updates.unshift(newUpdate);
  data.lastUpdated = new Date().toISOString();
  saveData(data);
  
  // Clear form
  document.getElementById('updateTitle').value = '';
  document.getElementById('updateDescription').value = '';
  document.getElementById('updateType').value = 'info';
  
  loadDashboard();
}

function deleteUpdate(id) {
  if (!confirm('هل أنت متأكد من حذف هذا التحديث؟')) {
    return;
  }
  
  const data = loadData();
  data.updates = data.updates.filter(u => u.id !== id);
  saveData(data);
  loadDashboard();
}