class MemoriesManager {
    constructor() {
        this.memories = [];
    }

    init() {
        // 일반 사용자용 버전에서는 추가/수정/삭제 기능 제거
        this.loadMemories();
    }

    async loadMemories() {
        try {
            const folders = await window.githubAPI.listFolderContents('추억');
            this.memories = [];
            
            for (const folder of folders) {
                if (folder.type === 'dir') {
                    try {
                        const dataPath = `${folder.path}/data.json`;
                        const memory = await window.githubAPI.getFileContent(dataPath);
                        if (memory) {
                            this.memories.push(memory);
                        }
                    } catch (error) {
                        console.error(`Failed to load memory from ${folder.path}:`, error);
                    }
                }
            }
            
            // 정렬: 최신순 (날짜 기준)
            this.memories.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            this.renderMemories();
        } catch (error) {
            console.error('Failed to load memories:', error);
            window.uiManager.showNotification('추억을 불러오는데 실패했습니다.', 'error');
        }
    }

    renderMemories() {
        const container = document.getElementById('memories-list');
        container.innerHTML = '';
        
        if (this.memories.length === 0) {
            container.innerHTML = '<div class="empty-message">추억이 없습니다.</div>';
            return;
        }
        
        for (const memory of this.memories) {
            const memoryElement = document.createElement('div');
            memoryElement.className = 'memory-item';
            
            const header = document.createElement('div');
            header.className = 'memory-header';
            
            const title = document.createElement('h3');
            title.className = 'memory-title';
            title.textContent = memory.title;
            
            const meta = document.createElement('div');
            meta.className = 'memory-meta';
            meta.textContent = `${memory.author} · ${memory.date}`;
            
            header.appendChild(title);
            header.appendChild(meta);
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'memory-image-container';
            
            if (memory.imagePath) {
                const image = document.createElement('img');
                image.className = 'memory-image';
                image.src = `https://raw.githubusercontent.com/${window.authManager.githubUsername}/${window.authManager.githubRepo}/main/${memory.imagePath}`;
                image.alt = memory.title;
                image.loading = 'lazy';
                imageContainer.appendChild(image);
            }
            
            memoryElement.appendChild(header);
            memoryElement.appendChild(imageContainer);
            
            container.appendChild(memoryElement);
        }
    }
}

window.memoriesManager = new MemoriesManager();

