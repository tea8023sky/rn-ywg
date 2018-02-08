import React, { Component } from 'react';
import {
	AppRegistry,
	Text,
	View,
	Image,
	TouchableHighlight,
	TextInput,
	Linking,
	BackHandler,
	Platform,
	Alert
} from 'react-native';
import cache from '../logic/cache';
import Regular from '../logic/regular';
import skin from '../style';
import config from '../config';
import net from '../logic/net';
import image from '../logic/image';
import chat from '../logic/chat';

/**
 * 广告界面
 *
 * @author wuzhitao
 * @export
 * @class Advertising
 * @extends {Component}
 */
export default class Advertising extends Component {
	static navigationOptions = {
		headerStyle: {
			height: 0, //导航条高度,40导航条高度+20沉侵高度
			elevation: 0, //Android去掉header的阴影
			shadowOpacity: 0 //ios去掉header的阴影
		}
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;

		this.state = {
			isADView: false, //是否显示广告视图（默认为不显示）
			ADData: null, //正在显示的广告数据
			ADText: '' //广告倒计时
		};

		this.data = {
			ADList: [] //广告数据列表
		};
	}

	//组件初始化完毕
	componentDidMount() {
		//加载本次广告
		this.getADData();
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		this.timer && clearTimeout(this.timer); //清除广告显示定时器
		this.ADinterval && clearInterval(this.ADinterval); //清除跳过定时器
	}

	/**
   * 加载已有广告
   *
   * @memberof Advertising
   */
	async getADData() {
		let ADData = await chat.getAdvertising();
		if (ADData && ADData.length > 0) {
			if (__DEV__) {
				console.log('Advertising 加载广告成功');
			}
			let nowTime = new Date().getTime(); //当前时间戳（毫秒）
			for (let i = 0; i < ADData.length; i++) {
				//过滤出有效广告
				if (ADData[i].stime * 1000 <= nowTime && ADData[i].etime * 1000 >= nowTime) {
					this.data.ADList.push(ADData[i]);
				}
			}
			this.setADData();
		} else {
			this.setState({ isADView: false });
			this.nav.navigate('home');
		}
	}

	/**
   * 设置数据
   *
   * @memberof Advertising
   */
	setADData() {
		if (this.data.ADList && this.data.ADList.length > 0) {
			this.setState({ isADView: true });
			this.setState({ ADData: this.data.ADList[0] });
			//广告显示定时器
			let ptime = this.state.ADData.ptime;
			this.timer = setTimeout(() => {
				this.setState({ isADView: true }); //关闭广告
				// this.timer && clearTimeout(this.timer); //清除定时器
				this.nav.navigate('home');
			}, ptime * 1000);

			let time = this.state.ADData.ctime;
			this.setState({ ADText: time + 's' });
			//广告倒计时定时器
			this.ADinterval = setInterval(() => {
				time--;
				if (time === 0) {
					this.ADinterval && clearInterval(this.ADinterval); //清除可跳过定时器
					this.setState({ ADText: '跳过' });
				} else {
					this.setState({ ADText: time + 's' });
				}
			}, 1000);
		} else {
			this.setState({ isADView: false });
			this.nav.navigate('home');
		}
	}

	/**
   * 打开广告连接
   *
   * @memberof Advertising
   */
	openADUrl = (url) => {
		if (url) {
			Linking.canOpenURL(url)
				.then((supported) => {
					if (!supported) {
						Alert.alert('您的设备不支持该功能');
					} else {
						return Linking.openURL(url);
					}
				})
				.catch((err) => console.log(err));
		}
	};

	/**
   * 跳过广告
   *
   * @memberof Advertising
   */
	jumpOverAD = () => {
		if (this.state.ADText == '跳过') {
			this.setState({ isADView: true }); //关闭广告
			if (this.timer) {
				this.timer && clearTimeout(this.timer); //清除广告播放定时器
			}
			this.nav.navigate('home');
		}
	};

	render() {
		if (this.state.isADView) {
			return (
				<TouchableHighlight
					onPress={() => (this.state.ADData.url ? this.openADUrl(this.state.ADData.url) : null)}
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					style={{ flex: 1 }}
				>
					<View style={{ flex: 1 }}>
						<Image
							source={{ uri: this.state.ADData ? this.state.ADData.img : null }}
							style={{ flex: 1 }}
							resizeMode={'stretch'}
						/>

						<View
							style={{
								right: 20,
								top: 20,
								width: 40,
								height: 40,
								borderRadius: 20,
								backgroundColor: '#F8F8F8',
								justifyContent: 'center',
								alignItems: 'center',
								position: 'absolute'
							}}
						>
							<TouchableHighlight
								onPress={() => this.jumpOverAD()} //跳过点击
								activeOpacity={1}
								underlayColor={skin.transparentColor}
							>
								<View
									style={{
										width: 40,
										height: 40,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Text
										style={{
											fontSize: 16,
											textAlign: 'center',
											textAlignVertical: 'center'
										}}
									>
										{this.state.ADText}
									</Text>
								</View>
							</TouchableHighlight>
						</View>
					</View>
				</TouchableHighlight>
			);
		} else {
			return (
				<View style={{ flex: 1 }}>
					<Image
						source={Platform.OS == 'ios' ? image.version.start_ios : image.version.start_ad}
						style={{ flex: 1 }}
						resizeMode={'stretch'}
					/>
				</View>
			);
		}
	}
}
