document.addEventListener('DOMContentLoaded', function() {
    // 모든 매니저 초기화
    window.authSystem.init();
    window.uiManager.init();
    window.memoriesManager.init();
    window.studentsManager.init();
    window.developersManager.init();
    
    console.log('학교 추억 저장소 애플리케이션이 초기화되었습니다.');
});

// 전역 에러 핸들러
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    if (window.uiManager) {
        window.uiManager.showNotification('예상치 못한 오류가 발생했습니다.', 'error');
    }
});

// 네트워크 연결 상태 모니터링
window.addEventListener('online', function() {
    if (window.uiManager) {
        window.uiManager.showNotification('인터넷 연결이 복구되었습니다.', 'success');
    }
});

window.addEventListener('offline', function() {
    if (window.uiManager) {
        window.uiManager.showNotification('인터넷 연결이 끊어졌습니다.', 'error');
    }
});

// 터치 디바이스 감지 및 최적화
function isTouchDevice() {
    return (('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0));
}

if (isTouchDevice()) {
    document.body.classList.add('touch-device');
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // 탭 전환 (Ctrl/Cmd + 1/2/3)
    if ((e.ctrlKey || e.metaKey) && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const tabMap = {
            '1': 'memories',
            '2': 'students', 
            '3': 'developers'
        };
        const tabName = tabMap[e.key];
        if (window.uiManager && document.getElementById('main-screen').classList.contains('active')) {
            window.uiManager.switchTab(tabName);
        }
    }
});

