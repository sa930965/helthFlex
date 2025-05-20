import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import DashboardScreen from '../Screen/Dashboard';
import AddEditTaskScreen from '../Screen/AddEditTaskScreen';
import TaskDetailScreen from '../Screen/TaskDetailScreen';
import VideoScreen from '../Screen/VideoScreen';
import VideoListScreen from '../Screen/VideoListScreen';
import DownloadedVideosScreen from '../Screen/DownloadedVideosScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DashboardScreen"
        options={{headerShown: false}}>
        <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} options={{headerShown: false}}/>
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{headerShown: false}}/>
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={{headerShown: false}}/>
        <Stack.Screen name="VideoScreen" component={VideoScreen} options={{headerShown: false}}/>
        <Stack.Screen name="VideoListScreen" component={VideoListScreen} options={{headerShown: false}}/>
        <Stack.Screen name="DownloadedVideos" component={DownloadedVideosScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
