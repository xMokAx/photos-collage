import React, { PureComponent } from "react";
import {
  Image,
  ImageBackground,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Animated
} from "react-native";

import Layout from "../constants/Layout";
import Colors from "../constants/Colors";
import Button from "./Button";

const { deviceHeight, deviceWidth } = Layout;
const indicatorCircleWidth = 10;
const indicatorSpace = 10;
const indicatorWidth = indicatorCircleWidth * 5 + (indicatorSpace * 5 - 1);
const imageWidth = deviceWidth / 3.6;
const imageSpace = 4;
const totalImagesWidth = imageWidth * 3 + imageSpace * 2;
const containerHeight = imageWidth * 3;
const containerWidth = totalImagesWidth;
const containerTop = deviceHeight / 2 - containerHeight / 2;
const containerLeft = deviceWidth / 2 - containerWidth / 2;
const top = containerHeight / 2 - imageWidth / 2;
const initialLeft = 0;
const touchCircleWidth = 50;
const handleWidth = 120;

const images = [
  require("../assets/images/tutorial-1.jpg"),
  require("../assets/images/tutorial-2.jpg"),
  require("../assets/images/tutorial-3.jpg")
];

export default class Slides extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isAnimating: true,
      slideIndex: 0
    };
    this.imagesAnim = [];
    this.transitionAnim = [];

    this.slidesLength = props.data.length;
    this.imageWidth = new Animated.Value(imageWidth);

    this.animVal = new Animated.Value(0);

    this.collageOpacity = new Animated.Value(1);
    this.collageScale = this.animVal.interpolate({
      inputRange: [
        0,
        deviceWidth,
        deviceWidth * 2,
        deviceWidth * 3,
        deviceWidth * 4
      ],
      outputRange: [1, 1, 1, 1, deviceHeight / 3 / (totalImagesWidth + 10)]
    });

    this.collageTranslateY = this.animVal.interpolate({
      inputRange: [
        0,
        deviceWidth,
        deviceWidth * 2,
        deviceWidth * 3,
        deviceWidth * 4
      ],
      outputRange: [0, 0, 0, 0, 28]
    });

    this.touchCircleOpacity = new Animated.Value(0);
    this.indicatorTranslateWidth;
    images.forEach((_img, index) => {
      this[`image${index}Opacity`] = new Animated.Value(1);
      this[`check${index}Opacity`] = new Animated.Value(0);
      this[`image${index}TranslateX`] = new Animated.Value(0);
      this[`image${index}TranslateY`] = new Animated.Value(0);
      this[`image${index}Height`] = new Animated.Value(imageWidth);

      if (index === 1) {
        this[`image${index}Scale`] = new Animated.Value(1);
      }
      if (index === 2) {
        this[`image${index}RotateX`] = new Animated.Value(0);
        this[`image${index}RotateXStr`] = this[
          `image${index}RotateX`
        ].interpolate({
          inputRange: [0, 180],
          outputRange: ["0deg", "180deg"]
        });
      } else {
        this[`image${index}RotateY`] = new Animated.Value(0);
        this[`image${index}RotateYStr`] = this[
          `image${index}RotateY`
        ].interpolate({
          inputRange: [0, 180],
          outputRange: ["0deg", "180deg"]
        });
      }
    });
  }

  componentDidMount() {
    this.animValListener = this.animVal.addListener(({ value }) => {
      // console.log("animation value: ", value);
      if (value % deviceWidth === 0) {
        const slideIndex = value / deviceWidth;
        if (slideIndex !== this.state.slideIndex) {
          this.setState({ slideIndex, isAnimating: true });
        }
      }
    });

    this.timeout = setTimeout(() => {
      Animated.sequence(this.imagesAnim).start(() => {
        console.log("Animation was finished");
        this.setState({
          isAnimating: false
        });
      });
    }, 0);
  }

  componentWillUnmount() {
    this.animVal.removeListener(this.animValListener);
    clearTimeout(this.timeout);
  }

  componentDidUpdate(_prevProps, prevState) {
    const { slideIndex } = this.state;
    if (slideIndex !== prevState.slideIndex) {
      if (slideIndex === 1) {
        this.imagesAnim = [
          Animated.timing(this.touchCircleOpacity, {
            useNativeDriver: true,
            toValue: 0.7
          }),
          Animated.timing(this.image1Scale, {
            toValue: 1.2
          }),
          Animated.timing(this.image1TranslateY, {
            toValue: imageWidth * 0.5
          }),
          Animated.timing(this.image2Opacity, {
            toValue: 0.7
          }),
          Animated.parallel([
            Animated.timing(this.touchCircleOpacity, {
              useNativeDriver: true,
              toValue: 0
            }),
            Animated.timing(this.image1TranslateY, {
              toValue: imageWidth
            }),
            Animated.timing(this.image2TranslateY, {
              toValue: 0
            }),
            Animated.timing(this.image1Scale, {
              toValue: 1
            }),
            Animated.timing(this.image2Opacity, {
              toValue: 1
            })
          ])
        ];
      } else if (slideIndex === 2) {
        this.imagesAnim = [
          Animated.timing(this.handle1Opacity, {
            toValue: 1
          }),
          Animated.parallel([
            Animated.timing(this.image0Height, {
              toValue: 1.1 * imageWidth
            }),
            Animated.timing(this.image2Height, {
              toValue: 0.9 * imageWidth
            }),
            Animated.timing(this.image2TranslateY, {
              toValue: 0.1 * imageWidth
            }),
            Animated.timing(this.handle1TranslateY, {
              toValue: 0.1 * imageWidth
            })
          ]),
          Animated.timing(this.handle1Opacity, {
            toValue: 0
          }),
          Animated.timing(this.handle2Opacity, {
            toValue: 1
          }),
          Animated.parallel([
            Animated.timing(this.image2Height, {
              toValue: 1.4 * imageWidth
            }),
            Animated.timing(this.image1Height, {
              toValue: 0.5 * imageWidth
            }),
            Animated.timing(this.image1TranslateY, {
              toValue: 1.5 * imageWidth
            }),
            Animated.timing(this.handle2TranslateY, {
              toValue: 0.5 * imageWidth
            })
          ]),
          Animated.parallel([
            Animated.timing(this.image2Height, {
              toValue: 0.8 * imageWidth
            }),
            Animated.timing(this.image1Height, {
              toValue: 1.1 * imageWidth
            }),
            Animated.timing(this.image1TranslateY, {
              toValue: 0.9 * imageWidth
            }),
            Animated.timing(this.handle2TranslateY, {
              toValue: -0.1 * imageWidth
            })
          ]),
          Animated.timing(this.handle2Opacity, {
            toValue: 0
          })
        ];
      } else if (slideIndex === 3) {
        this.imagesAnim = [
          Animated.timing(this.image0RotateY, {
            toValue: 180,
            duration: 0
          }),
          Animated.timing(this.image1RotateY, {
            toValue: 180,
            duration: 0
          }),
          Animated.timing(this.image2RotateX, {
            toValue: 180,
            duration: 0
          }),
          Animated.timing(this.image2RotateX, {
            toValue: 0,
            duration: 0
          }),
          Animated.timing(this.image0RotateY, {
            toValue: 0,
            duration: 0
          })
        ];
      } else if (slideIndex === 4) {
        this.imagesAnim = [
          Animated.spring(this.collageScale, {
            toValue: deviceHeight / 4 / (totalImagesWidth + 10),
            duration: 250
          }),
          Animated.spring(this.collageScale, {
            toValue: deviceHeight / 3 / (totalImagesWidth + 10),
            duration: 250
          }),
          Animated.timing(this.collageOpacity, {
            toValue: 0,
            duration: 500
          })
        ];
      }

      if (slideIndex === 3) {
        this.imagesAnim.length &&
          Animated.stagger(500, this.imagesAnim).start(() => {
            console.log("Animation was finished");
            this.setState({
              isAnimating: false
            });
          });
      } else {
        this.imagesAnim.length &&
          Animated.sequence(this.imagesAnim).start(() => {
            console.log("Animation was finished");
            this.setState({
              isAnimating: false
            });
          });
      }
    }
  }

  renderLastSlide(index) {
    if (index === this.props.data.length - 1) {
      return (
        <ImageBackground
          resizeMode="cover"
          source={require("../assets/images/lastslide.jpeg")}
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image
            source={require("../assets/images/icon.png")}
            style={{ width: deviceWidth / 3, height: deviceWidth / 3 }}
          />
          <Button
            text="GET STARTED"
            onPress={this.props.onComplete}
            containerStyle={{
              position: "absolute",
              bottom: "25%",
              left: "17%",
              height: 48,
              backgroundColor: Colors.darkGrey,
              width: "66%"
            }}
            color={Colors.white}
            size={18}
          />
        </ImageBackground>
      );
    }
  }

  renderSlides() {
    return this.props.data.map((slide, index) => {
      return (
        <View style={styles.slide} key={slide.text}>
          <Text style={styles.slideText}>{slide.text}</Text>
          {this.renderLastSlide(index)}
        </View>
      );
    });
  }

  renderImages() {
    const { slideIndex, isAnimating } = this.state;
    this.imagesAnim = [];
    if (slideIndex === 0) {
      this.imageWidth = this.animVal.interpolate({
        inputRange: [0, deviceWidth, deviceWidth + 1],
        outputRange: [imageWidth, totalImagesWidth, totalImagesWidth]
      });
    }

    return images.map((img, index) => {
      const spaceLeft = index === 0 ? 0 : imageSpace;
      const left = initialLeft + (imageWidth + spaceLeft) * index;
      const translationX = initialLeft - left;

      this[`image${index}TranslateX`] = this.animVal.interpolate({
        inputRange: [0, deviceWidth, deviceWidth + 1],
        outputRange: [0, translationX, translationX]
      });

      if (slideIndex === 0) {
        if (isAnimating) {
          this.imagesAnim.push(
            Animated.parallel([
              Animated.timing(this[`image${index}Opacity`], {
                toValue: 0.6
              }),
              Animated.timing(this[`check${index}Opacity`], {
                useNativeDriver: true,
                toValue: 1
              })
            ])
          );
        } else {
          const translation1Y =
            index === 0 ? -imageWidth : index === 1 ? 0 : imageWidth;
          const translation2Y =
            index === 0 ? -imageWidth : index === 1 ? imageWidth : 0;
          this[`image${index}TranslateY`] = this.animVal.interpolate({
            inputRange: [0, deviceWidth, deviceWidth + 1],
            outputRange: [0, translation1Y, translation2Y]
          });
          this[`image${index}Opacity`] = this.animVal.interpolate({
            inputRange: [0, deviceWidth],
            outputRange: [0.6, 1]
          });
          this[`check${index}Opacity`] = this.animVal.interpolate({
            inputRange: [0, deviceWidth],
            outputRange: [1, 0]
          });
        }
      } else if (slideIndex === 1) {
        if (isAnimating) {
          this[`image${index}Height`] = new Animated.Value(imageWidth);
          this[`image${index}Opacity`] = new Animated.Value(1);
          this[`check${index}Opacity`] = new Animated.Value(0);
          if (index === 1) {
            this.image1TranslateY = new Animated.Value(0);
          } else if (index === 2) {
            this.image2TranslateY = new Animated.Value(imageWidth);
          }
        } else {
          if (index === 1) {
            this.image1TranslateY = this.animVal.interpolate({
              inputRange: [0, deviceWidth, deviceWidth + 1],
              outputRange: [0, imageWidth, imageWidth]
            });
          } else if (index === 2) {
            this.image2TranslateY = this.animVal.interpolate({
              inputRange: [0, deviceWidth, deviceWidth + 1],
              outputRange: [0, 0, 0]
            });
          }
        }
      } else if (slideIndex === 2) {
        if (isAnimating) {
          this[`image${index}Height`] = new Animated.Value(imageWidth);

          if (index === 1) {
            this.image1RotateY.setValue(0);
            this.image1TranslateY = new Animated.Value(imageWidth);
            this[`handle${index}Opacity`] = new Animated.Value(0);
            this[`handle${index}TranslateY`] = new Animated.Value(0);
          } else if (index === 2) {
            this.image2TranslateY = new Animated.Value(0);
            this[`handle${index}Opacity`] = new Animated.Value(0);
            this[`handle${index}TranslateY`] = new Animated.Value(0);
          }
        } else {
          const lastImageHeight =
            index === 2 ? 0.8 * imageWidth : 1.1 * imageWidth;
          this[`image${index}Height`] = this.animVal.interpolate({
            inputRange: [0, deviceWidth, deviceWidth * 2, deviceWidth * 2 + 1],
            outputRange: [
              imageWidth,
              imageWidth,
              lastImageHeight,
              lastImageHeight
            ]
          });
          if (index === 1) {
            this.image1TranslateY = this.animVal.interpolate({
              inputRange: [
                0,
                deviceWidth,
                deviceWidth * 2,
                deviceWidth * 2 + 1
              ],
              outputRange: [0, 0, 0.9 * imageWidth, 0.9 * imageWidth]
            });
          } else if (index === 2) {
            this.image2TranslateY = this.animVal.interpolate({
              inputRange: [
                0,
                deviceWidth,
                deviceWidth * 2,
                deviceWidth * 2 + 1
              ],
              outputRange: [0, imageWidth, 0.1 * imageWidth, 0.1 * imageWidth]
            });
          }
        }
      } else if (slideIndex === 3) {
        if (isAnimating) {
          const lastImageHeight =
            index === 2 ? 0.8 * imageWidth : 1.1 * imageWidth;
          this[`image${index}Height`] = this.animVal.interpolate({
            inputRange: [deviceWidth * 2, deviceWidth * 3, deviceWidth * 3 + 1],
            outputRange: [imageWidth, lastImageHeight, lastImageHeight]
          });
          if (index === 1) {
            this.image1TranslateY = this.animVal.interpolate({
              inputRange: [
                deviceWidth * 2,
                deviceWidth * 3,
                deviceWidth * 3 + 1
              ],
              outputRange: [imageWidth, 0.9 * imageWidth, 0.9 * imageWidth]
            });
          } else {
            this.image2TranslateY = this.animVal.interpolate({
              inputRange: [
                deviceWidth * 2,
                deviceWidth * 3,
                deviceWidth * 3 + 1
              ],
              outputRange: [0, 0.1 * imageWidth, 0.1 * imageWidth]
            });
          }
        }
      }

      return (
        <React.Fragment key={index}>
          {slideIndex === 2 && index !== 0 && (
            <Animated.View
              style={[
                styles.handleStyle,
                {
                  top: index === 1 ? top - 3 : top - 3 + imageWidth,
                  left: initialLeft + (totalImagesWidth / 2 - handleWidth / 2),
                  opacity: this[`handle${index}Opacity`],
                  transform: [
                    {
                      translateY: this[`handle${index}TranslateY`]
                    }
                  ]
                }
              ]}
            />
          )}
          <Animated.View
            style={{
              position: "absolute",
              backgroundColor: Colors.backgroundColor,
              left,
              top,
              zIndex: index === 2 ? 0 : 1,
              width: this.imageWidth,
              height: this[`image${index}Height`],
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              transform: [
                { translateX: this[`image${index}TranslateX`] },
                { translateY: this[`image${index}TranslateY`] },
                { scale: index === 1 ? this[`image${index}Scale`] : 1 }
              ]
            }}
          >
            {slideIndex === 1 && index === 1 && (
              <Animated.View
                style={[
                  styles.touchCircle,
                  { opacity: this.touchCircleOpacity }
                ]}
              />
            )}

            <Animated.Image
              style={{
                flex: 1,
                width: this.imageWidth,
                height: this[`image${index}Height`],
                opacity: this[`image${index}Opacity`],
                transform: [
                  {
                    rotateX:
                      index === 2 ? this[`image${index}RotateXStr`] : "0deg"
                  },
                  {
                    rotateY:
                      index === 2 ? "0deg" : this[`image${index}RotateYStr`]
                  }
                ]
              }}
              source={img}
            />
            <Animated.Image
              source={require("../assets/images/checkicon.png")}
              style={[
                styles.checkIcon,
                { opacity: this[`check${index}Opacity`] }
              ]}
            />
          </Animated.View>
        </React.Fragment>
      );
    });
  }

  renderIndicator() {
    if (this.state.slideIndex === 4) {
      return null;
    }
    return (
      <View style={styles.indicatorContainer}>
        {!this.state.isAnimating && (
          <Text style={styles.indicatorText}>Swipe to continue</Text>
        )}
        <View style={[styles.indicator, { width: indicatorWidth }]}>
          {this.props.data.map((_s, index) => {
            const marginLeft = index === 0 ? 0 : indicatorSpace;
            const circleOpacity = this.animVal.interpolate({
              inputRange: [
                deviceWidth * (index - 1),
                deviceWidth * index,
                deviceWidth * (index + 1)
              ],
              outputRange: [0, 1, 0]
            });

            return (
              <View
                key={index}
                style={[styles.indicatorCircles, { marginLeft }]}
              >
                <Animated.View
                  style={[styles.animatedCircle, { opacity: circleOpacity }]}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  render() {
    if (this.state.slideIndex === 4) {
      if (this.state.isAnimating) {
        this.collageScale = new Animated.Value(
          deviceHeight / 3 / (totalImagesWidth + 10)
        );
      }
    }
    console.log("slides rerender");
    console.log("slideIndex: ", this.state.slideIndex);
    return (
      <React.Fragment>
        <ScrollView
          scrollEnabled={
            this.state.slideIndex === 4 ? false : !this.state.isAnimating
          }
          horizontal
          pagingEnabled
          style={{ flex: 1 }}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { x: this.animVal } } }
          ])}
        >
          {this.renderSlides()}
        </ScrollView>
        <Animated.View
          style={[
            styles.collageContainer,
            {
              opacity: this.collageOpacity,
              transform: [
                { scale: this.collageScale },
                { translateY: this.collageTranslateY }
              ]
            }
          ]}
          pointerEvents="none"
        >
          {this.renderImages()}
        </Animated.View>
        {this.renderIndicator()}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  slide: {
    width: deviceWidth,
    alignItems: "center"
  },
  slideText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: "center",
    width: 250,
    top: "15%"
  },
  collageContainer: {
    position: "absolute",
    top: containerTop,
    left: containerLeft,
    width: containerWidth,
    height: containerHeight
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 0,
    width: 200,
    height: 50,
    margin: 32,
    alignItems: "center"
  },
  indicatorText: {
    color: Colors.grey,
    fontSize: 16
  },
  indicator: {
    position: "absolute",
    left: (200 - indicatorWidth) / 2,
    bottom: 0,
    flexDirection: "row"
  },
  indicatorCircles: {
    width: indicatorCircleWidth,
    height: indicatorCircleWidth,
    borderRadius: indicatorCircleWidth / 2,
    backgroundColor: Colors.grey
  },
  animatedCircle: {
    flex: 1,
    borderRadius: indicatorCircleWidth / 2,
    backgroundColor: Colors.selectedColor
  },
  checkIcon: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 24
  },
  touchCircle: {
    position: "absolute",
    top: imageWidth / 2 - touchCircleWidth / 2,
    left: totalImagesWidth / 2 - touchCircleWidth / 2,
    width: touchCircleWidth,
    height: touchCircleWidth,
    borderRadius: touchCircleWidth / 2,
    backgroundColor: Colors.white,
    zIndex: 1
  },
  handleStyle: {
    position: "absolute",
    width: handleWidth,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.selectedColor,
    zIndex: 1
  }
});
