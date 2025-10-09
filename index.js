/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
LogBox.ignoreAllLogs();
LogBox.ignoreLogs([
  "ViewPropTypes will be removed",
  "ColorPropType will be removed",
  "Require cycle",
  "Warning: Encountered two children with the same key",
  "Seems like you're using an old API with gesture components",
  "ViewPropTypes will be removed from React Native",
  "`flexWrap: `wrap`` is not supported",
  "Warning: Cannot update a component",
  "Warning: Can't perform a React state update on an unmounted component.",
  "Possible Unhandled Promise Rejection",
  "ProgressBarAndroid has been extracted",
])
