import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";

import Colors from "../constants/Colors";
import ImageList from "../components/ImageList";

export default class GalleryScreen extends PureComponent {
  render() {
    const {
      photos,
      hasNextPage,
      getPhotos,
      onPhotoPress,
      selectedPhotos
    } = this.props.screenProps;
    return (
      <View style={styles.container}>
        <ImageList
          navigation={this.props.navigation}
          photos={photos}
          hasNextPage={hasNextPage}
          getPhotos={getPhotos}
          onPhotoPress={onPhotoPress}
          selectedPhotos={selectedPhotos}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor
  }
});
