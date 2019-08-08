import React, { PureComponent } from "react";
import { View, StyleSheet, AsyncStorage } from "react-native";

import Slides from "../components/Slides";
import Colors from "../constants/Colors";

const slidesData = [
  { text: "Create fun, one-of-a-kind collages using your own photos." },
  { text: "Long press then drag photos to swap them." },
  { text: "Use the handles to resize" },
  { text: "Mirror and flip to mix it up." },
  { text: "Ready to create your own?" }
];

export default class WelcomeScreen extends PureComponent {
  onSlidesComplete = async () => {
    try {
      await AsyncStorage.setItem("firstTimeUser", JSON.stringify(false));
      this.props.navigation.navigate("Gallery");
    } catch (error) {
      this.props.navigation.navigate("Gallery");
    }
  };

  render() {
    return (
      <View style={styles.screen}>
        <Slides data={slidesData} onComplete={this.onSlidesComplete} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    alignItems: "center"
  }
});
