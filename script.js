// Enhanced ML Explainer Dashboard - JavaScript
// Professional dark theme dashboard with comprehensive functionality

// Global configuration
const CONFIG = {
    API_BASE_URL: 'https://dashboard-1-e0jg.onrender.com',
    POLLING_INTERVAL: 2000, // 2 seconds
    MAX_POLLING_ATTEMPTS: 150, // 5 minutes max
    TOAST_DURATION: 5000,
    LOG_REFRESH_INTERVAL: 30000, // 30 seconds
    SYSTEM_REFRESH_INTERVAL: 60000, // 1 minute
    MAX_LOG_ENTRIES: 100
};

// Global state management
class AppState {
    constructor() {
        this.currentModelId = null;
        this.currentDatasetId = null;
        this.currentTaskId = null;
        this.pollingInterval = null;
        this.logRefreshInterval = null;
        this.systemRefreshInterval = null;
        this.currentSection = 'dashboard';
        this.logs = [];
        this.systemInfo = {};
        this.performanceMetrics = {};
    }

    reset() {
        this.currentModelId = null;
        this.currentDatasetId = null;
        this.currentTaskId = null;
        this.clearIntervals();
    }

    clearIntervals() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        if (this.logRefreshInterval) {
            clearInterval(this.logRefreshInterval);
            this.logRefreshInterval = null;
        }
        if (this.systemRefreshInterval) {
            clearInterval(this.systemRefreshInterval);
            this.systemRefreshInterval = null;
        }
    }
}

// Global app state
const appState = new AppState();

// DOM elements cache
const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    navItems: document.querySelectorAll('.nav-item'),
    
    // API Status
    apiStatus: document.getElementById('apiStatus'),
    
    // Content sections
    contentSections: document.querySelectorAll('.content-section'),
    
    // Dashboard elements
    modelStatusText: document.getElementById('modelStatusText'),
    datasetStatusText: document.getElementById('datasetStatusText'),
    analysisStatusText: document.getElementById('analysisStatusText'),
    modelStatusIndicator: document.getElementById('modelStatusIndicator'),
    datasetStatusIndicator: document.getElementById('datasetStatusIndicator'),
    analysisStatusIndicator: document.getElementById('analysisStatusIndicator'),
    
    // Upload elements
    modelUpload: document.getElementById('modelUpload'),
    datasetUpload: document.getElementById('datasetUpload'),
    modelFile: document.getElementById('modelFile'),
    datasetFile: document.getElementById('datasetFile'),
    modelStatus: document.getElementById('modelStatus'),
    datasetStatus: document.getElementById('datasetStatus'),
    generateBtn: document.getElementById('generateBtn'),
    
    // Progress elements
    progressSection: document.getElementById('progress-section'),
    progressFill: document.getElementById('progressFill'),
    progressPercentage: document.getElementById('progressPercentage'),
    progressText: document.getElementById('progressText'),
    progressDetails: document.getElementById('progressDetails'),
    progressStatus: document.getElementById('progressStatus'),
    
    // Results elements
    resultsSection: document.getElementById('results-section'),
    modelType: document.getElementById('modelType'),
    samplesProcessed: document.getElementById('samplesProcessed'),
    predictionCount: document.getElementById('predictionCount'),
    fidelityScore: document.getElementById('fidelityScore'),
    
    // Tab elements
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    
    // Explanation elements
    businessExplanation: document.getElementById('businessExplanation'),
    shapStatus: document.getElementById('shapStatus'),
    shapFeatures: document.getElementById('shapFeatures'),
    limeStatus: document.getElementById('limeStatus'),
    limeFeatures: document.getElementById('limeFeatures'),
    permutationStatus: document.getElementById('permutationStatus'),
    permutationFeatures: document.getElementById('permutationFeatures'),
    interactionsStatus: document.getElementById('interactionsStatus'),
    interactionsList: document.getElementById('interactionsList'),
    
    // Stats elements
    predictionStats: document.getElementById('predictionStats'),
    predMean: document.getElementById('predMean'),
    predStd: document.getElementById('predStd'),
    predMin: document.getElementById('predMin'),
    predMax: document.getElementById('predMax'),
    samplePredictions: document.getElementById('samplePredictions'),
    
    // Logs elements
    logLevelFilter: document.getElementById('logLevelFilter'),
    refreshLogsBtn: document.getElementById('refreshLogsBtn'),
    clearLogsBtn: document.getElementById('clearLogsBtn'),
    totalLogs: document.getElementById('totalLogs'),
    errorLogs: document.getElementById('errorLogs'),
    warningLogs: document.getElementById('warningLogs'),
    lastLogUpdate: document.getElementById('lastLogUpdate'),
    logEntries: document.getElementById('logEntries'),
    
    // System elements
    configList: document.getElementById('configList'),
    apiInfo: document.getElementById('apiInfo'),
    apiEndpoint: document.getElementById('apiEndpoint'),
    apiVersion: document.getElementById('apiVersion'),
    lastApiCheck: document.getElementById('lastApiCheck'),
    performanceMetrics: document.getElementById('performanceMetrics'),
    
    // Visualization elements
    visualizationContent: document.getElementById('visualizationContent'),
    
    // Error elements
    errorSection: document.getElementById('error-section'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    
    // UI elements
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Enhanced ML Explainer Dashboard initializing...');
    initializeApp();
});

async function initializeApp() {
    try {
        // Setup event listeners
        setupEventListeners();
        
        // Setup drag and drop
        setupDragAndDrop();
        
        // Initialize sidebar
        initializeSidebar();
        
        // Check API status
        await checkApiStatus();
        
        // Start auto-refresh intervals
        startAutoRefresh();
        
        // Show welcome message
        showToast('Welcome!', 'Enhanced ML Explainer Dashboard loaded successfully', 'success');
        
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showToast('Initialization Error', 'Failed to initialize dashboard', 'error');
    }
}

function setupEventListeners() {
    // Sidebar toggle
    if (elements.sidebarToggle) {
        elements.sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Navigation items
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) {
                switchSection(section);
            }
        });
    });
    
    // File upload handlers
    if (elements.modelFile) {
        elements.modelFile.addEventListener('change', handleModelFileSelect);
    }
    if (elements.datasetFile) {
        elements.datasetFile.addEventListener('change', handleDatasetFileSelect);
    }
    
    // Upload area clicks
    if (elements.modelUpload) {
        elements.modelUpload.addEventListener('click', () => elements.modelFile.click());
    }
    if (elements.datasetUpload) {
        elements.datasetUpload.addEventListener('click', () => elements.datasetFile.click());
    }
    
    // Generate button
    if (elements.generateBtn) {
        elements.generateBtn.addEventListener('click', handleGenerateExplanations);
    }
    
    // Retry button
    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', handleRetry);
    }
    
    // Tab buttons
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab-btn').dataset.tab;
            if (tab) {
                switchTab(tab);
            }
        });
    });
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.closest('.action-btn').dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Header action buttons
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }
    
    // Log controls
    if (elements.refreshLogsBtn) {
        elements.refreshLogsBtn.addEventListener('click', refreshLogs);
    }
    if (elements.clearLogsBtn) {
        elements.clearLogsBtn.addEventListener('click', clearLogs);
    }
    if (elements.logLevelFilter) {
        elements.logLevelFilter.addEventListener('change', filterLogs);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize handler
    window.addEventListener('resize', debounce(handleResize, 250));
}

function initializeSidebar() {
    // Set initial active state
    const defaultSection = 'dashboard';
    switchSection(defaultSection);
    
    // Handle mobile sidebar
    const isMobile = window.innerWidth <= 768;
    if (isMobile && elements.sidebar) {
        elements.sidebar.classList.remove('active');
    }
}

function toggleSidebar() {
    if (elements.sidebar) {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            elements.sidebar.classList.toggle('active');
        } else {
            elements.sidebar.classList.toggle('collapsed');
        }
    }
}

function switchSection(sectionName) {
    // Update navigation
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });
    
    // Update content sections
    elements.contentSections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}-section`);
    });
    
    // Update app state
    appState.currentSection = sectionName;
    
    // Section-specific initialization
    switch (sectionName) {
        case 'logs':
            refreshLogs();
            break;
        case 'system':
            refreshSystemInfo();
            break;
        case 'visualizations':
            refreshVisualizations();
            break;
    }
    
    // Close mobile sidebar
    if (window.innerWidth <= 768 && elements.sidebar) {
        elements.sidebar.classList.remove('active');
    }
}

function handleQuickAction(action) {
    switch (action) {
        case 'upload-model':
            switchSection('upload');
            elements.modelFile?.click();
            break;
        case 'upload-dataset':
            switchSection('upload');
            elements.datasetFile?.click();
            break;
        case 'generate-explanations':
            if (appState.currentModelId && appState.currentDatasetId) {
                handleGenerateExplanations();
            } else {
                switchSection('upload');
                showToast('Upload Required', 'Please upload both model and dataset first', 'warning');
            }
            break;
        case 'view-results':
            switchSection('results');
            break;
    }
}

function setupDragAndDrop() {
    // Model upload drag and drop
    if (elements.modelUpload) {
        setupUploadArea(elements.modelUpload, elements.modelFile, handleModelFileSelect);
    }
    
    // Dataset upload drag and drop
    if (elements.datasetUpload) {
        setupUploadArea(elements.datasetUpload, elements.datasetFile, handleDatasetFileSelect);
    }
}

function setupUploadArea(uploadArea, fileInput, handler) {
    const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
    
    events.forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        }, false);
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handler({ target: fileInput });
        }
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// API Status Check
async function checkApiStatus() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/`);
        
        if (response.ok) {
            const data = await response.json();
            updateApiStatus('connected', 'API Connected');
            
            // Update system info
            if (elements.apiEndpoint) {
                elements.apiEndpoint.textContent = CONFIG.API_BASE_URL;
            }
            if (elements.apiVersion && data.version) {
                elements.apiVersion.textContent = data.version;
            }
            if (elements.lastApiCheck) {
                elements.lastApiCheck.textContent = new Date().toLocaleTimeString();
            }
            
            console.log('API Status:', data);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('API Status Check Failed:', error);
        updateApiStatus('error', 'API Offline');
        showToast('Connection Error', 'Unable to connect to the API server', 'error');
    }
}

function updateApiStatus(status, text) {
    if (elements.apiStatus) {
        elements.apiStatus.className = `api-status ${status}`;
        const statusText = elements.apiStatus.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = text;
        }
    }
}

// File Upload Handlers
async function handleModelFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.pkl') && !file.name.endsWith('.joblib')) {
        showToast('Invalid File', 'Please select a .pkl or .joblib file', 'error');
        return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
        showToast('File Too Large', 'Model file must be less than 50MB', 'error');
        return;
    }

    updateUploadStatus('modelStatus', 'uploading', `Uploading ${file.name}...`);
    updateDashboardStatus('model', 'uploading', `Uploading ${file.name}...`);

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${CONFIG.API_BASE_URL}/upload-model`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            appState.currentModelId = data.model_id;
            
            const statusMessage = `✓ Model uploaded: ${data.filename} (${formatFileSize(data.size)})`;
            updateUploadStatus('modelStatus', 'success', statusMessage);
            updateDashboardStatus('model', 'active', `Model: ${data.filename}`);
            
            updateGenerateButton();
            showToast('Model Uploaded', `Successfully uploaded ${data.filename}`, 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Upload failed');
        }
    } catch (error) {
        console.error('Model upload error:', error);
        const errorMessage = `✗ Upload failed: ${error.message}`;
        updateUploadStatus('modelStatus', 'error', errorMessage);
        updateDashboardStatus('model', 'inactive', 'Upload failed');
        showToast('Upload Error', error.message, 'error');
    }
}

async function handleDatasetFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
        showToast('Invalid File', 'Please select a CSV file', 'error');
        return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('File Too Large', 'Dataset file must be less than 10MB', 'error');
        return;
    }

    updateUploadStatus('datasetStatus', 'uploading', `Uploading ${file.name}...`);
    updateDashboardStatus('dataset', 'uploading', `Uploading ${file.name}...`);

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${CONFIG.API_BASE_URL}/upload-dataset`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            appState.currentDatasetId = data.dataset_id;
            
            const statusMessage = `✓ Dataset uploaded: ${data.filename} (${data.shape[0]} rows, ${data.shape[1]} cols)`;
            updateUploadStatus('datasetStatus', 'success', statusMessage);
            updateDashboardStatus('dataset', 'active', `Dataset: ${data.filename} (${data.shape[0]} rows)`);
            
            updateGenerateButton();
            showToast('Dataset Uploaded', `Successfully uploaded ${data.filename}`, 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Upload failed');
        }
    } catch (error) {
        console.error('Dataset upload error:', error);
        const errorMessage = `✗ Upload failed: ${error.message}`;
        updateUploadStatus('datasetStatus', 'error', errorMessage);
        updateDashboardStatus('dataset', 'inactive', 'Upload failed');
        showToast('Upload Error', error.message, 'error');
    }
}

function updateUploadStatus(elementId, type, message) {
    const statusElement = elements[elementId];
    if (statusElement) {
        statusElement.className = `upload-status status-${type}`;
        statusElement.innerHTML = message;
    }
}

function updateDashboardStatus(type, status, message) {
    const statusMap = {
        'model': {
            text: elements.modelStatusText,
            indicator: elements.modelStatusIndicator
        },
        'dataset': {
            text: elements.datasetStatusText,
            indicator: elements.datasetStatusIndicator
        },
        'analysis': {
            text: elements.analysisStatusText,
            indicator: elements.analysisStatusIndicator
        }
    };

    const elements_obj = statusMap[type];
    if (!elements_obj) return;

    if (elements_obj.text) {
        elements_obj.text.textContent = message;
    }

    if (elements_obj.indicator) {
        const dot = elements_obj.indicator.querySelector('.status-dot');
        const text = elements_obj.indicator.querySelector('span:last-child');
        
        if (dot) {
            dot.className = `status-dot ${status}`;
        }
        if (text) {
            text.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    }
}

function updateGenerateButton() {
    const canGenerate = appState.currentModelId && appState.currentDatasetId;
    if (elements.generateBtn) {
        elements.generateBtn.disabled = !canGenerate;
        
        if (canGenerate) {
            elements.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Explanations';
            updateDashboardStatus('analysis', 'pending', 'Ready to generate explanations');
        }
    }
}

// Generate Explanations Handler
async function handleGenerateExplanations() {
    if (!appState.currentModelId || !appState.currentDatasetId) {
        showToast('Missing Files', 'Please upload both a model and dataset', 'warning');
        return;
    }

    console.log('Starting explanation generation with:', {
        modelId: appState.currentModelId,
        datasetId: appState.currentDatasetId
    });

    try {
        elements.generateBtn.disabled = true;
        elements.generateBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Starting...';
        updateDashboardStatus('analysis', 'pending', 'Starting analysis...');

        const response = await fetch(`${CONFIG.API_BASE_URL}/generate-explanations?model_id=${appState.currentModelId}&dataset_id=${appState.currentDatasetId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            appState.currentTaskId = data.task_id;
            
            // Show progress section
            showProgressSection();
            
            // Start polling for progress
            startProgressPolling();
            
            updateDashboardStatus('analysis', 'active', 'Generating explanations...');
            showToast('Task Started', 'Explanation generation has begun', 'success');
        } else {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (parseError) {
                const textResponse = await response.text();
                errorMessage = textResponse || errorMessage;
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Generate explanations error:', error);
        elements.generateBtn.disabled = false;
        elements.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Explanations';
        
        updateDashboardStatus('analysis', 'inactive', 'Generation failed');
        showToast('Error', error.message || 'Failed to generate explanations', 'error');
    }
}

function showProgressSection() {
    // Hide other sections and show progress
    elements.contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    if (elements.progressSection) {
        elements.progressSection.style.display = 'block';
        elements.progressSection.classList.add('active', 'fade-in');
    }
    
    // Update navigation
    elements.navItems.forEach(item => {
        item.classList.remove('active');
    });
}

function startProgressPolling() {
    let attempts = 0;
    
    appState.pollingInterval = setInterval(async () => {
        attempts++;
        
        if (attempts > CONFIG.MAX_POLLING_ATTEMPTS) {
            clearInterval(appState.pollingInterval);
            showError('Timeout Error', 'Task took too long to complete. Please try again.');
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/task-status/${appState.currentTaskId}`);
            
            if (response.ok) {
                const status = await response.json();
                updateProgress(status);
                
                if (status.status === 'completed') {
                    clearInterval(appState.pollingInterval);
                    await loadResults();
                } else if (status.status === 'failed') {
                    clearInterval(appState.pollingInterval);
                    showError('Processing Error', status.error || 'Task failed to complete');
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Polling error:', error);
            if (attempts % 10 === 0) {
                console.warn('Polling issues detected, but continuing...');
            }
        }
    }, CONFIG.POLLING_INTERVAL);
}

function updateProgress(status) {
    const progressPercentage = getProgressPercentage(status.status);
    
    if (elements.progressFill) {
        elements.progressFill.style.width = `${progressPercentage}%`;
    }
    
    if (elements.progressPercentage) {
        elements.progressPercentage.textContent = `${progressPercentage}%`;
    }
    
    if (elements.progressText) {
        elements.progressText.textContent = getProgressText(status.status);
    }
    
    if (elements.progressDetails && status.progress) {
        elements.progressDetails.textContent = status.progress;
    }
    
    if (elements.progressStatus) {
        elements.progressStatus.textContent = status.status.charAt(0).toUpperCase() + status.status.slice(1);
    }
}

function getProgressPercentage(status) {
    switch (status) {
        case 'queued': return 10;
        case 'processing': return 50;
        case 'completed': return 100;
        case 'failed': return 0;
        default: return 25;
    }
}

function getProgressText(status) {
    switch (status) {
        case 'queued': return 'Task queued for processing...';
        case 'processing': return 'Generating explanations...';
        case 'completed': return 'Processing complete!';
        case 'failed': return 'Processing failed';
        default: return 'Processing...';
    }
}

async function loadResults() {
    try {
        if (elements.progressText) {
            elements.progressText.textContent = 'Loading results...';
        }
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/results/${appState.currentTaskId}`);
        
        if (response.ok) {
            const results = await response.json();
            displayResults(results);
            
            // Show results section
            if (elements.progressSection) {
                elements.progressSection.style.display = 'none';
                elements.progressSection.classList.remove('active');
            }
            
            switchSection('results');
            
            updateDashboardStatus('analysis', 'active', 'Analysis completed successfully');
            showToast('Success!', 'Explanations generated successfully', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to load results');
        }
    } catch (error) {
        console.error('Load results error:', error);
        showError('Results Error', error.message);
    }
}

function displayResults(results) {
    console.log('Displaying results:', results);
    
    // Store results globally for other sections
    appState.currentResults = results;
    
    // Update summary cards
    updateSummaryCards(results);
    
    // Update prediction statistics
    updatePredictionStats(results.predictions);
    
    // Display business explanation
    displayBusinessExplanation(results.business_explanation);
    
    // Display technical explanations
    displayTechnicalExplanations(results.explanations);
    
    // Update fidelity scores
    updateFidelityScores(results.fidelity_scores);
    
    // Generate visualizations automatically
    if (appState.currentSection === 'visualizations') {
        refreshVisualizations();
    }
    
    // Reset generate button
    if (elements.generateBtn) {
        elements.generateBtn.disabled = false;
        elements.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Explanations';
    }
}

function updateSummaryCards(results) {
    if (elements.modelType) {
        elements.modelType.textContent = results.model_info?.type || 'Unknown';
    }
    if (elements.samplesProcessed) {
        elements.samplesProcessed.textContent = results.dataset_info?.processed_samples || '0';
    }
    if (elements.predictionCount) {
        elements.predictionCount.textContent = results.predictions?.count || '0';
    }
    
    // Calculate average fidelity score
    if (elements.fidelityScore) {
        const fidelityScores = results.fidelity_scores || {};
        const numericScores = Object.values(fidelityScores)
            .filter(score => typeof score === 'number' && !isNaN(score));
        
        if (numericScores.length > 0) {
            const avgFidelity = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
            elements.fidelityScore.textContent = (avgFidelity * 100).toFixed(1) + '%';
        } else {
            elements.fidelityScore.textContent = 'N/A';
        }
    }
}

function updatePredictionStats(predictions) {
    if (!predictions || !predictions.statistics) {
        if (elements.predictionStats) {
            elements.predictionStats.style.display = 'none';
        }
        return;
    }

    const stats = predictions.statistics;
    
    if (elements.predMean) {
        elements.predMean.textContent = stats.mean?.toFixed(3) || 'N/A';
    }
    if (elements.predStd) {
        elements.predStd.textContent = stats.std?.toFixed(3) || 'N/A';
    }
    if (elements.predMin) {
        elements.predMin.textContent = stats.min?.toFixed(3) || 'N/A';
    }
    if (elements.predMax) {
        elements.predMax.textContent = stats.max?.toFixed(3) || 'N/A';
    }

    // Display sample predictions
    if (elements.samplePredictions) {
        elements.samplePredictions.innerHTML = '';
        
        if (predictions.sample && predictions.sample.length > 0) {
            predictions.sample.forEach(pred => {
                const predElement = document.createElement('span');
                predElement.className = 'prediction-value';
                predElement.textContent = pred.toFixed(3);
                elements.samplePredictions.appendChild(predElement);
            });
        }
    }

    if (elements.predictionStats) {
        elements.predictionStats.style.display = 'block';
    }
}

function displayBusinessExplanation(explanation) {
    if (elements.businessExplanation) {
        if (explanation && explanation.trim()) {
            // Convert markdown-like formatting to HTML
            const htmlExplanation = explanation
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^### (.*$)/gim, '<h4>$1</h4>')
                .replace(/^## (.*$)/gim, '<h3>$1</h3>')
                .replace(/^# (.*$)/gim, '<h2>$1</h2>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^\d+\.\s/gm, '<li>')
                .replace(/^-\s/gm, '<li>');
            
            elements.businessExplanation.innerHTML = `<p>${htmlExplanation}</p>`;
        } else {
            elements.businessExplanation.innerHTML = '<p>No business explanation available.</p>';
        }
    }
}

function displayTechnicalExplanations(explanations) {
    if (!explanations) return;
    
    // SHAP Analysis
    displayShapAnalysis(explanations.shap);
    
    // LIME Analysis
    displayLimeAnalysis(explanations.lime);
    
    // Permutation Importance
    displayPermutationImportance(explanations.permutation_importance);
    
    // Feature Interactions
    displayFeatureInteractions(explanations.feature_interaction);
}

function displayShapAnalysis(shapData) {
    if (!elements.shapStatus || !elements.shapFeatures) return;
    
    if (!shapData || shapData.status !== 'success') {
        elements.shapStatus.textContent = 'Failed';
        elements.shapStatus.className = 'status-badge error';
        elements.shapFeatures.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>SHAP analysis not available or failed.</p></div>';
        return;
    }
    
    elements.shapStatus.textContent = 'Success';
    elements.shapStatus.className = 'status-badge success';
    
    const importance = shapData.global_feature_importance || [];
    const featureNames = shapData.feature_names || [];
    
    if (importance.length === 0 || featureNames.length === 0) {
        elements.shapFeatures.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle"></i><p>No SHAP feature importance data available.</p></div>';
        return;
    }
    
    // Create feature importance list
    const features = importance.map((imp, index) => ({
        name: featureNames[index] || `Feature ${index}`,
        importance: Math.abs(imp)
    })).sort((a, b) => b.importance - a.importance);
    
    const featuresHtml = features.slice(0, 10).map(feature => `
        <div class="feature-item">
            <div class="feature-name">${feature.name}</div>
            <div class="feature-importance">${feature.importance.toFixed(4)}</div>
        </div>
    `).join('');
    
    elements.shapFeatures.innerHTML = featuresHtml;
}

function displayLimeAnalysis(limeData) {
    if (!elements.limeStatus || !elements.limeFeatures) return;
    
    if (!limeData || limeData.status !== 'success') {
        elements.limeStatus.textContent = 'Failed';
        elements.limeStatus.className = 'status-badge error';
        elements.limeFeatures.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>LIME analysis not available or failed.</p></div>';
        return;
    }
    
    elements.limeStatus.textContent = 'Success';
    elements.limeStatus.className = 'status-badge success';
    
    const explanations = limeData.explanations || [];
    
    if (explanations.length === 0) {
        elements.limeFeatures.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle"></i><p>No LIME explanations available.</p></div>';
        return;
    }
    
    // Display first explanation
    const firstExplanation = explanations[0];
    if (typeof firstExplanation === 'object' && !firstExplanation.error) {
        const features = Object.entries(firstExplanation)
            .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
            .slice(0, 10);
        
        const featuresHtml = features.map(([name, importance]) => `
            <div class="feature-item">
                <div class="feature-name">${name}</div>
                <div class="feature-importance">${importance.toFixed(4)}</div>
            </div>
        `).join('');
        
        elements.limeFeatures.innerHTML = featuresHtml;
    } else {
        elements.limeFeatures.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>LIME explanation contains errors.</p></div>';
    }
}

function displayPermutationImportance(permData) {
    if (!elements.permutationStatus || !elements.permutationFeatures) return;
    
    if (!permData || permData.status !== 'success') {
        elements.permutationStatus.textContent = 'Failed';
        elements.permutationStatus.className = 'status-badge error';
        elements.permutationFeatures.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Permutation importance analysis not available or failed.</p></div>';
        return;
    }
    
    elements.permutationStatus.textContent = 'Success';
    elements.permutationStatus.className = 'status-badge success';
    
    const rankedFeatures = permData.ranked_features || [];
    
    if (rankedFeatures.length === 0) {
        elements.permutationFeatures.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle"></i><p>No permutation importance data available.</p></div>';
        return;
    }
    
    const featuresHtml = rankedFeatures.slice(0, 10).map(feature => `
        <div class="feature-item">
            <div class="feature-name">${feature.feature}</div>
            <div class="feature-importance">${Math.abs(feature.importance).toFixed(4)}</div>
        </div>
    `).join('');
    
    elements.permutationFeatures.innerHTML = featuresHtml;
}

function displayFeatureInteractions(interactionData) {
    if (!elements.interactionsStatus || !elements.interactionsList) return;
    
    if (!interactionData || interactionData.status !== 'success') {
        elements.interactionsStatus.textContent = 'Failed';
        elements.interactionsStatus.className = 'status-badge error';
        elements.interactionsList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Feature interaction analysis not available or failed.</p></div>';
        return;
    }
    
    elements.interactionsStatus.textContent = 'Success';
    elements.interactionsStatus.className = 'status-badge success';
    
    const interactions = interactionData.top_interactions || [];
    
    if (interactions.length === 0) {
        elements.interactionsList.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle"></i><p>No feature interactions found.</p></div>';
        return;
    }
    
    const interactionsHtml = interactions.map(interaction => `
        <div class="interaction-item">
            <div class="interaction-pair">${interaction.feature_1} ↔ ${interaction.feature_2}</div>
            <div class="interaction-strength">Strength: ${interaction.interaction_strength.toFixed(4)}</div>
        </div>
    `).join('');
    
    elements.interactionsList.innerHTML = interactionsHtml;
}

function updateFidelityScores(fidelityScores) {
    console.log('Fidelity Scores:', fidelityScores);
}

// Tab Management
function switchTab(tabName) {
    // Remove active class from all tabs and panes
    elements.tabBtns.forEach(btn => btn.classList.remove('active'));
    elements.tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected tab and pane
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedPane = document.getElementById(tabName);
    
    if (selectedButton && selectedPane) {
        selectedButton.classList.add('active');
        selectedPane.classList.add('active');
    }
}

// Error Handling
function showError(title, message) {
    // Hide other sections
    elements.contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    if (elements.errorSection) {
        elements.errorSection.style.display = 'block';
        elements.errorSection.classList.add('active', 'fade-in');
    }
    
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
    }
    
    // Reset generate button
    if (elements.generateBtn) {
        elements.generateBtn.disabled = false;
        elements.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Explanations';
    }
    
    updateDashboardStatus('analysis', 'inactive', 'Analysis failed');
    showToast(title, message, 'error');
}

function handleRetry() {
    // Hide error section
    if (elements.errorSection) {
        elements.errorSection.style.display = 'none';
        elements.errorSection.classList.remove('active');
    }
    
    // Reset progress section
    if (elements.progressSection) {
        elements.progressSection.style.display = 'none';
        elements.progressSection.classList.remove('active');
    }
    
    // Clear task ID and intervals
    appState.currentTaskId = null;
    appState.clearIntervals();
    
    // Switch back to upload section
    switchSection('upload');
    
    // Reset UI state
    if (elements.generateBtn) {
        elements.generateBtn.disabled = !appState.currentModelId || !appState.currentDatasetId;
        elements.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Explanations';
    }
    
    updateDashboardStatus('analysis', 'pending', 'Ready to retry');
    showToast('Ready to Retry', 'You can now generate explanations again', 'success');
}

// Logs Management
async function refreshLogs() {
    try {
        showLoadingOverlay(true);
        
        // In a real implementation, this would fetch from the backend
        // For now, we'll simulate log data
        const mockLogs = generateMockLogs();
        appState.logs = mockLogs;
        
        displayLogs(mockLogs);
        updateLogStats(mockLogs);
        
        if (elements.lastLogUpdate) {
            elements.lastLogUpdate.textContent = new Date().toLocaleTimeString();
        }
        
        showToast('Logs Refreshed', 'Log data has been updated', 'success');
    } catch (error) {
        console.error('Failed to refresh logs:', error);
        showToast('Error', 'Failed to refresh logs', 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

function generateMockLogs() {
    const logLevels = ['INFO', 'DEBUG', 'WARNING', 'ERROR'];
    const logMessages = [
        'API connection established',
        'Model upload completed successfully',
        'Dataset validation started',
        'SHAP analysis in progress',
        'Feature importance calculation completed',
        'Memory usage threshold exceeded',
        'Cache cleanup performed',
        'Database connection timeout',
        'Processing queue cleared',
        'System health check passed'
    ];
    
    const logs = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
        const timestamp = new Date(now.getTime() - (i * 60000)); // Each log 1 minute apart
        const level = logLevels[Math.floor(Math.random() * logLevels.length)];
        const message = logMessages[Math.floor(Math.random() * logMessages.length)];
        
        logs.push({
            timestamp: timestamp.toISOString(),
            level: level,
            message: message,
            logger: 'ml_explainer',
            module: 'main'
        });
    }
    
    return logs;
}

function displayLogs(logs) {
    if (!elements.logEntries) return;
    
    if (!logs || logs.length === 0) {
        elements.logEntries.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <h4>No Logs Available</h4>
                <p>Process some data to see analysis logs</p>
            </div>
        `;
        return;
    }
    
    const logFilter = elements.logLevelFilter?.value || 'all';
    const filteredLogs = logFilter === 'all' 
        ? logs 
        : logs.filter(log => log.level === logFilter);
    
    const logsHtml = filteredLogs.slice(0, CONFIG.MAX_LOG_ENTRIES).map(log => `
        <div class="log-entry ${log.level.toLowerCase()}">
            <div class="log-header">
                <span class="log-level ${log.level.toLowerCase()}">${log.level}</span>
                <span class="log-timestamp">${new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <div class="log-message">${log.message}</div>
        </div>
    `).join('');
    
    elements.logEntries.innerHTML = logsHtml;
}

function updateLogStats(logs) {
    if (!logs) return;
    
    const totalLogs = logs.length;
    const errorLogs = logs.filter(log => log.level === 'ERROR').length;
    const warningLogs = logs.filter(log => log.level === 'WARNING').length;
    
    if (elements.totalLogs) {
        elements.totalLogs.textContent = totalLogs;
    }
    if (elements.errorLogs) {
        elements.errorLogs.textContent = errorLogs;
    }
    if (elements.warningLogs) {
        elements.warningLogs.textContent = warningLogs;
    }
}

function filterLogs() {
    if (appState.logs) {
        displayLogs(appState.logs);
    }
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
        appState.logs = [];
        displayLogs([]);
        updateLogStats([]);
        showToast('Logs Cleared', 'All logs have been cleared', 'info');
    }
}

// System Information Management
async function refreshSystemInfo() {
    try {
        showLoadingOverlay(true);
        
        // Update API status
        await checkApiStatus();
        
        // Update performance metrics if available
        if (appState.currentResults && Object.keys(appState.currentResults).length > 0) {
            updatePerformanceMetrics();
        }
        
        showToast('System Info Updated', 'System information has been refreshed', 'success');
    } catch (error) {
        console.error('Failed to refresh system info:', error);
        showToast('Error', 'Failed to refresh system information', 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

function updatePerformanceMetrics() {
    if (!elements.performanceMetrics || !appState.currentResults) return;
    
    // Mock performance data - in a real app, this would come from the backend
    const mockMetrics = [
        { label: 'Model Loading', value: '1.2s' },
        { label: 'Data Processing', value: '3.4s' },
        { label: 'SHAP Analysis', value: '15.6s' },
        { label: 'LIME Analysis', value: '8.2s' }
    ];
    
    const metricsHtml = mockMetrics.map(metric => `
        <div class="performance-metric">
            <div class="metric-value">${metric.value}</div>
            <div class="metric-label">${metric.label}</div>
        </div>
    `).join('');
    
    elements.performanceMetrics.innerHTML = metricsHtml;
}

// Visualization Management
function refreshVisualizations() {
    if (!elements.visualizationContent) return;
    
    if (!appState.currentResults) {
        elements.visualizationContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <h4>No Visualizations Available</h4>
                <p>Upload model and dataset to generate interactive charts</p>
            </div>
        `;
        return;
    }
    
    // Generate visualizations based on current results
    generateVisualizationsFromResults(appState.currentResults);
}

function generateVisualizationsFromResults(results) {
    if (!elements.visualizationContent || !results) return;
    
    const explanations = results.explanations || {};
    const predictions = results.predictions || {};
    
    // Create visualization container
    elements.visualizationContent.innerHTML = `
        <div class="visualization-grid">
            <div class="viz-card" id="shapGlobalChart">
                <h4><i class="fas fa-chart-bar"></i> SHAP Global Feature Importance</h4>
                <div class="chart-container" id="shapGlobalContainer">
                    <div class="chart-loading">
                        <div class="spinner"></div>
                        <p>Generating SHAP chart...</p>
                    </div>
                </div>
            </div>
            <div class="viz-card" id="predictionDistChart">
                <h4><i class="fas fa-chart-line"></i> Prediction Distribution</h4>
                <div class="chart-container" id="predictionDistContainer">
                    <div class="chart-loading">
                        <div class="spinner"></div>
                        <p>Generating prediction chart...</p>
                    </div>
                </div>
            </div>
            <div class="viz-card" id="permutationChart">
                <h4><i class="fas fa-shuffle"></i> Permutation Importance</h4>
                <div class="chart-container" id="permutationContainer">
                    <div class="chart-loading">
                        <div class="spinner"></div>
                        <p>Generating permutation chart...</p>
                    </div>
                </div>
            </div>
            <div class="viz-card" id="featureInteractionChart">
                <h4><i class="fas fa-network-wired"></i> Feature Interactions</h4>
                <div class="chart-container" id="featureInteractionContainer">
                    <div class="chart-loading">
                        <div class="spinner"></div>
                        <p>Generating interaction chart...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Generate individual charts with delay for better UX
    setTimeout(() => generateShapChart(explanations.shap), 100);
    setTimeout(() => generatePredictionChart(predictions), 300);
    setTimeout(() => generatePermutationChart(explanations.permutation_importance), 500);
    setTimeout(() => generateInteractionChart(explanations.feature_interaction), 700);
}

function generateShapChart(shapData) {
    const container = document.getElementById('shapGlobalContainer');
    if (!container || !shapData || shapData.status !== 'success') {
        container.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>SHAP data not available</p>
            </div>
        `;
        return;
    }
    
    const importance = shapData.global_feature_importance || [];
    const featureNames = shapData.feature_names || [];
    
    if (importance.length === 0 || featureNames.length === 0) {
        container.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>No SHAP importance data available</p>
            </div>
        `;
        return;
    }
    
    // Prepare data for chart
    const features = importance.map((imp, index) => ({
        name: featureNames[index] || `Feature ${index}`,
        importance: Math.abs(imp),
        originalImportance: imp
    })).sort((a, b) => b.importance - a.importance).slice(0, 15);
    
    // Create simple HTML chart since we don't have Plotly
    const maxImportance = Math.max(...features.map(f => f.importance));
    
    const chartHtml = `
        <div class="html-chart">
            <div class="chart-bars">
                ${features.map(feature => `
                    <div class="chart-bar-item">
                        <div class="bar-label">${feature.name}</div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${(feature.importance / maxImportance) * 100}%">
                                <span class="bar-value">${feature.importance.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = chartHtml;
}

function generatePredictionChart(predictions) {
    const container = document.getElementById('predictionDistContainer');
    if (!container || !predictions || !predictions.sample) {
        container.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Prediction data not available</p>
            </div>
        `;
        return;
    }
    
    const samplePredictions = predictions.sample || [];
    if (samplePredictions.length === 0) {
        container.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>No prediction samples available</p>
            </div>
        `;
        return;
    }
    
    // Create histogram bins
    const numBins = Math.min(20, Math.ceil(Math.sqrt(samplePredictions.length)));
    const minVal = Math.min(...samplePredictions);
    const maxVal = Math.max(...samplePredictions);
    const binSize = (maxVal - minVal) / numBins;
    
    const bins = Array(numBins).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < numBins; i++) {
        binLabels.push((minVal + i * binSize).toFixed(3));
    }
    
    samplePredictions.forEach(pred => {
        const binIndex = Math.min(Math.floor((pred - minVal) / binSize), numBins - 1);
        bins[binIndex]++;
    });
    
    const maxCount = Math.max(...bins);
    
    const chartHtml = `
        <div class="html-chart histogram-chart">
            <div class="chart-title">Prediction Value Distribution</div>
            <div class="histogram-bars">
                ${bins.map((count, index) => `
                    <div class="hist-bar-item">
                        <div class="hist-bar" style="height: ${(count / maxCount) * 100}%">
                            <div class="hist-bar-count">${count}</div>
                        </div>
                        <div class="hist-label">${binLabels[index]}</div>
                    </div>
                `).join('')}
            </div>
            <div class="chart-stats">
                <div class="stat-item">
                    <span class="stat-label">Mean:</span>
                    <span class="stat-value">${predictions.statistics?.mean?.toFixed(3) || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Std:</span>
                    <span class="stat-value">${predictions.statistics?.std?.toFixed(3) || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Min:</span>
                    <span class="stat-value">${predictions.statistics?.min?.toFixed(3) || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Max:</span>
                    <span class="stat-value">${predictions.statistics?.max?.toFixed(3) || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = chartHtml;
}

function generatePermutationChart(permData) {
    const container = document.getElementById('permutationContainer');
    if (!container || !permData || permData.status !== 'success') {
        container.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Permutation importance data not available</p>
            </div>
        `;
        return;
    }
    
    const rankedFeatures = permData.ranked_features || [];
    if (rankedFeatures.length === 0) {
        container.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>No permutation importance data available</p>
            </div>
        `;
        return;
    }
    
    const topFeatures = rankedFeatures.slice(0, 15);
    const maxImportance = Math.max(...topFeatures.map(f => Math.abs(f.importance)));
    
    const chartHtml = `
        <div class="html-chart">
            <div class="chart-bars">
                ${topFeatures.map(feature => `
                    <div class="chart-bar-item">
                        <div class="bar-label">${feature.feature}</div>
                        <div class="bar-container">
                            <div class="bar-fill permutation-bar" style="width: ${(Math.abs(feature.importance) / maxImportance) * 100}%">
                                <span class="bar-value">${feature.importance.toFixed(4)} ± ${feature.std.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = chartHtml;
}

function generateInteractionChart(interactionData) {
    const container = document.getElementById('featureInteractionContainer');
    if (!container || !interactionData || interactionData.status !== 'success') {
        container.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Feature interaction data not available</p>
            </div>
        `;
        return;
    }
    
    const interactions = interactionData.top_interactions || [];
    if (interactions.length === 0) {
        container.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>No feature interactions found</p>
            </div>
        `;
        return;
    }
    
    const topInteractions = interactions.slice(0, 10);
    const maxStrength = Math.max(...topInteractions.map(i => i.interaction_strength));
    
    const chartHtml = `
        <div class="html-chart interaction-chart">
            <div class="interaction-items">
                ${topInteractions.map(interaction => `
                    <div class="interaction-chart-item">
                        <div class="interaction-pair-label">
                            <span class="feature-1">${interaction.feature_1}</span>
                            <i class="fas fa-arrows-alt-h"></i>
                            <span class="feature-2">${interaction.feature_2}</span>
                        </div>
                        <div class="interaction-strength-bar">
                            <div class="strength-fill" style="width: ${(interaction.interaction_strength / maxStrength) * 100}%">
                                <span class="strength-value">${interaction.interaction_strength.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = chartHtml;
}

// Auto-refresh functionality
function startAutoRefresh() {
    // Auto-refresh logs
    appState.logRefreshInterval = setInterval(() => {
        if (appState.currentSection === 'logs') {
            refreshLogs();
        }
    }, CONFIG.LOG_REFRESH_INTERVAL);
    
    // Auto-refresh system info
    appState.systemRefreshInterval = setInterval(() => {
        if (appState.currentSection === 'system') {
            refreshSystemInfo();
        }
    }, CONFIG.SYSTEM_REFRESH_INTERVAL);
}

// Dashboard refresh
async function refreshDashboard() {
    try {
        showLoadingOverlay(true);
        await checkApiStatus();
        
        // Refresh current section
        switch (appState.currentSection) {
            case 'logs':
                await refreshLogs();
                break;
            case 'system':
                await refreshSystemInfo();
                break;
            case 'visualizations':
                refreshVisualizations();
                break;
        }
        
        showToast('Dashboard Refreshed', 'All data has been updated', 'success');
    } catch (error) {
        console.error('Dashboard refresh failed:', error);
        showToast('Refresh Error', 'Failed to refresh dashboard', 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

// Toast notification system
function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    // Add to container
    if (elements.toastContainer) {
        elements.toastContainer.appendChild(toast);
    }
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after duration
    setTimeout(() => removeToast(toast), CONFIG.TOAST_DURATION);
    
    return toast;
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function removeToast(toast) {
    if (toast && toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Loading overlay
function showLoadingOverlay(show) {
    if (elements.loadingOverlay) {
        elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter to generate explanations
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (!elements.generateBtn?.disabled) {
            handleGenerateExplanations();
        }
        event.preventDefault();
    }
    
    // Escape to close modals/overlays
    if (event.key === 'Escape') {
        if (elements.loadingOverlay?.style.display !== 'none') {
            // Don't allow closing loading overlay with escape
            return;
        }
        
        if (elements.errorSection?.style.display !== 'none') {
            handleRetry();
        }
    }
    
    // Alt + number keys for quick section switching
    if (event.altKey && event.key >= '1' && event.key <= '6') {
        event.preventDefault();
        const sectionIndex = parseInt(event.key) - 1;
        const sections = ['dashboard', 'upload', 'results', 'visualizations', 'logs', 'system'];
        if (sections[sectionIndex]) {
            switchSection(sections[sectionIndex]);
        }
    }
    
    // R key to refresh current section (when not in input)
    if (event.key === 'r' && !event.target.matches('input, textarea, select')) {
        event.preventDefault();
        refreshDashboard();
    }
}

// Responsive design handler
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && elements.sidebar) {
        elements.sidebar.classList.remove('collapsed');
        elements.sidebar.classList.remove('active');
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) {
        return 'N/A';
    }
    return num.toFixed(decimals);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function logPerformance(operation, startTime) {
    const duration = performance.now() - startTime;
    console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showToast('Application Error', 'An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('Network Error', 'A network request failed', 'error');
});

// Cleanup when page is closed
window.addEventListener('beforeunload', function() {
    appState.clearIntervals();
});

// Additional CSS classes for enhanced visualizations (injected dynamically)
const additionalStyles = `
<style>
.visualization-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--space-xl);
    margin-top: var(--space-xl);
}

.viz-card {
    background: var(--accent-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: var(--space-lg);
    transition: var(--transition-normal);
}

.viz-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.viz-card h4 {
    color: var(--text-primary);
    margin-bottom: var(--space-md);
    font-weight: var(--font-weight-semibold);
}

.chart-placeholder {
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--card-bg);
    border: 1px dashed var(--border-color);
    border-radius: var(--border-radius-md);
    text-align: center;
    color: var(--text-muted);
}

.chart-placeholder i {
    font-size: 2rem;
    margin-bottom: var(--space-sm);
}

@media (max-width: 768px) {
    .visualization-grid {
        grid-template-columns: 1fr;
    }
    
    .viz-card {
        padding: var(--space-md);
    }
    
    .chart-placeholder {
        height: 200px;
    }
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
        if (entry.name.includes('fetch')) {
            console.log(`API call ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
    });
});

// Start observing performance
try {
    performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
} catch (e) {
    console.log('Performance monitoring not supported');
}

// Initialize theme handling
function initializeTheme() {
    // Check for system dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
    }
    
    // Listen for theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            document.body.classList.toggle('dark-theme', e.matches);
        });
    }
}

// Call theme initialization
initializeTheme();

// Accessibility enhancements
function enhanceAccessibility() {
    // Add focus management for modals
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Trap focus in loading overlay when visible
    document.addEventListener('keydown', (e) => {
        if (elements.loadingOverlay?.style.display === 'flex' && e.key === 'Tab') {
            e.preventDefault(); // Prevent tabbing when loading
        }
    });
    
    // Announce important state changes to screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // Export function for use elsewhere
    window.announceToScreenReader = announceToScreenReader;
}

// Initialize accessibility enhancements
enhanceAccessibility();

console.log('🎨 Enhanced ML Explainer Dashboard JavaScript loaded successfully');
console.log('📱 Responsive design enabled');
console.log('♿ Accessibility features enabled');
console.log('🌙 Dark theme optimized');
console.log('⚡ Performance monitoring active');

// Export key functions for external use if needed
window.MLExplainerDashboard = {
    switchSection,
    refreshDashboard,
    showToast,
    appState
};