class StudentsManager {
    constructor() {
        this.students = [];
    }

    init() {
        // 일반 사용자용 버전에서는 추가/수정/삭제 기능 제거
        this.loadStudents();
    }

    async loadStudents() {
        try {
            const folders = await window.githubAPI.listFolderContents('학생목록');
            this.students = [];
            
            for (const folder of folders) {
                if (folder.type === 'dir') {
                    try {
                        const dataPath = `${folder.path}/data.json`;
                        const student = await window.githubAPI.getFileContent(dataPath);
                        if (student) {
                            this.students.push(student);
                        }
                    } catch (error) {
                        console.error(`Failed to load student from ${folder.path}:`, error);
                    }
                }
            }
            
            this.renderStudents();
        } catch (error) {
            console.error('Failed to load students:', error);
            window.uiManager.showNotification('학생 목록을 불러오는데 실패했습니다.', 'error');
        }
    }

    renderStudents() {
        const container = document.getElementById('students-list');
        container.innerHTML = '';
        
        if (this.students.length === 0) {
            container.innerHTML = '<div class="empty-message">학생이 없습니다.</div>';
            return;
        }
        
        // 선생님과 학생 분리
        const teachers = this.students.filter(s => s.type === 'teacher');
        const students = this.students.filter(s => s.type === 'student');
        
        // 순서대로 정렬
        teachers.sort((a, b) => a.order - b.order);
        students.sort((a, b) => a.order - b.order);
        
        // 선생님 섹션
        if (teachers.length > 0) {
            const teachersSection = document.createElement('div');
            teachersSection.className = 'students-section';
            
            const teachersTitle = document.createElement('h3');
            teachersTitle.textContent = '선생님';
            teachersSection.appendChild(teachersTitle);
            
            const teachersGrid = document.createElement('div');
            teachersGrid.className = 'album-view';
            
            for (const teacher of teachers) {
                const teacherElement = this.createStudentElement(teacher);
                teachersGrid.appendChild(teacherElement);
            }
            
            teachersSection.appendChild(teachersGrid);
            container.appendChild(teachersSection);
        }
        
        // 학생 섹션
        if (students.length > 0) {
            const studentsSection = document.createElement('div');
            studentsSection.className = 'students-section';
            
            const studentsTitle = document.createElement('h3');
            studentsTitle.textContent = '학생';
            studentsSection.appendChild(studentsTitle);
            
            const studentsGrid = document.createElement('div');
            studentsGrid.className = 'album-view';
            
            for (const student of students) {
                const studentElement = this.createStudentElement(student);
                studentsGrid.appendChild(studentElement);
            }
            
            studentsSection.appendChild(studentsGrid);
            container.appendChild(studentsSection);
        }
    }

    createStudentElement(student) {
        const studentElement = document.createElement('div');
        studentElement.className = 'student-item';
        
        // 선생님인 경우 추가 스타일
        if (student.type === 'teacher') {
            studentElement.classList.add('teacher-item');
        }
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'student-image-container';
        
        if (student.imagePath) {
            const image = document.createElement('img');
            image.className = 'student-image';
            image.src = `https://raw.githubusercontent.com/${window.authManager.githubUsername}/${window.authManager.githubRepo}/main/${student.imagePath}`;
            image.alt = student.name;
            image.loading = 'lazy';
            imageContainer.appendChild(image);
        }
        
        const info = document.createElement('div');
        info.className = 'student-info';
        
        const name = document.createElement('h3');
        name.className = 'student-name';
        name.textContent = student.name;
        
        const type = document.createElement('div');
        type.className = 'student-type';
        type.textContent = student.type === 'teacher' ? '선생님' : '학생';
        
        info.appendChild(name);
        info.appendChild(type);
        
        studentElement.appendChild(imageContainer);
        studentElement.appendChild(info);
        
        return studentElement;
    }
}

window.studentsManager = new StudentsManager();

