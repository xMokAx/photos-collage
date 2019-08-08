import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Header } from "react-navigation";

import Colors from "../constants/Colors";
import EditableCollage from "./EditableCollage";

export default class EditHeader extends PureComponent {
  render() {
    const { screenProps, navigation } = this.props;
    const {
      selectedPhotos,
      selectedCollage,
      photos,
      hasNextPage,
      getPhotos
    } = screenProps;
    return (
      <View style={styles.container}>
        <Header {...this.props} />
        <EditableCollage
          navigation={navigation}
          photos={photos}
          getPhotos={getPhotos}
          hasNextPage={hasNextPage}
          layout={selectedCollage}
          selectedPhotos={selectedPhotos}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.backgroundColor,
    opacity: 0.95
  }
});
