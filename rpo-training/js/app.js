document.addEventListener('DOMContentLoaded', () => {
    const mainPage = document.getElementById('main-page');
    const sessionContainer = document.getElementById('session-container');
    const headerTitle = document.getElementById('header-title');
    const copyrightYear = document.getElementById('copyright-year');

    // Progress tracking system
    class ProgressTracker {
        constructor() {
            this.storageKey = 'rpo-training-progress';
            this.progress = this.loadProgress();
        }

        loadProgress() {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        }

        saveProgress() {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        }

        markSessionComplete(sessionId) {
            this.progress[sessionId] = {
                completed: true,
                completedAt: new Date().toISOString()
            };
            this.saveProgress();
            this.updateProgressIndicators();
        }

        isSessionComplete(sessionId) {
            return this.progress[sessionId]?.completed || false;
        }

        getModuleProgress(moduleNum) {
            const sessionIds = Object.keys(pageTitles).filter(id => id.startsWith(`session-${moduleNum}-`));
            const completed = sessionIds.filter(id => this.isSessionComplete(id)).length;
            return { completed, total: sessionIds.length, percentage: Math.round((completed / sessionIds.length) * 100) };
        }

        getOverallProgress() {
            const allSessions = Object.keys(pageTitles).filter(id => id.startsWith('session-'));
            const completed = allSessions.filter(id => this.isSessionComplete(id)).length;
            return { completed, total: allSessions.length, percentage: Math.round((completed / allSessions.length) * 100) };
        }

        updateProgressIndicators() {
            // Update module cards on main page
            for (let i = 1; i <= 7; i++) {
                const moduleCard = document.querySelector(`[onclick="navigateTo('module-${i}')"]`);
                if (moduleCard) {
                    this.updateModuleCard(moduleCard, i);
                }
            }
            // Update overall progress in header
            this.updateOverallProgress();
        }

        updateOverallProgress() {
            const overallProgress = this.getOverallProgress();
            const progressContainer = document.getElementById('overall-progress');
            const progressText = document.getElementById('progress-text');
            const progressBar = document.getElementById('progress-bar');

            if (progressContainer && progressText && progressBar) {
                progressText.textContent = `${overallProgress.completed}/${overallProgress.total} sessions`;
                progressBar.style.width = `${overallProgress.percentage}%`;
                
                // Show progress container if there's any progress
                if (overallProgress.completed > 0) {
                    progressContainer.classList.remove('hidden');
                } else {
                    progressContainer.classList.add('hidden');
                }
            }

            // Update continue learning button
            this.updateContinueLearning();
        }

        updateContinueLearning() {
            const continueContainer = document.getElementById('continue-learning');
            const continueBtn = document.getElementById('continue-btn');
            const nextSessionTitle = document.getElementById('next-session-title');

            if (!continueContainer || !continueBtn || !nextSessionTitle) return;

            const nextSession = this.getNextIncompleteSession();
            
            if (nextSession) {
                nextSessionTitle.textContent = nextSession.title;
                continueContainer.classList.remove('hidden');
                
                continueBtn.onclick = () => navigateTo(nextSession.id);
            } else {
                continueContainer.classList.add('hidden');
            }
        }

        getNextIncompleteSession() {
            const sessionOrder = [
                'session-1-1', 'session-1-2', 'session-1-3',
                'session-2-1', 'session-2-2', 'session-2-3',
                'session-3-1', 'session-3-2', 'session-4-1',
                'session-5-1', 'session-5-2', 'session-6-1',
                'session-7-1'
            ];

            for (const sessionId of sessionOrder) {
                if (!this.isSessionComplete(sessionId)) {
                    return {
                        id: sessionId,
                        title: pageTitles[sessionId] || sessionId
                    };
                }
            }
            return null; // All sessions completed
        }

        updateModuleCard(card, moduleNum) {
            const progress = this.getModuleProgress(moduleNum);
            let progressIndicator = card.querySelector('.progress-indicator');
            
            if (!progressIndicator) {
                progressIndicator = document.createElement('div');
                progressIndicator.className = 'progress-indicator';
                card.appendChild(progressIndicator);
            }

            const progressBarHtml = `
                <div class="mt-3 flex items-center justify-between text-sm">
                    <span class="text-gray-600">${progress.completed}/${progress.total} sessions</span>
                    <span class="text-blue-600 font-medium">${progress.percentage}%</span>
                </div>
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${progress.percentage}%"></div>
                </div>
            `;
            progressIndicator.innerHTML = progressBarHtml;
        }
    }

    const progressTracker = new ProgressTracker();

    const moduleTitles = {
        'module-1': 'Module 1: Prompting & Writing — The C.R.E.A.T.E. Framework',
        'module-2': 'Module 2: Sourcing & Research',
        'module-3': 'Module 3: Data & Knowledge',
        'module-4': 'Module 4: Automation',
        'module-5': 'Module 5: Train the Trainer',
        'module-6': 'Module 6: Strategy & Governance',
        'module-7': 'Module 7: Measuring Impact'
    };

    const pageTitles = {
        'main-page': 'RPO AI Acceleration Program',
        'session-1-1': 'Session 1.1: Prompt Engineering 101',
        'session-1-2': 'Session 1.2: AI-Powered Email Lab',
        'session-1-3': 'Session 1.3: Success Spotlight & Clinic',
        'session-2-1': 'Session 2.1: AI for Advanced Sourcing',
        'session-2-2': 'Session 2.2: The Randstad AI Toolkit',
        'session-2-3': 'Session 2.3: Responsible AI & Showcase',
        'session-3-1': 'Session 3.1: Data Insights in Sheets',
        'session-3-2': 'Session 3.2: Building a Knowledge Base',
        'session-4-1': 'Session 4.1: Intro to Automation',
        'session-5-1': 'Session 5.1: Becoming an AI Champion',
        'session-5-2': 'Session 5.2: Capstone Project Showcase',
        'session-6-1': 'Session 6.1: Developing an AI Roadmap',
        'session-7-1': 'Session 7.1: The ROI of AI in Recruiting'
    };

    function showSessionMenu(moduleId) {
        const moduleNum = moduleId.split('-')[1];
        const sessions = Object.keys(pageTitles)
            .filter(key => key.startsWith(`session-${moduleNum}-`))
            .map(key => ({
                id: key,
                title: pageTitles[key]
            }));

        let menuHtml = `
            <div class="content-section">
                <button onclick="navigateTo('main-page')" class="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    &larr; Back to All Modules
                </button>
                <h2 class="google-sans text-3xl font-bold text-gray-800">${moduleTitles[moduleId]}</h2>
                <p class="mt-2 text-lg text-gray-600">Select a session to begin.</p>
                <ul class="mt-6 space-y-4">
        `;

        sessions.forEach(session => {
            menuHtml += `
                <li>
                    <a href="#" onclick="event.preventDefault(); navigateTo('${session.id}')" class="block bg-white p-6 rounded-lg shadow-md hover:bg-gray-50 transition">
                        <h3 class="google-sans text-xl font-bold text-blue-700">${session.title}</h3>
                    </a>
                </li>
            `;
        });

        menuHtml += '</ul></div>';

        sessionContainer.innerHTML = menuHtml;
        sessionContainer.classList.add('active');
        mainPage.classList.remove('active');
        headerTitle.textContent = moduleTitles[moduleId] || 'Select a Session';
        window.scrollTo(0, 0);
    }

    function navigateTo(pageId) {
        // Store the scroll position if leaving the main page
        if (document.getElementById('main-page').classList.contains('active') && pageId !== 'main-page') {
            sessionStorage.setItem('mainPageScrollPosition', window.scrollY);
        }

        // This part seems to be for a different scroll position saving logic, removing it to avoid conflict
        if (pageId !== 'main-page') {
            sessionStorage.setItem('scrollPosition', window.scrollY);
        }

        // Hide all pages by default
        mainPage.classList.remove('active');
        sessionContainer.classList.remove('active');

        if (pageId === 'main-page') {
            mainPage.classList.add('active');
            sessionContainer.innerHTML = '';
            // Update progress indicators on main page
            setTimeout(() => progressTracker.updateProgressIndicators(), 100);
            // Restore scroll position if returning to the main page
            const savedPosition = sessionStorage.getItem('mainPageScrollPosition');
            if (savedPosition) {
                window.scrollTo(0, parseInt(savedPosition, 10) - 100); // Added -100 for a little buffer above
                sessionStorage.removeItem('scrollPosition');
            }
        } else if (pageId.startsWith('module-')) {
            showSessionMenu(pageId);
        } else {
            const sessionPath = pageId.replace('session-', '').replace('-page', '');
            const filePath = `sessions/${sessionPath}.html`;

            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    // Add completion checkbox to the session content
                    const sessionId = pageId;
                    const isCompleted = progressTracker.isSessionComplete(sessionId);
                    const completionCheckbox = `
                        <div class="session-completion" style="position: sticky; top: 80px; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 16px 0; z-index: 5;">
                            <label class="flex items-center cursor-pointer">
                                <input type="checkbox" id="session-complete-${sessionId}" class="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" ${isCompleted ? 'checked' : ''}>
                                <span class="text-sm font-medium text-gray-700">Mark this session as complete</span>
                                ${isCompleted ? '<span class="ml-2 text-green-600 text-sm">✓ Completed</span>' : ''}
                            </label>
                        </div>
                    `;
                    
                    sessionContainer.innerHTML = completionCheckbox + html;
                    sessionContainer.classList.add('active');
                    
                    // Add event listener for completion checkbox
                    const checkbox = document.getElementById(`session-complete-${sessionId}`);
                    if (checkbox) {
                        checkbox.addEventListener('change', (e) => {
                            if (e.target.checked) {
                                progressTracker.markSessionComplete(sessionId);
                                // Add visual feedback
                                const completedSpan = e.target.parentElement.querySelector('span:last-child') || document.createElement('span');
                                completedSpan.textContent = '✓ Completed';
                                completedSpan.className = 'ml-2 text-green-600 text-sm';
                                if (!e.target.parentElement.contains(completedSpan)) {
                                    e.target.parentElement.appendChild(completedSpan);
                                }
                            }
                        });
                    }

                    // Re-attach event listeners for any new buttons in the loaded content if necessary
                    const backButton = sessionContainer.querySelector('button');
                    // Store the current module ID before navigating to a session
                    const currentModuleId = sessionStorage.getItem('currentModuleId');
                    if (currentModuleId) {
                         sessionStorage.setItem('lastVisitedModule', currentModuleId);
                    }
                   
                    if(backButton) {
 backButton.onclick = () => {
 const lastModule = sessionStorage.getItem('lastVisitedModule');
                            if (lastModule) {
 navigateTo(lastModule);
                                sessionStorage.removeItem('lastVisitedModule'); // Clear after use
                            } else {
 navigateTo('main-page');
                            }
                        };
                    }
                })
                .catch(error => {
                    console.error('Error fetching session content:', error);
                    sessionContainer.innerHTML = '<p class="text-red-500">Error loading content. Please try again later.</p>';
                    sessionContainer.classList.add('active');
                });
        }

        headerTitle.textContent = pageTitles[pageId] || pageTitles['main-page'];
        if (pageId !== 'main-page') {
            window.scrollTo(0, 0);
        }

        // Store the current module ID when navigating to a module session menu
        if (pageId.startsWith('module-')) {
            sessionStorage.setItem('currentModuleId', pageId);
        }

    }

    // Make navigateTo and progressTracker globally accessible
    window.navigateTo = navigateTo;
    window.progressTracker = progressTracker;

    // Set copyright year
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    // Set up initial page view - check for URL anchor first
    const hash = window.location.hash.substring(1); // Remove the # symbol
    if (hash && Object.keys(pageTitles).includes(hash)) {
        navigateTo(hash);
    } else {
        navigateTo('main-page');
    }

    // Initialize progress indicators on page load
    setTimeout(() => progressTracker.updateProgressIndicators(), 200);

    // --- Back to Top Button Logic ---
    const backToTopBtn = document.getElementById('back-to-top');
    
    // Show/hide back to top button based on scroll position
    function toggleBackToTopButton() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    // Smooth scroll to top function
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Event listeners for back to top
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Show/hide button on scroll
    window.addEventListener('scroll', toggleBackToTopButton);
    
    // Initial check on page load
    toggleBackToTopButton();
});
