## react-native-smooth-slider

[![npm version](http://img.shields.io/npm/v/react-native-smooth-slider.svg?style=flat-square)](https://npmjs.org/package/react-native-smooth-slider "View this project on npm")
[![npm downloads](http://img.shields.io/npm/dm/react-native-smooth-slider.svg?style=flat-square)](https://npmjs.org/package/react-native-smooth-slider "View this project on npm")
[![npm licence](http://img.shields.io/npm/l/react-native-smooth-slider.svg?style=flat-square)](https://npmjs.org/package/react-native-smooth-slider "View this project on npm")
[![Platform](https://img.shields.io/badge/platform-ios%20%7C%20android-989898.svg?style=flat-square)](https://npmjs.org/package/react-native-smooth-slider "View this project on npm")

A react-native-gesture-handler smoothed `<Slider />` , also support trackImage and vertical.

<img src="https://raw.githubusercontent.com/flyskywhy/react-native-smooth-slider/master/Screenshots/basic@2x.png" width="375">
<img src="https://raw.githubusercontent.com/flyskywhy/react-native-smooth-slider/master/Screenshots/basic_android_xxhdpi.png" width="360">

It is a drop-in replacement for [Slider](http://facebook.github.io/react-native/docs/slider.html).

## Install

```shell
npm i --save react-native-smooth-slider
```

And need install react-native-gesture-handler (1.1.0+ e.g. 1.2.2 for RN 0.57.2+ , or latest for RN 0.60.0+) by yourself.

## Usage

```jsx
import React from "react";
import Slider from "react-native-smooth-slider";
import { AppRegistry, StyleSheet, View, Text } from "react-native";

class SliderExample extends React.Component {
  state = {
    value: 0.2
  };

  render() {
    return (
      <View style={styles.container}>
        <Slider
          value={this.state.value}
          onValueChange={value => this.setState({ value })}
        />
        <Text>
          Value: {this.state.value}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    alignItems: "stretch",
    justifyContent: "center"
  }
});

AppRegistry.registerComponent("SliderExample", () => SliderExample);
```

## Props

Prop                  | Type     | Optional | Default                   | Description
--------------------- | -------- | -------- | ------------------------- | -----------
value                 | number   | Yes      | 0                         | Initial value of the slider
disabled              | bool     | Yes      | false                     | If true the user won't be able to move the slider
minimumValue          | number   | Yes      | 0                         | Initial minimum value of the slider
maximumValue          | number   | Yes      | 1                         | Initial maximum value of the slider
step                  | number   | Yes      | 0                         | Step value of the slider. The value should be between 0 and maximumValue - minimumValue)
minimumTrackTintColor | string   | Yes      | '#3f3f3f'                 | The color used for the track to the left of the button
maximumTrackTintColor | string   | Yes      | '#b3b3b3'                 | The color used for the track to the right of the button
thumbTintColor        | string   | Yes      | '#343434'                 | The color used for the thumb
thumbTouchSize        | object   | Yes      | `{width: 40, height: 40}` | The size of the touch area that allows moving the thumb. The touch area has the same center as the visible thumb. This allows to have a visually small thumb while still allowing the user to move it easily.
moveVelocityThreshold | number   | Yes      | 2000                      | Prevent onValueChange if velocityX or velocityY (vertical is true) of nativeEvent is over the moveVelocityThreshold
onValueChange         | function | Yes      |                           | Callback continuously called while the user is dragging the slider and the dragging movement speed is below the moveVelocityThreshold
onSlidingStart        | function | Yes      |                           | Callback called when the user starts changing the value (e.g. when the slider is pressed)
onSlidingComplete     | function | Yes      |                           | Callback called when the user finishes changing the value (e.g. when the slider is released)
style                 | [style](http://facebook.github.io/react-native/docs/view.html#style)    | Yes      |                           | The style applied to the slider container
trackStyle            | [style](http://facebook.github.io/react-native/docs/view.html#style)    | Yes      |                           | The style applied to the track
trackImage            | [source](http://facebook.github.io/react-native/docs/image.html#source)    | Yes      |                           | Sets an image for the track.
thumbStyle            | [style](http://facebook.github.io/react-native/docs/view.html#style)    | Yes      |                           | The style applied to the thumb
thumbImage            | [source](http://facebook.github.io/react-native/docs/image.html#source)    | Yes      |                           | Sets an image for the thumb.
vertical              | bool     | Yes      | false                     | Set this to true to be a vertical slider.
debugTouchArea        | bool     | Yes      | false                     | Set this to true to visually see the thumb touch rect in green.
animateTransitions    | bool     | Yes      | false                     | Set to true if you want to use the default 'spring' animation
animationType         | string   | Yes      | 'timing'                  | Set to 'spring' or 'timing' to use one of those two types of animations with the default [animation properties](https://facebook.github.io/react-native/docs/animations.html).
animationConfig       | object   | Yes      | undefined                 | Used to configure the animation parameters.  These are the same parameters in the [Animated library](https://facebook.github.io/react-native/docs/animations.html).

## Methods

    setValue(value)

In some use case e.g. "tension rod", it's more convenient to use method instead of prop to restore original positon of the tension rod. Below is a vertical tension rod example screenshot.

<img src="https://raw.githubusercontent.com/flyskywhy/react-native-smooth-slider/master/Screenshots/vertical_tension_rod.png" width="75">


---

**MIT Licensed**
