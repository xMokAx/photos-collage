import React, { PureComponent } from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";

import Button from "../components/Button";

export default class CameraButton extends PureComponent {
  render() {
    return (
      <Button
        containerStyle={styles.containerStyle}
        color={Colors.selectedColor}
        onPress={this.props.onPress}
        text="CAMERA"
        size={18}
        icon={
          <Ionicons
            style={styles.iconStyle}
            name="ios-camera"
            size={32}
            color={Colors.selectedColor}
          />
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    height: 48
  },
  iconStyle: {
    marginRight: 8
  }
});
