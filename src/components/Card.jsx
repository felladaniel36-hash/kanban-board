/*
 * Kanban Board — Card Component
 * Developed by Huncho.dev
 */

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITIES } from '../utils/helpers';
import useBoardStore from '../store/useBoardStore';

export default function Card({ card, columnId, isHighlighted }) {
  const { id, title, description, priority } = card;
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const editCard = useBoardStore((s) => s.editCard);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description);
  const [editPriority, setEditPriority] = useState(priority);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, data: { cardId: id, columnId } });

  const priorityConfig = PRIORITIES[priority] || PRIORITIES.medium;

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    editCard(columnId, id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(title);
    setEditDesc(description);
    setEditPriority(priority);
    setIsEditing(false);
  };

  /*
   * FIX 1: When dragging, render a fixed-position placeholder.
   * Do NOT apply `transform` here — the placeholder must stay
   * in place while the DragOverlay follows the cursor.
   * Also set opacity to 0.4 so it's clearly a placeholder, not a duplicate.
   */
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className="p-3 rounded-xl border-2 border-dashed border-drag-ph-border bg-drag-ph-bg h-[80px] opacity-40"
      />
    );
  }

  /*
   * FIX 2: Apply transform via inline style only when NOT dragging.
   * This moves the card under the cursor during the grab phase
   * (before isDragging kicks in due to the distance threshold).
   */
  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    /*
     * FIX 3: Removed Framer Motion `layout` prop.
     * `layout` causes ghost animations when a card unmounts from
     * one column and mounts in another — Framer Motion animates
     * the layout shift, creating a visible "flying duplicate".
     */
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: isHighlighted ? 1.02 : 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
      ref={setNodeRef}
      style={isHighlighted ? { ...dragStyle, boxShadow: '0 4px 16px var(--shadow-color)' } : dragStyle}
      {...(isEditing ? {} : { ...listeners, ...attributes })}
      className={`group relative p-3 bg-surface rounded-xl border shadow-sm transition-shadow cursor-grab active:cursor-grabbing ${
        isHighlighted
          ? 'border-brand ring-2 ring-brand/30'
          : 'border-edge hover:shadow-md'
      }`}
    >
      {isEditing ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus
            className="w-full px-2 py-1 text-sm bg-surface-input border border-edge rounded-lg text-txt focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <textarea
            value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
            className="w-full px-2 py-1 text-sm bg-surface-input border border-edge rounded-lg text-txt focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
          <div className="flex gap-1">
            {Object.entries(PRIORITIES).map(([key, config]) => (
              <button
                key={key} type="button" onClick={() => setEditPriority(key)}
                className={`flex-1 px-2 py-1 text-xs rounded-md border cursor-pointer transition-all ${
                  editPriority === key
                    ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                    : 'bg-surface-input text-txt-secondary border-edge'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} className="flex-1 px-2 py-1 text-xs font-medium text-white bg-brand hover:brightness-110 rounded-lg cursor-pointer">Save</button>
            <button onClick={handleCancelEdit} className="px-2 py-1 text-xs font-medium text-txt-secondary bg-surface-input hover:bg-hover rounded-lg cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-txt leading-snug flex-1">{title}</h4>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="p-1 text-txt-secondary hover:text-brand hover:bg-hover rounded-md transition-colors cursor-pointer"
                title="Edit"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                className="p-1 text-txt-secondary hover:text-err hover:bg-hover rounded-md transition-colors cursor-pointer"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          {description && (
            <p className="mt-1.5 text-xs text-txt-secondary leading-relaxed line-clamp-2">{description}</p>
          )}
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${priorityConfig.bgColor} ${priorityConfig.textColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotColor}`} />
              {priorityConfig.label}
            </span>
          </div>
        </>
      )}

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-surface-overlay backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2 p-3 z-10"
          >
            <p className="text-xs font-medium text-txt text-center">Delete this card?</p>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); deleteCard(columnId, id); }} className="px-3 py-1 text-xs font-medium text-white bg-err hover:brightness-110 rounded-lg cursor-pointer transition-all">Delete</button>
              <button onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }} className="px-3 py-1 text-xs font-medium text-txt-secondary bg-surface-input hover:bg-hover rounded-lg cursor-pointer transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
