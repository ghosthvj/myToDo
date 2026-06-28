import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import TaskCard from '../tasks/TaskCard';
import TaskFormModal from '../tasks/TaskFormModal';
import type { Task, TaskList } from '../../types';
import { AnimatePresence } from 'framer-motion';

interface Props {
  list: TaskList;
}

export default function BoardColumn({ list }: Props) {
  const { data: tasks = [], isLoading } = useTasks(list.id, { status: 'PENDING', sort: 'priority', order: 'desc' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 w-full md:min-w-[280px] md:max-w-[320px] md:flex-shrink-0 md:h-full">
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-xl"
        style={{ borderTopColor: list.color, borderTopWidth: '3px' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: list.color }}
          />
          <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{list.name}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          {tasks.length}
        </span>
      </div>

      <div className="p-3 space-y-2 md:flex-1 md:overflow-y-auto">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))
        ) : tasks.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
            Sin tareas pendientes
          </p>
        ) : (
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                listId={list.id}
                draggable={false}
                onEdit={(t) => {
                  setEditingTask(t);
                  setModalOpen(true);
                }}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <TaskFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        listId={list.id}
        editingTask={editingTask}
      />
    </div>
  );
}
