import confetti from 'canvas-confetti';

export function formatXOF(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 XOF';
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XOF';
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#10B981', '#F59E0B', '#6366F1', '#3B82F6'],
    });
  } catch {
    // ignore
  }
}
