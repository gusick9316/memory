class DevelopersManager {
    constructor() {
        this.developers = [];
    }

    init() {
        // 일반 사용자용 버전에서는 추가/수정/삭제 기능 제거
        this.loadDevelopers();
        this.bindMusicEvents();
    }

    bindMusicEvents() {
        const musicToggle = document.getElementById('music-toggle');
        const backgroundMusic = document.getElementById('background-music');
        
        // 음악 URL 설정
        backgroundMusic.src = 'https://raw.githubusercontent.com/gusick9316/memory/main/music/background.mp3';
        
        musicToggle.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
                musicToggle.classList.add('active');
            } else {
                backgroundMusic.pause();
                musicToggle.classList.remove('active');
            }
        });
    }

    async loadDevelopers() {
        try {
            const folders = await window.githubAPI.listFolderContents('개발자');
            this.developers = [];
            
            for (const folder of folders) {
                if (folder.type === 'dir') {
                    try {
                        const dataPath = `${folder.path}/data.json`;
                        const developer = await window.githubAPI.getFileContent(dataPath);
                        if (developer) {
                            this.developers.push(developer);
                        }
                    } catch (error) {
                        console.error(`Failed to load developer from ${folder.path}:`, error);
                    }
                }
            }
            
            // 순서대로 정렬
            this.developers.sort((a, b) => a.order - b.order);
            
            this.renderDevelopers();
        } catch (error) {
            console.error('Failed to load developers:', error);
            window.uiManager.showNotification('개발자 목록을 불러오는데 실패했습니다.', 'error');
        }
    }

    renderDevelopers() {
        const container = document.getElementById('developers-list');
        container.innerHTML = '';
        
        if (this.developers.length === 0) {
            container.innerHTML = '<div class="empty-message">개발자가 없습니다.</div>';
            return;
        }
        
        const developersGrid = document.createElement('div');
        developersGrid.className = 'album-view';
        
        for (const developer of this.developers) {
            const developerElement = document.createElement('div');
            developerElement.className = 'developer-item';
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'developer-image-container';
            
            if (developer.imagePath) {
                const image = document.createElement('img');
                image.className = 'developer-image';
                image.src = `https://raw.githubusercontent.com/${window.authManager.githubUsername}/${window.authManager.githubRepo}/main/${developer.imagePath}`;
                image.alt = developer.name;
                image.loading = 'lazy';
                imageContainer.appendChild(image);
            }
            
            const info = document.createElement('div');
            info.className = 'developer-info';
            
            const name = document.createElement('h3');
            name.className = 'developer-name';
            name.textContent = developer.name;
            
            info.appendChild(name);
            
            developerElement.appendChild(imageContainer);
            developerElement.appendChild(info);
            
            developersGrid.appendChild(developerElement);
        }
        
        container.appendChild(developersGrid);
    }
}

window.developersManager = new DevelopersManager();

