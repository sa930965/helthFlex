import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=20');
  const data = await response.json();
  return data.map(task => ({
    id: `api-${task.id}`,
    title: task.title,
    description: '',
    dueDate: '',
    priority: 'Low',
    completed: task.completed,
    source: 'api',
  }));
});

export const loadLocalTasks = createAsyncThunk('tasks/loadLocalTasks', async () => {
  const json = await AsyncStorage.getItem('TASKS');
  const localTasks = json ? JSON.parse(json) : [];
  return localTasks.map(task => ({ ...task, source: 'local' }));
});

const saveToStorage = async (tasks) => {
  const localTasks = tasks.filter(task => task.source === 'local');
  await AsyncStorage.setItem('TASKS', JSON.stringify(localTasks));
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {
    addTask: (state, action) => {
      const newTask = { ...action.payload, source: 'local' };
      state.tasks.push(newTask);
      saveToStorage(state.tasks);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index > -1) {
        state.tasks[index] = { ...action.payload, source: 'local' };
        saveToStorage(state.tasks);
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      saveToStorage(state.tasks);
    },
    toggleTask: (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        if (task.source === 'local') {
          saveToStorage(state.tasks);
        }
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const apiTasks = action.payload;
        const localTasks = state.tasks.filter(task => task.source === 'local');
        state.tasks = [...localTasks, ...apiTasks];
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to fetch tasks';
      })
      .addCase(loadLocalTasks.fulfilled, (state, action) => {
        const localTasks = action.payload;
        const apiTasks = state.tasks.filter(task => task.source === 'api');
        state.tasks = [...localTasks, ...apiTasks];
      });
  }
});

export const { addTask, updateTask, deleteTask, toggleTask } = taskSlice.actions;
export default taskSlice.reducer;
