// Serviço completo de Notificações (Web Notification API + Áudio sintetizado + Notificações In-App)
import { getDaysDiff, formatCurrencyBRL } from './dateUtils';

// Toca um som suave de notificação usando a Web Audio API (sem precisar de arquivos externos)
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Primeiro tom (D5 - 587Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Segundo tom (A5 - 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn('Não foi possível reproduzir som de notificação:', err);
  }
}

// Verifica status da permissão do navegador
export function checkBrowserPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Solicita permissão ao usuário
export async function requestBrowserPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Erro ao pedir permissão de notificações:', err);
    return 'denied';
  }
}

// Envia notificação nativa do sistema / navegador
export function sendNativeNotification(title, body, tag = 'finance-alert') {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      body,
      tag,
      icon: '/favicon.svg',
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch (err) {
    console.error('Falha ao disparar notificação nativa:', err);
    return false;
  }
}

/**
 * Avalia as contas e gera as notificações requeridas:
 * - A cada 15 dias (diff === 15)
 * - A 7 dias (diff === 7)
 * - A 3 dias (diff === 3)
 * - No dia do pagamento pela manhã (diff === 0)
 * - Resumo das contas que vencem na semana (diff entre 0 e 7)
 * - Atrasadas (diff < 0)
 */
export function analyzeBillsForNotifications(bills) {
  const pendingBills = bills.filter(b => b.status === 'pending');
  const notifications = [];

  const dueToday = [];
  const due3Days = [];
  const due7Days = [];
  const due15Days = [];
  const dueThisWeek = [];
  const overdue = [];

  pendingBills.forEach(bill => {
    const diff = getDaysDiff(bill.dueDate);

    if (diff < 0) {
      overdue.push({ bill, diff: Math.abs(diff) });
    } else if (diff === 0) {
      dueToday.push(bill);
      dueThisWeek.push(bill);
    } else if (diff <= 7) {
      dueThisWeek.push(bill);
      if (diff === 3) due3Days.push(bill);
      if (diff === 7) due7Days.push(bill);
    } else if (diff === 15) {
      due15Days.push(bill);
    }
  });

  // 1. Notificação de Vencimento Hoje (Pela manhã)
  dueToday.forEach(bill => {
    notifications.push({
      id: `today-${bill.id}`,
      billId: bill.id,
      type: 'today',
      urgency: 'critical',
      title: '🚨 VENCE HOJE (Pela Manhã)!',
      message: `A conta "${bill.title}" no valor de ${formatCurrencyBRL(bill.amount)} vence hoje. Efetue o pagamento para evitar juros.`,
      bill,
      date: new Date().toISOString()
    });
  });

  // 2. Notificação a 3 dias
  due3Days.forEach(bill => {
    notifications.push({
      id: `3days-${bill.id}`,
      billId: bill.id,
      type: '3days',
      urgency: 'high',
      title: '⚠️ VENCE EM 3 DIAS',
      message: `Atenção: "${bill.title}" (${formatCurrencyBRL(bill.amount)}) vence em 3 dias. Deixe o saldo reservado!`,
      bill,
      date: new Date().toISOString()
    });
  });

  // 3. Notificação a 7 dias
  due7Days.forEach(bill => {
    notifications.push({
      id: `7days-${bill.id}`,
      billId: bill.id,
      type: '7days',
      urgency: 'medium',
      title: '📅 VENCE EM 7 DIAS (1 Semana)',
      message: `Lembrete: "${bill.title}" (${formatCurrencyBRL(bill.amount)}) vence em 7 dias.`,
      bill,
      date: new Date().toISOString()
    });
  });

  // 4. Notificação a 15 dias
  due15Days.forEach(bill => {
    notifications.push({
      id: `15days-${bill.id}`,
      billId: bill.id,
      type: '15days',
      urgency: 'info',
      title: '🔔 AVISO PRÉVIO (15 DIAS)',
      message: `Organize-se: "${bill.title}" no valor de ${formatCurrencyBRL(bill.amount)} vence daqui a 15 dias.`,
      bill,
      date: new Date().toISOString()
    });
  });

  // 5. Alerta de Contas Atrasadas
  overdue.forEach(({ bill, diff }) => {
    notifications.push({
      id: `overdue-${bill.id}`,
      billId: bill.id,
      type: 'overdue',
      urgency: 'critical',
      title: '⛔ CONTA EM ATRASO!',
      message: `A conta "${bill.title}" (${formatCurrencyBRL(bill.amount)}) venceu há ${diff} ${diff === 1 ? 'dia' : 'dias'}!`,
      bill,
      date: new Date().toISOString()
    });
  });

  // 6. Resumo semanal das contas da semana
  if (dueThisWeek.length > 0) {
    const totalWeekly = dueThisWeek.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    notifications.push({
      id: `summary-week-${new Date().toISOString().slice(0, 10)}`,
      type: 'weekly-summary',
      urgency: 'weekly',
      title: '🗓️ CONTAS DA SEMANA',
      message: `Você tem ${dueThisWeek.length} conta(s) a pagar nesta semana totalizando ${formatCurrencyBRL(totalWeekly)}.`,
      items: dueThisWeek,
      date: new Date().toISOString()
    });
  }

  return {
    allAlerts: notifications,
    dueToday,
    due3Days,
    due7Days,
    due15Days,
    dueThisWeek,
    overdue
  };
}

/**
 * Dispara notificações automáticas com controle de histórico para não repetir no mesmo dia
 */
export function processAndTriggerNotifications(bills, soundEnabled = true, force = false) {
  const analysis = analyzeBillsForNotifications(bills);
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = 'finan_sent_notifications';
  
  let sentHistory = {};
  try {
    sentHistory = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch {
    sentHistory = {};
  }

  let triggeredCount = 0;

  analysis.allAlerts.forEach(alert => {
    const notificationKey = `${alert.id}_${todayKey}`;

    // Se já enviou hoje e não for forçado, ignora
    if (!force && sentHistory[notificationKey]) {
      return;
    }

    // Dispara notificação nativa
    const sent = sendNativeNotification(alert.title, alert.message, alert.id);
    if (sent || force) {
      triggeredCount++;
      sentHistory[notificationKey] = new Date().toISOString();
    }
  });

  if (triggeredCount > 0 && soundEnabled) {
    playNotificationSound();
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(sentHistory));
  } catch (err) {
    console.warn('Erro ao salvar histórico de notificações:', err);
  }

  return {
    triggeredCount,
    analysis
  };
}
