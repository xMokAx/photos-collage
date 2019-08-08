import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";

import Colors from "../constants/Colors";

import EditableCollage from "../components/EditableCollage";

export default class EditScreen extends PureComponent {
  setScreenParams = title => {
    this.props.navigation.setParams({ title });
  };
  render() {
    console.log("EditScreen rerender");
    const { screenProps, navigation } = this.props;
    const {
      selectedPhotos,
      selectedCollage,
      photos,
      hasNextPage,
      getPhotos,
      replaceSelectedPhoto
    } = screenProps;
    return (
      <View style={styles.mainContainer}>
        <EditableCollage
          replaceSelectedPhoto={replaceSelectedPhoto}
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
  mainContainer: {
    flex: 1,
    top: 0,
    left: 0,
    backgroundColor: Colors.backgroundColor,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonStyle: {
    paddingHorizontal: 16
  }
});
