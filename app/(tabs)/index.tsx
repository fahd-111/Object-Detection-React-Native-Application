import {useRef, useState} from 'react';
import {CameraType, CameraView, useCameraPermissions} from "expo-camera";
import {Button, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function HomeScreen() {
  const [side, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  // const cameraRef = useRef<Camera | null>(null);
  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }
  
  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
        <View style={styles.container}>
          <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
          <Button onPress={requestPermission} title="Grant Permission" />
        </View>
    );
  }
  
  if (!mediaLibraryPermission) {
    // Media Library permissions are still loading.
    return <View />;
  }
  
  if (!mediaLibraryPermission.granted) {
    // Media Library permissions are not granted yet.
    return (
        <View style={styles.container}>
          <Text style={{ textAlign: 'center' }}>We need your permission to save videos to your gallery</Text>
          <Button onPress={requestMediaLibraryPermission} title="Grant Permission" />
        </View>
    );
  }
  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }
  const handleRecordButtonPress = async () => {
    if (!isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current?.recordAsync({
          maxDuration: 60, // Set maximum recording duration
        });
        console.log('Video object:', video);
        if (video && video.uri) {
          const { uri } = video;
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync('Videos', asset, false);
          console.log('Video saved to gallery:', asset);
        } else {
          console.error('Failed to record video: video object is invalid', video);
        }
      } catch (error) {
        console.error('Failed to record video:', error);
        setIsRecording(false);
      }
    } else {
      stopRecording();
      setIsRecording(false);
    }
    
  };
  return (
      <View style={styles.container}>
        <CameraView
            facing={side}
            ref={cameraRef}
            mode={'video'}
            style={styles.camera}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleRecordButtonPress}>
              <Text style={styles.text}>{isRecording ? 'Stop' : 'Start'}</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});