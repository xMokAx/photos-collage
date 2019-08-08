import React, { PureComponent } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated
} from "react-native";
import { Permissions, MediaLibrary, Camera } from "expo";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../constants/Colors";
import Layout from "../constants/Layout";

const { deviceHeight, deviceWidth } = Layout;
const cameraButtonWidth = 80;
const shotsButtonWidth = 40;
const cameraButtonInnerWidth = cameraButtonWidth - 12;

export default class CameraScreen extends PureComponent {
  state = {
    hasCameraPermission: null,
    shotsNumber: 1,
    shotsTaken: 0,
    showShotsNumber: false,
    willTakePhoto: false,
    takingPhotos: false,
    type: Camera.Constants.Type.front,
    timer: 2,
    showTimer: false
  };

  cameraButtonScale = new Animated.Value(1);

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    clearTimeout(this.photoTimeout);
    clearTimeout(this.shotsTimeout);
    clearInterval(this.interval);
    clearInterval(this.timerInterval);
  }

  onShotsButtonPress = () => {
    this.setState(
      prevState => ({
        shotsNumber:
          prevState.shotsNumber === 4 ? 1 : prevState.shotsNumber + 1,
        showShotsNumber: true
      }),
      () => {
        this.timeout = setTimeout(() => {
          this.setState({
            showShotsNumber: false
          });
        }, 500);
      }
    );
  };

  onFlipCameraButtonPress = () => {
    this.setState(prevState => ({
      type:
        prevState.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
    }));
  };

  onCloseCameraButtonPress = () => {
    this.props.navigation.navigate("Gallery");
  };

  onCameraButtonPressIn = () => {
    Animated.timing(
      this.cameraButtonScale,
      {
        useNativeDriver: true,
        toValue: 0.8
      },
      250
    ).start();
  };

  onCameraButtonPressOut = () => {
    Animated.timing(
      this.cameraButtonScale,
      {
        useNativeDriver: true,
        toValue: 1
      },
      250
    ).start();
  };

  onCameraButtonPress = async () => {
    if (this.state.takingPhotos) {
      return;
    }
    this.setState(
      {
        showShotsNumber: true,
        willTakePhoto: true,
        takingPhotos: true
      },
      () => {
        this.shotsTimeout = setTimeout(() => {
          if (this.cameraRef) {
            let photos = [];
            let x = 1;
            this.interval = setInterval(() => {
              if (x <= this.state.shotsNumber) {
                this.setState(
                  {
                    showShotsNumber: false,
                    willTakePhoto: false,
                    showTimer: true,
                    timer: 2
                  },
                  () => {
                    this.timerInterval = setInterval(() => {
                      if (this.state.timer) {
                        this.setState(prevState => ({
                          timer: prevState.timer - 1
                        }));
                      } else {
                        clearInterval(this.timerInterval);
                      }
                    }, 1000);
                  }
                );

                this.photoTimeout = setTimeout(async () => {
                  const tempPhoto = await this.cameraRef.takePictureAsync();
                  const photo = await MediaLibrary.createAssetAsync(
                    tempPhoto.uri
                  );
                  photos.push(photo);
                  if (photos.length === this.state.shotsNumber) {
                    this.props.screenProps.addPhotos(photos);
                  }
                  this.setState(prevState => ({
                    shotsTaken: prevState.shotsTaken + 1
                  }));
                }, 2500);
              } else {
                this.setState(
                  {
                    takingPhotos: false,
                    showTimer: false
                  },
                  () => {
                    clearInterval(this.interval);
                    console.log(photos);
                    this.props.navigation.navigate("Gallery");
                  }
                );
              }
              x++;
            }, 4000);
          }
        }, 500);
      }
    );
  };

  captureCameraRef = ref => (this.cameraRef = ref);

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      const {
        shotsNumber,
        showShotsNumber,
        type,
        willTakePhoto,
        shotsTaken,
        takingPhotos,
        timer,
        showTimer
      } = this.state;
      const {
        onCloseCameraButtonPress,
        onFlipCameraButtonPress,
        onShotsButtonPress,
        onCameraButtonPress,
        onCameraButtonPressIn,
        onCameraButtonPressOut
      } = this;
      return (
        <View style={styles.container}>
          <Camera
            ref={this.captureCameraRef}
            style={styles.container}
            type={type}
          />
          <TouchableOpacity
            style={styles.closeCamerButton}
            onPress={onCloseCameraButtonPress}
          >
            <View style={styles.closeIconContainer}>
              <Ionicons name="ios-close" size={40} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipCameraButton}
            onPress={onFlipCameraButtonPress}
          >
            <Ionicons
              name="ios-reverse-camera"
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>
          {showShotsNumber && (
            <View style={styles.numberOfShotsOverlay}>
              <Text style={styles.shotsNumberText}>
                {shotsNumber} {shotsNumber === 1 ? "Shot" : "Shots"}
              </Text>
              {willTakePhoto && (
                <Text style={styles.shotsNumberText}>Get Ready!</Text>
              )}
            </View>
          )}

          {timer && showTimer ? (
            <View style={styles.timer}>
              <Text style={[styles.text, styles.timerText]}>{timer}</Text>
            </View>
          ) : null}

          {!takingPhotos && (
            <TouchableWithoutFeedback onPress={onShotsButtonPress}>
              <View style={styles.shotsButton}>
                <Text style={[styles.text, styles.shotsButtonTex]}>
                  {shotsNumber}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}

          <TouchableWithoutFeedback
            onPress={onCameraButtonPress}
            onPressIn={onCameraButtonPressIn}
            onPressOut={onCameraButtonPressOut}
          >
            <View style={styles.cameraButton}>
              <View style={styles.cameraButtonNotch} />
              <Animated.View
                style={[
                  styles.cameraButtonInner,
                  { transform: [{ scale: this.cameraButtonScale }] }
                ]}
              >
                <Text style={[styles.text, styles.cameraButtonText]}>
                  {shotsNumber - shotsTaken
                    ? shotsNumber - shotsTaken
                    : "Done!"}
                </Text>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  timer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: deviceWidth,
    height: deviceHeight,
    justifyContent: "center",
    alignItems: "center"
  },
  timerText: {
    color: Colors.white,
    fontSize: 40
  },
  shotsButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    height: shotsButtonWidth,
    width: shotsButtonWidth,
    borderRadius: shotsButtonWidth / 2,
    backgroundColor: Colors.black,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: Colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  numberOfShotsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: Colors.black,
    opacity: 0.7,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontWeight: "500"
  },
  shotsButtonTex: {
    color: Colors.white,
    fontSize: 18
  },
  shotsNumberText: {
    fontSize: 54,
    color: Colors.lighterGrey
  },
  cameraButton: {
    position: "absolute",
    bottom: 10,
    left: deviceWidth / 2 - cameraButtonWidth / 2,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    width: cameraButtonWidth,
    height: cameraButtonWidth,
    borderRadius: cameraButtonWidth / 2,
    borderWidth: 3,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center"
  },
  cameraButtonText: {
    color: Colors.white,
    fontSize: 24
  },
  cameraButtonInner: {
    width: cameraButtonInnerWidth,
    height: cameraButtonInnerWidth,
    borderRadius: cameraButtonInnerWidth / 2,
    backgroundColor: Colors.selectedColor,
    justifyContent: "center",
    alignItems: "center"
  },
  cameraButtonNotch: {
    position: "absolute",
    width: 11,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.white,
    top: -11
  },
  flipCameraButton: {
    position: "absolute",
    top: 30,
    right: 30,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center"
  },
  closeCamerButton: {
    position: "absolute",
    top: 0,
    left: 0
  },
  closeIconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center"
  }
});
