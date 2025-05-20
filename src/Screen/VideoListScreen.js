import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVideos, downloadVideo, loadDownloads } from '../Redux/videosSlice';
import * as Progress from 'react-native-progress';

const VideoListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { videos, loading, error, downloads } = useSelector(state => state.videos);

  useEffect(() => {
    dispatch(fetchVideos());
    dispatch(loadDownloads());
  }, [dispatch]);

  const handleDownload = (item) => {
    dispatch(downloadVideo({ id: item.id, videoUrl: item.videoUrl }));
  };

  const renderProgressBar = (progress) => (
    <Progress.Bar
      progress={progress / 100}
      width={null}
      color="#5a31f4"
      borderRadius={5}
      height={8}
      unfilledColor="#eee"
      borderWidth={0}
    />
  );

  const renderItem = ({ item }) => {
    const downloadInfo = downloads[item.id];
    const isDownloaded = downloadInfo?.downloadedPath != null;
    const progress = downloadInfo?.progress ?? 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('VideoScreen', {
            videoUrl: isDownloaded ? downloadInfo.downloadedPath : item.videoUrl,
            offline: isDownloaded,
          })
        }
      >
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.author}>{item.author}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{item.duration}</Text>
            <Text style={styles.meta}>• {item.views} views</Text>
            <Text style={styles.meta}>• {item.uploadTime}</Text>
          </View>
          {item.isLive && <Text style={styles.live}>🔴 Live</Text>}

          {isDownloaded ? (
            <Text style={styles.offlineLabel}>✅ Available Offline</Text>
          ) : (
            <>
              {progress > 0 && progress < 100 ? renderProgressBar(progress) : null}
              <TouchableOpacity
                onPress={() => handleDownload(item)}
                style={styles.downloadButton}
                disabled={progress > 0 && progress < 100}
              >
                <Text style={styles.downloadButtonText}>
                  {progress > 0 && progress < 100 ? `${progress.toFixed(0)}% Downloading` : 'Download'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const downloadedVideoIds = Object.values(downloads).filter(d => d.downloadedPath);

  if (loading && videos.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5a31f4" />
      </View>
    );
  }

  if (error && videos.length === 0 && downloadedVideoIds.length > 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.offlineText}>You're offline. Showing downloaded videos only.</Text>
        <TouchableOpacity
          style={styles.downloadedVideosButton}
          onPress={() => navigation.navigate('DownloadedVideos')}
        >
          <Text style={styles.downloadedVideosButtonText}>Go to Downloaded Videos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error && downloadedVideoIds.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No Internet Connection and No Downloads Available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {downloadedVideoIds.length > 0 && (
        <TouchableOpacity
          style={styles.downloadedVideosButton}
          onPress={() => navigation.navigate('DownloadedVideos')}
        >
          <Text style={styles.downloadedVideosButtonText}>Go to Downloaded Videos</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  thumbnail: { width: '100%', height: 200 },
  infoContainer: { padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  author: { color: '#555' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  meta: { fontSize: 12, color: '#777', marginRight: 10 },
  live: { color: 'red', marginTop: 4, fontWeight: 'bold' },
  offlineLabel: { marginTop: 5, color: 'green', fontWeight: 'bold' },
  downloadButton: {
    marginTop: 10,
    backgroundColor: '#5a31f4',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  downloadButtonText: { color: 'white', fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  offlineText: { fontSize: 16, marginBottom: 20 },
  downloadedVideosButton: {
    backgroundColor: '#5a31f4',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadedVideosButtonText: { color: 'white', fontWeight: 'bold' },
});

export default VideoListScreen;
