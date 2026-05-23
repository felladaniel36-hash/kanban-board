/*
 * Kanban Board — Column Component
 * Developed by Huncho.dev
 */

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import Card from './Card';
import AddCardForm from './AddCardForm';
import useBoardStore from '../store/useBoardStore';

export default function Column({ column, highlightedCards }) {
  const { id, title, cards } = column;
  const addCard = useBoardStore((s) => s.addCard);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);
  const editColumnTitle = useBoardStore((s) => s.editColumnTitle);
  const clearColumn = useBoardStore((s) => s.clearColumn);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id });

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      editColumnTitle(id, editTitle.trim());
    } else {
      setEditTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleAddCard = (cardData) => {
    addCard(id, cardData);
    setShowAddForm(false);
  };

  return (
    <div
      className={`relative flex flex-col w-[320px] min-w-[320px] max-h-[calc(100vh-160px)] bg-surface-column rounded-2xl border transition-all duration-200 ${
        isOver
          ? 'border-brand shadow-lg bg-drag-ph-bg'
          : 'border-edge'
      }`}
      style={isOver ? { boxShadow: '0 8px 25px var(--shadow-color)' } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setEditTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="flex-1 px-2 py-0.5 text-sm font-bold bg-surface border border-brand rounded-lg text-txt focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ) : (
            <h3
              onClick={() => {
                setEditTitle(title);
                setIsEditingTitle(true);
              }}
              className="text-sm font-bold text-txt truncate cursor-pointer hover:text-brand transition-colors"
              title="Click to edit"
            >
              {title}
            </h3>
          )}
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-txt-secondary bg-surface-badge rounded-full shrink-0">
            {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-0.5 ml-2">
          {cards.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 text-txt-secondary hover:text-warn rounded-lg transition-colors cursor-pointer"
              title="Clear all cards"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-txt-secondary hover:text-err rounded-lg transition-colors cursor-pointer"
            title="Delete column"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Cards — plain div, NO AnimatePresence, NO motion wrappers */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[80px]"
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={id}
            isHighlighted={highlightedCards?.has(card.id)}
          />
        ))}

        {cards.length === 0 && !showAddForm && (
          <div className="flex flex-col items-center justify-center py-8 text-txt-secondary opacity-50">
            <svg
              className="w-8 h-8 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-xs">No cards yet</p>
          </div>
        )}
      </div>

      {/* Add Card */}
      <div className="p-3 pt-0">
        {showAddForm ? (
          <AddCardForm
            onAdd={handleAddCard}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2 text-sm font-medium text-txt-secondary hover:text-brand hover:bg-surface rounded-xl border-2 border-dashed border-edge hover:border-brand transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
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
            Add card
          </button>
        )}
      </div>

      {/* Delete Column Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-surface-overlay backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-4 z-20">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--danger) 15%, transparent)',
            }}
          >
            <svg
              className="w-6 h-6 text-err"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-txt text-center">
            Delete &ldquo;{title}&rdquo;?
          </p>
          <p className="text-xs text-txt-secondary text-center">
            {cards.length} card{cards.length !== 1 ? 's' : ''} will be removed.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => deleteColumn(id)}
              className="px-4 py-1.5 text-xs font-medium text-white bg-err hover:brightness-110 rounded-lg cursor-pointer transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-1.5 text-xs font-medium text-txt-secondary bg-surface-input hover:bg-hover rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clear Column Overlay */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-surface-overlay backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-4 z-20">
          <p className="text-sm font-medium text-txt text-center">
            Clear all cards in &ldquo;{title}&rdquo;?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearColumn(id);
                setShowClearConfirm(false);
              }}
              className="px-4 py-1.5 text-xs font-medium text-white bg-warn hover:brightness-110 rounded-lg cursor-pointer transition-all"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-1.5 text-xs font-medium text-txt-secondary bg-surface-input hover:bg-hover rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
