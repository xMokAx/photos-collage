import React, { PureComponent } from "react";
import { StyleSheet, View, Image } from "react-native";

export default class Collage extends PureComponent {
  render() {
    const { layout, selectedPhotos } = this.props;
    const { flexDirection, matrix } = layout;
    return (
      <View style={[styles.collage, { flexDirection }]}>
        {matrix.map((imageOrImages, index) => {
          const hasImages = typeof imageOrImages === "object";
          const direction = flexDirection === "column" ? "row" : "column";

          return hasImages ? (
            <View key={index} style={{ flexDirection: direction, flex: 1 }}>
              {imageOrImages.map((img, i) => (
                <Image
                  key={i}
                  style={{ flex: 1 }}
                  source={{
                    uri: selectedPhotos[img].uri
                  }}
                />
              ))}
            </View>
          ) : (
            <Image
              key={index}
              style={{ flex: 1 }}
              source={{
                uri: selectedPhotos[imageOrImages].uri
              }}
            />
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  collage: {
    flex: 1
  }
});
