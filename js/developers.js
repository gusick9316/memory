// 개발자 관리 기능 (보기 전용)
class DevelopersManager {
    constructor() {
        this.developers = [];
    }

    init() {
        this.loadDevelopers();
    }

    async loadDevelopers() {
        try {
            const data = await window.githubAPI.getFileContent('developers.json');
            if (data) {
                this.developers = data;
                this.renderDevelopers();
            } else {
                this.renderDevelopers(); // 빈 상태 표시
            }
        } catch (error) {
            console.error('개발자 로딩 실패:', error);
            this.renderDevelopers(); // 빈 상태 표시
        }
    }

    renderDevelopers() {
        const container = document.getElementById('developers-list');
        container.innerHTML = '';

        if (this.developers.length === 0) {
            container.innerHTML = '<div class="empty-state">아직 개발자가 없습니다.</div>';
            return;
        }

        // order 순으로 정렬
        const sortedDevelopers = [...this.developers].sort((a, b) => a.order - b.order);

        sortedDevelopers.forEach(developer => {
            const developerElement = this.createDeveloperElement(developer);
            container.appendChild(developerElement);
        });
    }

    createDeveloperElement(developer) {
        const div = document.createElement('div');
        div.className = 'developer-card';
        
        const imageUrl = developer.image ? 
            `https://raw.githubusercontent.com/gusick9316/memory/main/developers/${developer.folder}/${developer.image}` : 
            '';

        div.innerHTML = `
            <div class="developer-content">
                <div class="developer-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${developer.name}" loading="lazy">` : '<div class="no-image">이미지 없음</div>'}
                </div>
                <div class="developer-info">
                    <h3>${developer.name}</h3>
                </div>
            </div>
        `;

        return div;
    }
}

// 전역 변수로 등록
window.developersManager = new DevelopersManager();

