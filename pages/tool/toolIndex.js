/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	View,
	TouchableWithoutFeedback,
	Alert,
	StatusBar,
	Platform
} from 'react-native';
import Header from '../header';
import skin from '../../style';
import user from '../../logic/user';
import { SelectType } from './calculate/jcMain';
/**
 * 工具首页
 * @author zhangchao
 * @export
 * @class ToolIndex
 * @extends {Component}
 */
export default class ToolIndex extends Component {
	static navigationOptions = {
		header: (headerProps) => {
			return (
				<View>
					<StatusBar animated={true} barStyle={'light-content'} backgroundColor={skin.activeTint}/>
					<Header />
					<View
						style={{
							flexDirection: 'row',
							height: 40,
							justifyContent: 'center',
							backgroundColor: skin.main
						}}
					>
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Text style={{ fontSize: 16, color: skin.tint }}>工具</Text>
						</View>
					</View>
				</View>
			);
		}
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
	}

	//点击建材计算器
	_OnPressJC = () => {
		this.nav.navigate('jcMain');
	};
	//点击板材计算器
	_OnPressBC = () => {
		this.nav.navigate('jcSelect', {
			title: '板材',
			type: SelectType.TradeByType,
			typeid: 3
		});
	};
	//点击型材计算器
	_OnPressXC = () => {
		this.nav.navigate('jcSelect', {
			title: '型材',
			type: SelectType.TradeByType,
			typeid: 2
		});
	};
	//点击管材计算器
	_OnPressGC = () => {
		this.nav.navigate('jcSelect', {
			title: '管材',
			type: SelectType.TradeByType,
			typeid: 4
		});
	};

	//点击建材材质书
	_OnPressMaterialJC = async () => {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			this.nav.navigate('statement', { type: 1 });
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	};
	//点击板卷材质书
	_OnPressMaterialBJ = async () => {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			this.nav.navigate('statement', { type: 3 });
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	};
	//点击型材材质书
	_OnPressMaterialXC = async () => {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			this.nav.navigate('statement', { type: 2 });
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	};
	//点击钢企名录
	_OnPressGQML = async () => {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			//跳转到钢企名录页面
			this.nav.navigate('steelHome');
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	};
	//点击电子合同
	_OnPressDZHT = async () => {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			//跳转到电子合同页面
			this.nav.navigate('eContractMain');
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	};
	//点击报价单
	_onPressBJD = async () => {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			//跳转到报价单页面
			this.nav.navigate('offerMain');
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	};

	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					backgroundColor: '#FFF'
				}}
			>
				<View style={{ height: 10, backgroundColor: '#EEE' }} />
				<View
					style={{
						flex: 1,
						flexDirection: 'column',
						backgroundColor: '#FFF'
					}}
				>
					<Text
						style={{
							height: 20,
							marginTop: 20,
							marginLeft: 20,
							borderLeftColor: '#ffa500',
							borderLeftWidth: 5,
							paddingLeft: 10,
							fontSize: 12,
							color: '#808080'
						}}
					>
						理重计算器
					</Text>
					<View
						style={{
							flex: 3,
							flexDirection: 'row',
							justifyContent: 'space-around',
							paddingHorizontal: 10,
							paddingTop: 10,
							paddingBottom: 20
						}}
					>
						<TouchableWithoutFeedback onPress={this._OnPressJC}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/tjc.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									建材
								</Text>
							</View>
						</TouchableWithoutFeedback>

						<TouchableWithoutFeedback onPress={this._OnPressBC}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/tbc.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									板材
								</Text>
							</View>
						</TouchableWithoutFeedback>

						<TouchableWithoutFeedback onPress={this._OnPressXC}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/txc.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									型材
								</Text>
							</View>
						</TouchableWithoutFeedback>

						<TouchableWithoutFeedback onPress={this._OnPressGC}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/tgc.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									管材
								</Text>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</View>
				<View style={{ height: 10, backgroundColor: '#EEE' }} />
				<View
					style={{
						flex: 1,
						flexDirection: 'column',
						backgroundColor: '#FFF'
					}}
				>
					<Text
						style={{
							height: 20,
							marginLeft: 20,
							marginTop: 20,
							borderLeftColor: '#00bfff',
							borderLeftWidth: 5,
							paddingLeft: 10,
							fontSize: 12,
							color: '#808080'
						}}
					>
						材质书
					</Text>
					<View
						style={{
							flex: 3,
							flexDirection: 'row',
							justifyContent: 'space-around',
							paddingHorizontal: 10,
							paddingTop: 10,
							paddingBottom: 20
						}}
					>
						<TouchableWithoutFeedback onPress={this._OnPressMaterialJC}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/tjcb.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									建材
								</Text>
							</View>
						</TouchableWithoutFeedback>

						<TouchableWithoutFeedback onPress={this._OnPressMaterialBJ}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/tbcb.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									板/卷材
								</Text>
							</View>
						</TouchableWithoutFeedback>

						<TouchableWithoutFeedback onPress={this._OnPressMaterialXC}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/txcb.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									型材
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<View
							style={{
								flex: 1,
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						/>
					</View>
				</View>
				<View style={{ height: 10, backgroundColor: '#EEE' }} />
				<View
					style={{
						flex: 1,
						flexDirection: 'column',
						backgroundColor: '#FFF'
					}}
				>
					<Text
						style={{
							height: 20,
							marginLeft: 20,
							marginTop: 20,
							borderLeftColor: '#f4a460',
							borderLeftWidth: 5,
							paddingLeft: 10,
							fontSize: 12,
							color: '#808080'
						}}
					>
						其他
					</Text>
					<View
						style={{
							flex: 3,
							flexDirection: 'row',
							justifyContent: 'space-around',
							paddingHorizontal: 10,
							paddingTop: 10,
							paddingBottom: 20
						}}
					>
						<TouchableWithoutFeedback onPress={this._onPressBJD}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/tbjd.png')} />
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

						<TouchableWithoutFeedback onPress={this._OnPressGQML}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/tgqml.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									钢企名录
								</Text>
							</View>
						</TouchableWithoutFeedback>

						<TouchableWithoutFeedback onPress={this._OnPressDZHT}>
							<View
								style={{
									flex: 1,
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ height: 45, width: 45 }} source={require('../../img/tool/tdzht.png')} />
								<Text
									style={{
										fontSize: 12,
										color: '#5c5c5c',
										textAlign: 'center',
										paddingTop: 5
									}}
								>
									电子合同
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<View
							style={{
								flex: 1,
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						/>
					</View>
				</View>
			</View>
		);
	}
}
