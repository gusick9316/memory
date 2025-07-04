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
            const data = await window.githubAPI.getFileContent('memories.json');
            if (data) {
                this.memories = data;
                this.renderMemories();
            } else {
                this.renderMemories(); // 빈 상태 표시
            }
        } catch (error) {
            console.error('추억 로딩 실패:', error);
            this.renderMemories(); // 빈 상태 표시
        }
    }

    renderMemories() {
        const container = document.getElementById('memories-list');
        container.innerHTML = '';

        if (this.memories.length === 0) {
            container.innerHTML = '<div class="empty-state">아직 추억이 없습니다.</div>';
            return;
        }

        // 날짜순으로 정렬 (최신순)
        const sortedMemories = [...this.memories].sort((a, b) => {
            const dateA = new Date(a.year, a.month - 1, a.day);
            const dateB = new Date(b.year, b.month - 1, b.day);
            return dateB - dateA;
        });

        sortedMemories.forEach(memory => {
            const memoryElement = this.createMemoryElement(memory);
            container.appendChild(memoryElement);
        });
    }

    createMemoryElement(memory) {
        const div = document.createElement('div');
        div.className = 'memory-item';
        
        const imageUrl = memory.image ? 
            `https://raw.githubusercontent.com/gusick9316/memory/main/memories/${memory.folder}/${memory.image}` : 
            '';

        div.innerHTML = `
            <div class="memory-content">
                <div class="memory-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${memory.title}" loading="lazy">` : '<div class="no-image">이미지 없음</div>'}
                </div>
                <div class="memory-info">
                    <h3>${memory.title}</h3>
                    <p class="memory-author">작성자: ${memory.author}</p>
                    <p class="memory-date">${memory.year}년 ${memory.month}월 ${memory.day}일</p>
                </div>
            </div>
        `;

        return div;
    }
}

// 전역 변수로 등록
window.memoriesManager = new MemoriesManager();

