// Utility functions (localStorage-based functions replaced by Firebase/Firestore)

// Generate unique IDs (kept for compatibility; Firestore auto-generates IDs for new docs)
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
