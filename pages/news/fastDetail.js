'use strict';
import React from 'react';
import {
	StyleSheet,
	Dimensions,
	Image,
	Text,
	View,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Clipboard,
	NativeModules,
	Platform,
	Alert,
	Modal,
	ScrollView
} from 'react-native';
import Toast from 'react-native-root-toast';
import Header from '../header';
import skin from '../../style';
import image from '../../logic/image';
import SharePlatform from '../../logic/SharePlatform';
import config from '../../config';
import PopupDialog, {
	DialogTitle,
	DialogButton
	//SlideAnimation,
	//ScaleAnimation,
	//FadeAnimation,
} from 'react-native-popup-dialog';
//获取屏幕宽高
let { width, height } = Dimensions.get('window');

export default class FastDetail extends React.PureComponent {
	static navigationOptions = {
		header: headerProps => {
			return (
				<View>
					<Header />
				</View>
			);
		}
	};
	constructor(props) {
		super(props);
		this.state = {
			id: this.props.navigation.state.params.id,
			context: this.props.navigation.state.params.context,
			isShareMenuShow: false //分享面板
		};
	}
	componentDidMount() {}
	componentWillUnmount() {
		// 请注意Un"m"ount的m是小写
		// 如果存在this.timer，则使用clearTimeout清空。
		// 如果你使用多个timer，那么用多个变量，或者用个数组来保存引用，然后逐个clear
	}
	shareWeixin = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'快讯',
			this.state.context,
			config.getWebUrl() + 'share?id=' + this.state.id,
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.WECHAT,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装微信，需要安装微信方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	sharePyq = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'快讯',
			this.state.content,
			config.getWebUrl() + 'share?id=' + this.state.id,
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.WECHATMOMENT,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装微信，需要安装微信方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	shareQQ = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'快讯',
			this.state.context,
			config.getWebUrl() + 'share?id=' + this.state.id,
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.QQ,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装QQ，需要安装QQ方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	shareQQZONE = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'快讯',
			this.state.context,
			config.getWebUrl() + 'share?id=' + this.state.id,
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.QQZONE,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装QQ，需要安装QQ方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	render() {
		return (
			<TouchableWithoutFeedback
				onPress={() => {
					this.props.navigation.goBack();
				}}
			>
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						alignContent: 'center',
						backgroundColor: '#fff'
					}}
				>
					<TouchableWithoutFeedback
						onPress={() => {
							this.props.navigation.goBack();
						}}
						onLongPress={() => {
							this.menu.show();
						}}
					>
						<ScrollView>
							<View
								style={{
									padding: 10
								}}
							>
								<Text
									style={{
										fontSize: this.props.navigation.state
											.params.fontSize
											? this.props.navigation.state.params
													.fontSize
											: 16,
										color: '#5c5c5c'
									}}
									onLongPress={() => this.menu.show()}
									onPress={() =>
										this.props.navigation.goBack()
									}
								>
									{this.state.context}
								</Text>
							</View>
						</ScrollView>
					</TouchableWithoutFeedback>
					<PopupDialog
						ref={menu => {
							this.menu = menu;
						}}
						width={width}
						height={120}
						dialogStyle={{
							position: 'absolute',
							bottom: 25
						}}
					>
						<TouchableWithoutFeedback
							onPress={() => {
								Clipboard.setString(this.state.context); //复制内容到粘贴板
								try {
									// var content = await Clipboard.getString();
									Toast.show('内容已复制到粘贴板.', {
										duration: Toast.durations.SHORT,
										position: Toast.positions.BOTTOM
									});
								} catch (e) {
									Toast.show(e.message, {
										duration: Toast.durations.SHORT,
										position: Toast.positions.BOTTOM
									});
								}
								this.menu.dismiss();
							}}
						>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									borderBottomWidth: 1,
									borderBottomColor: '#f3f3f3'
								}}
							>
								<Text
									style={{
										fontSize: 14,
										color: '#666666',
										//height: 40,
										textAlignVertical: 'center'
									}}
								>
									复制
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback
							onPress={() => {
								this.menu.dismiss();
								this.setState({ isShareMenuShow: true });
							}}
						>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									borderBottomWidth: 1,
									borderBottomColor: '#f3f3f3'
								}}
							>
								<Text
									style={{
										fontSize: 14,
										color: '#666666',
										//height: 40,
										textAlignVertical: 'center'
									}}
								>
									分享
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback
							onPress={() => {
								this.menu.dismiss();
							}}
						>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									borderBottomWidth: 1,
									borderBottomColor: '#f3f3f3'
								}}
							>
								<Text
									style={{
										fontSize: 14,
										color: '#666666',
										//height: 40,
										textAlignVertical: 'center'
									}}
								>
									关闭
								</Text>
							</View>
						</TouchableWithoutFeedback>
					</PopupDialog>
					<Modal
						style={{
							backgroundColor: '#00000011',
							width: width,
							height: height
						}}
						animationType={'fade'}
						transparent={true}
						visible={this.state.isShareMenuShow}
						onRequestClose={() => {
							this.setState({ isShareMenuShow: false });
						}}
					>
						<TouchableHighlight
							onPress={() => {
								this.setState({ isShareMenuShow: false });
							}}
						>
							<View
								style={{
									backgroundColor: '#00000055',
									width: width,
									height: height
								}}
							/>
						</TouchableHighlight>
						<View
							style={{
								backgroundColor: '#fff',
								flexDirection: 'row',
								position: 'absolute',
								bottom: 0,
								right: 0,
								borderTopColor: '#f3f3f3',
								width: width,
								justifyContent: 'space-around',
								alignItems: 'center',
								height: width / 5
							}}
						>
							<TouchableHighlight
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								onPress={() => this.shareWeixin()}
							>
								<View
									style={{
										alignItems: 'center',
										justifyContent: 'center',
										flex: 1
									}}
								>
									<Image
										style={{ width: 30, height: 30 }}
										source={image.newsimages.weixin}
									/>
									<Text>微信好友</Text>
								</View>
							</TouchableHighlight>
							<TouchableHighlight
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								onPress={() => this.sharePyq()}
							>
								<View
									style={{
										alignItems: 'center',
										justifyContent: 'center',
										flex: 1
									}}
								>
									<Image
										style={{ width: 30, height: 30 }}
										source={image.newsimages.pengyouq}
									/>
									<Text>微信朋友圈</Text>
								</View>
							</TouchableHighlight>
							<TouchableHighlight
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								onPress={() => this.shareQQ()}
							>
								<View
									style={{
										alignItems: 'center',
										justifyContent: 'center',
										flex: 1
									}}
								>
									<Image
										style={{ width: 30, height: 30 }}
										source={image.newsimages.qq}
									/>
									<Text>QQ</Text>
								</View>
							</TouchableHighlight>
							<TouchableHighlight
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								onPress={() => this.shareQQZONE()}
							>
								<View
									style={{
										alignItems: 'center',
										justifyContent: 'center',
										flex: 1
									}}
								>
									<Image
										style={{ width: 30, height: 30 }}
										source={image.newsimages.qqzone}
									/>
									<Text>QQ空间</Text>
								</View>
							</TouchableHighlight>
						</View>
					</Modal>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}
