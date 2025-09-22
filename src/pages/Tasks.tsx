import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: number;
  title: string;
  description?: string;
  done: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!title.trim()) return;
    try {
      const response = await axios.post('http://localhost:3000/tasks', { title, description });
      setTasks([...tasks, response.data]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const toggleDone = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await axios.patch(`http://localhost:3000/tasks/${id}`, { done: !task.done });
      setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            rows={3}
          />
          <button
            onClick={createTask}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Task
          </button>
        </div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500">No tasks yet. Create your first task!</div>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div className="flex-1">
                  <h3 className={`font-semibold ${task.done ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleDone(task.id)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      task.done ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}
                  >
                    {task.done ? 'Done' : 'Mark Done'}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Tasks;