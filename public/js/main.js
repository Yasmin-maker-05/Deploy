const API_URL = window.location.origin;

// ===== Header Scroll Effect =====
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ===== Mobile Menu Toggle =====
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
  });
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ===== Agendamento Form =====
const agendamentoForm = document.getElementById('agendamentoForm');
if (agendamentoForm) {
  agendamentoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(agendamentoForm);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Agendamento realizado com sucesso!', 'success');
        agendamentoForm.reset();
        setTimeout(() => window.location.href = 'agendamentos.html', 1500);
      } else {
        showToast(result.mensagem || 'Erro ao criar agendamento', 'error');
      }
    } catch (error) {
      showToast('Erro ao conectar com o servidor', 'error');
    }
  });
}

// ===== List Agendamentos =====
const agendamentosTable = document.getElementById('agendamentosTable');
if (agendamentosTable) {
  loadAgendamentos();
}

async function loadAgendamentos(search = '') {
  const tbody = document.querySelector('#agendamentosTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8" class="loading"><div class="spinner"></div></td></tr>';

  try {
    let url = `${API_URL}/agendamentos`;
    if (search) {
      url = `${API_URL}/agendamentos/busca?nome=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);
    const result = await response.json();
    const agendamentos = result.agendamentos || [];

    if (agendamentos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <div class="empty-state-icon">📅</div>
            <p>Nenhum agendamento encontrado</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = agendamentos.map(a => `
      <tr>
        <td>${a.nomePet}</td>
        <td>${a.especie}</td>
        <td>${a.nomeDono}</td>
        <td>${a.telefoneDono}</td>
        <td>${a.servico}</td>
        <td>${a.data}</td>
        <td><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></td>
        <td class="actions-cell">
          ${a.status === 'Agendado' ? `
            <button class="action-btn complete" onclick="updateStatus('${a._id}', 'Concluído')">Concluir</button>
            <button class="action-btn cancel" onclick="updateStatus('${a._id}', 'Cancelado')">Cancelar</button>
          ` : ''}
          <button class="action-btn delete" onclick="deleteAgendamento('${a._id}')">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <p>Erro ao carregar agendamentos</p>
        </td>
      </tr>
    `;
  }
}

async function updateStatus(id, status) {
  try {
    const response = await fetch(`${API_URL}/agendamentos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      showToast(`Agendamento ${status.toLowerCase()} com sucesso!`, 'success');
      loadAgendamentos(document.getElementById('searchInput')?.value || '');
    } else {
      showToast('Erro ao atualizar status', 'error');
    }
  } catch (error) {
    showToast('Erro ao conectar com o servidor', 'error');
  }
}

async function deleteAgendamento(id) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

  try {
    const response = await fetch(`${API_URL}/agendamentos/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('Agendamento excluído com sucesso!', 'success');
      loadAgendamentos(document.getElementById('searchInput')?.value || '');
    } else {
      showToast('Erro ao excluir agendamento', 'error');
    }
  } catch (error) {
    showToast('Erro ao conectar com o servidor', 'error');
  }
}

// ===== Search =====
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadAgendamentos(e.target.value);
    }, 300);
  });
}

// ===== Set minimum date for date input =====
const dateInput = document.getElementById('data');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}
