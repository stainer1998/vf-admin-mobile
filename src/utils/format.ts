export function formatMoney(v: number | string): string {
  return `$${Number(v).toLocaleString('es-CL')}`
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00').toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
