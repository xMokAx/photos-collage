import React, { PureComponent } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Animated,
  Platform
} from "react-native";
import { Header } from "react-navigation-stack";

import Colors from "../constants/Colors";
import Layout from "../constants/Layout";
import { collageLayouts } from "../constants/CollageLayouts";

import Collage from "./Collage";

export default class GalleyHeader extends PureComponent {
  logoScale = new Animated.Value(1);

  componentDidUpdate(prevProps) {
    if (Platform.OS === "android") {
      if (
        prevProps.screenProps.selectedPhotos.length !==
        this.props.screenProps.selectedPhotos.length
      ) {
        this.scrollRef && this.scrollRef.scrollTo({ x: 0 });
      }
    }
  }

  scaleLogo = toValue => {
    Animated.timing(this.logoScale, {
      useNativeDriver: true,
      toValue
    }).start();
  };

  onLogoPressIn = () => {
    this.scaleLogo(0.8);
  };

  onLogoPressOut = () => {
    this.scaleLogo(1);
  };

  onLogoLongPress = () => {
    this.props.navigation.navigate("FakeSplash", { forceShow: true });
  };

  captureScrollRef = ref => (this.scrollRef = ref);

  render() {
    const { selectedPhotos, onCollageSelect } = this.props.screenProps;
    const hasCollages = !!selectedPhotos.length;
    console.log("from GalleryHeader: ", this.props.navigation.state.routeName);
    return (
      <View style={styles.header}>
        {hasCollages ? (
          <View style={{ flex: 1, width: "100%" }}>
            <Header {...this.props} />
            <ScrollView
              ref={this.captureScrollRef}
              centerContent={true}
              horizontal
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainerStyle}
            >
              {collageLayouts[selectedPhotos.length].map((layout, i) => (
                <TouchableHighlight
                  onPress={() => {
                    onCollageSelect(layout);
                    this.props.navigation.navigate("Edit");
                  }}
                  key={i}
                  style={styles.collage}
                >
                  <Collage layout={layout} selectedPhotos={selectedPhotos} />
                </TouchableHighlight>
              ))}
            </ScrollView>
          </View>
        ) : (
          <TouchableWithoutFeedback
            onPressIn={this.onLogoPressIn}
            onPressOut={this.onLogoPressOut}
            onLongPress={this.onLogoLongPress}
          >
            <Animated.Image
              source={require("../assets/images/icon.png")}
              style={[
                styles.logo,
                {
                  transform: [{ scale: this.logoScale }]
                }
              ]}
            />
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: Layout.headerHeight,
    borderBottomWidth: 1,
    borderColor: Colors.darkGrey,
    zIndex: 1,
    backgroundColor: Colors.backgroundColor,
    opacity: 0.95,
    alignItems: "center",
    justifyContent: "center"
  },
  scrollView: {
    flex: 1
  },
  contentContainerStyle: {
    paddingVertical: 8
  },
  collage: {
    width: Layout.headerHeight - Layout.titleHeight - 16,
    height: Layout.headerHeight - Layout.titleHeight - 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.darkGrey
  },
  logo: {
    width: Layout.logoWidth,
    height: Layout.logoWidth
  }
});
