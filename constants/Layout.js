import { Dimensions, Platform } from "react-native";
import { Header } from "react-navigation-stack";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const isSmallDevice = deviceWidth < 375;
const imageWidth = deviceWidth / 4;
const imageHeight = imageWidth;
const titleHeight = Header.HEIGHT;
const headerHeight = deviceHeight / 3;
const logoWidth = deviceWidth / 3;

export default {
  titleHeight,
  deviceWidth,
  deviceHeight,
  logoWidth,
  headerHeight,
  imageWidth,
  imageHeight,
  isSmallDevice
};
