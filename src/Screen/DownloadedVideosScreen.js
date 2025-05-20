import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';

const DownloadedVideosScreen = ({ navigation }) => {
  const { videos, downloads } = useSelector(state => state.videos);

  const downloadedVideos = videos.filter(
    video => downloads[video.id]?.downloadedPath
  );

  const renderItem = ({ item }) => {
    const localPath = downloads[item.id].downloadedPath;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('VideoScreen', {
            videoUrl: localPath,
            offline: true,
          })
        }
      >
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.offline}>Available Offline</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (downloadedVideos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No videos downloaded yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={downloadedVideos}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  thumbnail: {
    width: 120,
    height: 90,
  },
  info: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  offline: {
    color: 'green',
    marginTop: 5,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DownloadedVideosScreen;
