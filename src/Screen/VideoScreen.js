import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Video from 'react-native-video';

const VideoScreen = ({route}) => {
  const {videoUrl} = route.params;

  console.log(videoUrl);
  

  return (
    <View style={styles.container}>
      <Video
        source={{uri: videoUrl}}
        style={styles.video}
        controls
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000', justifyContent: 'center'},
  video: {width: '100%', height: 300, backgroundColor: '#000'},
});

export default VideoScreen;
