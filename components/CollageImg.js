import React, { PureComponent } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { GestureHandler } from "expo";
const {
  PanGestureHandler,
  PinchGestureHandler,
  LongPressGestureHandler,
  TapGestureHandler,
  State
} = GestureHandler;

import Colors from "../constants/Colors";
import Layout from "../constants/Layout";

export class CollageImage extends PureComponent {
  image = React.createRef();
  pinchRef = React.createRef();
  panRef = React.createRef();
  panContainerRef = React.createRef();
  longPressRef = React.createRef();
  imageContainer = React.createRef();
  resizeTopRef = React.createRef();

  constructor(props) {
    super(props);

    /* Pinching */
    this.baseScale = new Animated.Value(1);
    this.pinchScale = new Animated.Value(1);
    this.scale = Animated.multiply(this.baseScale, this.pinchScale);
    this.lastScale = 1;
    this.onPinchGestureEvent = Animated.event([
      { nativeEvent: { scale: this.pinchScale } }
    ]);
    this.source = props.source;
    this.aspectRatio = this.source.width / this.source.height;
    this.containerWidth = props.style.width;
    this.containerHeight = props.style.height;
    this.containerAspectRatio = this.containerWidth / this.containerHeight;
    if (this.containerAspectRatio >= this.aspectRatio) {
      this.imageWidth = this.containerWidth;
      this.imageHeight = Math.round(this.imageWidth / this.aspectRatio);
    } else if (this.containerAspectRatio < this.aspectRatio) {
      this.imageHeight = this.containerHeight;
      this.imageWidth = Math.round(this.imageHeight * this.aspectRatio);
    }
    this.imageLeft = Math.round(this.containerWidth - this.imageWidth) / 2;
    this.imageTop = Math.round(this.containerHeight - this.imageHeight) / 2;
    console.log(
      "from image constructor: ",
      props.id,
      this.imageWidth,
      this.imageHeight,
      this.imageLeft,
      this.imageTop
    );
    this.imageTranslate = new Animated.ValueXY(0, 0);
    this.imageTranslate.setOffset({ x: this.imageLeft, y: this.imageTop });
    this.imageTranslate.setValue({ x: 0, y: 0 });

    this.rotateX = new Animated.Value(0);
    this.rotateStrX = this.rotateX.interpolate({
      inputRange: [0, 180],
      outputRange: ["0deg", "180deg"]
    });
    this.lastRotateX = 0;

    this.rotateY = new Animated.Value(0);
    this.rotateStrY = this.rotateY.interpolate({
      inputRange: [0, 180],
      outputRange: ["0deg", "180deg"]
    });
    this.lastRotateX = 0;

    this.isMirrored = false;
    this.isFlipped = false;

    // container long press
    this.containerScale = new Animated.Value(1);
    this.containerOpacity = new Animated.Value(1);
    this.containerZIndex = new Animated.Value(0);

    this.isPanningContainer = false;

    this.containerOffset = { x: 0, y: 0 };
    this.containerTranslate = new Animated.ValueXY(0, 0);
    this.onPanContainerEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this.containerTranslate.x,
            translationY: this.containerTranslate.y
          }
        }
      ],
      { useNativeDriver: true }
    );

    this.containerTop = 0;
    this.containerLeft = 0;
    this.enabledResize = false;
    this.containerTopTranslate = new Animated.Value(this.containerTop);
    this.containerHeightTranslate = new Animated.Value(this.containerHeight);
    this.containerLeftTranslate = new Animated.Value(this.containerLeft);
    this.containerWidthTranslate = new Animated.Value(this.containerWidth);

    this.state = {
      canTranslateImage: true
    };
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.onContainerMeasure();
    }, 500);

    this.containerTranslateListener = this.containerTranslate.addListener(
      value => {
        this.containerX = this.containerInitialX + value.x;
        this.containerY = this.containerInitialY + value.y;
        if (this.props.movingImageId !== null && this.isPanningContainer) {
          this.props.checkImageCollision();
        }
      }
    );
  }

  componentWillUnmount() {
    this.containerTranslate.removeListener(this.containerTranslateListener);
    clearTimeout(this.timeout);
  }

  onSwitch = () => {
    const imageHeight = this.imageHeight * this.lastScale;
    const imageWidth = this.imageWidth * this.lastScale;
    if (
      imageHeight < this.containerHeight ||
      imageWidth < this.containerWidth
    ) {
      this.aspectRatio = this.source.width / this.source.height;
      this.containerAspectRatio = this.containerWidth / this.containerHeight;
      if (this.containerAspectRatio >= this.aspectRatio) {
        this.imageWidth = Math.max(this.imageWidth, this.containerWidth);
        this.imageHeight = this.imageWidth / this.aspectRatio;
      } else if (this.containerAspectRatio < this.aspectRatio) {
        this.imageHeight = Math.max(this.imageHeight, this.containerHeight);
        this.imageWidth = this.imageHeight * this.aspectRatio;
      }
      this.lastScale = 1;
      this.baseScale.setValue(this.lastScale);
    }

    console.log(this.props.id, this.imageLeft, this.imageTop);
    this.imageLeft = (this.containerWidth - this.imageWidth) / 2;
    this.imageTop = (this.containerHeight - this.imageHeight) / 2;
    this.imageTranslate = new Animated.ValueXY(0, 0);
    this.imageTranslate.setOffset({ x: this.imageLeft, y: this.imageTop });
    this.imageTranslate.setValue({ x: 0, y: 0 });
  };

  onPanGestureEvent = event => {
    let { translationX, translationY } = event.nativeEvent;
    translationX = Math.round(translationX);
    translationY = Math.round(translationY);

    shouldTranslate = true;
    const imageWidth = this.imageWidth * this.lastScale;
    const widthOffset = (imageWidth - this.imageWidth) / 2;
    const imageHeight = this.imageHeight * this.lastScale;
    const heightOffset = (imageHeight - this.imageHeight) / 2;
    let imageLeft = this.imageLeft + translationX;
    let imageTop = this.imageTop + translationY;
    const horizontalThreshold = 0.25 * this.containerWidth;
    const verticalThreshold = 0.25 * this.containerHeight;
    if (
      imageLeft >
      this.containerOffset.x + widthOffset + horizontalThreshold
    ) {
      shouldTranslate = false;
    } else if (
      imageLeft + imageWidth + horizontalThreshold <
      this.containerOffset.x + this.containerWidth + widthOffset
    ) {
      shouldTranslate = false;
    }
    if (imageTop > this.containerOffset.y + heightOffset + verticalThreshold) {
      shouldTranslate = false;
    } else if (
      imageTop + imageHeight + verticalThreshold <
      this.containerOffset.y + this.containerHeight + heightOffset
    ) {
      shouldTranslate = false;
    }
    if (shouldTranslate) {
      Animated.parallel([
        Animated.timing(this.imageTranslate.x, {
          toValue: translationX,
          duration: 0,
          easing: Easing.linear()
        }),
        Animated.timing(this.imageTranslate.y, {
          toValue: translationY,
          duration: 0,
          easing: Easing.linear()
        })
      ]).start();
    } else {
      this.translationX = translationX;
      this.translationY = translationY;
      this.setState({
        canTranslateImage: false
      });
    }
  };

  onPanHandlerStateChange = event => {
    let { translationX, translationY, state, oldState } = event.nativeEvent;
    translationX = Math.round(translationX);
    translationY = Math.round(translationY);
    if (state === State.BEGAN) {
      console.log("from State BEGAN", this.imageTranslate.x._offset);
      this.imageTranslate.setOffset({ x: this.imageLeft, y: this.imageTop });
      this.imageTranslate.setValue({ x: 0, y: 0 });
      console.log(this.imageTranslate.x._offset);
    }

    if (state === State.ACTIVE) {
      this.props.removeSavedImage();
    }

    if (oldState === State.ACTIVE) {
      console.log("image oldState was ACTIve");
      if (this.state.canTranslateImage) {
        this.imageLeft += translationX;
        this.imageTop += translationY;
      } else {
        this.imageLeft += this.translationX;
        this.imageTop += this.translationY;
      }
    }

    if (state === State.END || state === State.CANCELLED) {
      console.log("pan image State is END or CANCELLED");
      this.updateImagePosition();
    }
  };

  updateImagePosition = () => {
    console.log(
      "updateImagePosition was called: ",
      this.imageLeft,
      this.imageTop
    );
    let shouldUpdate = false;
    const imageWidth = this.imageWidth * this.lastScale;
    const widthOffset = (imageWidth - this.imageWidth) / 2;
    const imageHeight = this.imageHeight * this.lastScale;
    const heightOffset = (imageHeight - this.imageHeight) / 2;
    console.log(imageWidth);
    if (this.imageLeft > this.containerOffset.x + widthOffset) {
      shouldUpdate = true;
      console.log("should translate to the left");
      console.log(this.imageLeft);
      this.imageLeft = this.containerOffset.x + widthOffset;
      console.log(this.imageLeft);
    } else if (
      this.imageLeft + imageWidth <
      this.containerOffset.x + this.containerWidth + widthOffset
    ) {
      shouldUpdate = true;
      console.log("should translate to the right");
      console.log(this.imageLeft);
      this.imageLeft = this.containerWidth + widthOffset - imageWidth;
      console.log(this.imageLeft);
    }

    console.log(imageHeight);
    if (this.imageTop > this.containerOffset.y + heightOffset) {
      shouldUpdate = true;
      console.log("should translate to the top");
      console.log(this.imageTop);
      this.imageTop = this.containerOffset.y + heightOffset;
      console.log(this.imageTop);
    } else if (
      this.imageTop + imageHeight <
      this.containerOffset.y + this.containerHeight + heightOffset
    ) {
      shouldUpdate = true;
      console.log("should translate to the bottom");
      console.log(this.imageTop);
      this.imageTop = this.containerHeight + heightOffset - imageHeight;
      console.log(this.imageTop);
    }
    if (shouldUpdate) {
      console.log(
        this.imageTop,
        this.imageTranslate.y.__getValue(),
        this.imageTranslate.y._offset
      );
      console.log(
        this.imageLeft,
        this.imageTranslate.x.__getValue(),
        this.imageTranslate.x._offset
      );
      Animated.timing(this.imageTranslate, {
        toValue: {
          x: this.imageLeft - this.imageTranslate.x._offset,
          y: this.imageTop - this.imageTranslate.y._offset
        },
        duration: 250,
        easing: Easing.out(Easing.quad)
      }).start(({ finished }) => {
        console.log("image animation state: ", finished);
        if (finished) {
          this.imageTranslate.setOffset({
            x: this.imageLeft,
            y: this.imageTop
          });
          this.imageTranslate.setValue({ x: 0, y: 0 });
          if (!this.state.canTranslateImage) {
            this.setState({
              canTranslateImage: true
            });
          }
        }
        console.log(
          this.imageTop,
          this.imageTranslate.y.__getValue(),
          this.imageTranslate.y._offset
        );
        console.log(
          this.imageLeft,
          this.imageTranslate.x.__getValue(),
          this.imageTranslate.x._offset
        );
      });
    }
  };

  onPinchHandlerStateChange = event => {
    const { state, oldState } = event.nativeEvent;
    if (state === State.ACTIVE) {
      this.props.removeSavedImage();
    }
    if (oldState === State.ACTIVE) {
      this.lastScale *= event.nativeEvent.scale;
      this.baseScale.setValue(this.lastScale);
      this.pinchScale.setValue(1);
    }

    if (state === State.END || state === State.CANCELLED) {
      const imageWidth = this.imageWidth * this.lastScale;
      const imageHeight = this.imageHeight * this.lastScale;
      if (
        imageWidth < this.containerWidth ||
        imageHeight < this.containerHeight
      ) {
        console.log("should increase size");

        this.lastScale = Math.max(
          this.containerWidth / this.imageWidth,
          this.containerHeight / this.imageHeight
        );
        Animated.spring(this.baseScale, {
          toValue: this.lastScale
        }).start();
      }
      this.updateImagePosition();
    }
  };

  longPressAnimation = (zIndex, scale, opacity) => {
    return Animated.parallel([
      Animated.timing(this.containerZIndex, {
        toValue: 0,
        duration: 0,
        ...zIndex
      }),
      Animated.timing(this.containerScale, {
        useNativeDriver: true,
        duration: 100,
        toValue: 1,
        ...scale
      }),
      Animated.timing(this.containerOpacity, {
        useNativeDriver: true,
        duration: 100,
        toValue: 1,
        ...opacity
      })
    ]);
  };

  onLongPressHandlerStateChange = event => {
    const { state } = event.nativeEvent;
    const { onImageSelect, onImageMove, id } = this.props;
    if (state === State.ACTIVE) {
      this.isLongPressed = true;
      onImageSelect(null);
      onImageMove(id);

      this.longPressAnimation(
        { toValue: 1, duration: 100 },
        { toValue: 1.2 },
        { toValue: 0.7 }
      ).start();
    }
  };

  onPanContainerStateChange = event => {
    let { translationX, translationY, state } = event.nativeEvent;
    translationX = Math.round(translationX);
    translationY = Math.round(translationY);
    const { onImageMove, targetedImageId, onImageSwitch } = this.props;
    if (state === State.FAILED) {
      console.log("pan container state is FAILED");
      if (this.isLongPressed) {
        this.isLongPressed = false;
        onImageMove(null);
        this.longPressAnimation().start();
      }
    }
    if (state === State.ACTIVE) {
      console.log("pan container state is ACTIVE");
      this.isPanningContainer = true;
      this.containerOffset.x += translationX;
      this.containerOffset.y += translationY;
    }

    if (state === State.END || state === State.CANCELLED) {
      console.log("pan container was cancelled");
      this.isPanningContainer = false;
      if (targetedImageId !== null) {
        onImageSwitch();
      }
      onImageMove(null);
      this.containerOffset.x = 0;
      this.containerOffset.y = 0;
      this.containerX = this.containerInitialX;
      this.containerY = this.containerInitialY;
      Animated.parallel([
        Animated.spring(this.containerTranslate, {
          useNativeDriver: true,
          toValue: { x: 0, y: 0 }
        }),
        Animated.sequence([
          this.longPressAnimation({ toValue: 1 }),
          Animated.timing(this.containerZIndex, {
            toValue: 0,
            duration: 0
          })
        ])
      ]).start();
    }
  };

  onContainerMeasure = () => {
    this.imageContainer &&
      this.imageContainer.current._component.measure(
        (_fx, _fy, width, height, px, py) => {
          console.log(
            "from container measure:",
            this.props.id,
            px,
            py,
            width,
            height
          );
          this.containerInitialX = Math.round(px);
          this.containerInitialY = Math.round(py);
          this.containerX = this.containerInitialX;
          this.containerY = this.containerInitialY;
          const { collageWidth, collageHeight } = this.props;
          const collageY = Layout.titleHeight;
          if (this.containerInitialX + this.containerWidth < collageWidth) {
            this.right = this.containerInitialX + this.containerWidth;
            console.log("has right: ", this.right);
          }
          if (this.containerInitialX > 0) {
            this.left = this.containerInitialX;
            console.log("has left: ", this.left);
          }
          if (
            this.containerInitialY + this.containerHeight <
            collageHeight + collageY
          ) {
            this.bottom = this.containerInitialY + this.containerHeight;
            console.log(
              "leftSide: ",
              this.containerInitialY + this.containerHeight
            );
            console.log("rightSide: ", collageHeight + collageY);
            console.log("has bottom: ", this.bottom);
          }
          if (this.containerInitialY > collageY) {
            this.top = this.containerInitialY;
            console.log("leftSide: ", this.containerInitialY);
            console.log("rightSide: ", collageY);
            console.log("has top: ", this.top);
          }
          const { onImageSelect, id } = this.props;
          if (id === 0) {
            onImageSelect(id);
          }
        }
      );
  };

  onReplace = source => {
    this.source = source;
    this.aspectRatio = this.source.width / this.source.height;
    this.containerAspectRatio = this.containerWidth / this.containerHeight;
    if (this.containerAspectRatio >= this.aspectRatio) {
      this.imageWidth = this.containerWidth;
      this.imageHeight = this.imageWidth / this.aspectRatio;
    } else if (this.containerAspectRatio < this.aspectRatio) {
      this.imageHeight = this.containerHeight;
      this.imageWidth = this.imageHeight * this.aspectRatio;
    }
    this.imageLeft = (this.containerWidth - this.imageWidth) / 2;
    this.imageTop = (this.containerHeight - this.imageHeight) / 2;
    this.imageTranslate.setOffset({ x: this.imageLeft, y: this.imageTop });
    this.imageTranslate.setValue({ x: 0, y: 0 });
    this.lastScale = 1;
    this.baseScale.setValue(this.lastScale);
    this.lastRotateX = 0;
    this.rotateX.setValue(this.lastRotateX);
    this.lastRotateY = 0;
    this.rotateY.setValue(this.lastRotateY);
  };

  onFlip = () => {
    this.props.removeSavedImage();
    this.isFlipped = !this.isFlipped;
    this.lastRotateX = this.lastRotateX === 180 ? 0 : 180;
    Animated.timing(this.rotateX, {
      toValue: this.lastRotateX,
      duration: 0
    }).start();
  };

  onMirror = () => {
    this.props.removeSavedImage();
    this.isMirrored = !this.isMirrored;
    this.lastRotateY = this.lastRotateY === 180 ? 0 : 180;
    Animated.timing(this.rotateY, {
      toValue: this.lastRotateY,
      duration: 0
    }).start();
  };

  onSingleTap = event => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const { onImageSelect, id } = this.props;
      onImageSelect(id);
    }
  };

  onResizeEvent = (event, direction) => {
    const { translationY, translationX } = event.nativeEvent;
    const { onImageResizeEvent, id } = this.props;
    let translation;
    switch (direction) {
      case "top":
      case "bottom":
        translation = Math.round(translationY);
        onImageResizeEvent(direction, id, translation);
        break;
      case "left":
      case "right":
        translation = Math.round(translationX);
        onImageResizeEvent(direction, id, translation);
        break;
    }
  };

  onResizeStateChange = (event, direction) => {
    const { state } = event.nativeEvent;
    const { onImageResizeStateChange } = this.props;
    onImageResizeStateChange(direction, state);
  };

  render() {
    const { selected, targeted, isBordered } = this.props;
    const borderedStyle = isBordered
      ? {
          borderTopWidth: this.top ? 1 : 0,
          borderBottomWidth: this.bottom ? 1 : 0,
          borderRightWidth: this.right ? 1 : 0,
          borderLeftWidth: this.left ? 1 : 0
        }
      : {};
    return (
      <PanGestureHandler
        maxPointers={1}
        minPointers={1}
        onGestureEvent={this.onPanContainerEvent}
        onHandlerStateChange={this.onPanContainerStateChange}
        ref={this.panContainerRef}
        simultaneousHandlers={this.longPressRef}
        waitFor={[this.panRef, this.pinchRef]}
        enabled={this.state.canTranslateImage}
      >
        <Animated.View
          ref={this.imageContainer}
          style={{
            width: this.containerWidthTranslate,
            height: this.containerHeightTranslate,
            zIndex: selected ? 1 : this.containerZIndex
          }}
        >
          {this.top && (
            <PanGestureHandler
              maxPointers={1}
              minPointers={1}
              onHandlerStateChange={event => {
                this.onResizeStateChange(event, "top");
              }}
              onGestureEvent={event => {
                this.onResizeEvent(event, "top");
              }}
              ref={this.resizeTopRef}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  top: -4,
                  width: "100%",
                  height: 10,
                  borderRadius: 4,
                  zIndex: 1
                }}
              >
                {selected && (
                  <View
                    style={{
                      position: "absolute",
                      left: "25%",
                      top: 1,
                      width: "50%",
                      height: "80%",
                      borderRadius: 4,
                      backgroundColor: Colors.selectedColor,
                      borderWidth: 1,
                      borderColor: Colors.darkGrey
                    }}
                    pointerEvents="none"
                  />
                )}
              </Animated.View>
            </PanGestureHandler>
          )}
          {this.bottom && (
            <PanGestureHandler
              maxPointers={1}
              minPointers={1}
              onHandlerStateChange={event => {
                this.onResizeStateChange(event, "bottom");
              }}
              onGestureEvent={event => {
                this.onResizeEvent(event, "bottom");
              }}
              ref={this.resizeBottomRef}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: -4,
                  width: "100%",
                  height: 10,
                  borderRadius: 4,
                  zIndex: 1
                }}
              >
                {selected && (
                  <View
                    style={{
                      position: "absolute",
                      left: "25%",
                      bottom: 1,
                      width: "50%",
                      height: "80%",
                      borderRadius: 4,
                      backgroundColor: Colors.selectedColor,
                      borderWidth: 1,
                      borderColor: Colors.darkGrey
                    }}
                    pointerEvents="none"
                  />
                )}
              </Animated.View>
            </PanGestureHandler>
          )}
          {this.right && (
            <PanGestureHandler
              maxPointers={1}
              minPointers={1}
              onHandlerStateChange={event => {
                this.onResizeStateChange(event, "right");
              }}
              onGestureEvent={event => {
                this.onResizeEvent(event, "right");
              }}
              ref={this.resizeRightRef}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  right: -4,
                  height: "100%",
                  width: 10,
                  borderRadius: 4,
                  zIndex: 1
                }}
              >
                {selected && (
                  <View
                    style={{
                      position: "absolute",
                      top: "25%",
                      right: 1,
                      height: "50%",
                      width: "80%",
                      borderRadius: 4,
                      backgroundColor: Colors.selectedColor,
                      borderWidth: 1,
                      borderColor: Colors.darkGrey
                    }}
                    pointerEvents="none"
                  />
                )}
              </Animated.View>
            </PanGestureHandler>
          )}
          {this.left && (
            <PanGestureHandler
              maxPointers={1}
              minPointers={1}
              onHandlerStateChange={event => {
                this.onResizeStateChange(event, "left");
              }}
              onGestureEvent={event => {
                this.onResizeEvent(event, "left");
              }}
              ref={this.resizeLeftRef}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  left: -4,
                  height: "100%",
                  width: 10,
                  borderRadius: 4,
                  zIndex: 1
                }}
              >
                {selected && (
                  <View
                    style={{
                      position: "absolute",
                      top: "25%",
                      left: 1,
                      height: "50%",
                      width: "80%",
                      borderRadius: 4,
                      backgroundColor: Colors.selectedColor,
                      borderWidth: 1,
                      borderColor: Colors.darkGrey
                    }}
                    pointerEvents="none"
                  />
                )}
              </Animated.View>
            </PanGestureHandler>
          )}
          <LongPressGestureHandler
            ref={this.longPressRef}
            onGestureEvent={this.onLongPressEvent}
            onHandlerStateChange={this.onLongPressHandlerStateChange}
            minDurationMs={250}
            simultaneousHandlers={this.panContainerRef}
          >
            <Animated.View
              style={{
                width: "100%",
                height: "100%"
              }}
            >
              <View
                style={[
                  {
                    ...StyleSheet.absoluteFill,
                    zIndex: 1,
                    borderColor: Colors.white
                  },
                  borderedStyle
                ]}
                pointerEvents="none"
              />
              <View
                style={{
                  ...StyleSheet.absoluteFill,
                  borderColor: Colors.selectedColor,
                  borderWidth: targeted || selected ? 2 : 0,
                  zIndex: 1
                }}
                pointerEvents="none"
              />
              <TapGestureHandler
                onHandlerStateChange={this.onSingleTap}
                waitFor={[this.longPressRef, this.panRef, this.pinchRef]}
              >
                <Animated.View
                  style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    opacity: this.containerOpacity,
                    transform: [
                      { scale: this.containerScale },
                      ...this.containerTranslate.getTranslateTransform()
                    ]
                  }}
                >
                  <PinchGestureHandler
                    ref={this.pinchRef}
                    onGestureEvent={this.onPinchGestureEvent}
                    onHandlerStateChange={this.onPinchHandlerStateChange}
                    simultaneousHandlers={this.panRef}
                  >
                    <Animated.View
                      style={{
                        width: "100%",
                        height: "100%"
                      }}
                    >
                      <PanGestureHandler
                        maxPointers={2}
                        minPointers={1}
                        onGestureEvent={this.onPanGestureEvent}
                        onHandlerStateChange={this.onPanHandlerStateChange}
                        simultaneousHandlers={this.pinchRef}
                        ref={this.panRef}
                        enabled={this.state.canTranslateImage}
                      >
                        <Animated.View
                          style={{
                            width: "100%",
                            height: "100%"
                          }}
                        >
                          <Animated.Image
                            ref={this.image}
                            source={{ uri: this.source.uri }}
                            style={{
                              position: "absolute",
                              ...this.imageTranslate.getLayout(),
                              width: this.imageWidth,
                              height: this.imageHeight,
                              transform: [
                                { perspective: 1000 },
                                { scale: this.scale },
                                { rotateX: this.rotateStrX },
                                { rotateY: this.rotateStrY }
                              ]
                            }}
                          />
                        </Animated.View>
                      </PanGestureHandler>
                    </Animated.View>
                  </PinchGestureHandler>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </LongPressGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

export default CollageImage;
