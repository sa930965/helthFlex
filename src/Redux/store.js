import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./taskSlice";
import videosReducer from './videosSlice';


const store = configureStore({
  reducer: {
    tasks: taskReducer,
    videos: videosReducer,
  },
});

export default store;
