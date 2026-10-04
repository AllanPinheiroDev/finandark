// Gerenciamento de persistência local (LocalStorage) com dados demonstrativos dinâmicos
import { formatDateToInput } from './dateUtils';

const STORAGE_KEYS = {
  SALARY: 'finan_salary',
  BILLS: 'finan_bills',
  SETTINGS: 'finan_settings',
};

// Gera data relativa em dias a partir de hoje
function getRelativeDateStr(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return formatDateToInput(d);
}

// Dados iniciais dinâmicos baseados no dia de hoje para demonstrar imediatamente as regras de notificação
export function getDefaultBills() {
  return [
    {
      id: 'bill-1',
      title: 'Energia Elétrica (Enel / Luz)',
      amount: 215.80,
      dueDate: getRelativeDateStr(0), // Vence HOJE! (Alerta da manhã)
      category: 'servicos',
      status: 'pending',
      recurring: true,
      notes: 'Debitar na conta corrente pela manhã'
    },
    {
      id: 'bill-2',
      title: 'Internet Fibra Óptica 500MB',
      amount: 119.90,
      dueDate: getRelativeDateStr(3), // Vence em 3 dias!
      category: 'servicos',
      status: 'pending',
      recurring: true,
      notes: 'Boleto via e-mail'
    },
    {
      id: 'bill-3',
      title: 'Fatura Cartão de Crédito Black',
      amount: 1450.00,
      dueDate: getRelativeDateStr(7), // Vence em 7 dias! (1 semana)
      category: 'cartao',
      status: 'pending',
      recurring: true,
      notes: 'Compras do mês e parcelas'
    },
    {
      id: 'bill-4',
      title: 'Aluguel do Apartamento & Condomínio',
      amount: 1750.00,
      dueDate: getRelativeDateStr(15), // Vence em 15 dias!
      category: 'moradia',
      status: 'pending',
      recurring: true,
      notes: 'Transferência PIX para o proprietário'
    },
    {
      id: 'bill-5',
      title: 'Plano de Saúde Unimed',
      amount: 380.00,
      dueDate: getRelativeDateStr(21), // Vence daqui a 3 semanas
      category: 'saude',
      status: 'pending',
      recurring: true,
      notes: 'Débito automático'
    },
    {
      id: 'bill-6',
      title: 'Supermercado & Feira Semanal',
      amount: 620.00,
      dueDate: getRelativeDateStr(2), // Esta semana
      category: 'alimentacao',
      status: 'pending',
      recurring: true,
      notes: 'Compras essenciais'
    },
    {
      id: 'bill-7',
      title: 'Assinatura Spotify & Netflix',
      amount: 85.90,
      dueDate: getRelativeDateStr(-2), // Paga recentemente
      category: 'lazer',
      status: 'paid',
      paidAt: getRelativeDateStr(-2),
      recurring: true,
      notes: 'Débito no cartão'
    }
  ];
}

export function getDefaultSalary() {
  return {
    amount: 5800.00,
    payDay: 5, // Dia 5 de cada mês
    extraIncome: 0,
    notes: 'Salário Líquido Mensal'
  };
}

export function getDefaultSettings() {
  return {
    soundEnabled: true,
    morningHour: 8, // 08:00 AM
    notifyDays: [15, 7, 3, 0],
    browserNotificationsGranted: false,
    autoCheckIntervalMinutes: 30
  };
}

// Carregar salário
export function loadSalary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALARY);
    if (!raw) return getDefaultSalary();
    return JSON.parse(raw);
  } catch {
    return getDefaultSalary();
  }
}

// Salvar salário
export function saveSalary(salaryData) {
  try {
    localStorage.setItem(STORAGE_KEYS.SALARY, JSON.stringify(salaryData));
  } catch (err) {
    console.error('Erro ao salvar salário:', err);
  }
}

// Carregar contas
export function loadBills() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BILLS);
    if (!raw) {
      const defaults = getDefaultBills();
      saveBills(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultBills();
  } catch {
    return getDefaultBills();
  }
}

// Salvar contas
export function saveBills(bills) {
  try {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  } catch (err) {
    console.error('Erro ao salvar contas:', err);
  }
}

// Carregar configurações
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return getDefaultSettings();
    return { ...getDefaultSettings(), ...JSON.parse(raw) };
  } catch {
    return getDefaultSettings();
  }
}

// Salvar configurações
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Erro ao salvar configurações:', err);
  }
}
