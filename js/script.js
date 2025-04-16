/**
 * Sistema de Gestão de Projetos
 * Versão: 2.0.0
 * 
 * Este arquivo contém toda a lógica de funcionamento do sistema.
 */

// ========== DEFINIÇÃO DE DADOS ==========

/**
 * Membros do sistema
 * Cada membro tem um ID único, dados pessoais e profissionais, 
 * além de credenciais de acesso.
 */
let members = [
    { id: 1, name: 'João Silva', role: 'engineer', email: 'joao.silva@email.com', status: 'active', lastAccess: '2025-04-15', specialty: 'Engenharia Civil', phone: '999-888-777', password: 'membro' },
    { id: 2, name: 'Maria Santos', role: 'designer', email: 'maria.santos@email.com', status: 'active', lastAccess: '2025-04-14', specialty: 'UI/UX', phone: '111-222-333', password: 'membro' },
    { id: 3, name: 'Pedro Oliveira', role: 'engineer', email: 'pedro.oliveira@email.com', status: 'inactive', lastAccess: '2025-03-20', specialty: 'Engenharia Elétrica', phone: '444-555-666', password: 'membro' },
    { id: 4, name: 'Ana Costa', role: 'manager', email: 'ana.costa@email.com', status: 'active', lastAccess: '2025-04-16', specialty: 'Gestão de Projetos', phone: '777-888-999', password: 'membro' }
];

/**
 * Projetos gerenciados pelo sistema
 * Cada projeto tem ID único, informações de prazo, responsáveis e membros associados.
 */
let projects = [
    { id: 1, name: 'Desenvolvimento de Infraestrutura', description: 'Projeto para desenvolver a infraestrutura básica.', startDate: '2025-03-01', endDate: '2025-06-30', manager: 'Ana Costa', managerId: 4, status: 'active', members: [1, 2, 4] },
    { id: 2, name: 'Redesenho da Interface', description: 'Melhorias na interface do usuário do sistema principal.', startDate: '2025-04-10', endDate: '2025-05-15', manager: 'Maria Santos', managerId: 2, status: 'planning', members: [2, 3] }
];

/**
 * Registro de atividades no sistema
 * Histórico de ações realizadas pelos usuários.
 */
let activities = [
    { memberId: 1, memberName: 'João Silva', activity: 'Adicionou documentação', project: 'Desenvolvimento de Infraestrutura', date: '2025-04-15' },
    { memberId: 2, memberName: 'Maria Santos', activity: 'Atualizou design', project: 'Redesenho da Interface', date: '2025-04-14' },
    { memberId: 4, memberName: 'Ana Costa', activity: 'Criou novo projeto', project: 'Desenvolvimento de Infraestrutura', date: '2025-03-01' }
];

/**
 * Administradores do sistema
 * Usuários com permissões especiais para gerenciar o sistema.
 */
let admins = [
    { id: 1, name: 'Administrador Principal', email: 'admin@sistema.com', password: 'admin', level: 'super' }
];

/**
 * Configurações globais do sistema
 */
let settings = {
    systemName: 'Sistema de Gestão de Projetos',
    institutionName: 'Empresa XYZ',
    engineerGoal: 50,
    activeThreshold: 30,
    appVersion: '2.0.0'
};

/**
 * Variáveis globais para controle de estado
 */
let currentUser = null;  // Usuário logado atualmente
let isAdmin = false;     // Se o usuário atual é um administrador
let editMemberId = null; // ID do membro sendo editado (se houver)
let editProjectId = null; // ID do projeto sendo editado (se houver)

// ========== INICIALIZAÇÃO DO SISTEMA ==========

/**
 * Inicializa o sistema quando o documento está pronto
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    // Se o DOMContentLoaded já disparou
    initializeSystem();
}

/**
 * Função central de inicialização do sistema
 */
function initializeSystem() {
    console.log(`Inicializando Sistema de Gestão de Projetos v${settings.appVersion}...`);
    
    // Carregar dados salvos
    loadData();
    
    // Configurar eventos de navegação
    try {
        setupNavigation();
    } catch (e) {
        console.error("Erro ao configurar navegação:", e);
    }
    
    // Configurar eventos dos formulários
    try {
        setupFormEvents();
    } catch (e) {
        console.error("Erro ao configurar formulários:", e);
    }
    
    // Verificar se há um usuário logado
    checkLogin();
    
    // Tentar configurar controles de login
    try {
        setupLoginTypeToggle();
    } catch (e) {
        console.error("Erro ao configurar toggle de login:", e);
    }
    
    console.log("Sistema inicializado com sucesso!");
}

// ========== GERENCIAMENTO DE DADOS ==========

/**
 * Carrega dados do localStorage
 */
function loadData() {
    try {
        const savedMembers = localStorage.getItem('members');
        const savedProjects = localStorage.getItem('projects');
        const savedActivities = localStorage.getItem('activities');
        const savedSettings = localStorage.getItem('settings');
        const savedAdmins = localStorage.getItem('admins');
        
        if (savedMembers) members = JSON.parse(savedMembers);
        if (savedProjects) projects = JSON.parse(savedProjects);
        if (savedActivities) activities = JSON.parse(savedActivities);
        if (savedSettings) {
            // Mesclar configurações salvas com padrões
            const loadedSettings = JSON.parse(savedSettings);
            settings = { ...settings, ...loadedSettings };
        }
        if (savedAdmins) admins = JSON.parse(savedAdmins);
        
        console.log("Dados carregados do localStorage com sucesso");
    } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
        showNotification("Erro ao carregar dados. Alguns recursos podem não funcionar corretamente.", "error");
    }
}

/**
 * Salva dados no localStorage
 */
function saveData() {
    try {
        localStorage.setItem('members', JSON.stringify(members));
        localStorage.setItem('projects', JSON.stringify(projects));
        localStorage.setItem('activities', JSON.stringify(activities));
        localStorage.setItem('settings', JSON.stringify(settings));
        localStorage.setItem('admins', JSON.stringify(admins));
        
        console.log("Dados salvos no localStorage com sucesso");
        return true;
    } catch (error) {
        console.error("Erro ao salvar dados no localStorage:", error);
        showNotification("Erro ao salvar dados. Tente novamente ou entre em contato com o suporte.", "error");
        return false;
    }
}

// ========== AUTENTICAÇÃO E GERENCIAMENTO DE SESSÃO ==========

/**
 * Verifica se há um usuário logado e configura a sessão
 */
function checkLogin() {
    const loggedInUser = localStorage.getItem('currentUser');
    const userIsAdmin = localStorage.getItem('isAdmin');
    
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        isAdmin = userIsAdmin === 'true';
        
        console.log(`Usuário autenticado: ${currentUser.name} (${isAdmin ? 'Admin' : 'Membro'})`);
        
        showMainContent();
        updateUIForUserRole();
    } else {
        console.log("Nenhum usuário autenticado, exibindo tela de login");
        showLoginForm();
    }
}

/**
 * Exibe a tela de login
 */
function showLoginForm() {
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    
    if (loginSection && mainContent) {
        loginSection.style.display = 'block';
        mainContent.style.display = 'none';
    }
}

/**
 * Exibe o conteúdo principal do sistema
 */
function showMainContent() {
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    
    if (loginSection && mainContent) {
        loginSection.style.display = 'none';
        mainContent.style.display = 'block';
        
        // Atualizar a interface
        showTab('dashboard');
        updateDashboard();
        populateMembersTable();
        populateProjectsGrid();
        loadSettingsUI();
    }
}

/**
 * Configura elementos de UI de acordo com o papel do usuário
 */
function updateUIForUserRole() {
    if (isAdmin) {
        document.body.classList.add('is-admin');
        console.log("Interface configurada para administrador");
    } else {
        document.body.classList.remove('is-admin');
        console.log("Interface configurada para membro comum");
    }
}

/**
 * Configura o toggle de tipo de login, se os elementos existirem
 */
function setupLoginTypeToggle() {
    const loginAdminRadio = document.getElementById('login-admin');
    const loginMemberRadio = document.getElementById('login-member');
    const loginTypeSelect = document.getElementById('login-type');
    
    // Verificar se os elementos existem
    if (!loginAdminRadio || !loginMemberRadio) {
        console.log("Elementos de rádio para tipo de login não encontrados. Ignorando configuração.");
        return;
    }
    
    // Adicionar evento de alteração para atualizar o botão de login
    loginAdminRadio.addEventListener('change', updateLoginButton);
    loginMemberRadio.addEventListener('change', updateLoginButton);
    
    // Sincronizar com o select oculto, se existir
    if (loginTypeSelect) {
        loginAdminRadio.addEventListener('change', function() {
            if (this.checked) loginTypeSelect.value = 'admin';
        });
        
        loginMemberRadio.addEventListener('change', function() {
            if (this.checked) loginTypeSelect.value = 'member';
        });
        
        // Definir estado inicial
        if (loginTypeSelect.value === 'admin') {
            loginAdminRadio.checked = true;
        } else {
            loginMemberRadio.checked = true;
        }
    }
    
    // Inicializar o texto do botão
    updateLoginButton();
}

/**
 * Atualiza o texto do botão de login com base no tipo selecionado
 */
function updateLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    if (!loginBtn) return;
    
    const loginAdmin = document.getElementById('login-admin');
    
    // Verificar qual tipo está selecionado
    if (loginAdmin && loginAdmin.checked) {
        loginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Entrar como Administrador';
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar como Membro';
    }
}

/**
 * Função de login - compatível com ambas as interfaces
 */
function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Verificar qual método de seleção de tipo está disponível no DOM
    let loginType;
    const loginAdminRadio = document.getElementById('login-admin');
    const loginTypeSelect = document.getElementById('login-type');
    
    // Determinar o tipo de login baseado no elemento disponível
    if (loginAdminRadio) {
        // Usando os novos radio buttons
        const isAdmin = loginAdminRadio.checked;
        loginType = isAdmin ? 'admin' : 'member';
    } else if (loginTypeSelect) {
        // Usando o dropdown select antigo
        loginType = loginTypeSelect.value;
    } else {
        // Fallback se nenhum controle for encontrado
        console.error("Elementos de seleção de tipo de login não encontrados!");
        showNotification('Erro no formulário de login. Por favor, recarregue a página.', 'error');
        return;
    }
    
    console.log(`Tentativa de login: ${email} (${loginType})`);
    
    if (!email || !password) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    if (loginType === 'admin') {
        // Verificar credenciais de admin
        const admin = admins.find(a => a.email === email && a.password === password);
        
        if (admin) {
            console.log(`Login de administrador bem-sucedido: ${admin.name}`);
            currentUser = admin;
            isAdmin = true;
            
            localStorage.setItem('currentUser', JSON.stringify(admin));
            localStorage.setItem('isAdmin', 'true');
            
            showMainContent();
            updateUIForUserRole();
            
            // Registrar atividade
            addActivity({
                memberId: admin.id,
                memberName: admin.name,
                activity: 'Login como administrador',
                project: 'Sistema',
                date: getCurrentDate()
            });
            
            showNotification(`Bem-vindo, ${admin.name}!`, 'success');
        } else {
            console.log(`Falha no login de administrador para: ${email}`);
            showNotification('Credenciais de administrador inválidas!', 'error');
        }
    } else {
        // Verificar credenciais de membro
        const member = members.find(m => m.email === email && m.password === password);
        
        if (member) {
            console.log(`Login de membro bem-sucedido: ${member.name}`);
            currentUser = member;
            isAdmin = false;
            
            localStorage.setItem('currentUser', JSON.stringify(member));
            localStorage.setItem('isAdmin', 'false');
            
            // Atualizar último acesso
            const index = members.findIndex(m => m.id === member.id);
            members[index].lastAccess = getCurrentDate();
            members[index].status = 'active';
            saveData();
            
            showMainContent();
            updateUIForUserRole();
            
            // Registrar atividade
            addActivity({
                memberId: member.id,
                memberName: member.name,
                activity: 'Login no sistema',
                project: 'Sistema',
                date: getCurrentDate()
            });
            
            showNotification(`Bem-vindo, ${member.name}!`, 'success');
        } else {
            console.log(`Falha no login de membro para: ${email}`);
            showNotification('Credenciais de membro inválidas!', 'error');
        }
    }
}

/**
 * Realiza o logout do sistema
 */
function logout() {
    // Registrar atividade
    if (currentUser) {
        addActivity({
            memberId: currentUser.id,
            memberName: currentUser.name,
            activity: 'Logout do sistema',
            project: 'Sistema',
            date: getCurrentDate()
        });
        
        console.log(`Logout realizado: ${currentUser.name}`);
    }
    
    currentUser = null;
    isAdmin = false;
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    
    showLoginForm();
    
    showNotification('Logout realizado com sucesso!', 'info');
}

// ========== NAVEGAÇÃO E INTERFACE ==========

/**
 * Configura eventos de navegação e interação com a interface
 */
function setupNavigation() {
    // Links de navegação principal
    const navItems = {
        'nav-dashboard': 'dashboard',
        'nav-members': 'members',
        'nav-projects': 'projects',
        'nav-admin': 'admin',
        'nav-logout': 'logout'
    };
    
    // Configurar cada link de navegação
    Object.entries(navItems).forEach(([id, action]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                if (action === 'logout') {
                    logout();
                } else {
                    showTab(action);
                }
            });
        }
    });
    
    // Configurar filtros e campos de busca
    setupFiltersAndSearch();
}

/**
 * Configura filtros e campos de busca
 */
function setupFiltersAndSearch() {
    // Pesquisa e filtros
    const searchElements = {
        'member-search': searchMembers,
        'member-filter': filterMembers,
        'project-search': searchProjects,
        'project-filter': filterProjects
    };
    
    // Configurar cada elemento de busca/filtro
    Object.entries(searchElements).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            const event = element.tagName === 'SELECT' ? 'change' : 'keyup';
            element.addEventListener(event, handler);
        }
    });
}

/**
 * Configura eventos para todos os formulários e botões do sistema
 */
function setupFormEvents() {
    // Configurar login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
    
    // Botões de adicionar
    setupAddButtons();
    
    // Botões de salvar/submit
    setupSaveButtons();
    
    // Botões de exportação
    setupExportButtons();
    
    // Fechamento de modais
    setupModalClosing();
    
    // Projetos clicáveis
    setupProjectCards();
}

/**
 * Configura botões de adicionar
 */
function setupAddButtons() {
    const addButtons = {
        'add-member-btn': function() {
            openModal('add-member-modal');
            resetMemberForm();
        },
        'add-project-btn': function() {
            openModal('add-project-modal');
            resetProjectForm();
            populateProjectManagerSelect();
        },
        'add-admin-btn': function() {
            openModal('add-admin-modal');
            resetAdminForm();
        }
    };
    
    // Configurar cada botão
    Object.entries(addButtons).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    });
}

/**
 * Configura botões de salvar
 */
function setupSaveButtons() {
    const saveButtons = {
        'save-member-btn': saveMember,
        'save-project-btn': saveProject,
        'save-admin-btn': saveAdmin,
        'save-settings': saveSettings,
        'refresh-activities': refreshActivities
    };
    
    // Configurar cada botão
    Object.entries(saveButtons).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    });
}

/**
 * Configura botões de exportação
 */
function setupExportButtons() {
    // Botões de exportação com data-type
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            exportData(this.getAttribute('data-type'));
        });
    });
    
    // Botão de backup
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', backupSystem);
    }
}

/**
 * Configura fechamento de modais
 */
function setupModalClosing() {
    // Fechamento pelos botões X
    document.querySelectorAll('.modal .close').forEach(close => {
        close.addEventListener('click', function() {
            closeModal(this.closest('.modal').id);
        });
    });
    
    // Fechamento ao clicar fora
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

/**
 * Configura cliques em cards de projeto
 */
function setupProjectCards() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.card')) {
            const card = e.target.closest('.card');
            if (card.dataset.projectId) {
                showProjectDetails(parseInt(card.dataset.projectId));
            }
        }
    });
}

/**
 * Exibe uma aba específica do sistema
 */
function showTab(tabId) {
    console.log(`Mudando para a aba: ${tabId}`);
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    } else {
        console.error(`Aba não encontrada: ${tabId}`);
    }
}

/**
 * Abre um modal pelo ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Fecha um modal pelo ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========== DASHBOARD ==========

/**
 * Atualiza o dashboard com os dados mais recentes
 */
function updateDashboard() {
    // Contadores
    updateDashboardCounters();
    
    // Atividades recentes
    populateActivitiesTable();
    
    // Projetos ativos
    populateActiveProjectsGrid();
}

/**
 * Atualiza os contadores do dashboard
 */
function updateDashboardCounters() {
    const counters = {
        'total-members': members.length,
        'total-engineers': members.filter(m => m.role === 'engineer').length,
        'total-designers': members.filter(m => m.role === 'designer').length,
        'active-members': members.filter(m => m.status === 'active').length
    };
    
    // Atualizar cada contador
    Object.entries(counters).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Meta de engenheiros
    const engineerGoalElement = document.getElementById('engineer-goal');
    if (engineerGoalElement) {
        engineerGoalElement.textContent = settings.engineerGoal;
    }
}

/**
 * Preenche a tabela de atividades recentes
 */
function populateActivitiesTable() {
    const tbody = document.querySelector('#activities-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">Não há atividades registradas.</td></tr>';
        return;
    }
    
    activities.slice(0, 10).forEach(activity => {  // Mostrar apenas as 10 mais recentes
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${activity.memberName}</td>
            <td>${activity.activity}</td>
            <td>${activity.project}</td>
            <td>${formatDate(activity.date)}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Preenche o grid de projetos ativos no dashboard
 */
function populateActiveProjectsGrid() {
    const grid = document.getElementById('active-projects-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const activeProjects = projects.filter(p => p.status === 'active');
    
    if (activeProjects.length === 0) {
        grid.innerHTML = '<p class="no-data">Não há projetos ativos no momento.</p>';
        return;
    }
    
    activeProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.projectId = project.id;
        
        card.innerHTML = `
            <div class="card-header">${escapeHTML(project.name)}</div>
            <div class="card-body">
                <p>${escapeHTML(truncateText(project.description, 100))}</p>
                <p><strong>Gerente:</strong> ${escapeHTML(project.manager)}</p>
                <p><strong>Membros:</strong> ${project.members.length}</p>
            </div>
            <div class="card-footer">
                <span>${formatDate(project.startDate)} - ${formatDate(project.endDate)}</span>
                <span class="badge badge-success">Ativo</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ========== MEMBROS ==========

/**
 * Preenche a tabela de membros
 */
function populateMembersTable() {
    const tbody = document.querySelector('#members-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Não há membros cadastrados.</td></tr>';
        return;
    }
    
    members.forEach(member => {
        const tr = document.createElement('tr');
        
        // Botões de ação só aparecem para administradores
        const actionButtons = isAdmin ? `
            <td class="admin-only">
                <button class="btn btn-primary btn-sm edit-member" data-id="${member.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm delete-member" data-id="${member.id}"><i class="fas fa-trash"></i></button>
            </td>
        ` : '';
        
        tr.innerHTML = `
            <td>${escapeHTML(member.name)}</td>
            <td>${getRoleName(member.role)}</td>
            <td>${escapeHTML(member.email)}</td>
            <td>
                <span class="status-indicator ${member.status === 'active' ? 'status-active' : 'status-inactive'}"></span>
                ${member.status === 'active' ? 'Ativo' : 'Inativo'}
            </td>
            <td>${formatDate(member.lastAccess)}</td>
            ${actionButtons}
        `;
        tbody.appendChild(tr);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-member').forEach(btn => {
        btn.addEventListener('click', function() {
            editMember(parseInt(this.dataset.id));
        });
    });
    
    document.querySelectorAll('.delete-member').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteMember(parseInt(this.dataset.id));
        });
    });
}

/**
 * Filtra membros com base no termo de busca
 */
function searchMembers() {
    const searchTerm = document.getElementById('member-search').value.toLowerCase();
    const rows = document.querySelectorAll('#members-table tbody tr');
    
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const role = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || role.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Filtra membros com base no filtro selecionado
 */
function filterMembers() {
    const filterValue = document.getElementById('member-filter').value;
    const rows = document.querySelectorAll('#members-table tbody tr');
    
    rows.forEach(row => {
        const role = row.cells[1].textContent.toLowerCase();
        const status = row.cells[3].textContent.toLowerCase();
        
        if (filterValue === 'all') {
            row.style.display = '';
        } else if (filterValue === 'active' && status.includes('ativo')) {
            row.style.display = '';
        } else if (filterValue === 'inactive' && status.includes('inativo')) {
            row.style.display = '';
        } else if (filterValue === 'engineer' && role.includes('engenheiro')) {
            row.style.display = '';
        } else if (filterValue === 'designer' && role.includes('designer')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Limpa e reseta o formulário de membro
 */
function resetMemberForm() {
    const formFields = [
        { id: 'member-name', value: '' },
        { id: 'member-email', value: '' },
        { id: 'member-role', value: 'engineer' },
        { id: 'member-specialty', value: '' },
        { id: 'member-phone', value: '' },
        { id: 'member-status', value: 'active' },
        { id: 'member-password', value: '' }
    ];
    
    // Limpar cada campo
    formFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) element.value = field.value;
    });
    
    // Resetar o ID de edição
    editMemberId = null;
    
    // Atualizar o botão
    const saveButton = document.getElementById('save-member-btn');
    if (saveButton) saveButton.textContent = 'Adicionar Membro';
}

/**
 * Salva um membro (novo ou edição)
 */
function saveMember() {
    // Obter valores do formulário
    const formData = {
        name: document.getElementById('member-name').value.trim(),
        email: document.getElementById('member-email').value.trim(),
        role: document.getElementById('member-role').value,
        specialty: document.getElementById('member-specialty').value.trim(),
        phone: document.getElementById('member-phone').value.trim(),
        status: document.getElementById('member-status').value,
        password: document.getElementById('member-password').value
    };
    
    // Validar campos obrigatórios
    if (!formData.name || !formData.email || !formData.role) {
        showNotification('Por favor, preencha os campos obrigatórios!', 'error');
        return;
    }
    
    // Verificar email único
    const emailExists = members.some(m => 
        m.email === formData.email && 
        (editMemberId === null || m.id !== editMemberId)
    );
    
    if (emailExists) {
        showNotification('Este email já está em uso por outro membro!', 'error');
        return;
    }
    
    const today = getCurrentDate();
    
    if (editMemberId === null) {
        // Adicionar novo membro
        addNewMember(formData, today);
    } else {
        // Atualizar membro existente
        updateExistingMember(formData, today);
    }
    
    // Fechar o modal
    closeModal('add-member-modal');
}

/**
 * Adiciona um novo membro
 */
function addNewMember(formData, date) {
    // Gerar ID único
    const id = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
    
    const newMember = {
        id: id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        specialty: formData.specialty,
        phone: formData.phone,
        status: formData.status,
        lastAccess: date,
        password: formData.password || 'membro'  // Senha padrão se nenhuma for fornecida
    };
    
    members.push(newMember);
    
    if (saveData()) {
        // Registrar atividade
        addActivity({
            memberId: currentUser.id,
            memberName: currentUser.name,
            activity: `Adicionou membro ${formData.name}`,
            project: 'Sistema',
            date: date
        });
        
        // Atualizar a interface
        populateMembersTable();
        updateDashboard();
        populateProjectManagerSelect();
        
        showNotification(`Membro ${formData.name} adicionado com sucesso!`, 'success');
    }
}

/**
 * Atualiza um membro existente
 */
function updateExistingMember(formData, date) {
    const index = members.findIndex(m => m.id === editMemberId);
    
    if (index !== -1) {
        // Manter o lastAccess original
        const lastAccess = members[index].lastAccess;
        const oldPassword = members[index].password;
        
        members[index] = {
            id: editMemberId,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            specialty: formData.specialty,
            phone: formData.phone,
            status: formData.status,
            lastAccess: lastAccess,
            password: formData.password || oldPassword  // Manter senha anterior se nenhuma nova for fornecida
        };
        
        if (saveData()) {
            // Registrar atividade
            addActivity({
                memberId: currentUser.id,
                memberName: currentUser.name,
                activity: `Atualizou membro ${formData.name}`,
                project: 'Sistema',
                date: date
            });
            
            // Atualizar a interface
            populateMembersTable();
            updateDashboard();
            populateProjectManagerSelect();
            
            showNotification(`Membro ${formData.name} atualizado com sucesso!`, 'success');
        }
    }
}

/**
 * Prepara a edição de um membro
 */
function editMember(id) {
    const member = members.find(m => m.id === id);
    
    if (!member) {
        showNotification('Membro não encontrado!', 'error');
        return;
    }
    
    // Preencher o formulário
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-email').value = member.email;
    document.getElementById('member-role').value = member.role;
    document.getElementById('member-specialty').value = member.specialty || '';
    document.getElementById('member-phone').value = member.phone || '';
    document.getElementById('member-status').value = member.status;
    document.getElementById('member-password').value = '';  // Não preencher a senha por segurança
    
    // Definir ID para edição
    editMemberId = id;
    
    // Atualizar o botão
    const saveButton = document.getElementById('save-member-btn');
    if (saveButton) saveButton.textContent = 'Atualizar Membro';
    
    // Abrir o modal
    openModal('add-member-modal');
}

/**
 * Exclui um membro
 */
function deleteMember(id) {
    if (!confirm('Tem certeza que deseja excluir este membro?')) {
        return;
    }
    
    const index = members.findIndex(m => m.id === id);
    
    if (index !== -1) {
        const memberName = members[index].name;
        
        // Remover membro
        members.splice(index, 1);
        
        // Atualizar projetos
        projects.forEach(project => {
            project.members = project.members.filter(memberId => memberId !== id);
            
            // Se o gerente for removido, atualizar o projeto
            if (project.managerId === id) {
                project.manager = 'Não atribuído';
                project.managerId = null;
            }
        });
        
        if (saveData()) {
            // Atualizar a interface
            populateMembersTable();
            updateDashboard();
            populateProjectsGrid();
            
            // Registrar atividade
            addActivity({
                memberId: currentUser.id,
                memberName: currentUser.name,
                activity: `Removeu membro ${memberName}`,
                project: 'Sistema',
                date: getCurrentDate()
            });
            
            showNotification(`Membro ${memberName} removido com sucesso!`, 'success');
        }
    }
}

// ========== PROJETOS ==========

/**
 * Preenche o grid de projetos
 */
function populateProjectsGrid() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (projects.length === 0) {
        grid.innerHTML = '<p class="no-data">Não há projetos cadastrados.</p>';
        return;
    }
    
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.projectId = project.id;
        
        let statusBadge = '';
        let statusClass = '';
        
        switch (project.status) {
            case 'active':
                statusBadge = 'Ativo';
                statusClass = 'badge-success';
                break;
            case 'completed':
                statusBadge = 'Concluído';
                statusClass = 'badge-primary';
                break;
            case 'planning':
                statusBadge = 'Planejamento';
                statusClass = 'badge-primary';
                break;
            case 'paused':
                statusBadge = 'Pausado';
                statusClass = 'badge-danger';
                break;
            default:
                statusBadge = project.status;
                statusClass = 'badge-primary';
        }
        
        card.innerHTML = `
            <div class="card-header">${escapeHTML(project.name)}</div>
            <div class="card-body">
                <p>${escapeHTML(truncateText(project.description, 100))}</p>
                <p><strong>Gerente:</strong> ${escapeHTML(project.manager)}</p>
                <p><strong>Membros:</strong> ${project.members.length}</p>
            </div>
            <div class="card-footer">
                <span>${formatDate(project.startDate)} - ${formatDate(project.endDate)}</span>
                <span class="badge ${statusClass}">${statusBadge}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Filtra projetos com base no termo de busca
 */
function searchProjects() {
    const searchTerm = document.getElementById('project-search').value.toLowerCase();
    const cards = document.querySelectorAll('#projects-grid .card');
    
    cards.forEach(card => {
        const name = card.querySelector('.card-header').textContent.toLowerCase();
        const description = card.querySelector('.card-body p:first-child').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Filtra projetos com base no filtro selecionado
 */
function filterProjects() {
    const filterValue = document.getElementById('project-filter').value;
    const cards = document.querySelectorAll('#projects-grid .card');
    
    cards.forEach(card => {
        const statusBadge = card.querySelector('.badge').textContent.toLowerCase();
        
        if (filterValue === 'all') {
            card.style.display = '';
        } else if (filterValue === 'active' && statusBadge.includes('ativo')) {
            card.style.display = '';
        } else if (filterValue === 'completed' && statusBadge.includes('concluído')) {
            card.style.display = '';
        } else if (filterValue === 'pending' && (statusBadge.includes('planejamento') || statusBadge.includes('pausado'))) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Preenche o select de gerentes de projeto
 */
function populateProjectManagerSelect() {
    const select = document.getElementById('project-manager');
    if (!select) return;
    
    select.innerHTML = '';
    
    const managers = members.filter(m => m.role === 'manager' && m.status === 'active');
    
    if (managers.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nenhum gerente disponível';
        select.appendChild(option);
        return;
    }
    
    managers.forEach(manager => {
        const option = document.createElement('option');
        option.value = manager.id;
        option.textContent = manager.name;
        select.appendChild(option);
    });
}

/**
 * Limpa e reseta o formulário de projeto
 */
function resetProjectForm() {
    // Limpar campos
    document.getElementById('project-name').value = '';
    document.getElementById('project-description').value = '';
    
    // Data atual
    const today = getCurrentDate();
    document.getElementById('project-start').value = today;
    
    // Data de término padrão (30 dias)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    document.getElementById('project-end').value = formatDateForInput(endDate);
    
    document.getElementById('project-status').value = 'planning';
    
    // Resetar o ID de edição
    editProjectId = null;
    
    // Atualizar o botão
    const saveButton = document.getElementById('save-project-btn');
    if (saveButton) saveButton.textContent = 'Adicionar Projeto';
}

/**
 * Salva um projeto (novo ou edição)
 */
function saveProject() {
    // Obter valores do formulário
    const formData = {
        name: document.getElementById('project-name').value.trim(),
        description: document.getElementById('project-description').value.trim(),
        startDate: document.getElementById('project-start').value,
        endDate: document.getElementById('project-end').value,
        managerId: parseInt(document.getElementById('project-manager').value) || null,
        status: document.getElementById('project-status').value
    };
    
    // Validar campos obrigatórios
    if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
        showNotification('Por favor, preencha os campos obrigatórios!', 'error');
        return;
    }
    
    // Validar datas
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
        showNotification('A data de início deve ser anterior à data de término!', 'error');
        return;
    }
    
    const today = getCurrentDate();
    
    // Encontrar gerente
    let managerName = 'Não atribuído';
    if (formData.managerId) {
        const manager = members.find(m => m.id === formData.managerId);
        if (manager) {
            managerName = manager.name;
        }
    }
    
    if (editProjectId === null) {
        // Adicionar novo projeto
        addNewProject(formData, managerName, today);
    } else {
        // Atualizar projeto existente
        updateExistingProject(formData, managerName, today);
    }
    
    // Fechar o modal
    closeModal('add-project-modal');
}

/**
 * Adiciona um novo projeto
 */
function addNewProject(formData, managerName, date) {
    // Gerar ID único
    const id = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    
    const newProject = {
        id: id,
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        manager: managerName,
        managerId: formData.managerId,
        status: formData.status,
        members: formData.managerId ? [formData.managerId] : []  // Incluir o gerente na lista de membros
    };
    
    projects.push(newProject);
    
    if (saveData()) {
        // Registrar atividade
        addActivity({
            memberId: currentUser.id,
            memberName: currentUser.name,
            activity: `Criou projeto ${formData.name}`,
            project: formData.name,
            date: date
        });
        
        // Atualizar a interface
        populateProjectsGrid();
        updateDashboard();
        
        showNotification(`Projeto ${formData.name} criado com sucesso!`, 'success');
    }
}

/**
 * Atualiza um projeto existente
 */
function updateExistingProject(formData, managerName, date) {
    const index = projects.findIndex(p => p.id === editProjectId);
    
    if (index !== -1) {
        // Manter membros existentes
        const existingMembers = projects[index].members;
        
        projects[index] = {
            id: editProjectId,
            name: formData.name,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
            manager: managerName,
            managerId: formData.managerId,
            status: formData.status,
            members: existingMembers
        };
        
        // Verificar se o gerente mudou e adicionar à lista se necessário
        if (formData.managerId && !existingMembers.includes(formData.managerId)) {
            projects[index].members.push(formData.managerId);
        }
        
        if (saveData()) {
            // Registrar atividade
            addActivity({
                memberId: currentUser.id,
                memberName: currentUser.name,
                activity: `Atualizou projeto ${formData.name}`,
                project: formData.name,
                date: date
            });
            
            // Atualizar a interface
            populateProjectsGrid();
            updateDashboard();
            
            showNotification(`Projeto ${formData.name} atualizado com sucesso!`, 'success');
        }
    }
}

/**
 * Exibe detalhes de um projeto
 */
function showProjectDetails(id) {
    const project = projects.find(p => p.id === id);
    
    if (!project) {
        showNotification('Projeto não encontrado!', 'error');
        return;
    }
    
    // Preencher dados do projeto
    document.getElementById('project-details-title').textContent = project.name;
    document.getElementById('project-details-description').textContent = project.description;
    document.getElementById('project-details-manager').textContent = project.manager;
    document.getElementById('project-details-start').textContent = formatDate(project.startDate);
    document.getElementById('project-details-end').textContent = formatDate(project.endDate);
    
    let statusText = '';
    switch (project.status) {
        case 'planning':
            statusText = 'Planejamento';
            break;
        case 'active':
            statusText = 'Em Andamento';
            break;
        case 'paused':
            statusText = 'Pausado';
            break;
        case 'completed':
            statusText = 'Concluído';
            break;
        default:
            statusText = project.status;
    }
    
    document.getElementById('project-details-status').textContent = statusText;
    
    // Listar membros do projeto
    const membersList = document.getElementById('project-members-list');
    membersList.innerHTML = '';
    
    if (project.members.length === 0) {
        membersList.innerHTML = '<li>Nenhum membro atribuído a este projeto.</li>';
    } else {
        project.members.forEach(memberId => {
            const member = members.find(m => m.id === memberId);
            if (member) {
                const li = document.createElement('li');
                li.textContent = `${member.name} (${getRoleName(member.role)})`;
                membersList.appendChild(li);
            }
        });
    }
    
    // Abrir o modal
    openModal('project-details-modal');
}

// ========== ADMINISTRADORES ==========

/**
 * Limpa e reseta o formulário de administrador
 */
function resetAdminForm() {
    document.getElementById('admin-name').value = '';
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-level').value = 'admin';
}

/**
 * Salva um novo administrador
 */
function saveAdmin() {
    const name = document.getElementById('admin-name').value.trim();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const level = document.getElementById('admin-level').value;
    
    if (!name || !email || !password) {
        showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Verificar email único
    const emailExists = admins.some(a => a.email === email);
    if (emailExists) {
        showNotification('Este email já está em uso por outro administrador!', 'error');
        return;
    }
    
    // Adicionar novo admin
    const id = admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1;
    
    const newAdmin = {
        id: id,
        name: name,
        email: email,
        password: password,
        level: level
    };
    
    admins.push(newAdmin);
    
    if (saveData()) {
        // Atualizar a tabela
        const tbody = document.querySelector('#admin-users-table tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHTML(name)}</td>
            <td>${escapeHTML(email)}</td>
            <td>${level === 'super' ? 'Super Admin' : 'Administrador'}</td>
            <td>
                <button class="btn btn-danger btn-sm delete-admin" data-id="${id}"><i class="fas fa-trash"></i> Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
        
        // Adicionar evento ao botão
        tr.querySelector('.delete-admin').addEventListener('click', function() {
            deleteAdmin(id);
        });
        
        // Registrar atividade
        addActivity({
            memberId: currentUser.id,
            memberName: currentUser.name,
            activity: `Adicionou administrador ${name}`,
            project: 'Sistema',
            date: getCurrentDate()
        });
        
        // Fechar o modal
        closeModal('add-admin-modal');
        resetAdminForm();
        
        showNotification(`Administrador ${name} adicionado com sucesso!`, 'success');
    }
}

/**
 * Remove um administrador
 */
function deleteAdmin(id) {
    if (!confirm('Tem certeza que deseja remover este administrador?')) {
        return;
    }
    
    // Não permitir remoção do admin principal
    if (id === 1) {
        showNotification('Não é possível remover o administrador principal do sistema!', 'error');
        return;
    }
    
    const index = admins.findIndex(a => a.id === id);
    
    if (index !== -1) {
        const adminName = admins[index].name;
        
        // Remover admin
        admins.splice(index, 1);
        
        if (saveData()) {
            // Remover da tabela
            const rows = document.querySelectorAll('#admin-users-table tbody tr');
            rows.forEach(row => {
                const deleteBtn = row.querySelector('.delete-admin');
                if (deleteBtn && parseInt(deleteBtn.dataset.id) === id) {
                    row.remove();
                }
            });
            
            // Registrar atividade
            addActivity({
                memberId: currentUser.id,
                memberName: currentUser.name,
                activity: `Removeu administrador ${adminName}`,
                project: 'Sistema',
                date: getCurrentDate()
            });
            
            showNotification(`Administrador ${adminName} removido com sucesso!`, 'success');
        }
    }
}

// ========== CONFIGURAÇÕES ==========

/**
 * Carrega as configurações do sistema para a interface
 */
function loadSettingsUI() {
    document.getElementById('system-title').value = settings.systemName;
    document.getElementById('institution-name').value = settings.institutionName;
    document.getElementById('engineer-goal-input').value = settings.engineerGoal;
    document.getElementById('active-threshold').value = settings.activeThreshold;
    document.getElementById('engineer-goal').textContent = settings.engineerGoal;
    document.getElementById('system-name').textContent = settings.systemName;
}

/**
 * Salva as configurações do sistema
 */
function saveSettings() {
    settings.systemName = document.getElementById('system-title').value.trim();
    settings.institutionName = document.getElementById('institution-name').value.trim();
    settings.engineerGoal = document.getElementById('engineer-goal-input').value;
    settings.activeThreshold = document.getElementById('active-threshold').value;
    
    if (saveData()) {
        // Atualizar elementos
        document.getElementById('engineer-goal').textContent = settings.engineerGoal;
        document.getElementById('system-name').textContent = settings.systemName;
        
        // Registrar atividade
        addActivity({
            memberId: currentUser.id,
            memberName: currentUser.name,
            activity: 'Atualizou configurações do sistema',
            project: 'Sistema',
            date: getCurrentDate()
        });
        
        showNotification('Configurações salvas com sucesso!', 'success');
    }
}

// ========== ATIVIDADES ==========

/**
 * Adiciona uma nova atividade ao registro
 */
function addActivity(activity) {
    activities.unshift(activity);
    
    // Limitar número de atividades
    if (activities.length > 100) {
        activities = activities.slice(0, 100);
    }
    
    saveData();
    populateActivitiesTable();
}

/**
 * Atualiza a tabela de atividades recentes
 */
function refreshActivities() {
    populateActivitiesTable();
    showNotification('Lista de atividades atualizada!', 'info');
}

// ========== EXPORTAÇÃO DE DADOS ==========

/**
 * Exporta dados do sistema em formato CSV
 */
function exportData(type) {
    let data;
    let filename;
    
    switch(type) {
        case 'members':
            data = members;
            filename = `membros_exportados_${getCurrentDate()}.csv`;
            break;
        case 'projects':
            data = projects;
            filename = `projetos_exportados_${getCurrentDate()}.csv`;
            break;
        case 'activities':
            data = activities;
            filename = `atividades_exportadas_${getCurrentDate()}.csv`;
            break;
        default:
            showNotification('Tipo de exportação inválido!', 'error');
            return;
    }
    
    if (!data || data.length === 0) {
        showNotification(`Não há dados de ${type} para exportar!`, 'warning');
        return;
    }
    
    try {
        // Converter para CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).join(','));
        const csv = [headers, ...rows].join('\n');
        
        // Criar download
        downloadFile(csv, filename, 'text/csv;charset=utf-8;');
        
        // Registrar atividade
        addActivity({
            memberId: currentUser.id,
            memberName: currentUser.name,
            activity: `Exportou dados (${type})`,
            project: 'Sistema',
            date: getCurrentDate()
        });
        
        showNotification(`Dados de ${type} exportados com sucesso!`, 'success');
    } catch (error) {
        console.error(`Erro ao exportar ${type}:`, error);
        showNotification(`Erro ao exportar dados de ${type}!`, 'error');
    }
}

/**
 * Cria um backup completo do sistema em formato JSON
 */
function backupSystem() {
    try {
        const backup = {
            members: members,
            projects: projects,
            activities: activities,
            settings: settings,
            admins: admins,
            version: settings.appVersion,
            date: new Date().toISOString()
        };
        
        // Criar download
        const jsonStr = JSON.stringify(backup, null, 2);
        const filename = `backup_sistema_${getCurrentDate().replace(/-/g, '')}.json`;
        
        downloadFile(jsonStr, filename, 'application/json');
        
        // Registrar atividade
        addActivity({
            memberId: currentUser.id,
            memberName: currentUser.name,
            activity: 'Realizou backup completo do sistema',
            project: 'Sistema',
            date: getCurrentDate()
        });
        
        showNotification('Backup do sistema realizado com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao criar backup:", error);
        showNotification('Erro ao criar backup do sistema!', 'error');
    }
}

/**
 * Utilitário para criar download de arquivo
 */
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ========== NOTIFICAÇÕES ==========

/**
 * Exibe uma notificação ao usuário
 */
function showNotification(message, type = 'info') {
    // Verificar se já existe um elemento de notificação
    let notification = document.querySelector('.notification');
    
    // Se não existir, criar um novo
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Definir a classe de acordo com o tipo
    notification.className = 'notification notification-' + type;
    
    // Definir o ícone de acordo com o tipo
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // Definir o conteúdo
    notification.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    // Mostrar a notificação
    notification.style.display = 'flex';
    
    // Animar a entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Esconder após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        // Remover após a animação
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

// ========== UTILITÁRIOS ==========

/**
 * Obtém a data atual no formato YYYY-MM-DD
 */
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * Formata uma data para exibição (DD/MM/YYYY)
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) return dateStr;
    
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
}

/**
 * Formata uma data para campo input (YYYY-MM-DD)
 */
function formatDateForInput(date) {
    if (!(date instanceof Date)) {
        return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Trunca um texto e adiciona reticências se necessário
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Retorna o nome da função em português
 */
function getRoleName(role) {
    const roles = {
        'engineer': 'Engenheiro',
        'designer': 'Designer',
        'manager': 'Gerente',
        'other': 'Outro'
    };
    return roles[role] || role;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHTML(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Credenciais de teste
console.log("Credenciais de teste disponíveis:");
console.log("Admin: admin@sistema.com / senha: admin");
console.log("Membro: joao.silva@email.com / senha: membro");