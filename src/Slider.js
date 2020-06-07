'use strict';

import React, {
    PureComponent,
} from 'react';

import {
    Animated,
    Easing,
    Image,
    StyleSheet,
    View,
    ViewPropTypes,
    Text,
} from 'react-native';

import {
    PanGestureHandler,
    State,
} from 'react-native-gesture-handler';

import PropTypes from 'prop-types';

var TRACK_SIZE = 4;
var THUMB_SIZE = 20;

var DEFAULT_ANIMATION_CONFIGS = {
    spring: {
        friction: 7,
        tension: 100
    },
    timing: {
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        delay: 0
    },
};

export default class Slider extends PureComponent {
    constructor(props) {
        super(props);
        this.isMoving = false;
        this._translateX = new Animated.Value(0);
        this._lastOffsetX = 0;
        this._onGestureEvent = Animated.event(
            [{
                nativeEvent: props.vertical ? {
                    translationY: this._translateX,
                } : {
                    translationX: this._translateX,
                },
            }], {
                useNativeDriver: true,
                listener: this._handlePanResponderMove,
            }
        );
    }

    _onHandlerStateChange = event => {
        if (event.nativeEvent.state === State.BEGAN) {
            // This synthetic event is reused for performance reasons, so save it first
            var x = event.nativeEvent.x;
            this._handlePanResponderGrant(x);
        } else if (event.nativeEvent.oldState === State.ACTIVE) {
            // This synthetic event is reused for performance reasons, so save it first
            var translationX = this.props.vertical ? -event.nativeEvent.translationY : event.nativeEvent.translationX;
            this._handlePanResponderEnd(translationX);
        } else if (event.nativeEvent.state === State.FAILED && event.nativeEvent.oldState === State.BEGAN) {
            // Just tap not move on the slider, will comes here
            this._handlePanResponderEnd(0);
        }
    };

    static propTypes = {
        /**
         * Initial value of the slider. The value should be between minimumValue
         * and maximumValue, which default to 0 and 1 respectively.
         * Default value is 0.
         *
         * *This is not a controlled component*, e.g. if you don't update
         * the value, the component won't be reset to its inital value.
         */
        value: PropTypes.number,

        /**
         * If true the user won't be able to move the slider.
         * Default value is false.
         */
        disabled: PropTypes.bool,

        /**
         * Initial minimum value of the slider. Default value is 0.
         */
        minimumValue: PropTypes.number,

        /**
         * Initial maximum value of the slider. Default value is 1.
         */
        maximumValue: PropTypes.number,

        /**
         * Step value of the slider. The value should be between 0 and
         * (maximumValue - minimumValue). Default value is 0.
         */
        step: PropTypes.number,

        /**
         * The color used for the track to the left of the button. Overrides the
         * default blue gradient image.
         */
        minimumTrackTintColor: PropTypes.string,

        /**
         * The color used for the track to the right of the button. Overrides the
         * default blue gradient image.
         */
        maximumTrackTintColor: PropTypes.string,

        /**
         * The color used for the thumb.
         */
        thumbTintColor: PropTypes.string,

        /**
         * The size of the touch area that allows moving the thumb.
         * The touch area has the same center has the visible thumb.
         * This allows to have a visually small thumb while still allowing the user
         * to move it easily.
         * The default is {width: 40, height: 40}.
         */
        thumbTouchSize: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        }),

        /**
         * Prevent onValueChange if velocityX or velocityY (vertical is true)
         * of nativeEvent is over the moveVelocityThreshold.
         */
        moveVelocityThreshold: PropTypes.number,

        /**
         * Callback continuously called while the user is dragging the slider
         * and the dragging movement speed is below the moveVelocityThreshold.
         */
        onValueChange: PropTypes.func,

        /**
         * Callback when the slider component is rendered
         */
        onReady: PropTypes.func,

        /**
         * This is format the output of the current value
         */
        thumbValueFormatter: PropTypes.func,

        /**
         * Callback called when the user starts changing the value (e.g. when
         * the slider is pressed).
         */
        onSlidingStart: PropTypes.func,

        /**
         * Callback called when the user finishes changing the value (e.g. when
         * the slider is released).
         */
        onSlidingComplete: PropTypes.func,

        /**
         * The style applied to the slider container.
         */
        style: ViewPropTypes.style,

        /**
         * The style applied to the track.
         */
        trackStyle: ViewPropTypes.style,

        /**
         * Sets an image for the track.
         */
        trackImage: Image.propTypes.source,

        /**
         * The style applied to the thumb.
         */
        thumbStyle: ViewPropTypes.style,

        /**
         * Sets an image for the thumb.
         */
        thumbImage: Image.propTypes.source,

        /**
         * Set this to true to be a vertical slider.
         */
        vertical: PropTypes.bool,

        /**
         * Set to true to animate values with default 'timing' animation type
         */
        animateTransitions: PropTypes.bool,

        /**
         * Custom Animation type. 'spring' or 'timing'.
         */
        animationType: PropTypes.oneOf(['spring', 'timing']),

        /**
         * Used to configure the animation parameters.  These are the same parameters in the Animated library.
         */
        animationConfig: PropTypes.object,

        /**
         * The style applied to the goal thumb.
         */
        goalThumbStyle: ViewPropTypes.style,

        /**
         * The style applied to the floating thumb.
         */
        thumbFloatStyle: ViewPropTypes.style,

        /**
         * The indicates whether to show or not show the curent value of the slider on the thumb
         */
        showThumbValue: PropTypes.bool,

        /**
         * This is the vertical offset of the floating thumb
         */
        floatThumbOffset: PropTypes.number,
    };

    static defaultProps = {
        value: 0,
        minimumValue: 0,
        maximumValue: 1,
        step: 0,
        minimumTrackTintColor: '#3f3f3f',
        maximumTrackTintColor: '#b3b3b3',
        thumbTintColor: '#343434',
        thumbTouchSize: {
            width: 40,
            height: 40
        },
        vertical: false,
        moveVelocityThreshold: 2000,
        animationType: 'timing',
        floatThumbOffset: -35,
    };

    state = {
        containerSize: {
            width: 0,
            height: 0
        },
        trackSize: {
            width: 0,
            height: 0
        },
        thumbSize: {
            width: 0,
            height: 0
        },
        goalThumbSize: {
            width: 0,
            height: 0
        },
        floatThumbSize: {
            width: 0,
            height: 0
        },
        allMeasured: false,
        value: new Animated.Value(this.props.value),
        currentValue: this.props.thumbValueFormatter ? this.props.thumbValueFormatter(this.props.value) : this.props.value,
        isMoving: false,
    };

    componentWillReceiveProps(nextProps) {
        var newValue = nextProps.value;

        if (this.props.value !== newValue) {
            this.setValue(newValue);
        }
    }

    setValue = (value: number) => {
        if (!this.isMoving && this.state.containerSize.width) {
            this._translateX.setOffset(this.props.vertical ? this.state.containerSize.width - this._getThumbCenter(value) : this._getThumbCenter(value));
            this._translateX.setValue(0);
        }

        if (this.props.animateTransitions) {
            this._setCurrentValueAnimated(value);
        } else {
            this._setCurrentValue(value);
        }
    }

    render() {
        var {
            minimumValue,
            maximumValue,
            minimumTrackTintColor,
            maximumTrackTintColor,
            thumbTintColor,
            styles,
            style,
            trackStyle,
            trackImage,
            thumbStyle,
            vertical,
            onValueChange,
            thumbTouchSize,
            animationType,
            animateTransitions,
            goalThumbStyle,
            showThumbValue,
            thumbFloatStyle,
            floatThumbOffset,
            ...other
        } = this.props;

        var {
            value,
            containerSize,
            thumbSize,
            goalThumbSize,
            floatThumbSize,
            allMeasured,
            currentValue,
            isMoving,
        } = this.state;

        var mainStyles = styles || defaultStyles;
        var thumbCenter = value.interpolate({
            inputRange: [minimumValue, maximumValue],
            outputRange: [0, containerSize.width - thumbSize.width / 2],
            extrapolate: 'clamp',
        });
        var valueVisibleStyle = {};
        if (!allMeasured) {
            valueVisibleStyle.opacity = 0;
        }

        var minimumTrackStyle = {
            position: 'absolute',
            width: Animated.add(thumbCenter, thumbSize.width / 2),
            backgroundColor: minimumTrackTintColor,
            ...valueVisibleStyle
        };

        var touchOverflowStyle = this._getTouchOverflowStyle();

        var translate = this._translateX.interpolate({
            inputRange: [0, containerSize.width || 200],
            outputRange: [0, containerSize.width || 200],
            extrapolate: 'clamp',
        });


        var transformStyle = {};
        if (vertical) {
            transformStyle.transform = [{
                rotate: '-90deg'
            }];
            translate = Animated.multiply(Animated.add(translate, -containerSize.width), -1);
        }

        var thumbMarginLeftStyle = {
            marginLeft: -thumbSize.width / 2,
        };

        var floatThumbMarginLeftStyle = {
            marginLeft: -floatThumbSize.width / 2,
        };

        var goalThumbMarginLeftStyle = {
            marginLeft: -goalThumbSize.width / 2,
        };

        return (
            <View {...other} style={[mainStyles.container, style, transformStyle]} onLayout={this._measureContainer}>
                <View
                    style={[{backgroundColor: maximumTrackTintColor}, mainStyles.track, trackStyle, valueVisibleStyle]}
                    renderToHardwareTextureAndroid={true}
                    onLayout={this._measureTrack} >
                    {trackImage ? <Image
                        style={trackStyle}
                        source={trackImage}
                        resizeMode="stretch" />
                    : <Animated.View
                        renderToHardwareTextureAndroid={true}
                        style={[mainStyles.track, trackStyle, minimumTrackStyle]} />
                    }
                </View>
                {this.props.goal !==undefined && <Animated.View
                    onLayout={this._measureGoalThumb}
                    renderToHardwareTextureAndroid={true}
                    style={[
                        {backgroundColor: thumbTintColor},
                        mainStyles.thumb, mainStyles.goalThumb, goalThumbStyle, goalThumbMarginLeftStyle,
                        {
                            transform: [
                                {
                                    translateX: new Animated.Value(this._getThumbCenter(this.props.goal)).interpolate({
                                        inputRange: [0, containerSize.width || 200],
                                        outputRange: [0, containerSize.width || 200],
                                        extrapolate: 'clamp',
                                    })
                                },
                                { translateY: 0},
                            ],
                            ...valueVisibleStyle
                        }
                    ]}
                />}
                <Animated.View
                    onLayout={this._measureThumb}
                    renderToHardwareTextureAndroid={true}
                    style={[
                        {backgroundColor: thumbTintColor},
                        mainStyles.thumb,
                        {
                            position: 'absolute',
                            width: THUMB_SIZE,
                            height: THUMB_SIZE,
                            borderRadius: THUMB_SIZE / 2,
                        },
                        thumbStyle,
                        isMoving && {
                            backgroundColor: 'transparent',
                            shadowColor: 'transparent',
                            elevation: 0,
                            borderWidth: 0,
                        },
                        thumbMarginLeftStyle,
                        {
                            transform: [
                                { translateX: translate},
                                { translateY: 0},
                            ],
                            ...valueVisibleStyle
                        }
                    ]}
                >
                    {this._renderThumbImage()}
                    <View style={mainStyles.thumbTextContainer}>
                        {showThumbValue && <Text style={[mainStyles.thumbText]}>{currentValue}</Text>}
                    </View>
                </Animated.View>
                {(isMoving) && <Animated.View
                    onLayout={this._measureFloatThumb}
                    renderToHardwareTextureAndroid={true}
                    style={[
                        { backgroundColor: thumbTintColor },
                        mainStyles.thumb,
                        {
                            position: 'absolute',
                            width: THUMB_SIZE,
                            height: THUMB_SIZE,
                            borderRadius: THUMB_SIZE / 2,
                        },
                        thumbFloatStyle,
                        floatThumbMarginLeftStyle,
                        {
                            transform: [
                                { translateX: translate},
                                { translateY: floatThumbOffset},
                            ],
                            ...valueVisibleStyle
                        }
                    ]}
                >
                    {this._renderThumbImage()}
                    <View style={mainStyles.thumbTextContainer}>
                        {showThumbValue && <Text style={[mainStyles.thumbText]}>{currentValue}</Text>}
                    </View>
                </Animated.View>}
                <PanGestureHandler
                    onGestureEvent={this._onGestureEvent}
                    onHandlerStateChange={this._onHandlerStateChange}>
                    <Animated.View
                        renderToHardwareTextureAndroid={true}
                        style={[defaultStyles.touchArea, touchOverflowStyle]}
                    />
                </PanGestureHandler>
            </View>
        );
    }

    _handlePanResponderGrant = (x: number) => {
        this._lastOffsetX = x - this._getTouchOverflowSize().width / 2;
        if (this._lastOffsetX < 0) {
            this._lastOffsetX = 0;
        } else if (this._lastOffsetX > this.state.containerSize.width) {
            this._lastOffsetX = this.state.containerSize.width;
        }

        this._translateX.setOffset(this.props.vertical ? this.state.containerSize.width - this._lastOffsetX : this._lastOffsetX);
        this._translateX.setValue(0);

        this._fireChangeEvent('onSlidingStart');
    };

    _handlePanResponderMove = (e: Object) => {
        // This synthetic event is reused for performance reasons, so save it first
        var translationX = e.nativeEvent.translationX;
        var translationY = e.nativeEvent.translationY;
        var velocityX = e.nativeEvent.velocityX;
        var velocityY = e.nativeEvent.velocityY;

        if (this.props.disabled) {
            return;
        }
        this.isMoving = true;
        this.setState(state => ({ ...state, isMoving: true}));

        var translation = this.props.vertical ? -translationY : translationX;
        var offset = this._lastOffsetX + translation;
        if (offset < 0) {
            offset = 0;
        } else if (offset > this.state.containerSize.width) {
            offset = this.state.containerSize.width;
        }

        var newValue = this._getValue(offset);
        if (this._getCurrentValue() !== newValue) {
            this._setCurrentValue(newValue);
            var velocity = Math.abs(this.props.vertical ? velocityY : velocityX);
            if (velocity < this.props.moveVelocityThreshold) {
                this._fireChangeEvent('onValueChange');
            }
        }
    };

    _handlePanResponderEnd = (translationX: number) => {
        if (this.props.disabled) {
            return;
        }

        this.isMoving = false;
        this.setState(state => ({ ...state, isMoving: false}));

        this._lastOffsetX += translationX;
        if (this._lastOffsetX < 0) {
            this._lastOffsetX = 0;
        } else if (this._lastOffsetX > this.state.containerSize.width) {
            this._lastOffsetX = this.state.containerSize.width;
        }

        var value = this._getValue(this._lastOffsetX);
        var offset = this._getThumbCenter(value);
        this._translateX.setOffset(this.props.vertical ? this.state.containerSize.width - offset : offset);
        this._translateX.setValue(0);

        this._setCurrentValue(value);
        this._fireChangeEvent('onSlidingComplete');
    };

    _measureContainer = (x: Object) => {
        this._handleMeasure('containerSize', x);
    };

    _measureTrack = (x: Object) => {
        this._handleMeasure('trackSize', x);
    };

    _measureThumb = (x: Object) => {
        this._handleMeasure('thumbSize', x);
    };

    _measureGoalThumb = (x: Object) => {
        this._handleMeasure('goalThumbSize', x);
    };

    _measureFloatThumb = (x: Object) => {
        this._handleMeasure('floatThumbSize', x);
    };

    _handleMeasure = (name: string, x: Object) => {
        var {
            width,
            height
        } = x.nativeEvent.layout;
        var size = {
            width: width,
            height: height
        };

        var storeName = `_${name}`;
        var currentSize = this[storeName];
        if (currentSize && width === currentSize.width && height === currentSize.height) {
            return;
        }
        this[storeName] = size;

        if (this._containerSize && this._trackSize && this._thumbSize && this[storeName] ) {
            this.setState(state => ({
                ...state,
                containerSize: this._containerSize,
                trackSize: this._trackSize,
                thumbSize: this._thumbSize,
                [name]: this[storeName],
                allMeasured: true,
            }), () => {
                var offset = this._getThumbCenter(this.props.value);
                this._translateX.setOffset(this.props.vertical ? this.state.containerSize.width - offset : offset);
                this._translateX.setValue(0);
                this._lastOffsetX = offset;
                this._fireChangeEvent('onReady');
            });
        }
    };

    _getRatio = (value: number) => {
        return (value - this.props.minimumValue) / (this.props.maximumValue - this.props.minimumValue);
    };

    _getThumbCenter = (value: number) => {
        var ratio = this._getRatio(value);
        return ratio * this.state.containerSize.width;
    };

    _getValue = (offset: number) => {
        var length = this.state.containerSize.width;
        var thumbCenter = offset;

        var ratio = thumbCenter / length;

        if (this.props.step) {
            return Math.max(this.props.minimumValue,
                Math.min(this.props.maximumValue,
                    this.props.minimumValue + Math.round(ratio * (this.props.maximumValue - this.props.minimumValue) / this.props.step) * this.props.step
                )
            );
        } else {
            return Math.max(this.props.minimumValue,
                Math.min(this.props.maximumValue,
                    ratio * (this.props.maximumValue - this.props.minimumValue) + this.props.minimumValue
                )
            );
        }
    };

    _getCurrentValue = () => {
        return this.state.value.__getValue();
    };

    _setCurrentValue = (value: number) => {
        this.state.value.setValue(value);
        this.setState(state => ({
            ...state,
            currentValue: this.props.thumbValueFormatter ? this.props.thumbValueFormatter(value) : value,
        }));
    };

    _setCurrentValueAnimated = (value: number) => {
        var animationType = this.props.animationType;
        var animationConfig = Object.assign({},
            DEFAULT_ANIMATION_CONFIGS[animationType],
            this.props.animationConfig, {
                toValue: value
            }
        );

        Animated[animationType](this.state.value, animationConfig).start();
    };

    _fireChangeEvent = (event) => {
        if (this.props[event]) {
            this.props[event](this._getCurrentValue());
        }
    };

    _getTouchOverflowSize = () => {
        var state = this.state;
        var props = this.props;

        var size = {};
        if (state.allMeasured === true) {
            size.width = Math.max(0, props.thumbTouchSize.width - state.thumbSize.width);
            size.height = Math.max(0, props.thumbTouchSize.height - state.containerSize.height);
        }

        return size;
    };

    _getTouchOverflowStyle = () => {
        var {
            width,
            height
        } = this._getTouchOverflowSize();

        var touchOverflowStyle = {};
        if (width !== undefined && height !== undefined) {
            var verticalMargin = -height / 2;
            touchOverflowStyle.marginTop = verticalMargin;
            touchOverflowStyle.marginBottom = verticalMargin;

            var horizontalMargin = -width / 2;
            touchOverflowStyle.marginLeft = horizontalMargin;
            touchOverflowStyle.marginRight = horizontalMargin;
        }

        return touchOverflowStyle;
    };

    _renderThumbImage = () => {
        var {
            thumbImage,
            thumbStyle,
        } = this.props;

        if (!thumbImage) {
            return;
        }

        var imageStyle = {
            width: defaultStyles.thumb.width,
            height: defaultStyles.thumb.height,
        };
        if (thumbStyle) {
            imageStyle.width = thumbStyle.width || imageStyle.width;
            imageStyle.height = thumbStyle.height || imageStyle.height;
        }

        return <Image source={thumbImage} style={imageStyle} />;
    };
}

var defaultStyles = StyleSheet.create({
    container: {
        height: 40,
        justifyContent: 'center',
    },
    track: {
        height: TRACK_SIZE,
        borderRadius: TRACK_SIZE / 2,
    },
    thumb: {
        position: 'absolute',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
    },
    goalThumb: {
        height: 10,
        width: 1,
    },
    thumbTextContainer: {
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
        height: '100%',
    },
    thumbText: {
        fontSize: 12,
        textAlign: 'center',
    },
    touchArea: {
        position: 'absolute',
        backgroundColor: 'transparent',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
