/*
 * Kanban Board — Zustand Store
 * Developed by Huncho.dev
 */

import { create } from 'zustand';
import { generateId, DEFAULT_COLUMNS } from '../utils/helpers';
import { loadFromStorage, saveToStorage } from '../hooks/useLocalStorage';

const getInitialColumns = () => {
  const saved = loadFromStorage();
  return saved || DEFAULT_COLUMNS;
};

const useBoardStore = create((set) => ({
  columns: getInitialColumns(),
  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),

  addColumn: (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    set((state) => {
      const newColumns = [
        ...state.columns,
        { id: generateId(), title: trimmed, cards: [] },
      ];
      saveToStorage(newColumns);
      return { columns: newColumns };
    });
  },

  deleteColumn: (columnId) => {
    set((state) => {
      const newColumns = state.columns.filter((col) => col.id !== columnId);
      saveToStorage(newColumns);
      return { columns: newColumns };
    });
  },

  editColumnTitle: (columnId, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    set((state) => {
      const newColumns = state.columns.map((col) =>
        col.id === columnId ? { ...col, title: trimmed } : col
      );
      saveToStorage(newColumns);
      return { columns: newColumns };
    });
  },

  clearColumn: (columnId) => {
    set((state) => {
      const newColumns = state.columns.map((col) =>
        col.id === columnId ? { ...col, cards: [] } : col
      );
      saveToStorage(newColumns);
      return { columns: newColumns };
    });
  },

  addCard: (columnId, { title, description = '', priority = 'medium' }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          cards: [
            ...col.cards,
            {
              id: generateId(),
              title: trimmedTitle,
              description: description.trim(),
              priority,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });
      saveToStorage(newColumns);
      return { columns: newColumns };
    });
  },

  deleteCard: (columnId, cardId) => {
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          cards: col.cards.filter((card) => card.id !== cardId),
        };
      });
      saveToStorage(newColumns);
      return { columns: newColumns };
    });
  },

  editCard: (columnId, cardId, updatedData) => {
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId ? { ...card, ...updatedData } : card
          ),
        };
      });
      saveToStorage(newColumns);
      return { columns: newColumns };
    });
  },

  moveCard: (fromColumnId, toColumnId, cardId) => {
    // Guard: same column = no-op
    if (fromColumnId === toColumnId) return;

    set((state) => {
      // Guard: both columns must exist
      const fromCol = state.columns.find((col) => col.id === fromColumnId);
      const toCol = state.columns.find((col) => col.id === toColumnId);
      if (!fromCol || !toCol) return state;

      // Guard: the card must actually be in the source column
      const movedCard = fromCol.cards.find((card) => card.id === cardId);
      if (!movedCard) return state;

      // Guard: the card must NOT already be in the target column (prevents duplication)
      if (toCol.cards.some((card) => card.id === cardId)) return state;

      // Atomic: remove from source + add to target in one pass
      const newColumns = state.columns.map((col) => {
        if (col.id === fromColumnId) {
          return { ...col, cards: col.cards.filter((card) => card.id !== cardId) };
        }
        if (col.id === toColumnId) {
          return { ...col, cards: [...col.cards, movedCard] };
        }
        return col;
      });

      saveToStorage(newColumns);
      return { columns: newColumns };
    });
  },
}));

export default useBoardStore;
