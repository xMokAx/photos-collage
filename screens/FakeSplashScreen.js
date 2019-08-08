import React, { PureComponent } from "react";
import { View, StyleSheet, Animated } from "react-native";

import Layout from "../constants/Layout";
import Colors from "../constants/Colors";

const { headerHeight, logoWidth, deviceWidth, deviceHeight } = Layout;

export default class FakeSplashScreen extends PureComponent {
  constructor(props) {
    super(props);
    const forceShow = this.props.navigation.getParam("forceShow", false);
    if (!forceShow) {
      if (props.screenProps.firstTimeUser) {
        console.log("should show tutorial");
        props.navigation.navigate("Welcome");
      } else {
        console.log("should go to gallery");
        props.navigation.navigate("Gallery");
      }
    }
  }
  logoY = new Animated.Value(headerHeight / 2 - logoWidth / 2);
  logoX = deviceWidth / 2 - logoWidth / 2;

  componentDidMount() {
    const forceShow = this.props.navigation.getParam("forceShow", false);
    if (forceShow) {
      Animated.timing(this.logoY, {
        toValue: deviceHeight / 2 - logoWidth / 2,
        duration: 750
      }).start(() => {
        this.timeout = setTimeout(() => {
          this.props.navigation.navigate("Welcome");
        }, 500);
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    return (
      <View style={styles.screen}>
        <Animated.Image
          source={require("../assets/images/icon.png")}
          style={[
            styles.logo,
            {
              position: "absolute",
              left: this.logoX,
              top: this.logoY
            }
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.white
  },
  logo: {
    width: Layout.logoWidth,
    height: Layout.logoWidth
  }
});
