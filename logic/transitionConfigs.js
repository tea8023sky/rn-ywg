/* @flow */

import { Animated, Easing, Platform } from 'react-native';

import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';

const IOSTransitionSpec = {
	duration: 500,
	easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
	timing: Animated.timing
};

// Standard iOS navigation transition
const SlideFromRightIOS = {
	transitionSpec: IOSTransitionSpec,
	screenInterpolator: CardStackStyleInterpolator.forHorizontal,
	containerStyle: {
		backgroundColor: '#000'
	}
};

const SlideFromBottomIOS = {
	transitionSpec: IOSTransitionSpec,
	screenInterpolator: CardStackStyleInterpolator.forVertical,
	containerStyle: {
		backgroundColor: '#000'
	}
};

// Standard Android navigation transition when opening an Activity
const FadeInFromBottomAndroid = {
	// See http://androidxref.com/7.1.1_r6/xref/frameworks/base/core/res/res/anim/activity_open_enter.xml
	transitionSpec: {
		duration: 350,
		easing: Easing.out(Easing.poly(5)), // decelerate
		timing: Animated.timing
	},
	screenInterpolator: CardStackStyleInterpolator.forFadeFromBottomAndroid
};

// Standard Android navigation transition when closing an Activity
const FadeOutToBottomAndroid = {
	// See http://androidxref.com/7.1.1_r6/xref/frameworks/base/core/res/res/anim/activity_close_exit.xml
	transitionSpec: {
		duration: 230,
		easing: Easing.in(Easing.poly(4)), // accelerate
		timing: Animated.timing
	},
	screenInterpolator: CardStackStyleInterpolator.forFadeFromBottomAndroid
};

export default {
	SlideFromRight,
	SlideFromBottom,
	FadeFromBottom
};

/**
 * 右侧划入
 * 
 * @author jyk
 * @returns 
 */
function SlideFromRight() {
	return SlideFromRightIOS;
}
/**
 * 底部划入
 * 
 * @author jyk
 * @returns 
 */
function SlideFromBottom() {
	return SlideFromBottomIOS;
}
/**
 * 底部淡入
 * 
 * @author jyk
 * @param {any} transitionProps 
 * @param {any} prevTransitionProps 
 * @returns 
 */
function FadeFromBottom(transitionProps, prevTransitionProps) {
	if (prevTransitionProps && transitionProps.index < prevTransitionProps.index) {
		return FadeOutToBottomAndroid;
	}
	return FadeInFromBottomAndroid;
}

// function ModalSlideFromBottom(transitionProps, prevTransitionProps, isModal) {
// 	return ModalSlideFromBottomIOS;
// }

// function getTransitionConfig(
// 	transitionConfigurer?: () => TransitionConfig,
// 	// props for the new screen
// 	transitionProps: NavigationTransitionProps,
// 	// props for the old screen
// 	prevTransitionProps: NavigationTransitionProps,
// 	isModal: boolean
// ): TransitionConfig {
// 	const defaultConfig = defaultTransitionConfig(transitionProps, prevTransitionProps, isModal);
// 	if (transitionConfigurer) {
// 		return {
// 			...defaultConfig,
// 			...transitionConfigurer()
// 		};
// 	}
// 	return defaultConfig;
// }
