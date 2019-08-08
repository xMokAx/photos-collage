import React from "react";
import {
  createStackNavigator,
  createMaterialTopTabNavigator
} from "react-navigation";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../constants/Colors";
import GalleryScreen from "../screens/GalleryScreen";
import FacesScreen from "../screens/FacesScreen";
import RecentsScreen from "../screens/RecentsScreen";
import GalleryHeader from "../components/GalleryHeader";
import EditScreen from "../screens/EditScreen";
import CameraScreen from "../screens/CameraScreen";
import Button from "../components/Button";
import Layout from "../constants/Layout";

const Home = createMaterialTopTabNavigator(
  {
    Gallery: GalleryScreen,
    Faces: FacesScreen,
    Recents: RecentsScreen
  },
  {
    swipeEnabled: true,
    tabBarPosition: "bottom",
    tabBarOptions: {
      style: {
        backgroundColor: Colors.backgroundColor,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 0.95
      },
      activeTintColor: Colors.selectedColor,
      renderIndicator: () => null,
      labelStyle: {
        fontWeight: "500"
      }
    }
  }
);

const MainNavigator = createStackNavigator(
  {
    Gallery: {
      screen: Home,
      navigationOptions: ({ screenProps }) => {
        return {
          title: "CHOOSE LAYOUT",
          header: props => <GalleryHeader {...props} />,
          headerLeft: (
            <Button
              onPress={screenProps.removeSelectedPhotos}
              icon={<Ionicons name="ios-close" size={34} color={"#fff"} />}
            />
          )
        };
      }
    },
    Camera: {
      screen: CameraScreen,
      navigationOptions: {
        header: () => null
      }
    },
    Edit: {
      screen: EditScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: navigation.getParam("title", "EDIT"),
          headerRight: navigation.getParam("headerRight", null),
          headerLeft: navigation.getParam(
            "headerLeft",
            <Button
              onPress={navigation.goBack}
              icon={<Ionicons name="ios-arrow-back" size={24} color={"#fff"} />}
            />
          )
        };
      }
    }
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.backgroundColor,
        borderBottomWidth: 0,
        height: 56
      },
      headerTitleStyle: {
        fontWeight: "700",
        color: "#fff",
        fontSize: 18
      },
      headerLeftContainerStyle: {
        height: Layout.titleHeight - 16,
        width: Layout.titleHeight,
        marginVertical: 8,
        marginRight: 8,
        borderRightWidth: 1,
        borderColor: "#424242"
      },
      headerTintColor: "#fff"
    }
  }
);

export default MainNavigator;
