import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';


const VIDEO_API_URL = 'https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json';

export const fetchVideos = createAsyncThunk('videos/fetchVideos', async () => {
  const response = await fetch(VIDEO_API_URL);
  const text = await response.text();
  return JSON.parse(text);
});

export const loadDownloads = createAsyncThunk('videos/loadDownloads', async () => {
  const saved = await AsyncStorage.getItem('downloads');
  return saved ? JSON.parse(saved) : {};
});


export const downloadVideo = ({ id, videoUrl }) => async dispatch => {
  const downloadDest = `${RNFS.DocumentDirectoryPath}/${id}.mp4`;

  const ret = RNFS.downloadFile({
    fromUrl: videoUrl,
    toFile: downloadDest,
    progress: res => {
      const progress = (res.bytesWritten / res.contentLength) * 100;
      dispatch(setDownloadProgress({ id, progress }));
    },
  });

  await ret.promise;

  dispatch(setDownloadedPath({ id, downloadedPath: `file://${downloadDest}` }));

  const saved = await AsyncStorage.getItem('downloads');
  const downloads = saved ? JSON.parse(saved) : {};
  downloads[id] = {
    downloadedPath: `file://${downloadDest}`,
    progress: 100,
  };
  await AsyncStorage.setItem('downloads', JSON.stringify(downloads));
};
const videosSlice = createSlice({
  name: 'videos',
  initialState: {
    videos: [],
    downloads: {},
    loading: false,
    error: null,
  },
  reducers: {
    setDownloadProgress: (state, action) => {
      const { id, progress } = action.payload;
      state.downloads[id] = {
        ...state.downloads[id],
        progress,
      };
    },
    setDownloadedPath: (state, action) => {
      const { id, downloadedPath } = action.payload;
      state.downloads[id] = {
        ...state.downloads[id],
        downloadedPath,
        progress: 100,
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchVideos.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(loadDownloads.fulfilled, (state, action) => {
        state.downloads = action.payload;
      });
  },
});

export const { setDownloadProgress, setDownloadedPath } = videosSlice.actions;


export default videosSlice.reducer;
