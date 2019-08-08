import React, { Component, Fragment } from "react";
import {
  Platform,
  Image,
  StatusBar,
  StyleSheet,
  View,
  Text,
  AsyncStorage
} from "react-native";
import {
  AppLoading,
  Asset,
  Font,
  Icon,
  FaceDetector,
  MediaLibrary,
  Permissions
} from "expo";
import { SafeAreaView } from "react-navigation";

SafeAreaView.setStatusBarHeight(0);

import AppNavigator from "./navigation/AppNavigator";
import Button from "./components/Button";
import Layout from "./constants/Layout";
import Colors from "./constants/Colors";

const PAGE_SIZE = 50;

export default class App extends Component {
  state = {
    firstTimeUser: true,
    isLoadingComplete: false,
    photos: [],
    facesPhotos: [],
    recentsPhotos: [],
    canAcessPhotos: false,
    photosError: "",
    hasNextPage: null,
    endCursor: "",
    selectedPhotos: [],
    selectedCollage: null
  };

  constructor(props) {
    super(props);
    AsyncStorage.multiGet(
      ["firstTimeUser", "recentsPhotos", "facesPhotos"],
      (_error, results) => {
        if (results) {
          results.forEach(res => {
            if (res[1] !== null) {
              this.setState({
                [res[0]]: JSON.parse(res[1])
              });
            }
          });
        }
      }
    );
  }

  componentDidMount() {
    this.getCamerRollPermission();
  }

  storeRecents = () =>
    AsyncStorage.setItem(
      "recentsPhotos",
      JSON.stringify(this.state.recentsPhotos)
    );

  storeFaces = () =>
    AsyncStorage.setItem("facesPhotos", JSON.stringify(this.state.facesPhotos));

  getCamerRollPermission = async () => {
    await Permissions.askAsync(Permissions.CAMERA_ROLL).then(r => {
      if (r.status === "granted") {
        this.setState({
          canAcessPhotos: true
        });
        this.getPhotos();
      } else {
        this.setState({
          photosError:
            "Photo Collage doesn't work without access to your photos."
        });
      }
    });
  };

  getPhotos = () => {
    console.log("get photos!");
    let options = {
      first: PAGE_SIZE,
      sortBy: ["creationTime"]
    };
    if (this.state.endCursor) {
      options.after = this.state.endCursor;
    }
    MediaLibrary.getAssetsAsync(options)
      .then(r => {
        this.setState(
          prevState => ({
            photos: [...prevState.photos, ...r.assets],
            hasNextPage: r.hasNextPage,
            endCursor: r.endCursor
          }),
          () => {
            // if (Platform.OS === "android") {
            //   this.detectFaces(r.assets);
            // }
          }
        );
      })
      .catch(err => {
        this.setState({
          photosError:
            "Photo Collage doesn't work without access to your photos"
        });
      });
  };

  detectPhotoFaces = async (photo, newPhoto) => {
    const options = {
      mode: FaceDetector.Constants.Mode.fast,
      detectLandmarks: FaceDetector.Constants.Landmarks.none,
      runClassifications: FaceDetector.Constants.Classifications.none
    };
    const { faces } = await FaceDetector.detectFacesAsync(photo.uri, options);
    if (faces.length) {
      console.log(photo.uri);
      console.log("has faces");
      this.setState(
        prevState => ({
          facesPhotos: newPhoto
            ? [photo, ...prevState.facesPhotos]
            : [...prevState.facesPhotos, photo]
        }),
        this.storeFaces
      );
    }
  };

  detectFaces = async photos => {
    for (const photo of photos) {
      if (!this.state.facesPhotos.some(p => p.uri === photo.uri)) {
        await this.detectPhotoFaces(photo);
      }
    }
  };

  addRecentPhoto = photo => {
    this.setState(
      prevState => ({
        recentsPhotos: [photo, ...prevState.recentsPhotos].reduce(
          (unique, item) => {
            return unique.some(p => p.uri === item.uri)
              ? unique
              : [...unique, item];
          },
          []
        )
      }),
      this.storeRecents
    );
  };

  onPhotoPress = photo => {
    const { selectedPhotos, recentsPhotos } = this.state;
    if (selectedPhotos.some(p => p.uri === photo.uri)) {
      console.log("remove photo");
      this.setState(prevState => ({
        selectedPhotos: prevState.selectedPhotos.filter(
          p => p.uri !== photo.uri
        )
      }));
    } else if (selectedPhotos.length === 9) {
      return;
    } else {
      this.addRecentPhoto(photo);
      console.log("add photo");
      this.setState(prevState => ({
        selectedPhotos: [...prevState.selectedPhotos, photo]
      }));
    }
  };

  removeSelectedPhotos = () => {
    this.setState({
      selectedPhotos: []
    });
  };

  replaceSelectedPhoto = (oldUri, newPhoto) => {
    this.setState({
      selectedPhotos: this.state.selectedPhotos.map(p => {
        if (p.uri === oldUri) {
          return newPhoto;
        } else {
          return p;
        }
      })
    });
  };

  onCollageSelect = selectedCollage => {
    this.setState({
      selectedCollage
    });
  };

  removeDeletedPhoto = (uri, type) => {
    if (type === "faces") {
      this.setState(
        prevState => ({
          facesPhotos: prevState.facesPhotos.filter(p => p.uri !== uri)
        }),
        this.storeFaces
      );
    } else if (type === "recents") {
      this.setState(
        prevState => ({
          recentsPhotos: prevState.recentsPhotos.filter(p => p.uri !== uri)
        }),
        this.storeRecents
      );
    } else {
      this.setState(prevState => ({
        photos: prevState.photos.filter(p => p.uri !== uri)
      }));
    }
  };

  addPhotos = async photos => {
    await this.setState(prevState => ({
      photos: [...photos, ...prevState.photos],
      selectedPhotos: photos,
      recentsPhotos: [...photos, ...prevState.recentsPhotos]
    }));
    // if (Platform.OS === "android") {
    //   await this.detectFaces(photos);
    // }
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      const {
        getPhotos,
        getCamerRollPermission,
        onPhotoPress,
        removeSelectedPhotos,
        onCollageSelect,
        replaceSelectedPhoto,
        removeDeletedPhoto,
        addPhotos
      } = this;
      const {
        photos,
        selectedPhotos,
        facesPhotos,
        recentsPhotos,
        photosError,
        hasNextPage,
        canAcessPhotos,
        selectedCollage,
        firstTimeUser
      } = this.state;
      console.log("rerender app");
      return (
        <View style={styles.container}>
          <StatusBar hidden />
          {!canAcessPhotos ? (
            <Fragment>
              <View style={styles.logoContainer}>
                <Image
                  source={require("./assets/images/icon.png")}
                  style={styles.logo}
                />
              </View>
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{photosError}</Text>
                <Button
                  containerStyle={styles.buttonContainer}
                  size={18}
                  color={Colors.selectedColor}
                  text="TURN ON"
                  onPress={getCamerRollPermission}
                />
              </View>
            </Fragment>
          ) : (
            <AppNavigator
              screenProps={{
                firstTimeUser,
                getPhotos,
                photos,
                hasNextPage,
                facesPhotos,
                recentsPhotos,
                onPhotoPress,
                selectedPhotos,
                removeSelectedPhotos,
                onCollageSelect,
                selectedCollage,
                replaceSelectedPhoto,
                removeDeletedPhoto,
                addPhotos
              }}
            />
          )}
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require("./assets/images/checkicon.png"),
        require("./assets/images/icon.png"),
        require("./assets/images/tutorial-1.jpg"),
        require("./assets/images/tutorial-2.jpg"),
        require("./assets/images/tutorial-3.jpg"),
        require("./assets/images/lastslide.jpeg")
      ]),

      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        ...Icon.MaterialIcons.font
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        // "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf")
      })
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const container = {
  flex: 1,
  backgroundColor: Colors.backgroundColor
};

const styles = StyleSheet.create({
  container,
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: Layout.headerHeight,
    borderBottomWidth: 1,
    borderColor: Colors.darkGrey
  },
  errorContainer: {
    ...container,
    alignItems: "center",
    padding: 32
  },
  buttonContainer: {
    height: 64,
    width: "100%"
  },
  errorText: {
    textAlign: "center",
    color: "gray",
    fontSize: 18,
    marginBottom: 32
  },
  logo: {
    width: Layout.logoWidth,
    height: Layout.logoWidth
  }
});
