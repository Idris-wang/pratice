class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateStats();
        this.updateDate();
        this.loadTheme();
    }

    bindEvents() {
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const clearCompletedBtn = document.getElementById('clearCompleted');
        const themeToggle = document.getElementById('themeToggle');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        themeToggle.addEventListener('click', () => this.toggleTheme());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('todo-checkbox')) {
                this.toggleTodo(e.target.dataset.id);
            } else if (e.target.classList.contains('fa-edit') || e.target.closest('.todo-btn.edit')) {
                this.editTodo(e.target.closest('.todo-item').dataset.id);
            } else if (e.target.classList.contains('fa-trash-alt') || e.target.closest('.todo-btn.delete')) {
                this.deleteTodo(e.target.closest('.todo-item').dataset.id);
            }
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (!text) {
            this.showToast('请输入待办事项内容', 'error');
            return;
        }

        if (this.editingId) {
            this.updateTodo(this.editingId, text);
            this.editingId = null;
            document.getElementById('addBtn').innerHTML = '<i class="fas fa-plus"></i>';
        } else {
            const todo = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                createdAt: new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            this.todos.unshift(todo);
            this.saveTodos();
            this.showToast('任务添加成功');
        }

        input.value = '';
        this.updateDisplay();
        this.updateStats();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.updateDisplay();
            this.updateStats();

            const message = todo.completed ? '任务已完成' : '任务已取消完成';
            this.showToast(message);
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            document.getElementById('todoInput').value = todo.text;
            document.getElementById('todoInput').focus();
            this.editingId = id;
            document.getElementById('addBtn').innerHTML = '<i class="fas fa-check"></i>';
        }
    }

    updateTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            this.saveTodos();
            this.showToast('任务已更新');
        }
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');

            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.updateDisplay();
                this.updateStats();
                this.showToast('任务已删除');
            }, 300);
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;

        if (completedCount === 0) {
            this.showToast('没有已完成的任务', 'error');
            return;
        }

        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.updateDisplay();
        this.updateStats();
        this.showToast(`已清除 ${completedCount} 个已完成任务`);
    }

    setFilter(filter) {
        this.currentFilter = filter;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.updateDisplay();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(t => t.completed);
            case 'pending':
                return this.todos.filter(t => !t.completed);
            default:
                return this.todos;
        }
    }

    updateDisplay() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        }
    }

    createTodoHTML(todo) {
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-content">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
                        ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                    <div class="todo-actions">
                        <button class="todo-btn edit" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="todo-btn delete" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="todo-date">创建于 ${todo.createdAt}</div>
            </div>
        `;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;

        const clearBtn = document.getElementById('clearCompleted');
        clearBtn.disabled = completed === 0;
    }

    updateDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        document.getElementById('currentDate').textContent = dateString;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');

        toastMessage.textContent = message;
        toast.className = `toast ${type}`;

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('todo-theme', newTheme);

        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('todo-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('addBtn').click();
    }
});

window.addEventListener('beforeunload', () => {
    const app = window.todoApp;
    if (app) {
        app.saveTodos();
    }
});