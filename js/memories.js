// 추억 관리 기능 (보기 전용)
class MemoriesManager {
    constructor() {
        this.memories = [];
    }

    init() {
        this.loadMemories();
    }

    async loadMemories() {
        try {
            const folders = await window.githubAPI.listFolderContents('추억');
            this.memories = [];

            for (const folder of folders) {
                if (folder.type === 'dir') {
                    const memoryData = await window.githubAPI.getFileContent(`추억/${folder.name}/data.json`);
                    if (memoryData) {
                        this.memories.push(memoryData);
                    }
                }
            }

            // 날짜순 정렬 (오래된 것부터)
            this.memories.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            this.renderMemories();
            
        } catch (error) {
            console.error('Failed to load memories:', error);
        }
    }

    async renderMemories() {
        const container = document.getElementById('memories-list');
        container.innerHTML = '';

        if (this.memories.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #718096;">
                    <p>아직 추억이 없습니다.</p>
                </div>
            `;
            return;
        }

        for (const memory of this.memories) {
            const memoryElement = await this.createMemoryElement(memory);
            container.appendChild(memoryElement);
        }
    }

    async createMemoryElement(memory) {
        const div = document.createElement('div');
        div.className = 'memory-item fade-in';
        
        const imageUrl = await window.githubAPI.getImageUrl(memory.imagePath);
        
        div.innerHTML = `
            <div class="memory-header">
                <h3 class="memory-title">${memory.title}</h3>
                <div class="memory-meta">${memory.author}, ${memory.date}</div>
            </div>
            <img src="${imageUrl}" alt="${memory.title}" class="memory-image" loading="lazy" />
        `;

        return div;
    }
}

// 전역 추억 매니저 인스턴스
window.memoriesManager = new MemoriesManager();

