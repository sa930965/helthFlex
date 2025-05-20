import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { deleteTask } from '../Redux/taskSlice';
import Icon from 'react-native-vector-icons/Ionicons';

const TaskDetailScreen = ({ route, navigation }) => {
  const { task } = route.params;
  const dispatch = useDispatch();

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          dispatch(deleteTask(task.id));
          navigation.goBack();
        },
        style: 'destructive'
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Icon name="checkmark-done-circle" size={28} color={task.completed ? '#4CAF50' : '#ccc'} />
        <Text style={styles.title}>{task.title}</Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{task.description || 'No description provided.'}</Text>

        <Text style={styles.label}>Due Date</Text>
        <Text style={styles.value}>{task.dueDate}</Text>

        <Text style={styles.label}>Priority</Text>
        <Text style={styles.value}>{task.priority}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={[styles.status, { color: task.completed ? '#4CAF50' : '#f44336' }]}> 
          {task.completed ? 'Completed' : 'Incomplete'}
        </Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('AddEditTask', { task })}>
        <Icon name="pencil" size={18} color="#fff" />
        <Text style={styles.buttonText}>Edit Task</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Icon name="trash" size={18} color="#fff" />
        <Text style={styles.buttonText}>Delete Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9f9f9', flexGrow: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  detailCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 20
  },
  label: { fontSize: 14, color: '#666', marginTop: 12 },
  value: { fontSize: 16, color: '#000', marginTop: 4 },
  status: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  editButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#5a31f4',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10
  },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f44336',
    padding: 14,
    borderRadius: 8
  },
  buttonText: { color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 16 }
});

export default TaskDetailScreen;