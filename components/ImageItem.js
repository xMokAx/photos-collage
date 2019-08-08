import React, { PureComponent } from "react";
import { TouchableHighlight, View, Image, StyleSheet } from "react-native";

import Colors from "../constants/Colors";
import Layout from "../constants/Layout";

const { imageWidth } = Layout;

export default class ImageItem extends PureComponent {
  static defaultProps = {
    disabled: false
  };

  onPress = () => {
    const { onPhotoPress, photo } = this.props;
    console.log(photo);
    onPhotoPress(photo);
  };

  onImageError = () => {
    this.props.removeDeletedPhoto(this.props.uri);
  };

  render() {
    const { selected, uri, disabled } = this.props;
    return (
      <TouchableHighlight
        activeOpacity={0.6}
        style={styles.imageContainer}
        onPress={this.onPress}
        disabled={disabled}
      >
        <View
          style={
            (selected || disabled) && {
              borderWidth: 2,
              borderColor: Colors.selectedColor
            }
          }
        >
          <Image
            style={[
              styles.imageItem,
              (selected || disabled) && { opacity: 0.6 }
            ]}
            source={{ uri }}
            onError={this.onImageError}
          />
          {selected && (
            <Image
              source={require("../assets/images/checkicon.png")}
              style={styles.iconStyle}
            />
          )}
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  imageContainer: {
    width: imageWidth,
    padding: 1,
    backgroundColor: Colors.backgroundColor,
    borderColor: Colors.selectedColor
  },
  imageItem: {
    width: "100%",
    aspectRatio: 1
  },
  iconStyle: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12
  }
});
