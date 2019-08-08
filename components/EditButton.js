import React, { PureComponent } from "react";
import { Text, StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import Colors from "../constants/Colors";

export default class EditButton extends PureComponent {
  static defaultProps = {
    disabled: false
  };
  render() {
    const { icon, text, onPress, disabled } = this.props;
    const backgroundColor = disabled ? Colors.darkerGrey : Colors.darkGrey;
    const textColor = disabled ? Colors.lightGrey : Colors.white;
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onPress} disabled={disabled}>
          <View style={styles.button}>
            <View
              style={[
                styles.iconContainer,
                { borderRadius: 8, backgroundColor }
              ]}
            >
              {icon}
            </View>
            <Text style={[styles.text, { color: textColor }]}>{text}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { margin: 8, height: 100 },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  iconContainer: {
    height: 80,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  text: {
    fontSize: 12,
    fontWeight: "500"
  }
});
