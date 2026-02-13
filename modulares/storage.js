const KEY = "transactions_v1"; 

export function loadTransactions() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : []; 
  } catch {
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(KEY, JSON.stringify(transactions));
}
