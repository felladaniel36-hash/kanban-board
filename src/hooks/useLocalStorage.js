/*
 * Kanban Board — LocalStorage Persistence
 * Developed by Huncho.dev
 */

const STORAGE_KEY = 'huncho-kanban-data';

export const saveToStorage = (data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('[Huncho.dev] Storage save failed:', err);
    return false;
  }
};

export const loadFromStorage = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;

    const data = JSON.parse(serialized);

    if (!Array.isArray(data)) {
      console.warn('[Huncho.dev] Corrupted data detected. Resetting.');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const isValid = data.every(
      (col) =>
        col &&
        typeof col.id === 'string' &&
        typeof col.title === 'string' &&
        Array.isArray(col.cards)
    );

    if (!isValid) {
      console.warn('[Huncho.dev] Invalid column structure. Resetting.');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Huncho.dev] Storage load failed:', err);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('[Huncho.dev] Storage clear failed:', err);
    return false;
  }
};
