import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon from 'react-native-vector-icons/FontAwesome';

import * as Progress from 'react-native-progress'; 

export default function TimersListScreen({ navigation }) {
  const [timers, setTimers] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showModal, setShowModal] = useState(false); 

  const [completedTimerName, setCompletedTimerName] = useState("")
  const intervalRefs = useRef({})

  useEffect(() => {
    loadTimers();
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  const loadTimers = async () => {
    const savedTimers = await AsyncStorage.getItem("timers");
    if (savedTimers) setTimers(JSON.parse(savedTimers));
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const groupedTimers = timers.reduce((acc, timer) => {
    acc[timer.category] = acc[timer.category] || [];
    acc[timer.category].push(timer);
    return acc;
  }, {});

  const startTimer = (id) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id === id && !timer.isRunning) {
        const intervalId = setInterval(() => {
          setTimers((prevTimers) =>
            prevTimers.map((t) => {
              if (t.id === id) {
                if (t.remainingTime === 1) {
                  clearInterval(intervalId);
                  markAsCompleted(t);
                  return { ...t, remainingTime: 0, isRunning: false, intervalId: null };
                }
                return { ...t, remainingTime: t.remainingTime - 1 };
              }
              return t;
            })
          );
        }, 1000);

        intervalRefs.current[id] = intervalId;

        return { ...timer, isRunning: true, isPaused: false, intervalId };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };

  const pauseTimer = (id) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id === id && timer.isRunning) {
        clearInterval(intervalRefs.current[id]);
        delete intervalRefs.current[id];
        return { ...timer, isRunning: false, isPaused: true, intervalId: null };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };

  const resumeTimer = (id) => {
    startTimer(id);
  };

  const resetTimer = (id) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id === id) {
        clearInterval(intervalRefs.current[id]);
        delete intervalRefs.current[id];
        return { ...timer, remainingTime: timer.duration, isRunning: false, isPaused: false, intervalId: null };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };

  const markAsCompleted = async (completedTimer) => {
    const history = (await AsyncStorage.getItem("history")) ? JSON.parse(await AsyncStorage.getItem("history")) : [];
    const newHistoryItem = {
      id: completedTimer.id,
      name: completedTimer.name,
      completedAt: new Date().toLocaleString(),
    };
    await AsyncStorage.setItem("history", JSON.stringify([...history, newHistoryItem]));

    setCompletedTimerName(completedTimer.name); 
    setShowModal(true);
  };

  const saveTimers = async (updatedTimers) => {
    await AsyncStorage.setItem("timers", JSON.stringify(updatedTimers));
    setTimers(updatedTimers);
  };

  const startAllTimers = () => {
    const updatedTimers = timers.map((timer) => {
      if (!timer.isRunning) {
        const intervalId = setInterval(() => {
          setTimers((prevTimers) =>
            prevTimers.map((t) => {
              if (t.id === timer.id) {
                if (t.remainingTime === 1) {
                  clearInterval(intervalId);
                  markAsCompleted(t); // Mark as completed and reset automatically
                  return { ...t, remainingTime: t.duration, isRunning: false, intervalId: null }; // Reset the timer
                }
                return { ...t, remainingTime: t.remainingTime - 1 };
              }
              return t;
            })
          );
        }, 1000);
  
        intervalRefs.current[timer.id] = intervalId;
  
        return { ...timer, isRunning: true, isPaused: false, intervalId };
      }
      return timer;
    });
  
    // Set all categories to be expanded
    const allCategoriesExpanded = Object.keys(groupedTimers).reduce((acc, category) => {
      acc[category] = true; // Expanding all categories
      return acc;
    }, {});
    
    setExpandedCategories(allCategoriesExpanded); // Set expanded categories state
  
    saveTimers(updatedTimers);
  };
  
  const pauseAllTimers = () => {
    const updatedTimers = timers.map((timer) => {
      if (timer.isRunning) {
        clearInterval(intervalRefs.current[timer.id]);
        delete intervalRefs.current[timer.id];
        return { ...timer, isRunning: false, isPaused: true, intervalId: null };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };

  const resetAllTimers = () => {
    const updatedTimers = timers.map((timer) => {
      clearInterval(intervalRefs.current[timer.id]);
      delete intervalRefs.current[timer.id];
      return { ...timer, remainingTime: timer.duration, isRunning: false, isPaused: false, intervalId: null };
    });
    saveTimers(updatedTimers);
  };

  return (
    <View style={styles.container}>
      <View style={styles.globalActions}>
        <TouchableOpacity onPress={startAllTimers} style={styles.actionButton}>
          <Text style={styles.buttonText}>▶ Start All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pauseAllTimers} style={styles.actionButton}>
          <Text style={styles.buttonText}>⏸ Pause All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetAllTimers} style={styles.actionButton}>
          <Text style={styles.buttonText}>🔄 Reset All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={Object.keys(groupedTimers)}
        keyExtractor={(category) => category}
        renderItem={({ item: category }) => (
          <View style={styles.categoryContainer}>
            <TouchableOpacity onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
              <Text style={styles.categoryText}>{category}</Text>
              <Text style={styles.arrow}>{expandedCategories[category] ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {expandedCategories[category] && (
              <FlatList
                data={groupedTimers[category]}
                keyExtractor={(timer) => timer.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.timerItem}>
                    <Text style={styles.timerText}>
                      {item.name} - <Text style={styles.timerTime}>{item.remainingTime}s</Text>
                    </Text>
                    <Text style={styles.status}>
                      Status: {item.remainingTime === 0 ? "Completed" : item.isRunning ? "Running" : item.isPaused ? "Paused" : "Idle"}
                    </Text>

                    <Progress.Bar
                      progress={item.remainingTime / item.duration}
                      width={null}
                      height={10}
                      color="#28A745"
                      style={styles.progressBar}
                    />

                    <View style={styles.buttonContainer}>
                    {!item.isRunning && !item.isPaused && item.remainingTime > 0 && (
                    <TouchableOpacity onPress={() => startTimer(item.id)} style={styles.startButton}>
                        <Text style={styles.buttonText}>▶ Start</Text>
                    </TouchableOpacity>
                    )}
                    {item.isRunning && (
                    <TouchableOpacity onPress={() => pauseTimer(item.id)} style={styles.pauseButton}>
                        <Text style={styles.buttonText}>⏸ Pause</Text>
                    </TouchableOpacity>
                    )}
                    {item.isPaused && (
                    <TouchableOpacity onPress={() => resumeTimer(item.id)} style={styles.resumeButton}>
                        <Text style={styles.buttonText}>▶ Resume</Text>
                    </TouchableOpacity>
                    )}
                    {item.remainingTime === 0 && (
                    <Text style={styles.timerCompletedText}>Completed</Text>
                    )}
                    <TouchableOpacity onPress={() => resetTimer(item.id)} style={styles.resetButton}>
                    <Text style={styles.buttonText}>🔄 Reset</Text>
                    </TouchableOpacity>

                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      />
      
      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate("Home")}>
        <Icon name="plus" size={30} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.floatingButtonHistory} onPress={() => navigation.navigate("HistoryScreen")}>
        <Icon name="history" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalMessage}>
              Timer "{completedTimerName}" has completed!
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalButton}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  globalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#28A745",
    padding: 8,
    borderRadius: 6,
    width: 100,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  categoryContainer: { marginBottom: 20 },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#6999D6",
    borderRadius: 6,
  },
  categoryText: { color: "#fff", fontSize: 18 },
  arrow: { color: "#fff", fontSize: 18 },
  timerItem: { marginTop: 10, backgroundColor: "#fff", padding: 10, borderRadius: 6 },
  timerText: { fontSize: 16 },
  timerTime: { fontWeight: "bold", color: "#28A745" },
  status: { color: "#777" },
  progressBar: { marginVertical: 10 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  startButton: { backgroundColor: "#28A745", padding: 10, borderRadius: 6 },
  pauseButton: { backgroundColor: "#FF9800", padding: 10, borderRadius: 6 },
  resumeButton: { backgroundColor: "#2196F3", padding: 10, borderRadius: 6 },
  resetButton: { backgroundColor: "#9E9E9E", padding: 10, borderRadius: 6 },
  floatingButton: {
    position: "absolute",
    bottom: 20, 
    right: 20,
    backgroundColor: "#C4A484",
    width: 60,
    height: 60,
    borderRadius: 30, 
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  floatingButtonHistory: {
    position: "absolute",
    bottom: 90, 
    right: 20,
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10, 
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#28A745",
    padding: 10,
    borderRadius: 6,
    width: 100,
    alignItems: "center",
  },
  timerCompletedText: {
    color: "#28A745",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  }
  
});

