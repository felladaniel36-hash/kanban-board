/*
 * Kanban Board — Board Component
 * Developed by Huncho.dev
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import Column from './Column';
import useBoardStore from '../store/useBoardStore';
import { PRIORITIES } from '../utils/helpers';
import useEdgeScroll from '../hooks/useEdgeScroll';

export default function Board() {
  const columns = useBoardStore((s) => s.columns);
  const searchQuery = useBoardStore((s) => s.searchQuery);
  const moveCard = useBoardStore((s) => s.moveCard);
  const addColumn = useBoardStore((s) => s.addColumn);

  const [activeCard, setActiveCard] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [columnError, setColumnError] = useState('');

  /*
   * Board container scrolls in both directions:
   * - overflow-x for columns that go off-screen horizontally
   * - overflow-y for columns that grow taller than the viewport
   * The edge scroll hook handles auto-scrolling in all 4 directions.
   */
  const boardRef = useRef(null);
  useEdgeScroll(boardRef);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
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
        )
          ids.add(card.id);
      });
    });
    return ids;
  }, [searchQuery, columns]);

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveCard({
      id: active.id,
      columnId: active.data?.current?.columnId,
    });
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      setActiveCard(null);

      if (!over || !active) return;

      const fromColumnId = active.data?.current?.columnId;
      if (!fromColumnId) return;

      const currentColumns = useBoardStore.getState().columns;
      const columnIdSet = new Set(currentColumns.map((c) => c.id));

      let toColumnId = null;

      if (columnIdSet.has(over.id)) {
        toColumnId = over.id;
      }

      if (!toColumnId) return;
      if (fromColumnId === toColumnId) return;

      moveCard(fromColumnId, toColumnId, active.id);
    },
    [moveCard]
  );

  const handleDragCancel = useCallback(() => {
    setActiveCard(null);
  }, []);

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

  const activeCardData = useMemo(() => {
    if (!activeCard) return null;
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === activeCard.id);
      if (card) return card;
    }
    return null;
  }, [activeCard, columns]);

  const activePriority = activeCardData
    ? PRIORITIES[activeCardData.priority] || PRIORITIES.medium
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/*
       * Board scrolls in BOTH directions:
       * - overflow-x-auto: horizontal scroll for off-screen columns
       * - overflow-y-auto: vertical scroll when columns grow tall
       * - items-start: columns align to top, each grows independently
       */}
      <div
        ref={boardRef}
        className="flex gap-5 p-6 overflow-x-auto overflow-y-auto flex-1 items-start"
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            highlightedCards={highlightedCards}
          />
        ))}

        {/* Add Column */}
        <div className="min-w-[320px]">
          {showAddColumn ? (
            <div className="p-4 bg-surface-column rounded-2xl border border-edge space-y-3">
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
            </div>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className="w-full py-4 text-sm font-medium text-txt-secondary hover:text-brand bg-surface-column/50 hover:bg-surface-column rounded-2xl border-2 border-dashed border-edge hover:border-brand transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Column
            </button>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeCardData ? (
          <div
            className="p-3 bg-surface rounded-xl border border-brand w-[280px] opacity-90 pointer-events-none"
            style={{
              boxShadow: '0 12px 40px var(--shadow-color)',
              transform: 'rotate(2deg) scale(1.04)',
            }}
          >
            <h4 className="text-sm font-semibold text-txt">
              {activeCardData.title}
            </h4>
            {activeCardData.description && (
              <p className="mt-1 text-xs text-txt-secondary line-clamp-2">
                {activeCardData.description}
              </p>
            )}
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${activePriority.bgColor} ${activePriority.textColor}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${activePriority.dotColor}`}
                />
                {activePriority.label}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
