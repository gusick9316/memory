// 학생목록 관리 기능 (보기 전용)
class StudentsManager {
    constructor() {
        this.students = [];
    }

    init() {
        this.loadStudents();
    }

    async loadStudents() {
        try {
            const data = await window.githubAPI.getFileContent('students.json');
            if (data) {
                this.students = data;
                this.renderStudents();
            } else {
                this.renderStudents(); // 빈 상태 표시
            }
        } catch (error) {
            console.error('학생목록 로딩 실패:', error);
            this.renderStudents(); // 빈 상태 표시
        }
    }

    renderStudents() {
        const container = document.getElementById('students-list');
        container.innerHTML = '';

        if (this.students.length === 0) {
            container.innerHTML = '<div class="empty-state">아직 학생이 없습니다.</div>';
            return;
        }

        // order 순으로 정렬
        const sortedStudents = [...this.students].sort((a, b) => a.order - b.order);

        sortedStudents.forEach(student => {
            const studentElement = this.createStudentElement(student);
            container.appendChild(studentElement);
        });
    }

    createStudentElement(student) {
        const div = document.createElement('div');
        div.className = `student-card ${student.type}`;
        
        const imageUrl = student.image ? 
            `https://raw.githubusercontent.com/gusick9316/memory/main/students/${student.folder}/${student.image}` : 
            '';

        div.innerHTML = `
            <div class="student-content">
                <div class="student-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${student.name}" loading="lazy">` : '<div class="no-image">이미지 없음</div>'}
                </div>
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <span class="student-type">${student.type === 'teacher' ? '선생님' : '학생'}</span>
                </div>
            </div>
        `;

        return div;
    }
}

// 전역 변수로 등록
window.studentsManager = new StudentsManager();

