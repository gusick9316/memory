// 학교 추억 저장소 - 보기 전용 버전
class SchoolMemoryViewer {
    constructor() {
        this.githubAPI = new GitHubAPI();
        this.currentTab = 'memories';
        this.isAuthenticated = false;
        this.backgroundMusic = null;
        this.isMusicPlaying = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }

    setupEventListeners() {
        // 인증 폼
        const authSubmit = document.getElementById('auth-submit');
        const secretCode = document.getElementById('secret-code');
        
        authSubmit.addEventListener('click', () => this.authenticate());
        secretCode.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.authenticate();
        });

        // 탭 네비게이션
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('memories');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('students');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('developers');
                        break;
                }
            }
        });

        // 음악 컨트롤
        const musicToggle = document.getElementById('music-toggle');
        musicToggle.addEventListener('click', () => this.toggleMusic());
    }

    checkAuthentication() {
        const savedAuth = localStorage.getItem('school-memory-auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                if (authData.timestamp && Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
                    this.initializeApp(authData.username, authData.repo, authData.token);
                    return;
                }
            } catch (error) {
                console.error('인증 데이터 파싱 오류:', error);
            }
        }
        this.showScreen('auth-screen');
    }

    async authenticate() {
        const secretCode = document.getElementById('secret-code').value;
        
        if (!secretCode) {
            alert('비밀코드를 입력해주세요.');
            return;
        }

        this.showScreen('loading-screen');
        
        try {
            // 비밀코드를 기반으로 GitHub 정보 추출
            const authInfo = this.parseSecretCode(secretCode);
            
            if (!authInfo) {
                throw new Error('올바르지 않은 비밀코드입니다.');
            }

            await this.initializeApp(authInfo.username, authInfo.repo, authInfo.token);
            
            // 인증 정보 저장
            localStorage.setItem('school-memory-auth', JSON.stringify({
                username: authInfo.username,
                repo: authInfo.repo,
                token: authInfo.token,
                timestamp: Date.now()
            }));

        } catch (error) {
            console.error('인증 오류:', error);
            alert('인증에 실패했습니다. 비밀코드를 확인해주세요.');
            this.showScreen('auth-screen');
        }
    }

    parseSecretCode(secretCode) {
        // 비밀코드 형식: username:repo:token
        const parts = secretCode.split(':');
        if (parts.length !== 3) {
            return null;
        }
        
        return {
            username: parts[0],
            repo: parts[1],
            token: parts[2]
        };
    }

    async initializeApp(username, repo, token) {
        try {
            await this.githubAPI.init(username, repo, token);
            this.isAuthenticated = true;
            
            this.showScreen('main-screen');
            await this.loadAllData();
            
        } catch (error) {
            console.error('앱 초기화 오류:', error);
            throw error;
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    switchTab(tabName) {
        // 탭 버튼 활성화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 탭 콘텐츠 표시
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    async loadAllData() {
        try {
            // 저장소 용량 업데이트
            await this.updateStorageInfo();
            
            // 모든 데이터 로드
            await Promise.all([
                this.loadMemories(),
                this.loadStudents(),
                this.loadDevelopers()
            ]);
            
        } catch (error) {
            console.error('데이터 로딩 오류:', error);
        }
    }

    async updateStorageInfo() {
        try {
            const size = await this.githubAPI.getRepoSize();
            document.getElementById('storage-usage').textContent = `${size}MB`;
        } catch (error) {
            console.error('저장소 정보 업데이트 오류:', error);
        }
    }

    async loadMemories() {
        const memoriesList = document.getElementById('memories-list');
        memoriesList.innerHTML = '<div class="loading">추억을 불러오는 중...</div>';

        try {
            const memories = await this.githubAPI.getMemories();
            
            if (memories.length === 0) {
                memoriesList.innerHTML = `
                    <div class="empty">
                        <h3>아직 추억이 없습니다</h3>
                        <p>첫 번째 추억을 기다리고 있어요!</p>
                    </div>
                `;
                return;
            }

            // 날짜순 정렬 (최신순)
            memories.sort((a, b) => new Date(b.date) - new Date(a.date));

            memoriesList.innerHTML = memories.map(memory => `
                <div class="memory-card">
                    <img src="${memory.imagePath}" alt="${memory.title}" class="memory-image" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23f0f0f0\\'/><text x=\\'50\\' y=\\'50\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23999\\'>이미지 없음</text></svg>'" />
                    <div class="memory-content">
                        <h3 class="memory-title">${this.escapeHtml(memory.title)}</h3>
                        <div class="memory-meta">
                            <span class="memory-date">${this.formatDate(memory.date)}</span>
                            <span class="memory-author">${this.escapeHtml(memory.author)}</span>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('추억 로딩 오류:', error);
            memoriesList.innerHTML = `
                <div class="error">
                    <h3>추억을 불러올 수 없습니다</h3>
                    <p>네트워크 연결을 확인해주세요.</p>
                </div>
            `;
        }
    }

    async loadStudents() {
        const studentsList = document.getElementById('students-list');
        studentsList.innerHTML = '<div class="loading">학생목록을 불러오는 중...</div>';

        try {
            const students = await this.githubAPI.getStudents();
            
            if (students.length === 0) {
                studentsList.innerHTML = `
                    <div class="empty">
                        <h3>아직 학생 정보가 없습니다</h3>
                        <p>학생들의 정보를 기다리고 있어요!</p>
                    </div>
                `;
                return;
            }

            // 이름순 정렬
            students.sort((a, b) => a.name.localeCompare(b.name));

            studentsList.innerHTML = students.map(student => `
                <div class="album-card">
                    <img src="${student.imagePath}" alt="${student.name}" class="album-image" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23f0f0f0\\'/><text x=\\'50\\' y=\\'50\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23999\\'>이미지 없음</text></svg>'" />
                    <div class="album-content">
                        <h3 class="album-name">${this.escapeHtml(student.name)}</h3>
                        <span class="album-type">${student.type === 'student' ? '학생' : '선생님'}</span>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('학생목록 로딩 오류:', error);
            studentsList.innerHTML = `
                <div class="error">
                    <h3>학생목록을 불러올 수 없습니다</h3>
                    <p>네트워크 연결을 확인해주세요.</p>
                </div>
            `;
        }
    }

    async loadDevelopers() {
        const developersList = document.getElementById('developers-list');
        developersList.innerHTML = '<div class="loading">개발자 정보를 불러오는 중...</div>';

        try {
            const developers = await this.githubAPI.getDevelopers();
            
            if (developers.length === 0) {
                developersList.innerHTML = `
                    <div class="empty">
                        <h3>아직 개발자 정보가 없습니다</h3>
                        <p>개발자들의 정보를 기다리고 있어요!</p>
                    </div>
                `;
                return;
            }

            // 이름순 정렬
            developers.sort((a, b) => a.name.localeCompare(b.name));

            developersList.innerHTML = developers.map(developer => `
                <div class="album-card">
                    <img src="${developer.imagePath}" alt="${developer.name}" class="album-image" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23f0f0f0\\'/><text x=\\'50\\' y=\\'50\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23999\\'>이미지 없음</text></svg>'" />
                    <div class="album-content">
                        <h3 class="album-name">${this.escapeHtml(developer.name)}</h3>
                        <span class="album-type">개발자</span>
                    </div>
                </div>
            `).join('');

            // 배경 음악 설정
            await this.setupBackgroundMusic();

        } catch (error) {
            console.error('개발자 정보 로딩 오류:', error);
            developersList.innerHTML = `
                <div class="error">
                    <h3>개발자 정보를 불러올 수 없습니다</h3>
                    <p>네트워크 연결을 확인해주세요.</p>
                </div>
            `;
        }
    }

    async setupBackgroundMusic() {
        try {
            const musicUrl = await this.githubAPI.getBackgroundMusicUrl();
            if (musicUrl) {
                this.backgroundMusic = document.getElementById('background-music');
                this.backgroundMusic.src = musicUrl;
                this.backgroundMusic.volume = 0.3; // 볼륨 30%
            }
        } catch (error) {
            console.error('배경 음악 설정 오류:', error);
        }
    }

    toggleMusic() {
        if (!this.backgroundMusic) return;

        const musicBtn = document.getElementById('music-toggle');
        
        if (this.isMusicPlaying) {
            this.backgroundMusic.pause();
            musicBtn.classList.remove('active');
            musicBtn.textContent = '🎵';
            this.isMusicPlaying = false;
        } else {
            this.backgroundMusic.play().then(() => {
                musicBtn.classList.add('active');
                musicBtn.textContent = '🎶';
                this.isMusicPlaying = true;
            }).catch(error => {
                console.error('음악 재생 오류:', error);
                alert('음악을 재생할 수 없습니다.');
            });
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// GitHub API 클래스 (간소화된 버전)
class GitHubAPI {
    constructor() {
        this.username = null;
        this.repo = null;
        this.token = null;
        this.baseUrl = 'https://api.github.com';
    }

    async init(username, repo, token) {
        this.username = username;
        this.repo = repo;
        this.token = token;

        try {
            const repoInfo = await this.getRepoInfo();
            return repoInfo;
        } catch (error) {
            console.error('GitHub API 초기화 오류:', error);
            throw error;
        }
    }

    async getRepoInfo() {
        const url = `${this.baseUrl}/repos/${this.username}/${this.repo}`;
        const response = await this.fetchWithAuth(url);
        
        if (!response.ok) {
            throw new Error(`저장소 정보를 가져오는데 실패했습니다: ${response.status}`);
        }
        
        return await response.json();
    }

    async getRepoSize() {
        try {
            const repoInfo = await this.getRepoInfo();
            return Math.round(repoInfo.size / 1024);
        } catch (error) {
            console.error('저장소 크기 확인 오류:', error);
            return 0;
        }
    }

    async fetchWithAuth(url, options = {}) {
        return fetch(url, {
            ...options,
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                ...options.headers
            }
        });
    }

    async getFileContent(path) {
        try {
            const url = `${this.baseUrl}/repos/${this.username}/${this.repo}/contents/${path}`;
            const response = await this.fetchWithAuth(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`파일을 가져오는데 실패했습니다: ${response.status}`);
            }
            
            const data = await response.json();
            return atob(data.content);
        } catch (error) {
            console.error('파일 내용 가져오기 오류:', error);
            return null;
        }
    }

    async getFolderContents(path) {
        try {
            const url = `${this.baseUrl}/repos/${this.username}/${this.repo}/contents/${path}`;
            const response = await this.fetchWithAuth(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`폴더 내용을 가져오는데 실패했습니다: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('폴더 내용 가져오기 오류:', error);
            return [];
        }
    }

    async getMemories() {
        try {
            const folders = await this.getFolderContents('추억');
            const memories = [];

            for (const folder of folders) {
                if (folder.type === 'dir') {
                    const dataContent = await this.getFileContent(`추억/${folder.name}/data.json`);
                    if (dataContent) {
                        try {
                            const memoryData = JSON.parse(dataContent);
                            memories.push({
                                ...memoryData,
                                imagePath: `https://raw.githubusercontent.com/${this.username}/${this.repo}/main/${memoryData.imagePath}`
                            });
                        } catch (error) {
                            console.error(`추억 데이터 파싱 오류 (${folder.name}):`, error);
                        }
                    }
                }
            }

            return memories;
        } catch (error) {
            console.error('추억 목록 가져오기 오류:', error);
            return [];
        }
    }

    async getStudents() {
        try {
            const folders = await this.getFolderContents('학생목록');
            const students = [];

            for (const folder of folders) {
                if (folder.type === 'dir') {
                    const dataContent = await this.getFileContent(`학생목록/${folder.name}/data.json`);
                    if (dataContent) {
                        try {
                            const studentData = JSON.parse(dataContent);
                            students.push({
                                ...studentData,
                                imagePath: `https://raw.githubusercontent.com/${this.username}/${this.repo}/main/${studentData.imagePath}`
                            });
                        } catch (error) {
                            console.error(`학생 데이터 파싱 오류 (${folder.name}):`, error);
                        }
                    }
                }
            }

            return students;
        } catch (error) {
            console.error('학생목록 가져오기 오류:', error);
            return [];
        }
    }

    async getDevelopers() {
        try {
            const folders = await this.getFolderContents('개발자');
            const developers = [];

            for (const folder of folders) {
                if (folder.type === 'dir') {
                    const dataContent = await this.getFileContent(`개발자/${folder.name}/data.json`);
                    if (dataContent) {
                        try {
                            const developerData = JSON.parse(dataContent);
                            developers.push({
                                ...developerData,
                                imagePath: `https://raw.githubusercontent.com/${this.username}/${this.repo}/main/${developerData.imagePath}`
                            });
                        } catch (error) {
                            console.error(`개발자 데이터 파싱 오류 (${folder.name}):`, error);
                        }
                    }
                }
            }

            return developers;
        } catch (error) {
            console.error('개발자 목록 가져오기 오류:', error);
            return [];
        }
    }

    async getBackgroundMusicUrl() {
        try {
            const musicContent = await this.getFileContent('music/background.txt');
            if (musicContent) {
                return musicContent.trim();
            }
            return null;
        } catch (error) {
            console.error('배경 음악 URL 가져오기 오류:', error);
            return null;
        }
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SchoolMemoryViewer();
});

