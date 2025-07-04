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
            const folders = await window.githubAPI.listFolderContents('개발자');
            this.developers = [];

            for (const folder of folders) {
                if (folder.type === 'dir') {
                    const developerData = await window.githubAPI.getFileContent(`개발자/${folder.name}/data.json`);
                    if (developerData) {
                        this.developers.push(developerData);
                    }
                }
            }

            this.renderDevelopers();
            
        } catch (error) {
            console.error('Failed to load developers:', error);
        }
    }

    async renderDevelopers() {
        const container = document.getElementById('developers-list');
        container.innerHTML = '';

        if (this.developers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #718096;">
                    <p>아직 개발자가 없습니다.</p>
                </div>
            `;
            return;
        }

        for (const developer of this.developers) {
            const element = await this.createDeveloperElement(developer);
            container.appendChild(element);
        }
    }

    async createDeveloperElement(developer) {
        const div = document.createElement('div');
        div.className = 'developer-item fade-in';
        
        const imageUrl = await window.githubAPI.getImageUrl(developer.imagePath);
        
        div.innerHTML = `
            <img src="${imageUrl}" alt="${developer.name}" class="developer-image" loading="lazy" />
            <div class="developer-name">${developer.name}</div>
        `;

        return div;
    }
}

// 전역 개발자 매니저 인스턴스
window.developersManager = new DevelopersManager();

