// Utilitários de data e moeda para o aplicativo financeiro

export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateToInput(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function formatCurrencyBRL(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

/**
 * Calcula a diferença em dias inteiros entre a data de vencimento e hoje (ou baseDate)
 * Ex: hoje = 04/10, vencimento = 04/10 => diff = 0 (vence hoje)
 * Ex: hoje = 04/10, vencimento = 07/10 => diff = 3 (vence em 3 dias)
 * Ex: hoje = 04/10, vencimento = 01/10 => diff = -3 (atrasada 3 dias)
 */
export function getDaysDiff(dueDateStr, baseDate = new Date()) {
  if (!dueDateStr) return 0;
  const due = parseDate(dueDateStr);
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const diffTime = due.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Retorna se o vencimento ocorre dentro dos próximos 7 dias (semana atual)
 */
export function isDueThisWeek(dueDateStr, baseDate = new Date()) {
  const diff = getDaysDiff(dueDateStr, baseDate);
  return diff >= 0 && diff <= 7;
}

/**
 * Retorna informações e estilo de urgência baseado nos dias restantes
 */
export function getDueStatusInfo(dueDateStr, isPaid) {
  if (isPaid) {
    return {
      text: 'Pago',
      type: 'paid',
      badgeClass: 'badge-paid',
      urgencyOrder: 99,
      daysDiff: 0
    };
  }

  const diff = getDaysDiff(dueDateStr);

  if (diff < 0) {
    const absDays = Math.abs(diff);
    return {
      text: `Atrasada (${absDays} ${absDays === 1 ? 'dia' : 'dias'})`,
      type: 'overdue',
      badgeClass: 'badge-overdue',
      urgencyOrder: 1,
      daysDiff: diff
    };
  }

  if (diff === 0) {
    return {
      text: 'Vence Hoje!',
      type: 'today',
      badgeClass: 'badge-today',
      urgencyOrder: 2,
      daysDiff: 0
    };
  }

  if (diff <= 3) {
    return {
      text: `Vence em ${diff} ${diff === 1 ? 'dia' : 'dias'}`,
      type: '3days',
      badgeClass: 'badge-danger',
      urgencyOrder: 3,
      daysDiff: diff
    };
  }

  if (diff <= 7) {
    return {
      text: `Vence em ${diff} dias (esta semana)`,
      type: '7days',
      badgeClass: 'badge-warning',
      urgencyOrder: 4,
      daysDiff: diff
    };
  }

  if (diff <= 15) {
    return {
      text: `Vence em ${diff} dias`,
      type: '15days',
      badgeClass: 'badge-info',
      urgencyOrder: 5,
      daysDiff: diff
    };
  }

  return {
    text: `Vence em ${diff} dias`,
    type: 'future',
    badgeClass: 'badge-neutral',
    urgencyOrder: 6,
    daysDiff: diff
  };
}
