class App {
    constructor() {
        this.projects = [];
        this.completedProjects = [];
        this.mode = 'assigned';
        

        this.projects.push({
            id: Date.now().toString(),
            name: '',
            tasks: []
        });

        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        this.projectsList = document.getElementById('projects-list');
        this.btnAddProject = document.getElementById('btn-add-project');
        this.btnAssigned = document.getElementById('btn-assigned');
        this.btnCompleted = document.getElementById('btn-completed');
        this.btnImport = document.getElementById('btn-import');
        this.btnLoadAssigned = document.getElementById('btn-load-assigned');
        this.markdownOutput = document.getElementById('markdown-output');
        this.btnCopy = document.getElementById('btn-copy');
        this.modal = document.getElementById('import-modal');
        this.importText = document.getElementById('import-text');
        this.btnCancelImport = document.getElementById('btn-cancel-import');
        this.btnConfirmImport = document.getElementById('btn-confirm-import');
    }

    bindEvents() {
        this.btnAddProject.addEventListener('click', () => this.addProject());
        this.btnAssigned.addEventListener('click', () => this.setMode('assigned'));
        this.btnCompleted.addEventListener('click', () => this.setMode('completed'));
        
        this.btnImport.addEventListener('click', () => this.openModal());
        this.btnCancelImport.addEventListener('click', () => this.closeModal());
        this.btnConfirmImport.addEventListener('click', () => this.importMarkdown());
        this.modal.addEventListener('click', (e) => {
            if(e.target === this.modal) this.closeModal();
        });

        this.btnCopy.addEventListener('click', () => this.copyToClipboard());
        this.btnLoadAssigned.addEventListener('click', () => this.loadAssignedToCompleted());
    }


    get currentProjects() {
        return this.mode === 'assigned' ? this.projects : this.completedProjects;
    }

    setMode(newMode) {
        this.mode = newMode;
        

        if (this.mode === 'assigned') {
            this.btnAssigned.classList.add('active');
            this.btnCompleted.classList.remove('active');
            this.btnLoadAssigned.classList.add('hidden');
        } else {
            this.btnAssigned.classList.remove('active');
            this.btnCompleted.classList.add('active');
            this.btnLoadAssigned.classList.remove('hidden');
        }

        this.render();
    }

    addProject() {
        this.currentProjects.push({
            id: Date.now().toString(),
            name: '',
            tasks: []
        });
        this.render();
    }

    removeProject(index) {
        this.currentProjects.splice(index, 1);
        this.render();
    }

    updateProjectName(index, name) {
        this.currentProjects[index].name = name;
        this.generateMarkdown();
    }

    addTask(projectIndex) {
        this.currentProjects[projectIndex].tasks.push({
            id: Date.now().toString(),
            text: '',
            isCompleted: false
        });
        this.render();
    }

    removeTask(projectIndex, taskIndex) {
        this.currentProjects[projectIndex].tasks.splice(taskIndex, 1);
        this.render();
    }

    updateTaskText(projectIndex, taskIndex, text) {
        this.currentProjects[projectIndex].tasks[taskIndex].text = text;
        this.generateMarkdown();
    }

    toggleTaskCompletion(projectIndex, taskIndex, isCompleted) {
        this.currentProjects[projectIndex].tasks[taskIndex].isCompleted = isCompleted;
        this.generateMarkdown();
    }

    loadAssignedToCompleted() {

        this.completedProjects = this.projects.map(p => ({
            id: p.id,
            name: p.name,
            tasks: p.tasks.map(t => ({
                id: t.id,
                text: t.text,
                isCompleted: false
            }))
        }));
        this.render();
    }


    render() {
        this.projectsList.innerHTML = '';
        
        this.currentProjects.forEach((project, pIndex) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            

            const header = document.createElement('div');
            header.className = 'project-header';
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'project-input';
            nameInput.placeholder = 'Project Name';
            nameInput.value = project.name;
            nameInput.oninput = (e) => this.updateProjectName(pIndex, e.target.value);

            const invalidBtn = document.createElement('button');
            invalidBtn.className = 'icon-btn delete-btn';
            invalidBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
            invalidBtn.onclick = () => this.removeProject(pIndex);

            header.appendChild(nameInput);
            header.appendChild(invalidBtn);
            projectCard.appendChild(header);


            const taskList = document.createElement('div');
            taskList.className = 'task-list';

            project.tasks.forEach((task, tIndex) => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';


                if (this.mode === 'completed') {
                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.className = 'task-checkbox-container';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'task-checkbox';
                    checkbox.checked = task.isCompleted;
                    checkbox.onchange = (e) => this.toggleTaskCompletion(pIndex, tIndex, e.target.checked);
                    
                    checkboxContainer.appendChild(checkbox);
                    taskItem.appendChild(checkboxContainer);
                }

                const taskInput = document.createElement('input');
                taskInput.type = 'text';
                taskInput.className = 'task-input';
                taskInput.placeholder = 'Task description';
                taskInput.value = task.text;
                taskInput.oninput = (e) => this.updateTaskText(pIndex, tIndex, e.target.value);

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'icon-btn delete-btn delete-task-btn';
                deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                deleteBtn.onclick = () => this.removeTask(pIndex, tIndex);

                taskItem.appendChild(taskInput);
                taskItem.appendChild(deleteBtn);
                taskList.appendChild(taskItem);
            });

            projectCard.appendChild(taskList);


            const addTaskBtn = document.createElement('button');
            addTaskBtn.className = 'add-task-btn';
            addTaskBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Task';
            addTaskBtn.onclick = () => this.addTask(pIndex);
            
            projectCard.appendChild(addTaskBtn);

            this.projectsList.appendChild(projectCard);
        });

        this.generateMarkdown();
    }

    generateMarkdown() {
        const date = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = date.toLocaleDateString('en-US', options);

        let markdown = `**${dateString}**\n\n`;

        if (this.mode === 'assigned') {
            markdown += '**Assigned Tasks**\n\n';
            this.projects.forEach(project => {
                if (project.name) {
                    markdown += `**${project.name}**\n`;
                    project.tasks.forEach(task => {
                        if (task.text) {
                            markdown += `- ${task.text}\n`;
                        }
                    });
                    markdown += '\n';
                }
            });
        } else {
            markdown += '**Completed Tasks**\n\n';
            this.completedProjects.forEach(project => {
                if (project.name) {
                    markdown += `**${project.name}**\n`;
                    project.tasks.forEach(task => {
                        if (task.text) {
                            const checkMark = task.isCompleted ? ':white_check_mark:' : ':large_yellow_square:';
                            markdown += `- ${task.text} ${checkMark}\n`;
                        }
                    });
                    markdown += '\n';
                }
            });
        }

        this.markdownOutput.textContent = markdown.trim();
    }


    openModal() {
        this.modal.classList.remove('hidden');
        this.importText.value = '';
        this.importText.focus();
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }

    importMarkdown() {
        const text = this.importText.value;
        const lines = text.split('\n');
        
        let currentProject = null;
        let newProjects = [];

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;


            const projectMatch = line.match(/^\*\*(.*?)\*\*$/);

            // Enhanced check to ignore headers, dates with digits, or date strings like "Friday, December 19"
            const isDateString = /^\*\*\w+,\s+\w+\s+\d{1,2}(,\s+\d{4})?\*\*$/.test(line) || // matches "Friday, December 19" or "Friday, December 19, 2025"
                /^\*\*\d/.test(line) || // matches "**13 December**" (starts with digit)
                /^\*\*\d+\s+\w+\*\*$/.test(line) || // matches "**13 December**" explicit
                /^\*\*\w+\s+\d+\*\*$/.test(line); // matches "**December 13**"

            const isHeader = line.includes('Assigned Tasks') || line.includes('Completed Tasks') || isDateString;

            if (projectMatch && !isHeader) {
                currentProject = {
                    id: Date.now().toString() + Math.random(),
                    name: projectMatch[1],
                    tasks: []
                };
                newProjects.push(currentProject);
            } else if (line.startsWith('-') && currentProject) {
                let taskText = line.substring(1).trim();
                let isCompleted = false;

                // Handle old format: [x] or [ ]
                if (taskText.startsWith('[x]')) {
                    isCompleted = true;
                    taskText = taskText.substring(3).trim();
                } else if (taskText.startsWith('[ ]')) {
                    taskText = taskText.substring(3).trim();
                }
                // Handle new emoji format at the end
                else if (taskText.endsWith(':white_check_mark:')) {
                    isCompleted = true;
                    taskText = taskText.substring(0, taskText.length - ':white_check_mark:'.length).trim();
                } else if (taskText.endsWith(':large_yellow_square:')) {
                    taskText = taskText.substring(0, taskText.length - ':large_yellow_square:'.length).trim();
                }

                currentProject.tasks.push({
                    id: Date.now().toString() + Math.random(),
                    text: taskText,
                    isCompleted: isCompleted
                });
            }
        });

        if (newProjects.length > 0) {
            if (this.mode === 'assigned') {
                this.projects = newProjects;
            } else {
                this.completedProjects = newProjects;
            }
            this.render();
        }

        this.closeModal();
    }

    copyToClipboard() {
        const text = this.markdownOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = this.btnCopy.innerHTML;
            this.btnCopy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
            setTimeout(() => {
                this.btnCopy.innerHTML = originalText;
            }, 2000);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
