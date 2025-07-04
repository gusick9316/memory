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
            const folders = await window.githubAPI.listFolderContents('학생목록');
            this.students = [];

            for (const folder of folders) {
                if (folder.type === 'dir') {
                    const studentData = await window.githubAPI.getFileContent(`학생목록/${folder.name}/data.json`);
                    if (studentData) {
                        this.students.push(studentData);
                    }
                }
            }

            this.renderStudents();
            
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    }

    async renderStudents() {
        const container = document.getElementById('students-list');
        container.innerHTML = '';

        if (this.students.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #718096;">
                    <p>아직 학생목록이 없습니다.</p>
                </div>
            `;
            return;
        }

        // 선생님과 학생 분리
        const teachers = this.students.filter(s => s.type === 'teacher');
        const students = this.students.filter(s => s.type === 'student');

        // 선생님 먼저 렌더링
        for (const teacher of teachers) {
            const element = await this.createStudentElement(teacher);
            container.appendChild(element);
        }

        // 학생 렌더링
        for (const student of students) {
            const element = await this.createStudentElement(student);
            container.appendChild(element);
        }
    }

    async createStudentElement(student) {
        const div = document.createElement('div');
        div.className = `student-item ${student.type} fade-in`;
        
        const imageUrl = await window.githubAPI.getImageUrl(student.imagePath);
        
        div.innerHTML = `
            <img src="${imageUrl}" alt="${student.name}" class="student-image" loading="lazy" />
            <div class="student-name">${student.name}</div>
        `;

        return div;
    }
}

// 전역 학생 매니저 인스턴스
window.studentsManager = new StudentsManager();

