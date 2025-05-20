import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addTask, updateTask } from '../Redux/taskSlice';
import uuid from 'react-native-uuid';

const AddEditTaskScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const task = route.params?.task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [priority, setPriority] = useState(task?.priority || 'Low');

  const handleSave = () => {
    if (!title || !dueDate) return Alert.alert('Validation', 'Title and Due Date are required');

    const newTask = {
      id: task?.id || uuid.v4(),
      title,
      description,
      dueDate,
      priority,
      completed: task?.completed || false
    };

    if (task) dispatch(updateTask(newTask));
    else dispatch(addTask(newTask));

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{task ? 'Edit Task' : 'Add Task'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Task Title *"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Due Date (YYYY-MM-DD) *"
        value={dueDate}
        onChangeText={setDueDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Priority (Low/Medium/High)"
        value={priority}
        onChangeText={setPriority}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{task ? 'Update Task' : 'Create Task'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  saveButton: {
    backgroundColor: '#5a31f4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});

export default AddEditTaskScreen;
