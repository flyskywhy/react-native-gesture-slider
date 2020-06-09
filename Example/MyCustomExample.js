import React, { useState } from 'react';
import { View, ViewPropTypes, Text } from 'react-native';
import PropTypes from 'prop-types';
import Slider from '../src/Slider';


const MyCustomSlider = (props) => {
    const [sliderReady, setSliderReady] = useState(false);
    const {
    minimumTrackTintColor = 'gold',
    maximumTrackTintColor = '#eff2f6',
    minimumValue,
    maximumValue,
    showThumbValue = true,
    trackStyle = {},
    thumbStyle = {},
    thumbFloatStyle = {},
    thumbValueFormatter,
    onReady,
    ...others
  } = props;

    return (
    <View style={{paddingTop: 50}}>


      <Slider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        thumbValueFormatter={thumbValueFormatter}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        showThumbValue={showThumbValue}
        trackStyle={{
            height: 10,
            borderRadius: 5,
            ...trackStyle,
        }}
        thumbStyle={{
            width: 30,
            height: 30,
            borderRadius: 50,
            backgroundColor: 'white',
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
            shadowOpacity: 0.35,
            elevation: 4,
            ...thumbStyle,
        }}
        thumbFloatStyle={{
            width: 35,
            height: 35,
            borderRadius: 50,
            backgroundColor: 'white',
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
            shadowOpacity: 0.35,
            elevation: 4,
            ...thumbFloatStyle,
        }}
        onReady={() => {
            setSliderReady(true);
            if (onReady) { onReady(); }
        }}
        {...others}
      />


      <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          top: -10,
          opacity: Number(sliderReady),
      }}
      >
        <Text style={{fontSize: 13}}>
          {thumbValueFormatter ? thumbValueFormatter(minimumValue) : minimumValue}
        </Text>
        <Text style={{fontSize: 13}}>
          {thumbValueFormatter ? thumbValueFormatter(maximumValue) : maximumValue}
        </Text>
      </View>
    </View>
    );
};

const MSlider = () => {
    const [state, setState] = useState({
        value: 4,
        min: 0,
        max: 12,
        goal: 6,
        goalThumbStyle: {
            backgroundColor: 'black',
        },
        minimumTrackTintColor: 'gold',
    });



    return(
        <MyCustomSlider
            value={state.value}
            goal={state.goal}
            step={1}
            thumbValueFormatter={(val: number) => `${Math.round(val)}%`}
            minimumValue={state.min}
            maximumValue={state.max}
            showThumbValue
            goalThumbStyle={state.goalThumbStyle}
            minimumTrackTintColor={state.minimumTrackTintColor}
            onValueChange={(value) => {
                if (value >= state.goal) {
                    setState({
                        ...state,
                        goalThumbStyle: {
                            backgroundColor: 'white',
                        },
                        minimumTrackTintColor: 'lightblue',
                        value
                    });
                } else {
                    setState({
                        ...state,
                        goalThumbStyle: {
                            backgroundColor: 'black',
                        },
                        minimumTrackTintColor: 'gold',
                        value
                    });
                }
            }}
        />
    );
};

export default MSlider;
