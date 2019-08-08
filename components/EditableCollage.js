import React, { PureComponent } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  Animated,
  Easing,
  BackHandler,
  PixelRatio
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
  GestureHandler,
  takeSnapshotAsync,
  MediaLibrary,
  Constants
} from "expo";
const { State } = GestureHandler;
import ProgressBar from "react-native-progress/Bar";

import Layout from "../constants/Layout";
import Colors from "../constants/Colors";

import CollageImg from "./CollageImg";
import ImageList from "../components/ImageList";
import EditButton from "./EditButton";
import Button from "./Button";

const { deviceHeight, titleHeight, deviceWidth } = Layout;
const collageWidth = deviceWidth;
const collageHeight = collageWidth;
const targetPixels = 1564;
const pixelRatio = PixelRatio.get();
const pixels = targetPixels / pixelRatio;

export default class EditableCollage extends PureComponent {
  state = {
    targetedImageId: null,
    selectedImageId: null,
    movingImageId: null,
    resizedImageId: null,
    isFlipped: false,
    isMirrored: false,
    isBordered: false,
    selectedImageUri: null,
    savedImage: null,
    isSaving: false,
    isSaved: false,
    isReplacing: false,
    progress: 0
  };
  longestRow = 0;
  imagesRefs = {};
  rowsRefs = {};
  collageScale = new Animated.Value(1);
  collageTranslateY = new Animated.Value(0);
  progress = new Animated.Value(0);
  collageRef = React.createRef();

  didFocusSubscription;
  willBlurSubscription;

  componentWillMount() {
    const { navigation } = this.props;
    this.didFocusSubscription = navigation.addListener("didFocus", payload =>
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackButtonPressAndroid
      )
    );
    const headerRight = (
      <Button
        containerStyle={styles.rightButtonContainerStyle}
        text="SAVE"
        color={Colors.selectedColor}
        size={18}
        onPress={this.onSavePress}
      />
    );
    const headerLeft = (
      <Button
        disabled={this.state.isSaving}
        onPress={this.onBackPress}
        icon={<Ionicons name="ios-arrow-back" size={24} color={Colors.white} />}
      />
    );
    this.setScreenParams({
      title: "EDIT",
      headerRight,
      headerLeft
    });
  }

  componentDidMount() {
    this.willBlurSubscription = this.props.navigation.addListener(
      "willBlur",
      payload =>
        BackHandler.removeEventListener(
          "hardwareBackPress",
          this.onBackButtonPressAndroid
        )
    );

    this.progressListener = this.progress.addListener(({ value }) => {
      if (this.state.isSaving) {
        this.setState({
          progress: value
        });
      }
    });

    // setTimeout(() => {
    //   this.collageRef &&
    //     this.collageRef.current._component.measure(
    //       (_fx, _fy, width, height, px, py) => {
    //         console.log("from collage measure:", px, py, width, height);
    //         this.setState({
    //           collageY: Math.round(py)
    //         });
    //       }
    //     );
    // }, 100);
  }

  componentWillUnmount() {
    this.didFocusSubscription && this.didFocusSubscription.remove();
    this.willBlurSubscription && this.willBlurSubscription.remove();
    this.progress.removeListener(this.progressListener);
  }

  removeSavedImage = () => {
    if (this.state.savedImage) {
      this.setState({
        savedImage: null
      });
    }
  };

  onSavePress = async () => {
    const { selectedImageId, savedImage } = this.state;
    if (selectedImageId !== null) {
      await this.onImageSelect(null);
    }

    Animated.timing(this.collageScale, {
      useNativeDriver: true,
      toValue: 0.9
    }).start();

    if (!savedImage) {
      this.setScreenParams({
        title: "SAVING",
        headerRight: null
      });
      this.setState(
        {
          isSaving: true
        },
        () => {
          Animated.timing(this.progress, {
            useNativeDriver: true,
            toValue: 1,
            duration: 750
          }).start();
        }
      );
      const result = await takeSnapshotAsync(this.collageRef, {
        height: pixels,
        width: pixels,
        quality: 1,
        format: "jpg"
      });
      console.log(result);
      const savedResult = await MediaLibrary.createAssetAsync(result);
      console.log(savedResult);
      this.setState({
        isSaving: false,
        isSaved: true,
        savedImage: savedResult,
        progress: 0
      });
    }

    this.setScreenParams({
      title: "SAVED",
      headerRight: (
        <Button
          containerStyle={styles.rightButtonContainerStyle}
          text="DONE"
          color={Colors.selectedColor}
          size={18}
          onPress={this.onDonePress}
        />
      )
    });
  };

  onDonePress = () => {
    this.props.navigation.navigate("Gallery");
  };

  finishSaving = () => {
    Animated.timing(this.collageScale, {
      useNativeDriver: true,
      toValue: 1
    }).start();
    this.setScreenParams({
      title: "EDIT",
      headerRight: (
        <Button
          containerStyle={styles.rightButtonContainerStyle}
          text="SAVE"
          color={Colors.selectedColor}
          size={18}
          onPress={this.onSavePress}
        />
      )
    });
    this.setState({
      isSaved: false
    });
  };

  finishReplacing = () => {
    this.setScreenParams({
      title: "EDIT",
      headerRight: (
        <Button
          containerStyle={styles.rightButtonContainerStyle}
          text="SAVE"
          color={Colors.selectedColor}
          size={18}
          onPress={this.onSavePress}
        />
      )
    });
    this.setState({
      isReplacing: false
    });
    Animated.parallel([
      Animated.timing(this.collageScale, {
        useNativeDriver: true,
        toValue: 1
      }),
      Animated.timing(this.collageTranslateY, {
        useNativeDriver: true,
        toValue: 0
      })
    ]).start();
  };

  onBackPress = () => {
    const { isReplacing, isSaved, isSaving } = this.state;
    if (isReplacing) {
      this.finishReplacing();
    } else if (isSaved) {
      this.finishSaving();
    } else if (isSaving) {
      return;
    } else {
      this.props.navigation.goBack();
    }
  };

  onBackButtonPressAndroid = () => {
    const { isReplacing, isSaved, isSaving } = this.state;
    if (isReplacing) {
      this.finishReplacing();
      return true;
    } else if (isSaved) {
      this.finishSaving();
      return true;
    } else if (isSaving) {
      return;
    } else {
      return false;
    }
  };

  setScreenParams = params => {
    this.props.navigation.setParams(params);
  };

  getScreenTitle = () => this.props.navigation.state.params.title;

  setRowZIndex = (selectedImageId, zIndex) => {
    if (selectedImageId !== null) {
      if (typeof this.imagesRefs[selectedImageId].props.rowId !== "undefined") {
        this.rowsRefs[
          this.imagesRefs[selectedImageId].props.rowId
        ].setNativeProps({
          zIndex
        });
      }
    }
  };

  onImageSelect = selectedImageId => {
    if (selectedImageId !== null && this.state.isReplacing) {
      this.imageListRef.scrollToIndex(
        this.imagesRefs[selectedImageId].source.uri
      );
    }
    if (
      selectedImageId === this.state.selectedImageId &&
      this.state.isReplacing
    ) {
      return;
    } else if (
      selectedImageId === this.state.selectedImageId ||
      selectedImageId === null
    ) {
      this.setRowZIndex(selectedImageId, 0);
      this.setState({
        selectedImageId: null,
        selectedImageUri: null,
        isFlipped: false,
        isMirrored: false
      });
    } else {
      this.setRowZIndex(this.state.selectedImageId, 0);
      this.setRowZIndex(selectedImageId, 1);
      this.setState({
        selectedImageId,
        selectedImageUri: this.imagesRefs[selectedImageId].source.uri,
        isFlipped: this.imagesRefs[selectedImageId].isFlipped,
        isMirrored: this.imagesRefs[selectedImageId].isMirrored
      });
    }
  };

  onImageTarget = targetedImageId => {
    this.setState({
      targetedImageId
    });
  };

  flipSelectedImageId = () => {
    const { selectedImageId } = this.state;
    if (selectedImageId === null) {
      return;
    }
    this.imagesRefs[selectedImageId].onFlip();
    this.setState({
      isFlipped: this.imagesRefs[selectedImageId].isFlipped
    });
  };

  mirrorSelectedImageId = () => {
    const { selectedImageId } = this.state;
    if (selectedImageId === null) {
      return;
    }
    this.imagesRefs[selectedImageId].onMirror();
    this.setState({
      isMirrored: this.imagesRefs[selectedImageId].isMirrored
    });
  };

  onBorderPress = () => {
    this.removeSavedImage();
    this.setState(prevState => ({
      isBordered: !prevState.isBordered
    }));
  };

  onImageMove = movingImageId => {
    const prevMovingImage = this.state.movingImageId
    if (movingImageId === null && this.state.isReplacing) {
      this.setScreenParams({ title: "REPLACE" });
    } else if (movingImageId === null) {
      this.setScreenParams({ title: "EDIT" });
    } else {
      this.setScreenParams({ title: "SWAP" });
    }
    this.setState(
      {
        movingImageId
      },
      () => {
        if (movingImageId === null) {
          this.setRowZIndex(prevMovingImage, 0);
        } else {
          this.setRowZIndex(movingImageId, 1);
        }
      }
    );
  };

  checkImageCollision = () => {
    let targetImage = null;
    const { movingImageId, targetedImageId } = this.state;
    const movingImage = this.imagesRefs[movingImageId];
    Object.entries(this.imagesRefs).forEach((entry, i) => {
      const [id, img] = entry;

      if (Number(id) !== movingImageId) {
        const movingImageIdCenterX =
          movingImage.containerX + movingImage.containerWidth / 2;
        const movingImageIdCenterY =
          movingImage.containerY + movingImage.containerHeight / 2;
        if (
          movingImageIdCenterX > img.containerInitialX &&
          movingImageIdCenterX < img.containerInitialX + img.containerWidth &&
          movingImageIdCenterY > img.containerInitialY &&
          movingImageIdCenterY < img.containerInitialY + img.containerHeight
        ) {
          targetImage = Number(id);
        }
      }
    });
    if (targetedImageId !== targetImage) {
      this.onImageTarget(targetImage);
    }
  };

  onImageSwitch = () => {
    const { targetedImageId, movingImageId } = this.state;
    this.removeSavedImage();
    const targetedImage = this.imagesRefs[targetedImageId];
    const movingImage = this.imagesRefs[movingImageId];

    const targetSource = targetedImage.source;
    const movingSource = movingImage.source;
    targetedImage.source = movingSource;
    movingImage.source = targetSource;

    const targetImageWidth = targetedImage.imageWidth;
    const movingImageWidth = movingImage.imageWidth;
    targetedImage.imageWidth = movingImageWidth;
    movingImage.imageWidth = targetImageWidth;
    const targetImageHeight = targetedImage.imageHeight;
    const movingImageHeight = movingImage.imageHeight;
    targetedImage.imageHeight = movingImageHeight;
    movingImage.imageHeight = targetImageHeight;

    const targetScale = targetedImage.lastScale;
    const movingScale = movingImage.lastScale;
    targetedImage.lastScale = movingScale;
    targetedImage.baseScale.setValue(movingScale);
    movingImage.lastScale = targetScale;
    movingImage.baseScale.setValue(targetScale);

    targetedImage.onSwitch();
    movingImage.onSwitch();

    const targetRotateX = targetedImage.lastRotateX;
    const movingRotateX = movingImage.lastRotateX;
    const targetRotateY = targetedImage.lastRotateY;
    const movingRotateY = movingImage.lastRotateY;
    if (targetRotateX !== movingRotateX) {
      targetedImage.onFlip();
      movingImage.onFlip();
    }
    if (targetRotateY !== movingRotateY) {
      targetedImage.onMirror();
      movingImage.onMirror();
    }

    this.onImageTarget(null);
  };

  onImageResizeEvent = (direction, imageId, translation) => {
    let shouldResize = true,
      animArr = [];
    this.images = [];
    this.adjacentImages = [];
    const image = this.imagesRefs[imageId];

    const resizeTopAnim = img => {
      const containerHeight = img.containerHeight - translation;
      animArr.push(
        Animated.timing(img.containerHeightTranslate, {
          toValue: containerHeight,
          duration: 0,
          easing: Easing.linear()
        })
      );
      const lastScale = Math.max(
        containerHeight / img.imageHeight,
        img.lastScale
      );

      const imageHeight = Math.round(lastScale * img.imageHeight);
      const heightOffset = (imageHeight - img.imageHeight) / 2;
      let imageTranslation;
      if (img.imageTop + imageHeight < containerHeight + heightOffset) {
        imageTranslation =
          containerHeight + heightOffset - (img.imageTop + imageHeight);
        console.log(img.props.id, "first case", imageTranslation);
      }

      if (imageTranslation) {
        animArr.push(
          Animated.timing(img.imageTranslate.y, {
            toValue: imageTranslation,
            duration: 0,
            easing: Easing.linear()
          })
        );
      }
      if (lastScale > img.lastScale) {
        animArr.push(
          Animated.timing(img.baseScale, {
            toValue: lastScale,
            duration: 0,
            easing: Easing.linear()
          })
        );
      }
    };
    const resizeBottomAnim = img => {
      console.log(img.props.id, img.imageLeft, img.imageTop);
      const containerHeight = img.containerHeight + translation;
      animArr.push(
        Animated.timing(img.containerHeightTranslate, {
          toValue: containerHeight,
          duration: 0,
          easing: Easing.linear()
        })
      );
      const lastScale = Math.max(
        containerHeight / img.imageHeight,
        img.lastScale
      );

      const imageHeight = Math.round(lastScale * img.imageHeight);
      const heightOffset = (imageHeight - img.imageHeight) / 2;
      let imageTranslation;
      if (img.imageTop + imageHeight < containerHeight + heightOffset) {
        imageTranslation =
          containerHeight + heightOffset - (img.imageTop + imageHeight);
        console.log(img.props.id, "first case", imageTranslation);
      }

      if (imageTranslation) {
        animArr.push(
          Animated.timing(img.imageTranslate.y, {
            toValue: imageTranslation,
            duration: 0,
            easing: Easing.linear()
          })
        );
      }
      if (lastScale > img.lastScale) {
        animArr.push(
          Animated.timing(img.baseScale, {
            toValue: lastScale,
            duration: 0,
            easing: Easing.linear()
          })
        );
      }
    };

    function resizeLeftAnim(img) {
      console.log(img.props.id, img.imageLeft, img.imageTop);
      const containerWidth = img.containerWidth - translation;
      animArr.push(
        Animated.timing(img.containerWidthTranslate, {
          toValue: containerWidth,
          duration: 0,
          easing: Easing.linear()
        })
      );
      const lastScale = Math.max(
        containerWidth / img.imageWidth,
        img.lastScale
      );

      const imageWidth = Math.round(lastScale * img.imageWidth);
      const widthOffset = (imageWidth - img.imageWidth) / 2;
      let imageTranslation;
      if (img.imageLeft + imageWidth < containerWidth + widthOffset) {
        imageTranslation =
          containerWidth + widthOffset - (img.imageLeft + imageWidth);
        console.log(img.props.id, "first case", imageTranslation);
      }

      if (imageTranslation) {
        animArr.push(
          Animated.timing(img.imageTranslate.x, {
            toValue: imageTranslation,
            duration: 0,
            easing: Easing.linear()
          })
        );
      }
      if (lastScale > img.lastScale) {
        animArr.push(
          Animated.timing(img.baseScale, {
            toValue: lastScale,
            duration: 0,
            easing: Easing.linear()
          })
        );
      }
    }

    function resizeRightAnim(img) {
      const containerWidth = img.containerWidth + translation;
      animArr.push(
        Animated.timing(img.containerWidthTranslate, {
          toValue: containerWidth,
          duration: 0,
          easing: Easing.linear()
        })
      );
      const lastScale = Math.max(
        containerWidth / img.imageWidth,
        img.lastScale
      );

      const imageWidth = Math.round(lastScale * img.imageWidth);
      const widthOffset = (imageWidth - img.imageWidth) / 2;
      let imageTranslation;
      if (img.imageLeft + imageWidth < containerWidth + widthOffset) {
        imageTranslation =
          containerWidth + widthOffset - (img.imageLeft + imageWidth);
        console.log(img.props.id, "first case", imageTranslation);
      }

      if (imageTranslation) {
        animArr.push(
          Animated.timing(img.imageTranslate.x, {
            toValue: imageTranslation,
            duration: 0,
            easing: Easing.linear()
          })
        );
      }
      if (lastScale > img.lastScale) {
        animArr.push(
          Animated.timing(img.baseScale, {
            toValue: lastScale,
            duration: 0,
            easing: Easing.linear()
          })
        );
      }
    }
    switch (direction) {
      case "top":
        Object.keys(this.imagesRefs).forEach(id => {
          const img = this.imagesRefs[id];
          if (image.top === img.top) {
            this.images.push(id);
            if (img.containerHeight - translation < 30) {
              shouldResize = false;
            } else {
              resizeTopAnim(img);
            }
          }
          if (image.top === img.bottom) {
            this.adjacentImages.push(id);
            if (img.containerHeight + translation < 30) {
              shouldResize = false;
            } else {
              resizeBottomAnim(img);
            }
          }
        });
        break;
      case "bottom":
        Object.keys(this.imagesRefs).forEach(id => {
          const img = this.imagesRefs[id];
          if (image.bottom === img.bottom) {
            this.images.push(id);
            if (img.containerHeight + translation < 30) {
              shouldResize = false;
            } else {
              resizeBottomAnim(img);
            }
          }
          if (image.bottom === img.top) {
            this.adjacentImages.push(id);
            if (img.containerHeight - translation < 30) {
              shouldResize = false;
            } else {
              resizeTopAnim(img);
            }
          }
        });
        break;
      case "left":
        Object.keys(this.imagesRefs).forEach(id => {
          const img = this.imagesRefs[id];
          if (image.left === img.left) {
            this.images.push(id);
            if (img.containerWidth - translation < 30) {
              shouldResize = false;
            } else {
              resizeLeftAnim(img);
            }
          }
          if (image.left === img.right) {
            this.adjacentImages.push(id);
            if (img.containerWidth + translation < 30) {
              shouldResize = false;
            } else {
              resizeRightAnim(img);
            }
          }
        });
        break;
      case "right":
        Object.keys(this.imagesRefs).forEach(id => {
          const img = this.imagesRefs[id];
          if (image.right === img.right) {
            this.images.push(id);
            if (img.containerWidth + translation < 30) {
              shouldResize = false;
            } else {
              resizeRightAnim(img);
            }
          }
          if (image.right === img.left) {
            this.adjacentImages.push(id);
            if (img.containerWidth - translation < 30) {
              shouldResize = false;
            } else {
              resizeLeftAnim(img);
            }
          }
        });
        break;
    }
    if (shouldResize) {
      this.translation = translation;
      Animated.parallel(animArr).start();
    }
  };

  onImageResizeStateChange = (direction, state) => {
    if (state === State.ACTIVE) {
      this.removeSavedImage();
    }
    if (state === State.END || state === State.CANCELLED) {
      let images, adjacentImages;
      switch (direction) {
        case "top":
        case "bottom":
          images = direction === "top" ? this.images : this.adjacentImages;
          adjacentImages =
            direction === "top" ? this.adjacentImages : this.images;
          console.log(images, adjacentImages);
          images.forEach(id => {
            const img = this.imagesRefs[id];
            const containerHeight = img.containerHeight - this.translation;
            const lastScale = Math.max(
              containerHeight / img.imageHeight,
              img.lastScale
            );
            const imageHeight = Math.round(lastScale * img.imageHeight);
            const heightOffset = (imageHeight - img.imageHeight) / 2;
            let imageTranslation = 0;
            if (img.imageTop + imageHeight < containerHeight + heightOffset) {
              imageTranslation =
                containerHeight + heightOffset - (img.imageTop + imageHeight);
              console.log(img.props.id, "first case", imageTranslation);
            }
            img.containerHeight = containerHeight;
            img.lastScale = lastScale;
            img.baseScale.setValue(lastScale);
            img.imageTop += imageTranslation;
            img.imageTranslate.y.setOffset(img.imageTop);
            img.imageTranslate.y.setValue(0);
            img.containerInitialY += this.translation;
            img.containerY += this.translation;
          });

          adjacentImages.forEach(id => {
            const img = this.imagesRefs[id];
            const containerHeight = img.containerHeight + this.translation;
            const lastScale = Math.max(
              containerHeight / img.imageHeight,
              img.lastScale
            );
            const imageHeight = Math.round(lastScale * img.imageHeight);
            const heightOffset = (imageHeight - img.imageHeight) / 2;
            let imageTranslation = 0;
            if (img.imageTop + imageHeight < containerHeight + heightOffset) {
              imageTranslation =
                containerHeight + heightOffset - (img.imageTop + imageHeight);
              console.log(img.props.id, "first case", imageTranslation);
            }
            img.containerHeight = containerHeight;
            img.lastScale = lastScale;
            img.baseScale.setValue(lastScale);
            img.imageTop += imageTranslation;
            img.imageTranslate.y.setOffset(img.imageTop);
            img.imageTranslate.y.setValue(0);
          });
          break;
        case "left":
        case "right":
          images = direction === "left" ? this.images : this.adjacentImages;
          adjacentImages =
            direction === "left" ? this.adjacentImages : this.images;
          console.log(images, adjacentImages);
          images.forEach(id => {
            const img = this.imagesRefs[id];
            const containerWidth = img.containerWidth - this.translation;
            const lastScale = Math.max(
              containerWidth / img.imageWidth,
              img.lastScale
            );
            const imageWidth = Math.round(lastScale * img.imageWidth);
            const widthOffset = (imageWidth - img.imageWidth) / 2;
            let imageTranslation = 0;
            if (img.imageLeft + imageWidth < containerWidth + widthOffset) {
              imageTranslation =
                containerWidth + widthOffset - (img.imageLeft + imageWidth);
              console.log(img.props.id, "first case", imageTranslation);
            }
            img.containerWidth = containerWidth;
            img.lastScale = lastScale;
            img.baseScale.setValue(lastScale);
            img.imageLeft += imageTranslation;
            img.imageTranslate.x.setOffset(img.imageLeft);
            img.imageTranslate.x.setValue(0);
            img.containerInitialX += this.translation;
            img.containerX += this.translation;
          });

          adjacentImages.forEach(id => {
            const img = this.imagesRefs[id];
            const containerWidth = img.containerWidth + this.translation;
            const lastScale = Math.max(
              containerWidth / img.imageWidth,
              img.lastScale
            );
            const imageWidth = Math.round(lastScale * img.imageWidth);
            const widthOffset = (imageWidth - img.imageWidth) / 2;
            let imageTranslation = 0;
            if (img.imageLeft + imageWidth < containerWidth + widthOffset) {
              imageTranslation =
                containerWidth + widthOffset - (img.imageLeft + imageWidth);
              console.log(img.props.id, "first case", imageTranslation);
            }
            img.containerWidth = containerWidth;
            img.lastScale = lastScale;
            img.baseScale.setValue(lastScale);
            img.imageLeft += imageTranslation;
            img.imageTranslate.x.setOffset(img.imageLeft);
            img.imageTranslate.x.setValue(0);
          });
          break;
      }
    }
  };

  onReplacePress = () => {
    console.log("from onReplacePress");
    this.setScreenParams({ title: "REPLACE", headerRight: null });
    Animated.parallel([
      Animated.timing(this.collageScale, {
        useNativeDriver: true,
        toValue: 0.9
      }),
      Animated.timing(this.collageTranslateY, {
        useNativeDriver: true,
        toValue: -(collageWidth / 10) / 2
      })
    ]).start();
    if (this.state.selectedImageId === null) {
      this.setState({
        selectedImageId: 0,
        selectedImageUri: this.imagesRefs[0].source.uri
      });
    }
    this.setState({
      isReplacing: true
    });
  };

  onImageReplace = source => {
    console.log("from onImageReplace");
    this.removeSavedImage();
    this.props.replaceSelectedPhoto(this.state.selectedImageUri, source);
    this.setState({
      selectedImageUri: source.uri
    });
    if (this.state.selectedImageId !== null) {
      this.imagesRefs[this.state.selectedImageId].onReplace(source);
    }
  };

  getButtonColor(bool) {
    return bool ? Colors.selectedColor : Colors.white;
  }

  renderScreenBottom() {
    const {
      isReplacing,
      isSaved,
      isFlipped,
      isMirrored,
      selectedImageUri,
      selectedImageId,
      isBordered,
      isSaving
    } = this.state;
    const { photos, hasNextPage, getPhotos } = this.props;
    const disabled = selectedImageId === null;
    if (isReplacing) {
      return (
        <View style={{ flex: 1 }}>
          <ImageList
            ref={view => (this.imageListRef = view)}
            hasOffset={false}
            photos={photos}
            hasNextPage={hasNextPage}
            getPhotos={getPhotos}
            onPhotoPress={this.onImageReplace}
            selectedUri={selectedImageUri}
          />
        </View>
      );
    } else if (isSaved) {
      return (
        <View style={styles.container}>
          <Text style={styles.finishText}>
            Congratulations, your photo was saved.
          </Text>
        </View>
      );
    } else {
      return (
        <ScrollView
          horizontal
          contentContainerStyle={{
            height: deviceHeight - collageHeight - Layout.titleHeight,
            alignItems: "center",
            paddingHorizontal: 16
          }}
        >
          <EditButton
            text="REPLACE"
            icon={
              <MaterialIcons
                style={styles.iconStyle}
                name="swap-vert"
                size={32}
                color={isSaving ? Colors.lightGrey : Colors.white}
              />
            }
            disabled={isSaving}
            onPress={this.onReplacePress}
          />
          <EditButton
            text="FLIP"
            icon={
              <MaterialIcons
                style={styles.iconStyle}
                name="rotate-right"
                size={32}
                color={
                  disabled ? Colors.lightGrey : this.getButtonColor(isFlipped)
                }
              />
            }
            onPress={this.flipSelectedImageId}
            disabled={disabled}
          />
          <EditButton
            text="MIRROR"
            icon={
              <MaterialIcons
                style={styles.iconStyle}
                name="flip"
                size={32}
                color={
                  disabled ? Colors.lightGrey : this.getButtonColor(isMirrored)
                }
              />
            }
            onPress={this.mirrorSelectedImageId}
            disabled={disabled}
          />
          <EditButton
            text="BORDER"
            icon={
              <MaterialIcons
                style={styles.iconStyle}
                name="border-inner"
                size={32}
                color={
                  isSaving ? Colors.lightGrey : this.getButtonColor(isBordered)
                }
              />
            }
            disabled={isSaving}
            onPress={this.onBorderPress}
          />
        </ScrollView>
      );
    }
  }

  render() {
    console.log("window height: ", deviceHeight);
    console.log("Title height: ", titleHeight);
    console.log("status bar height: ", Constants.statusBarHeight);
    const {
      isBordered,
      selectedImageId,
      movingImageId,
      targetedImageId,
      isSaving,
      progress,
      isSaved
    } = this.state;
    const { layout, selectedPhotos } = this.props;
    const { flexDirection, matrix } = layout;
    const pointerEvents = isSaving || isSaved ? "none" : "auto";
    console.log("collage dimensions: ", collageWidth, collageHeight);
    return (
      <React.Fragment>
        {isSaving && (
          <View style={styles.progressContainer}>
            <ProgressBar
              useNativeDriver={true}
              width={collageWidth}
              height={3}
              color={Colors.selectedColor}
              borderWidth={0}
              progress={progress}
            />
          </View>
        )}
        <Animated.View
          pointerEvents={pointerEvents}
          ref={this.collageRef}
          style={{
            flexDirection,
            width: collageWidth,
            height: collageHeight,
            transform: [
              { scale: this.collageScale },
              { translateY: this.collageTranslateY }
            ],
            zIndex: 1
          }}
        >
          {matrix.map((imageOrImages, index) => {
            let hasImages = typeof imageOrImages === "object";
            let direction = flexDirection === "column" ? "row" : "column";
            let width, height;
            switch (flexDirection) {
              case "row":
                width = collageWidth / matrix.length;
                height = collageHeight;
                break;
              case "column":
                width = collageWidth;
                height = collageHeight / matrix.length;
                break;
            }
            const id = this.longestRow ? index * this.longestRow : index;
            return hasImages ? (
              <View
                ref={row => (this.rowsRefs[index] = row)}
                key={index}
                style={{
                  flexDirection: direction
                }}
              >
                {imageOrImages.map((img, i) => {
                  this.longestRow = Math.max(
                    this.longestRow,
                    imageOrImages.length
                  );
                  let imageWidth, imageHeight;
                  switch (direction) {
                    case "row":
                      imageWidth = width / imageOrImages.length;
                      imageHeight = height;
                      break;
                    case "column":
                      imageWidth = width;
                      imageHeight = height / imageOrImages.length;
                  }
                  const id = index * this.longestRow + i;
                  return (
                    <CollageImg
                      removeSavedImage={this.removeSavedImage}
                      onImageResizeEvent={this.onImageResizeEvent}
                      onImageResizeStateChange={this.onImageResizeStateChange}
                      rowId={direction === "row" ? index : undefined}
                      isBordered={isBordered}
                      ref={img => (this.imagesRefs[id] = img)}
                      id={id}
                      key={i}
                      style={{ width: imageWidth, height: imageHeight }}
                      source={selectedPhotos[img]}
                      selected={selectedImageId === id}
                      targeted={targetedImageId === id}
                      onImageSelect={this.onImageSelect}
                      onImageMove={this.onImageMove}
                      checkImageCollision={this.checkImageCollision}
                      movingImageId={movingImageId}
                      onImageSwitch={this.onImageSwitch}
                      targetedImageId={targetedImageId}
                      collageWidth={collageWidth}
                      collageHeight={collageHeight}
                    />
                  );
                })}
              </View>
            ) : (
              <CollageImg
                removeSavedImage={this.removeSavedImage}
                onImageResizeEvent={this.onImageResizeEvent}
                onImageResizeStateChange={this.onImageResizeStateChange}
                isBordered={isBordered}
                id={id}
                ref={img => (this.imagesRefs[id] = img)}
                key={index}
                style={{ width, height }}
                source={selectedPhotos[imageOrImages]}
                selected={selectedImageId === id}
                targeted={targetedImageId === id}
                onImageSelect={this.onImageSelect}
                onImageMove={this.onImageMove}
                checkImageCollision={this.checkImageCollision}
                movingImageId={movingImageId}
                onImageSwitch={this.onImageSwitch}
                targetedImageId={targetedImageId}
                collageWidth={collageWidth}
                collageHeight={collageHeight}
              />
            );
          })}
        </Animated.View>
        {this.renderScreenBottom()}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  finishText: {
    color: Colors.white,
    fontSize: 16
  },
  progressContainer: {
    position: "absolute",
    top: 0
  },
  rightButtonContainerStyle: {
    width: 60
  }
});
