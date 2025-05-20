import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchTasks,
  loadLocalTasks,
  toggleTask,
  addTask,
} from '../Redux/taskSlice';
import moment from 'moment';
import uuid from 'react-native-uuid';
import Icon from 'react-native-vector-icons/Ionicons';

const COLORS = ['#fef073', '#fcaee9', '#a8f1fd', '#aff8d8', '#b4b0ff'];

const DashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {tasks} = useSelector(state => state.tasks);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(moment().format('HH:mm'));
  const [colorIndex, setColorIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await dispatch(loadLocalTasks());
      await dispatch(fetchTasks());
      setLoading(false);
    };

    loadData();
  }, []);

  const handleCreateTask = () => {
    if (!title || !time)
      return Alert.alert('Validation', 'Title and Due Time are required');

    const newTask = {
      id: uuid.v4(),
      title,
      description: '',
      dueDate: `${moment().format('YYYY-MM-DD')} ${time}`,
      priority: 'Low',
      completed: false,
      color: COLORS[colorIndex],
    };

    dispatch(addTask(newTask));
    setModalVisible(false);
    setTitle('');
    setTime(moment().format('HH:mm'));
    setColorIndex(0);
  };

  const filteredTasks = tasks
  
  .filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  })
  .sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = {High: 3, Medium: 2, Low: 1};
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    if (sortBy === 'dueDate') {
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date();
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date();
      return new Date(dateA) - new Date(dateB);
    }

    return 0;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Dashboard</Text>

      <View style={styles.filterRow}>
        {['all', 'completed', 'incomplete'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterBtn,
              filter === type && styles.activeFilterBtn,
            ]}>
            <Text style={filter === type && styles.activeFilterText}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
        {['dueDate', 'priority'].map(sort => (
          <TouchableOpacity
            key={sort}
            onPress={() => setSortBy(sort)}
            style={[
              styles.filterBtn,
              sortBy === sort && styles.activeFilterBtn,
            ]}>
            <Text style={sortBy === sort && styles.activeFilterText}>
              Sort: {sort}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{padding: 16, flexGrow: 1}}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TouchableOpacity
              key={task.id}
              onPress={() => navigation.navigate('TaskDetail', {task})}
              onLongPress={() => dispatch(toggleTask(task.id))}
              style={[
                styles.taskCard,
                {backgroundColor: task.color || '#fff'},
              ]}>
              <View style={styles.taskRow}>
                <Text
                  style={[
                    styles.taskText,
                    task.completed && {
                      textDecorationLine: 'line-through',
                      opacity: 0.6,
                    },
                  ]}>
                  {task.title}
                </Text>
                <Icon name="chevron-forward" size={20} color="#555" />
              </View>
              <Text style={styles.taskTime}>
                {task.dueDate ? moment(task.dueDate).format('hh:mm A') : 'N/A'}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}>
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            navigation.navigate('VideoListScreen', {
              videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            })
          }>
          <Icon name="videocam" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>❌</Text>
            </TouchableOpacity>
            <TextInput
              placeholder="Task Title*"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="HH:mm*"
              value={time}
              onChangeText={setTime}
              style={styles.input}
            />
            <View style={styles.colorRow}>
              {COLORS.map((c, idx) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: c,
                      borderWidth: colorIndex === idx ? 2 : 0,
                    },
                  ]}
                  onPress={() => setColorIndex(idx)}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[
                styles.createButton,
                {backgroundColor: COLORS[colorIndex]},
              ]}
              onPress={handleCreateTask}>
              <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                Create Task
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f8f8'},
  header: {fontSize: 24, fontWeight: 'bold', padding: 16},
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  filterBtn: {
    padding: 6,
    margin: 4,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 14,
  },
  activeFilterBtn: {backgroundColor: '#5a31f4'},
  activeFilterText: {color: '#fff', fontWeight: 'bold'},
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {fontSize: 16, fontWeight: '600', color: '#333'},
  taskTime: {marginTop: 6, color: '#666'},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#5a31f4',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  colorDot: {width: 30, height: 30, borderRadius: 15},
  createButton: {padding: 14, borderRadius: 8, marginTop: 10},
  closeButton: {fontSize: 18, marginBottom: 10},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  fab: {
    backgroundColor: '#5a31f4',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    marginHorizontal: 4,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 16,
  },
});

export default DashboardScreen;
