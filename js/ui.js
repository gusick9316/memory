// UI 관련 기능 (보기 전용)
class UIManager {
    constructor() {
        this.currentTab = 'memories';
    }

    init() {
        this.bindTabEvents();
        this.bindMusicEvents();
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

    bindMusicEvents() {
        const musicToggle = document.getElementById('music-toggle');
        const backgroundMusic = document.getElementById('background-music');
        
        // 음악 파일 설정
        backgroundMusic.src = 'https://raw.githubusercontent.com/gusick9316/memory/main/assets/background-music.mp3';
        
        musicToggle.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play().then(() => {
                    musicToggle.classList.add('active');
                    musicToggle.textContent = '🎵';
                }).catch(error => {
                    console.error('음악 재생 실패:', error);
                });
            } else {
                backgroundMusic.pause();
                musicToggle.classList.remove('active');
                musicToggle.textContent = '🔇';
            }
        });
    }

    showNotification(message, type = 'info') {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        // 3초 후 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// 전역 변수로 등록
window.uiManager = new UIManager();

