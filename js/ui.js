class UIManager {
    constructor() {
        this.currentTab = 'memories';
    }

    init() {
        this.bindTabEvents();
        this.updateStorageInfo();
    }

    bindTabEvents() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // 현재 활성 탭 제거
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 새 탭 활성화
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showLoading(element) {
        element.disabled = true;
        const originalText = element.textContent;
        element.textContent = '처리중...';
        
        return () => {
            element.disabled = false;
            element.textContent = originalText;
        };
    }

    async updateStorageInfo() {
        try {
            const size = await window.githubAPI.getRepositorySize();
            document.getElementById('storage-usage').textContent = `${size}MB`;
        } catch (error) {
            console.error('Failed to update storage info:', error);
        }
    }
}

window.uiManager = new UIManager();

