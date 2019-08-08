import React, { PureComponent, Fragment } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import ImageItem from "./ImageItem";

import CameraButton from "./CameraButton";
import Layout from "../constants/Layout";

const { imageHeight, headerHeight } = Layout;

export default class ImageList extends PureComponent {
  static defaultProps = {
    hasOffset: true
  };

  keyExtractor = (_item, index) => index;

  onEndReached = () => {
    const { hasNextPage, getPhotos } = this.props;
    if (!hasNextPage) {
      return;
    }
    getPhotos();
  };
  scrollToIndex = uri => {
    const index = Math.floor(
      this.props.photos.findIndex(p => p.uri === uri) / 4
    );
    console.log("from scrollToIndex: ", index);
    this.flatListRef.scrollToIndex({ index, viewOffset: 0 });
  };

  getItemLayout = (_data, index) => ({
    length: imageHeight,
    offset: imageHeight * index,
    index
  });

  onCameraButtonPress = () => {
    console.log("GO TO CAMERA");
    this.props.navigation.navigate("Camera");
  };

  captureRef = ref => {
    this.flatListRef = ref;
  };

  render() {
    console.log("from ImageList render");
    const {
      photos,
      onPhotoPress,
      selectedPhotos,
      selectedUri,
      hasOffset,
      removeDeletedPhoto
    } = this.props;
    const { onEndReached, keyExtractor, getItemLayout } = this;
    return (
      <FlatList
        onEndReached={onEndReached}
        ref={this.captureRef}
        initialScrollIndex={
          hasOffset
            ? 0
            : Math.floor(
                this.props.photos.findIndex(p => p.uri === selectedUri) / 4
              )
        }
        onEndReachedThreshold={0.5}
        getItemLayout={getItemLayout}
        ListHeaderComponent={
          hasOffset ? (
            <Fragment>
              <View style={styles.listOffset} />
              <CameraButton onPress={this.onCameraButtonPress} title="Camera" />
            </Fragment>
          ) : null
        }
        keyExtractor={keyExtractor}
        numColumns={4}
        data={photos}
        extraData={selectedUri}
        renderItem={({ item }) => {
          return hasOffset ? (
            <ImageItem
              uri={item.uri}
              onPhotoPress={onPhotoPress}
              photo={item}
              selected={!!selectedPhotos.find(p => p.uri === item.uri)}
              removeDeletedPhoto={removeDeletedPhoto}
            />
          ) : (
            <ImageItem
              uri={item.uri}
              onPhotoPress={onPhotoPress}
              photo={item}
              disabled={selectedUri === item.uri}
            />
          );
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  listOffset: {
    height: headerHeight
  }
});
