/*
 * Kanban Board — Add Card Form
 * Developed by Huncho.dev
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITIES } from '../utils/helpers';

export default function AddCardForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Card title is required');
      return;
    }
    onAdd({ title, description, priority });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setError('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="overflow-hidden"
    >
      <div className="p-3 bg-surface rounded-xl border border-edge shadow-sm space-y-3">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (error) setError(''); }}
            placeholder="Card title..."
            autoFocus
            className="w-full px-3 py-2 text-sm bg-surface-input border border-edge rounded-lg text-txt placeholder-txt-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="text-xs text-err mt-1 ml-1"
              >{error}</motion.p>
            )}
          </AnimatePresence>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)..."
          rows={2}
          className="w-full px-3 py-2 text-sm bg-surface-input border border-edge rounded-lg text-txt placeholder-txt-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
        />

        <div className="flex gap-1.5">
          {Object.entries(PRIORITIES).map(([key, config]) => (
            <button
              key={key} type="button" onClick={() => setPriority(key)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                priority === key
                  ? `${config.bgColor} ${config.textColor} ${config.borderColor} ring-2 ring-offset-1 ring-brand`
                  : 'bg-surface-input text-txt-secondary border-edge hover:bg-hover'
              }`}
              style={priority === key ? { '--tw-ring-offset-color': 'var(--card-surface)' } : undefined}
            >{config.label}</button>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="submit" className="flex-1 px-3 py-2 text-sm font-medium text-white bg-brand hover:brightness-110 rounded-lg transition-all cursor-pointer">
            Add Card
          </button>
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-input hover:bg-hover rounded-lg transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </motion.form>
  );
}
