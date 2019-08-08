import React, { PureComponent } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

export default class Button extends PureComponent {
  static defaultProps = {
    disabled: false
  };
  render() {
    const {
      containerStyle,
      size,
      color,
      onPress,
      text,
      icon,
      disabled
    } = this.props;

    return (
      <View style={[styles.containerStyle, containerStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          disabled={disabled}
        >
          {icon && icon}
          {text && <Text style={{ fontSize: size, color }}>{text}</Text>}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  button: {
    height: "100%",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});
