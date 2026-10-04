import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';

import './App.css';
import { 
  loadBills, 
  saveBills, 
  loadSalary, 
  saveSalary, 
  loadSettings, 
  saveSettings,
  getDefaultBills
} from './utils/storage';

import { 
  checkBrowserPermission, 
  requestBrowserPermission, 
  analyzeBillsForNotifications, 
  processAndTriggerNotifications,
  playNotificationSound 
} from './utils/notificationService';

import { getDaysDiff } from './utils/dateUtils';

import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { WeeklyAlertBanner } from './components/WeeklyAlertBanner';
import { BillFilter } from './components/BillFilter';
import { BillList } from './components/BillList';
import { BillModal } from './components/BillModal';
import { SalaryModal } from './components/SalaryModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { CategoryBreakdown } from './components/CategoryBreakdown';

function App() {
  // Estados principais
  const [bills, setBills] = useState(() => loadBills());
  const [salary, setSalary] = useState(() => loadSalary());
  const [settings, setSettings] = useState(() => loadSettings());
  const [permissionStatus, setPermissionStatus] = useState(() => checkBrowserPermission());

  // Estados de Modais
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Estados de Filtro e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDateAsc');

  // Notificações e Análise
  const { allAlerts, dueToday } = useMemo(() => {
    return analyzeBillsForNotifications(bills);
  }, [bills]);

  // Salvar no LocalStorage sempre que houver alteração
  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  useEffect(() => {
    saveSalary(salary);
  }, [salary]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Atualizar status de permissão
  useEffect(() => {
    setPermissionStatus(checkBrowserPermission());
  }, []);

  // Verificação periódica automática de notificações (ex: a cada 30 minutos ou quando a aba volta a ficar visível)
  useEffect(() => {
    const runCheck = () => {
      processAndTriggerNotifications(bills, settings.soundEnabled, false);
    };

    // Executa ao inicializar
    runCheck();

    const interval = setInterval(runCheck, 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, [bills, settings.soundEnabled]);

  // Manipular permissão de notificações nativas
  const handleRequestPermission = async () => {
    const result = await requestBrowserPermission();
    setPermissionStatus(result);
    if (result === 'granted') {
      // Dispara teste
      processAndTriggerNotifications(bills, settings.soundEnabled, true);
    }
  };

  // Alternar som de notificação
  const handleToggleSound = () => {
    const nextState = !settings.soundEnabled;
    setSettings(prev => ({ ...prev, soundEnabled: nextState }));
    if (nextState) {
      playNotificationSound();
    }
  };

  // Disparar teste imediato de notificação
  const handleTestNotification = async () => {
    if (permissionStatus !== 'granted') {
      const perm = await requestBrowserPermission();
      setPermissionStatus(perm);
    }
    const result = processAndTriggerNotifications(bills, settings.soundEnabled, true);
    if (settings.soundEnabled) {
      playNotificationSound();
    }
  };

  // Marcar conta como Paga ou Reabrir
  const handleToggleStatus = (billId) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        const nextStatus = bill.status === 'paid' ? 'pending' : 'paid';
        if (nextStatus === 'paid') {
          // Lança confetes de celebração por quitar a conta!
          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.75 },
              colors: ['#10b981', '#06b6d4', '#38bdf8', '#8b5cf6']
            });
          } catch (e) {
            // Ignora se der erro
          }
        }
        return {
          ...bill,
          status: nextStatus,
          paidAt: nextStatus === 'paid' ? new Date().toISOString() : null
        };
      }
      return bill;
    }));
  };

  // Salvar conta (Nova ou Editada)
  const handleSaveBill = (billData) => {
    if (editingBill) {
      setBills(prev => prev.map(b => b.id === billData.id ? billData : b));
    } else {
      setBills(prev => [billData, ...prev]);
    }
    setEditingBill(null);
  };

  // Abrir modal de edição
  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setIsBillModalOpen(true);
  };

  // Excluir conta
  const handleDeleteBill = (billId) => {
    const billToDelete = bills.find(b => b.id === billId);
    if (window.confirm(`Tem certeza que deseja excluir a conta "${billToDelete?.title}"?`)) {
      setBills(prev => prev.filter(b => b.id !== billId));
    }
  };

  // Salvar Salário
  const handleSaveSalary = (salaryData) => {
    setSalary(salaryData);
  };

  // Restaurar dados de exemplo
  const handleResetToDemo = () => {
    if (window.confirm('Deseja restaurar as contas e o salário com os dados de exemplo dinâmicos?')) {
      const demoBills = getDefaultBills();
      setBills(demoBills);
      saveBills(demoBills);
    }
  };

  // Exportar dados como JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ salary, bills, settings }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `finandark-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtragem e Ordenação das Contas
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // 1. Busca por texto
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = bill.title?.toLowerCase().includes(query);
        const matchesNotes = bill.notes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes) return false;
      }

      // 2. Categoria
      if (selectedCategory !== 'all' && bill.category !== selectedCategory) {
        return false;
      }

      // 3. Status
      const diff = getDaysDiff(bill.dueDate);
      if (statusFilter === 'pending' && bill.status !== 'pending') return false;
      if (statusFilter === 'paid' && bill.status !== 'paid') return false;
      if (statusFilter === 'overdue' && (bill.status === 'paid' || diff >= 0)) return false;
      if (statusFilter === 'week' && (bill.status === 'paid' || diff < 0 || diff > 7)) return false;
      if (statusFilter === '15days' && (bill.status === 'paid' || diff < 0 || diff > 15)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'dueDateDesc') {
        return b.dueDate.localeCompare(a.dueDate);
      }
      if (sortBy === 'amountDesc') {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      if (sortBy === 'amountAsc') {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }
      if (sortBy === 'titleAsc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [bills, searchTerm, selectedCategory, statusFilter, sortBy]);

  return (
    <div className="app-wrapper">
      {/* 1. Header do App */}
      <Header
        onOpenAddBill={() => {
          setEditingBill(null);
          setIsBillModalOpen(true);
        }}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
        alertCount={allAlerts.length}
        hasUrgentToday={dueToday.length > 0}
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestPermission}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
      />

      {/* 2. Resumo Financeiro (Salário, Contas a Pagar, Já Pago, Saldo Livre) */}
      <FinancialSummary
        salary={salary}
        bills={bills}
        onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
      />

      {/* 3. Banner Destaque de Vencimentos & Notificações (Hoje, 3 dias, 7 dias, 15 dias, Semana) */}
      <WeeklyAlertBanner
        bills={bills}
        onMarkPaid={handleToggleStatus}
        onTestNotification={handleTestNotification}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
      />

      {/* 4. Distribuição de Gastos por Categoria */}
      <CategoryBreakdown bills={bills} />

      {/* 5. Painel de Filtros e Busca */}
      <BillFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={bills.length}
        filteredCount={filteredBills.length}
      />

      {/* 6. Lista de Contas */}
      <BillList
        bills={filteredBills}
        onToggleStatus={handleToggleStatus}
        onEditBill={handleEditBill}
        onDeleteBill={handleDeleteBill}
        onOpenAddBill={() => {
          setEditingBill(null);
          setIsBillModalOpen(true);
        }}
      />

      {/* 7. Rodapé com Ações Rápidas */}
      <footer className="app-footer">
        <div>
          <span>FinanDark • Controle Financeiro Pessoal com Notificações Inteligentes</span>
        </div>
        <div className="footer-actions">
          <button type="button" className="btn-footer-link" onClick={handleResetToDemo}>
            Restaurar Dados de Exemplo
          </button>
          <span>•</span>
          <button type="button" className="btn-footer-link" onClick={handleExportData}>
            Exportar Backup (JSON)
          </button>
        </div>
      </footer>

      {/* Modais */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
        editingBill={editingBill}
      />

      <SalaryModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        salary={salary}
        onSave={handleSaveSalary}
      />

      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        bills={bills}
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestPermission}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onTestNotification={handleTestNotification}
      />
    </div>
  );
}

export default App;
