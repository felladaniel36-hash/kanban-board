/*
 * Kanban Board — Utility Functions
 * Developed by Huncho.dev
 */

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
};

export const PRIORITIES = {
  low: {
    label: 'Low',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  medium: {
    label: 'Medium',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-700',
    dotColor: 'bg-amber-500',
  },
  high: {
    label: 'High',
    bgColor: 'bg-rose-100 dark:bg-rose-900/40',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-300 dark:border-rose-700',
    dotColor: 'bg-rose-500',
  },
};

export const DEFAULT_COLUMNS = [
  {
    id: generateId(),
    title: 'To Do',
    cards: [
      {
        id: generateId(),
        title: 'Research competitors',
        description: 'Analyze top 5 competitors and document findings',
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        title: 'Design wireframes',
        description: 'Create low-fidelity wireframes for the main pages',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: generateId(),
    title: 'In Progress',
    cards: [
      {
        id: generateId(),
        title: 'Build authentication',
        description: 'Implement login and signup flows with JWT',
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: generateId(),
    title: 'Done',
    cards: [
      {
        id: generateId(),
        title: 'Project setup',
        description: 'Initialize repo, install dependencies, configure CI/CD',
        priority: 'low',
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

export const isValidString = (str) => {
  return typeof str === 'string' && str.trim().length > 0;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
};
