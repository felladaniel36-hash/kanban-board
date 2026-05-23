/*
 * Kanban Board — Board Component
 * Developed by Huncho.dev
 */

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import Column from './Column';
import useBoardStore from '../store/useBoardStore';
import { PRIORITIES } from '../utils/helpers';

export default function Board() {
  const columns = useBoardStore((s) => s.columns);
  const searchQuery = useBoardStore((s) => s.searchQuery);
  const moveCard = useBoardStore((s) => s.moveCard);
  const addColumn = useBoardStore((s) => s.addColumn);

  const [activeCard, setActiveCard] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [columnError, setColumnError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const highlightedCards = useMemo(() => {
    if (!searchQuery.trim()) return new Set();
    const q = searchQuery.toLowerCase();
    const ids = new Set();
    columns.forEach((col) => {
      col.cards.forEach((card) => {
        if (
          card.title.toLowerCase().includes(q) ||
          card.description.toLowerCase().includes(q)
        ) ids.add(card.id);
      });
    });
    return ids;
  }, [searchQuery, columns]);

  const getActiveCardData = () => {
    if (!activeCard) return null;
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === activeCard.id);
      if (card) return card;
    }
    return null;
  };

  const handleDragStart = (event) => {
    setActiveCard({
      id: event.active.id,
      columnId: event.active.data?.current?.columnId,
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;
    const fromColumnId = active.data?.current?.columnId;
    const toColumnId = over.id;
    if (fromColumnId && toColumnId && fromColumnId !== toColumnId) {
      moveCard(fromColumnId, toColumnId, active.id);
    }
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      setColumnError('Column title is required');
      return;
    }
    addColumn(newColumnTitle.trim());
    setNewColumnTitle('');
    setShowAddColumn(false);
    setColumnError('');
  };

  const activeCardData = getActiveCardData();
  const activePriority = activeCardData
    ? PRIORITIES[activeCardData.priority] || PRIORITIES.medium
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveCard(null)}
    >
      <div className="flex gap-5 p-6 overflow-x-auto flex-1 items-start">
        <AnimatePresence mode="popLayout">
          {columns.map((column) => (
            <Column key={column.id} column={column} highlightedCards={highlightedCards} />
          ))}
        </AnimatePresence>

        {/* Add Column */}
        <div className="min-w-[320px]">
          <AnimatePresence mode="wait">
            {showAddColumn ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-surface-column rounded-2xl border border-edge space-y-3"
              >
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => {
                    setNewColumnTitle(e.target.value);
                    if (columnError) setColumnError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setShowAddColumn(false);
                      setNewColumnTitle('');
                      setColumnError('');
                    }
                  }}
                  placeholder="Column title..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-surface border border-edge rounded-xl text-txt placeholder-txt-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                />
                {columnError && (
                  <p className="text-xs text-err ml-1">{columnError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddColumn}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-brand hover:brightness-110 rounded-xl transition-all cursor-pointer"
                  >
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnTitle('');
                      setColumnError('');
                    }}
                    className="px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-input hover:bg-hover rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddColumn(true)}
                className="w-full py-4 text-sm font-medium text-txt-secondary hover:text-brand bg-surface-column/50 hover:bg-surface-column rounded-2xl border-2 border-dashed border-edge hover:border-brand transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Column
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCardData && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05, rotate: 2 }}
            className="p-3 bg-surface rounded-xl border border-brand shadow-xl w-[280px] opacity-95"
            style={{ boxShadow: '0 8px 30px var(--shadow-color)' }}
          >
            <h4 className="text-sm font-semibold text-txt">{activeCardData.title}</h4>
            {activeCardData.description && (
              <p className="mt-1 text-xs text-txt-secondary line-clamp-2">{activeCardData.description}</p>
            )}
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${activePriority.bgColor} ${activePriority.textColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activePriority.dotColor}`} />
                {activePriority.label}
              </span>
            </div>
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
