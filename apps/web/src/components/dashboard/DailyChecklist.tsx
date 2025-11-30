import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface DailyChecklistProps {
  // In a real app, these would come from the backend
}

const DailyChecklist: React.FC<DailyChecklistProps> = () => {
  // Mock data for MVP
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Drink 2L Water', completed: false },
    { id: 2, text: '10 min Meditation', completed: false },
    { id: 3, text: 'Read 10 pages', completed: false },
    { id: 4, text: 'No Sugar', completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
      <h3 className="text-slate-400 text-sm font-bold mb-4 uppercase tracking-wider">Daily Discipline</h3>
      
      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => toggleTask(task.id)}
            className={`
              flex items-center gap-3 p-3 rounded cursor-pointer transition-all
              ${task.completed ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-slate-800 hover:bg-slate-700 border border-transparent'}
            `}
          >
            {task.completed ? (
              <CheckSquare size={20} className="text-blue-400" />
            ) : (
              <Square size={20} className="text-slate-500" />
            )}
            
            <span className={`font-medium ${task.completed ? 'text-blue-300 line-through' : 'text-slate-300'}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyChecklist;
