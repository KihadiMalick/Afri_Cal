import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 320;

export const wp = (percent) => (SCREEN_WIDTH * percent) / 100;
export const hp = (percent) => (SCREEN_HEIGHT * percent) / 100;
export const fp = (size) => (size * SCREEN_WIDTH) / BASE_WIDTH;

export const SCREEN = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
