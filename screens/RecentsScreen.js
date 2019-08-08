import React, { PureComponent } from "react";
import { View, StyleSheet } from "react-native";

import ImageList from "../components/ImageList";
import Colors from "../constants/Colors";

export default class RecentsScreen extends PureComponent {
  removeDeletedPhoto = uri => {
    this.props.screenProps.removeDeletedPhoto(uri, "recents");
  };

  render() {
    const {
      getPhotos,
      recentsPhotos,
      onPhotoPress,
      selectedPhotos
    } = this.props.screenProps;
    return (
      <View style={styles.container}>
        <ImageList
          navigation={this.props.navigation}
          photos={recentsPhotos}
          getPhotos={getPhotos}
          onPhotoPress={onPhotoPress}
          selectedPhotos={selectedPhotos}
          removeDeletedPhoto={this.removeDeletedPhoto}
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
