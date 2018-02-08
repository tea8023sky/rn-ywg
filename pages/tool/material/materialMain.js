import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Button,
	TextInput,
	Image,
	View,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Dimensions,
	ScrollView,
	Alert
} from 'react-native';
import Header from '../../header';
import { Loading } from '../../loading';
import skin from '../../../style';
import image from '../../../logic/image';
import net from '../../../logic/net';
import user from '../../../logic/user';
import TimeUtil from '../../../logic/TimeUtil';
import PageHelper from '../../../logic/pageHelper';
import Icon from 'react-native-vector-icons/Ionicons';

//获取屏幕宽高
let { width, height } = Dimensions.get('window');

export default class MaterialMain extends Component {
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: '材质书',
		headerTitleStyle: {
			alignSelf: 'center',
			textAlign: 'center',
			fontSize: 16,
			color: skin.tint
		},
		headerLeft: (
			<TouchableHighlight
				activeOpacity={1}
				underlayColor={skin.transparentColor}
				onPress={() => {
					navigation.state.params.goBackPage();
				}}
			>
				<View style={{ paddingLeft: 20 }}>
					<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: skin.tint }} />
				</View>
			</TouchableHighlight>
		),
		headerRight: (
			<TouchableWithoutFeedback
				onPress={() => {
					navigation.goBack(PageHelper.getPageKey('statement')); //关闭到主页
				}}
			>
				<View>
					<Text style={{ color: 'white', backgroundColor: skin.main, fontSize: 16, paddingRight: 20 }}>
						关闭
					</Text>
				</View>
			</TouchableWithoutFeedback>
		)
	});
	constructor(props) {
		super(props);
		this.state = {
			list: [],
			value: [],
			isDisable: false //避免重复点击‘确认’按钮（默认按钮可用）
		};
		this.nav = this.props.navigation;
		this.type = this.nav.state.params.type; //获取参数 type
		this.ArrayList = {}; //数组类型
		this.ObjectList = []; //对象类型
		this.userID = '';
	}
	
	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	//组件初始化完毕
	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
		this.LoadOfferData();
		this.getUserID();
	}
	//在组件销毁的时候要将其移除
	componentWillUnmount() {}

	async getUserID() {
		let result = await user.GetUserInfo();
		if (result) {
			this.userID = result.id;
		}
	}
	async LoadOfferData() {
		let result = await _getOffeed(
			this.nav.state.params.steel.id,
			this.nav.state.params.trade.id,
			this.nav.state.params.standard ? this.nav.state.params.standard.id : '0'
		);
		for (let key in result.data) {
			if (result.data[key] instanceof Array) {
				this.ArrayList[key] = result.data[key]; //取出二维数组对象列表
			} else {
				this.ObjectList.push(result.data[key]); //取出一维对象列表
			}
		}
		let listdata = [];
		//把ArrayList push到listdata
		for (let i = 0; i < result.arrayleng; i++) {
			for (let key in this.ArrayList) {
				let array = this.ArrayList[key];

				if (i < array.length) {
					listdata.push(array[i]);
				}
			}
		}
		//把ObjectList追加到listdata
		if (this.ObjectList.length > 0) {
			listdata = listdata.concat(this.ObjectList);
		}
		//日期显示bug处理(08-24-16 ---->> 2016-08-24)
		for (let i = 0; i < listdata.length; i++) {
			let obj = listdata[i];
			if (obj.rname.indexOf('date') >= 0 && obj.value.split('-').length == 3) {
				let arr = obj.value.split('-');
				listdata[i].value = '20' + arr[2] + '-' + arr[0] + '-' + arr[1];
			}
			//重量四舍五入3位处理
			if (obj.rname.indexOf('weight') >= 0 && !isNaN(parseFloat(obj.value))) {
				listdata[i].value = '' + TimeUtil.getFloat(parseFloat(obj.value), 3);
			}
		}
		this.setState({ list: listdata });
		let value = new Array(listdata.length);
		for (let i = 0; i < listdata.length; i++) {
			value[i] = listdata[i].value;
		}
		this.setState({ value: value });
	}

	//选择钢厂
	_onPressSteel = () => {
		this.nav.goBack(PageHelper.getPageKey('tradeSelect'));
	};

	//选择品名
	_onPressTrade = () => {
		this.nav.goBack(PageHelper.getPageKey('standardSelect'));
	};

	//选择规格
	_onPressStandard = () => {
		this.nav.goBack();
	};
	//输入框文本变化
	/**
	 * index 输入框索引 ，用于改变文本框值
	 * 
	 * rname 输入值分类名
	 * 
	 * name 输入值名
	 * 
	 * text 输入文本框文字
	 */
	_onChangeText = (index, rname, name, text) => {
		//改变文本框文字
		this.state.value[index] = text;
		let value = this.state.value;
		this.setState({ value: value });

		//改变ArrayList值
		if (this.ArrayList[rname]) {
			for (let i = 0; i < this.ArrayList[rname].length; i++) {
				if (this.ArrayList[rname][i].name == name) {
					this.ArrayList[rname][i].value = text;
					break;
				}
			}
		} else {
			for (let i = 0; i < this.ObjectList.length; i++) {
				if (this.ObjectList[i].name == name) {
					this.ObjectList[i].value = text;
					break;
				}
			}
		}
	};
	//生成图片
	CreateImage = async () => {
		this.setState({ isDisable: true }); //避免重复点击‘确认’按钮（禁用按钮）
		let params = {
			stid: this.nav.state.params.steel.id,
			tid: this.nav.state.params.trade.id,
			sid: this.nav.state.params.standard ? this.nav.state.params.standard.id : '0',
			type: this.nav.state.params.type,
			uid: this.userID
		};
		for (let key in this.ArrayList) {
			let value = this.ArrayList[key][0].value;
			for (let i = 1; i < this.ArrayList[key].length; i++) {
				value = value + ',' + this.ArrayList[key][i].value;
			}
			params[key] = value;
		}
		for (let i = 0; i < this.ObjectList.length; i++) {
			params[this.ObjectList[i].rname] = this.ObjectList[i].value;
		}
		this.refs.loading.Isvisible(true);
		let url = await _createTexture(params);
		if (url) {
			this.nav.navigate('resultImage', { title: '材质书', url: url }); //跳转图片生成页
		}
		this.refs.loading.Isvisible(false);
		// this.state.value[0] = JSON.stringify(params);
		// let value = this.state.value;
		// this.setState({ value: value });
		this.setState({ isDisable: false }); //避免重复点击‘确认’按钮（启用按钮）
	};
	render() {
		return (
			<View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
				<TouchableWithoutFeedback onPress={this._onPressSteel}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-end',
							alignItems: 'center',
							height: 40,
							padding: 10
						}}
					>
						<Text style={{ color: '#999999', fontSize: 14, flex: 2 }}>钢厂</Text>
						<Text
							style={{
								color: '#5c5c5c',
								fontSize: 14,
								flex: 8,
								textAlign: 'right',
								paddingRight: 10
							}}
						>
							{this.nav.state.params.steel.name}
						</Text>
						<Image style={{ width: 16, height: 16, paddingRight: 10 }} source={image.tool.next} />
					</View>
				</TouchableWithoutFeedback>
				<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />
				<TouchableWithoutFeedback onPress={this._onPressTrade}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-end',
							alignItems: 'center',
							height: 40,
							padding: 10
						}}
					>
						<Text style={{ color: '#999999', fontSize: 14, flex: 2 }}>品名</Text>
						<Text
							style={{
								color: '#5c5c5c',
								fontSize: 14,
								flex: 8,
								textAlign: 'right',
								paddingRight: 10
							}}
						>
							{this.nav.state.params.trade.name}
						</Text>
						<Image style={{ width: 16, height: 16, paddingRight: 10 }} source={image.tool.next} />
					</View>
				</TouchableWithoutFeedback>
				<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />
				{this.nav.state.params.standard ? (
					<View>
						<TouchableWithoutFeedback onPress={this._onPressStandard}>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'flex-end',
									alignItems: 'center',
									height: 40,
									padding: 10
								}}
							>
								<Text style={{ color: '#999999', fontSize: 14, flex: 2 }}>规格</Text>
								<Text
									style={{
										color: '#5c5c5c',
										fontSize: 14,
										flex: 8,
										textAlign: 'right',
										paddingRight: 10
									}}
								>
									{this.nav.state.params.standard.content}
								</Text>
								<Image style={{ width: 16, height: 16, paddingRight: 10 }} source={image.tool.next} />
							</View>
						</TouchableWithoutFeedback>
						<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />
					</View>
				) : (
					<View />
				)}
				<View style={{ height: 0 }}>
					<Loading text="正在生成图片" ref="loading" />
				</View>
				<View
					style={{
						backgroundColor: '#F8F8F8',
						paddingTop: 10,
						paddingBottom: 10,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Text style={{ color: '#808080', fontSize: 14 }}>请填写对应信息</Text>
				</View>

				<ScrollView>
					{this.state.list.length > 0 ? (
						this.state.list.map((elem, index) => {
							return (
								<View
									key={'k' + index}
									style={{
										flexDirection: 'row',
										justifyContent: 'center',
										alignItems: 'center',
										paddingBottom: 0,
										padding: 10
										//borderColor: '#f3f3f3',
										//borderWidth: 1,
										//borderRadius: 5
									}}
								>
									<Text style={{ flex: 1 }}>{elem.name}</Text>
									<View
										style={{
											flex: 3,
											flexDirection: 'row',
											justifyContent: 'center',
											alignItems: 'center',
											height: 40,
											//padding: 0,
											borderColor: '#f3f3f3',
											borderWidth: 1,
											borderRadius: 5
										}}
									>
										<TextInput
											style={{
												flex: 1,
												color: '#999999',
												fontSize: 14,

												height: 32,
												textAlign: 'left',
												padding: 0
											}}
											onChangeText={this._onChangeText.bind(this, index, elem.rname, elem.name)}
											value={this.state.value[index]}
											underlineColorAndroid="transparent"
										/>
									</View>
								</View>
							);
						})
					) : (
						<View />
					)}
					{this.state.list.length > 0 ? (
						<View style={{ padding: 10 }}>
							{/* <Button
								title="确定"
								color={skin.main}
								disabled={this.state.isDisable}
								onPress={this.CreateImage}
							/> */}

							<TouchableHighlight
								activeOpacity={1}
								underlayColor={'#FFF'}
								onPress={this.CreateImage}
								disabled={this.state.isDisable}
								style={{
									flexDirection: 'row',
									marginHorizontal: 20,
									marginTop: 25,
									borderRadius: 5
								}}
							>
								<View
									style={{
										flex: 1,
										backgroundColor: skin.main,
										justifyContent: 'center',
										alignItems: 'center',
										height: 40,
										borderRadius: 5
									}}
								>
									<Text style={{ color: '#FFF' }}>确定</Text>
								</View>
							</TouchableHighlight>
						</View>
					) : (
						<View />
					)}
				</ScrollView>
			</View>
		);
	}
}

//材质信息
let _getOffeed = async function(stid, tid, sid) {
	let result = await net.ApiPost('texture', 'GetOffer3', {
		stid: stid,
		tid: tid,
		sid: sid
	});
	if (result != null && result.status == 1) {
		console.log(result);
		return result.data;
	}
	return null;
};

//材质书生成图片
let _createTexture = async function(params) {
	let result = await net.MaterialPost('CreateTexture.ashx', params);
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};
