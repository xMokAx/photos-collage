import { createAppContainer, createSwitchNavigator } from "react-navigation";

import MainTabNavigator from "./MainTabNavigator";
import WelcomeScreen from "../screens/WelcomeScreen";
import FakeSplashScreen from "../screens/FakeSplashScreen";

export default createAppContainer(
  createSwitchNavigator(
    {
      // You could add another route here for authentication.
      // Read more at https://reactnavigation.org/docs/en/auth-flow.html
      FakeSplash: FakeSplashScreen,
      Welcome: WelcomeScreen,
      Main: MainTabNavigator
    },
    {
      initialRouteName: "FakeSplash"
    }
  )
);
