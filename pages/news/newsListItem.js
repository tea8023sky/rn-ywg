//列表item
import React, { Component, PureComponent } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	View,
	FlatList,
	TouchableHighlight,
	Alert,
	TouchableWithoutFeedback
} from 'react-native';
import Dimensions from 'Dimensions';
import Icon from 'react-native-vector-icons/Ionicons';
import TimeUtil from '../../logic/TimeUtil';
import user from '../../logic/user';
import Swiper from 'react-native-swiper';
import MarqueeLabel from '../marquee';
//item被选中时的背景色
_underlayColor = '#DDD';
//item被选中时的透明度
_activeOpacity = 0.8;

//图文item
export class TextImageItem extends PureComponent {
	constructor(props) {
		super(props);
	}

	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableHighlight
				activeOpacity={_activeOpacity}
				underlayColor={_underlayColor}
				onPress={this._onPress}
			>
				<View
					style={{
						paddingVertical: 10,
						paddingHorizontal: 12,
						flexDirection: 'row'
					}}
				>
					<Image
						style={{ height: 75, width: 100, borderRadius: 5 }}
						source={{
							uri: this.props.data.img,
							cache: 'force-cache'
						}}
					/>
					<View style={{ paddingLeft: 10, flex: 1 }}>
						<Text style={{ flex: 1, fontSize: 16, color: '#555' }}>
							{this.props.data.title}
						</Text>
						<View style={{ flexDirection: 'row' }}>
							<Text
								style={{
									flex: 1,
									fontSize: 12,
									color: '#9e9e9e'
								}}
							>
								{this.props.data.source}
							</Text>
							<Text style={{ fontSize: 12, color: '#9e9e9e' }}>
								{TimeUtil.getSeparateDate(
									this.props.data.retime
								)}
							</Text>
						</View>
					</View>
				</View>
			</TouchableHighlight>
		);
	}
}
//let Dimensions = require('Dimensions');
let { width, height } = Dimensions.get('window');
let imageWidth = width - 20;
let imageHeight = 160;
//图片item
export class ImageItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableHighlight
				activeOpacity={_activeOpacity}
				underlayColor={_underlayColor}
				onPress={this._onPress}
			>
				<View style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
					<Image
						resizeMode="stretch"
						style={{
							height: imageHeight,
							width: imageWidth,
							borderRadius: 5
						}}
						source={{
							uri: this.props.data.img,
							cache: 'force-cache'
						}}
					/>
					<View
						style={{
							height: 20,
							marginTop: -20,
							backgroundColor: '#00000088',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text
							numberOfLines={1}
							style={{ color: '#FFF', fontSize: 14 }}
						>
							{this.props.data.title}
						</Text>
					</View>
					{this.props.data.isimg == 2 ? (
						<Text
							style={{
								position: 'absolute',
								right: 20,
								bottom: 30,
								fontSize: 12,
								width: 42,
								height: 20,
								textAlign: 'center',
								backgroundColor: '#444444',
								color: '#fff'
							}}
						>
							图集
						</Text>
					) : (
						<View />
					)}
				</View>
			</TouchableHighlight>
		);
	}
}

//视频item
export class VideoItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableHighlight
				activeOpacity={_activeOpacity}
				underlayColor={_underlayColor}
				onPress={this._onPress}
			>
				<View style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
					<View style={{ height: 20, marginBottom: 5 }}>
						<Text
							numberOfLines={1}
							style={{ fontSize: 16, color: '#555555' }}
						>
							{this.props.data.title}
						</Text>
					</View>
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Image
							style={{
								height: imageHeight,
								width: imageWidth,
								borderRadius: 5
							}}
							source={{
								uri: this.props.data.img,
								cache: 'force-cache'
							}}
						/>
						<View
							style={{
								opacity: 0.6,
								position: 'absolute',
								width: 40,
								height: 40,
								borderRadius: 20,
								justifyContent: 'center',
								alignItems: 'center'
							}}
							backgroundColor="#000"
						>
							<Icon
								style={{ marginLeft: 3 }}
								name="ios-play"
								color="#FFF"
								size={20}
							/>
							{/* #9E9E9E */}
						</View>
						{/* <Image source={require('../../img/video_play.png')} /> */}
					</View>
					<View style={{ flexDirection: 'row', paddingTop: 10 }}>
						<Text
							style={{ flex: 1, fontSize: 12, color: '#9e9e9e' }}
						>
							{this.props.data.source}
						</Text>
						<Text style={{ fontSize: 12, color: '#9e9e9e' }}>
							{TimeUtil.getSeparateDate(this.props.data.retime)}
						</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	}
}

//时间线item，快讯日期
export class TimeLineItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	// _onPress = () => {
	// 	this.props.ItemPress(this.props.data);
	// };

	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					backgroundColor: '#f3f3f3',
					height: 32,
					alignItems: 'center'
				}}
			>
				<Text
					style={{ fontSize: 16, color: '#555555', paddingLeft: 20 }}
				>
					{this.props.data.dtDay}
				</Text>
				<Text
					style={{ fontSize: 14, color: '#888888', paddingLeft: 10 }}
				>
					{this.props.data.dtYearMon}
				</Text>
			</View>
		);
	}
}

//时间线item，快讯消息
export class TimeLineMsgItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableHighlight
				activeOpacity={_activeOpacity}
				underlayColor={_underlayColor}
				onPress={this._onPress}
			>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						backgroundColor: '#fff'
					}}
				>
					<View style={{ width: 40, backgroundColor: '#fff' }}>
						<View
							style={{
								width: 1,
								height: height,
								backgroundColor: '#e3e3e3',
								position: 'absolute',
								left: 30,
								top: 0
							}}
						/>
						<View
							style={{
								width: 12,
								height: 12,
								borderRadius: 6,
								backgroundColor: '#f38686',
								position: 'absolute',
								left: 25,
								top: 8
							}}
						/>
						<View
							style={{
								width: 8,
								height: 8,
								borderRadius: 4,
								backgroundColor: '#fff',
								position: 'absolute',
								left: 27,
								top: 10
							}}
						/>
					</View>
					<View
						style={{
							flex: 1,
							flexDirection: 'column',
							backgroundColor: '#fff',
							paddingBottom: 10
						}}
					>
						<Text
							style={{
								fontSize: 12,
								color: '#818181',
								paddingLeft: 6,
								padding: 6
							}}
						>
							{TimeUtil.getTime(
								this.props.data.publishtime,
								'hh:mm'
							)}
						</Text>
						<Text
							style={{
								fontSize: this.props.fontSize,
								color: '#5c5c5c',
								backgroundColor: '#f5f5f5',
								padding: 10,
								paddingTop: 5
							}}
						>
							{this.props.data.context}
						</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	}
}
//语音早报列表
export class AudioItem extends PureComponent {
	constructor(props) {
		super(props);
	}

	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableHighlight
				activeOpacity={_activeOpacity}
				underlayColor={_underlayColor}
				onPress={this._onPress}
			>
				<View
					style={{
						paddingVertical: 10,
						paddingHorizontal: 12,
						flexDirection: 'row'
					}}
				>
					<Image
						style={{ height: 75, width: 100, borderRadius: 5 }}
						source={{
							uri: this.props.data.img,
							cache: 'force-cache'
						}}
					/>
					<View style={{ paddingLeft: 10, flex: 1 }}>
						<Text style={{ flex: 1, fontSize: 16, color: '#555' }}>
							{this.props.data.title}
						</Text>
						<View style={{ flexDirection: 'row' }}>
							<Text
								style={{
									flex: 1,
									fontSize: 12,
									color: '#9e9e9e'
								}}
							>
								{this.props.data.randomread + '次播放'}
							</Text>
							<Text style={{ fontSize: 12, color: '#9e9e9e' }}>
								{TimeUtil.getSeparateDate(
									this.props.data.retime
								)}
							</Text>
						</View>
					</View>
				</View>
			</TouchableHighlight>
		);
	}
}
//首页语音早报
export class NewsAudioItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableHighlight
				activeOpacity={_activeOpacity}
				underlayColor={_underlayColor}
				onPress={this._onPress}
			>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						padding: 10,
						paddingRight: 10
					}}
				>
					<Image
						style={{ height: 33, width: 33 }}
						source={require('../../img/news/homezaobao.png')}
					/>
					<MarqueeLabel
						//duration={5000}
						speed={100}
						textStyle={{ fontSize: 14, color: '#5c5c5c' }}
					>
						{this.props.data.title}
					</MarqueeLabel>
				</View>
			</TouchableHighlight>
		);
	}
}

//快捷工具
export class NewsToolItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = async index => {
		//Alert.alert('' + index);
		if (index == 1) {
			//建材不需要检测登录状态
			this.props.navigation.navigate('jcMain');
		} else {
			let isLogin = await user.IsLogin();
			if (isLogin) {
				switch (index) {
					case 0:
						this.props.navigation.navigate('chat', {
							chatSelected: false,
							dySelected: true
						});
						break;
					case 2:
						this.props.navigation.navigate('statement', {
							type: 1
						});
						break;
					case 3:
						this.props.navigation.navigate('offerMain');
						break;
				}
			} else {
				//未登录时跳转到登录页面
				this.props.navigation.navigate('login');
			}
		}
	};
	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					padding: 10,
					justifyContent: 'space-around'
				}}
			>
				<TouchableWithoutFeedback onPress={this._onPress.bind(this, 0)}>
					<View
						style={{
							flex: 1,
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Image
							style={{ height: 45, width: 45 }}
							source={require('../../img/news/news01.png')}
						/>
						<Text
							style={{
								fontSize: 12,
								color: '#5c5c5c',
								textAlign: 'center',
								paddingTop: 5
							}}
						>
							动态
						</Text>
					</View>
				</TouchableWithoutFeedback>

				<TouchableWithoutFeedback onPress={this._onPress.bind(this, 1)}>
					<View
						style={{
							flex: 1,
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Image
							style={{ height: 45, width: 45 }}
							source={require('../../img/news/news02.png')}
						/>
						<Text
							style={{
								fontSize: 12,
								color: '#5c5c5c',
								textAlign: 'center',
								paddingTop: 5
							}}
						>
							建材计算器
						</Text>
					</View>
				</TouchableWithoutFeedback>

				<TouchableWithoutFeedback onPress={this._onPress.bind(this, 2)}>
					<View
						style={{
							flex: 1,
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Image
							style={{ height: 45, width: 45 }}
							source={require('../../img/news/news03.png')}
						/>
						<Text
							style={{
								fontSize: 12,
								color: '#5c5c5c',
								textAlign: 'center',
								paddingTop: 5
							}}
						>
							建材材质书
						</Text>
					</View>
				</TouchableWithoutFeedback>

				<TouchableWithoutFeedback onPress={this._onPress.bind(this, 3)}>
					<View
						style={{
							flex: 1,
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Image
							style={{ height: 45, width: 45 }}
							source={require('../../img/news/news04.png')}
						/>
						<Text
							style={{
								fontSize: 12,
								color: '#5c5c5c',
								textAlign: 'center',
								paddingTop: 5
							}}
						>
							报价单
						</Text>
					</View>
				</TouchableWithoutFeedback>
			</View>
		);
	}
}

//推荐文章
export class NewsRecommendItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableHighlight
				activeOpacity={_activeOpacity}
				underlayColor={_underlayColor}
				onPress={this._onPress}
			>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						padding: 10,
						paddingRight: 20
					}}
				>
					<Image
						style={{ height: 16, width: 16 }}
						source={require('../../img/news/news05.png')}
					/>
					<Text
						numberOfLines={1}
						style={{ fontSize: 14, color: '#5c5c5c' }}
					>
						{this.props.data.title}
					</Text>
				</View>
			</TouchableHighlight>
		);
	}
}

//图集索引
const renderPagination = (index, total, context) => {
	return (
		<View
			style={{
				position: 'absolute',
				bottom: 5,
				right: 10
			}}
		>
			<Text style={{ color: 'white', fontSize: 16 }}>
				<Text
					style={{
						color: 'white',
						fontSize: 16
					}}
				>
					{index + 1}
				</Text>/{total}
			</Text>
		</View>
	);
};

//轮播图集文章
export class SwiperImageItem extends PureComponent {
	constructor(props) {
		super(props);
		//Alert.alert(JSON.stringify(this.props.data));
		this.index = 0;
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data[this.index]);
	};

	render() {
		console.log('*********11111*********this.props.data*******');
		console.log(this.props.data);
		console.log('*********11111****************');
		return (
			<View style={{ padding: 10 }}>
				<Swiper
					newflag={false} //添加新的标志newflag为false表示非标价单轮播；newflag为true表示标价单轮播（解决ios报价单下标为1显示最后一张图片）
					loop={true} //如果设置为false，那么滑动到最后一张时，再次滑动将不会滑到第一张图片。
					autoplay={true} //自动轮播
					autoplayTimeout={5}
					height={160}
					horizontal={true}
					showsButtons={false}
					removeClippedSubviews={false}
					renderPagination={renderPagination}
					onIndexChanged={index => {
						this.index = index;
					}}
					//showsPagination={false}
				>
					<TouchableHighlight onPress={this._onPress}>
						<View>
							<Image
								resizeMode="stretch"
								source={{
									uri: this.props.data[0].img,
									cache: 'force-cache'
								}}
								style={{ width: width - 20, height: 160 }}
							/>
							<View
								style={{
									flex: 1,
									alignItems: 'center',
									position: 'absolute',
									width: width,
									height: 30,
									right: 0,
									bottom: 0,
									backgroundColor: '#000'
								}}
							>
								<Text
									numberOfLines={1}
									style={{
										color: '#fff',
										position: 'absolute',
										width: width - 60,
										bottom: 5,
										textAlign: 'center',
										paddingRight: 0
									}}
								>
									{this.props.data[0].title}
								</Text>
							</View>
						</View>
					</TouchableHighlight>
					<TouchableHighlight onPress={this._onPress}>
						<View>
							<Image
								resizeMode="stretch"
								source={{
									uri: this.props.data[1].img,
									cache: 'force-cache'
								}}
								style={{ width: width - 20, height: 160 }}
							/>
							<View
								style={{
									flex: 1,
									alignItems: 'center',
									position: 'absolute',
									width: width,
									height: 30,
									right: 0,
									bottom: 0,
									backgroundColor: '#000'
								}}
							>
								<Text
									numberOfLines={1}
									style={{
										color: '#fff',
										position: 'absolute',
										width: width - 60,
										bottom: 5,
										textAlign: 'center',
										paddingRight: 0
									}}
								>
									{this.props.data[1].title}
								</Text>
							</View>
						</View>
					</TouchableHighlight>
					<TouchableHighlight onPress={this._onPress}>
						<View>
							<Image
								resizeMode="stretch"
								source={{
									uri: this.props.data[2].img,
									cache: 'force-cache'
								}}
								style={{ width: width - 20, height: 160 }}
							/>
							<View
								style={{
									flex: 1,
									alignItems: 'center',
									position: 'absolute',
									width: width,
									height: 30,
									right: 0,
									bottom: 0,
									backgroundColor: '#000'
								}}
							>
								<Text
									numberOfLines={1}
									style={{
										color: '#fff',
										position: 'absolute',
										width: width - 60,
										bottom: 5,
										textAlign: 'center',
										paddingRight: 0
									}}
								>
									{this.props.data[2].title}
								</Text>
							</View>
						</View>
					</TouchableHighlight>
				</Swiper>
			</View>
		);
	}
}
