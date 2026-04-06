import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 320;

export const wp = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
export const hp = (size) => (SCREEN_HEIGHT / 700) * size;
export const fp = (size) => {
  var scaled = (SCREEN_WIDTH / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const SCREEN = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
