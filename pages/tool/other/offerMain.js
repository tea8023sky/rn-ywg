import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	View,
	FlatList,
	Alert,
	Button,
	TouchableWithoutFeedback,
	TouchableOpacity,
	Linking,
	Dimensions,
	ScrollView,
	TouchableHighlight,
	Keyboard,
	Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-root-toast';
import net from '../../../logic/net';
import event from '../../../logic/event';
import config from '../../../config';
import cache from '../../../logic/cache';
import user from '../../../logic/user';
import Regular from '../../../logic/regular';
//获取屏幕宽高
let { width, height } = Dimensions.get('window');

/**
 *报价单首页
 *
 * @author zhangchao
 * @export
 * @class OfferMain
 * @extends {Component}
 */
export default class OfferMain extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '报价单',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: '#FFF'
			},
			headerLeft: (
				<TouchableWithoutFeedback
					onPress={() => {
						navigation.state.params.goBackPage();
					}}
				>
					<View style={{ paddingLeft: 20 }}>
						<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: '#FFF' }} />
					</View>
				</TouchableWithoutFeedback>
			),
			headerRight: (
				<TouchableWithoutFeedback
					onPress={() => {
						navigation.state.params._addOffer();
					}}
				>
					<View>
						<Text style={{ color: '#FFF', paddingRight: 10 }}>添加</Text>
					</View>
				</TouchableWithoutFeedback>
			)
		};
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			companyshort: '',
			mobile: '',
			remark: '',
			list: [],
			isIOSNine: false //是否为ios 9
		};
		this.data = {
			time: null
		};
	}

	//组件初始化完毕
	componentDidMount = async () => {
		Keyboard.dismiss();
		this.props.navigation.setParams({
			_addOffer: this._onAddOffer,
			goBackPage: this._goBackPage
		});
		//监听添加报价单
		event.Sub(this, event.Events.tool.saveOffer, this._onSaveOffer);

		if (Platform.OS == 'ios') {
			let iosVersion = Platform.Version.toString();
			if (iosVersion.startsWith('9.')) {
				this.setState({ isIOSNine: true });
			}
		}

		//从缓存中读取报价单
		let queryOfferInfo = await cache.LoadFromFile(config.ToolOfferInfoKey);
		let userInfo = await user.GetUserInfo();
		//如果缓存中存在报价单，则初始化报价单数据
		if (queryOfferInfo) {
			this.setState({
				userid: userInfo.id,
				companyshort: queryOfferInfo.companyshort,
				mobile: queryOfferInfo.mobile,
				remark: queryOfferInfo.remark,
				list: queryOfferInfo.list
			});
		} else {
			this.setState({
				userid: userInfo.id,
				companyshort: userInfo.companyshort,
				mobile: userInfo.mobile,
				remark: '',
				list: []
			});
		}
		await cache.SaveToFile(config.ToolOfferInfoKey, this.state);
	};

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		event.UnSub(this);
	}
	//返回到上一页
	_goBackPage = async () => {
		await cache.SaveToFile(config.ToolOfferInfoKey, this.state);
		Keyboard.dismiss();
		this.nav.goBack();
	};
	//添加报价单
	_onAddOffer = async () => {
		this.nav.navigate('addOffer');
	};

	//处理添加的报价单（回调）
	_onSaveOffer = async offerItem => {
		let result = offerItem;
		let data = this.state.list;
		data.push({
			key:
				Math.random()
					.toString()
					.substr(2, 6) + new Date().getTime(),
			stid: result.steel.id, //钢厂ID
			stname: result.steel.name, //钢厂名
			tid: result.trade.id, //品名ID
			tname: result.trade.name, //品名
			sid: result.stock.id, //库存ID
			sname: result.stock.name, //库存名称
			standard: result.standard, //规格
			price: result.price.length > 0 ? Number(result.price) : '电议' //单价
		});
		this.setState({ list: data });
		await cache.SaveToFile(config.ToolOfferInfoKey, this.state);
	};

	//删除报价单缓存中指定数据
	_onDelOffer = async item => {
		let result = this.state.list;
		let datas = [];
		for (let params of result) {
			if (params.key == item.key) {
				continue;
			}
			datas.push(params);
		}
		//删除报价单缓存中指定数据
		let queryOfferInfo = await cache.LoadFromFile(config.ToolOfferInfoKey);
		queryOfferInfo.list = datas;
		this.setState({ list: datas });
		await cache.SaveToFile(config.ToolOfferInfoKey, this.state);
	};

	//生成图片
	_onCreateOfferImg = async () => {
		//防止多次点击“生成图片”按钮重复提交
		let nowTime = new Date().getTime();
		if (!this.data.time) {
			this.data.time = nowTime;
		} else {
			let time = nowTime - this.data.time;
			this.data.time = nowTime;
			if (time < 2000) {
				return;
			}
		}
		let companyshort = this.state.companyshort;
		let mobile = this.state.mobile;
		//校验公司名称
		if (!companyshort) {
			Toast.show('请输入公司名称', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		//校验手机号
		let isPhoneNum = Regular.isPhoneNumber(mobile);
		if (!isPhoneNum) {
			Toast.show('请输入正确的手机号', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		await cache.SaveToFile(config.ToolOfferInfoKey, this.state);
		this.props.navigation.navigate('createOfferImg');
	};

	//实时更新状态、缓存中用户输入的公司名
	_initCompanyShort = async text => {
		this.setState({ companyshort: text });
	};
	//实时更新状态、缓存中用户输入的手机号
	_initMobile = async text => {
		this.setState({ mobile: text });
	};
	//实时更新状态、缓存中用户输入的备注
	_initRemark = async text => {
		this.setState({ remark: text });
	};

	/**
	 * 输入值控制
	 *
	 * @memberof UpdataInfo
	 */
	setValue = text => {
		let value = text;
		if (this.state.isIOSNine) {
			if (text.length >= 40) {
				value = text.substr(0, 40);
			}
		}
		this.setState({ remark: value });
	};
	/**
	 * 文本输入视图
	 *
	 * @returns
	 * @memberof OfferMain
	 */
	inputView = () => {
		if (this.state.isIOSNine) {
			return (
				<TextInput
					style={{ height: 60 }}
					onChangeText={text => {
						this.setValue(text);
					}}
					value={this.state.remark}
					placeholder="备注(40个字符以内)"
					placeholderTextColor="#808080"
					autoFocus={false}
					multiline={true}
					maxLength={40}
					underlineColorAndroid="transparent"
				/>
			);
		}

		return (
			<TextInput
				style={{ height: 60 }}
				onChangeText={this._initRemark}
				value={this.state.remark}
				placeholder="备注(40个字符以内)"
				placeholderTextColor="#808080"
				autoFocus={false}
				multiline={true}
				maxLength={40}
				underlineColorAndroid="transparent"
			/>
		);
	};

	render() {
		if (this.state.list.length > 0) {
			return (
				<ScrollView style={{ backgroundColor: '#fff' }} keyboardShouldPersistTaps={'handled'}>
					<View
						style={{
							flex: 1,
							backgroundColor: '#FFF',
							flexDirection: 'column',
							marginTop: 5
						}}
					>
						<View
							style={{
								height: 50,
								backgroundColor: '#FFF',
								flexDirection: 'column'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									paddingTop: 5,
									paddingBottom: 5,
									paddingRight: 5,
									paddingLeft: 10
								}}
							>
								<Text style={{ flex: 1 }}>公司名</Text>
								<View
									style={{
										flex: 4,
										borderBottomColor: '#F2F2F2',
										borderBottomWidth: 1
									}}
								>
									<TextInput
										style={{ padding: 0 }}
										onChangeText={this._initCompanyShort}
										value={this.state.companyshort}
										placeholder="输入公司名"
										placeholderTextColor="#808080"
										autoFocus={false}
										underlineColorAndroid="transparent"
									/>
								</View>
							</View>
							<View
								style={{
									height: 1,
									backgroundColor: '#F2F2F2',
									marginVertical: 5
								}}
							/>
						</View>
						<View
							style={{
								height: 50,
								backgroundColor: '#FFF',
								flexDirection: 'column'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									paddingTop: 5,
									paddingBottom: 5,
									paddingRight: 5,
									paddingLeft: 10
								}}
							>
								<Text style={{ flex: 1 }}>手机号</Text>
								<View
									style={{
										flex: 4,
										borderBottomColor: '#F2F2F2',
										borderBottomWidth: 1
									}}
								>
									<TextInput
										style={{ padding: 0 }}
										onChangeText={this._initMobile}
										keyboardType="numeric"
										value={this.state.mobile}
										placeholder="输入手机号"
										placeholderTextColor="#808080"
										autoFocus={false}
										underlineColorAndroid="transparent"
									/>
								</View>
							</View>
							<View
								style={{
									height: 1,
									backgroundColor: '#F2F2F2',
									marginVertical: 5
								}}
							/>
						</View>
						<View
							style={{
								backgroundColor: '#FFF',
								flexDirection: 'column'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									paddingTop: 5,
									paddingBottom: 5,
									paddingRight: 5,
									paddingLeft: 10
								}}
							>
								<View
									style={{
										flex: 5,
										borderBottomColor: '#F2F2F2',
										borderBottomWidth: 1
									}}
								>
									{this.inputView()}
								</View>
							</View>
							<View
								style={{
									height: 1,
									backgroundColor: '#F2F2F2',
									marginVertical: 5
								}}
							/>
						</View>
						{this.state.list.map((item, index) => {
							return (
								<View
									key={item.key}
									style={{
										backgroundColor: '#FFF',
										flexDirection: 'column',
										// 全体边框宽度
										borderWidth: 1,
										// 全体边框颜色
										borderColor: '#F2F2F2',
										marginHorizontal: 10
									}}
								>
									<View
										style={{
											flexDirection: 'row',
											backgroundColor: '#F2F2F2',
											paddingVertical: 5,
											paddingHorizontal: 10
										}}
									>
										<Text
											style={{
												flex: 1,
												alignItems: 'flex-start'
											}}
										>
											序号:
										</Text>
										<Text
											style={{
												flex: 6,
												alignItems: 'flex-start'
											}}
										>
											{index + 1}
										</Text>
										<TouchableHighlight
											onPress={() => {
												Alert.alert(
													'',
													'是否确认删除',
													[
														{
															text: '取消',
															onPress: () => {},
															style: 'cancel'
														},
														{
															text: '删除',
															onPress: async () => {
																this._onDelOffer(item);
															}
														}
													],
													{ cancelable: true }
												);
											}}
											activeOpacity={1}
											underlayColor={'#F2F2F2'}
										>
											<View
												style={{
													flex: 4,
													alignItems: 'flex-end'
												}}
											>
												<Icon name="ios-trash-outline" size={22} color={'#ccc'} />
											</View>
										</TouchableHighlight>
									</View>
									<View
										style={{
											flexDirection: 'column',
											paddingHorizontal: 10
										}}
									>
										<View
											style={{
												flexDirection: 'row',
												paddingTop: 6
											}}
										>
											<Text
												style={{
													flex: 1,
													alignItems: 'flex-start'
												}}
											>
												钢厂:
											</Text>
											<Text
												style={{
													flex: 3,
													alignItems: 'flex-start',
													color: '#333'
												}}
												numberOfLines={1}
											>
												{item.stname}
											</Text>
											<Text
												style={{
													flex: 1,
													alignItems: 'flex-start'
												}}
											>
												品名:
											</Text>
											<Text
												style={{
													flex: 3,
													alignItems: 'flex-start',
													color: '#333'
												}}
												numberOfLines={1}
											>
												{item.tname}
											</Text>
										</View>
										<View
											style={{
												flexDirection: 'row',
												paddingTop: 6
											}}
										>
											<Text
												style={{
													flex: 1,
													alignItems: 'flex-start'
												}}
											>
												规格:
											</Text>
											<Text
												style={{
													flex: 3,
													alignItems: 'flex-start',
													color: '#333'
												}}
												numberOfLines={1}
											>
												{item.standard}
											</Text>
											<Text
												style={{
													flex: 1,
													alignItems: 'flex-start'
												}}
											>
												单价:
											</Text>
											<Text
												style={{
													flex: 3,
													alignItems: 'flex-start',
													color: '#333'
												}}
												numberOfLines={1}
											>
												{item.price}
											</Text>
										</View>
										<View
											style={{
												flexDirection: 'row',
												paddingVertical: 6
											}}
										>
											<Text
												style={{
													flex: 1,
													alignItems: 'flex-start'
												}}
											>
												库房:
											</Text>
											<Text
												style={{
													flex: 3,
													alignItems: 'flex-start',
													color: '#333'
												}}
												numberOfLines={1}
											>
												{item.sname}
											</Text>
											<Text
												style={{
													flex: 1,
													alignItems: 'flex-start'
												}}
											/>
											<Text
												style={{
													flex: 3,
													alignItems: 'flex-start'
												}}
											/>
										</View>
									</View>
								</View>
							);
						})}
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={'#FFF'}
							onPress={this._onCreateOfferImg}
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
									backgroundColor: '#4BC1D2',
									justifyContent: 'center',
									alignItems: 'center',
									height: 40,
									borderRadius: 5
								}}
							>
								<Text style={{ color: '#FFF' }}>生成图片</Text>
							</View>
						</TouchableHighlight>
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center',
								padding: 5
							}}
						>
							<Text>制作完成，可生成报价单图片</Text>
						</View>
					</View>
				</ScrollView>
			);
		} else {
			return (
				<ScrollView style={{ backgroundColor: '#fff' }} keyboardShouldPersistTaps={'handled'}>
					<View
						style={{
							flex: 1,
							backgroundColor: '#FFF',
							flexDirection: 'column',
							marginTop: 5
						}}
					>
						<View
							style={{
								height: 50,
								backgroundColor: '#FFF',
								flexDirection: 'column'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									paddingTop: 5,
									paddingBottom: 5,
									paddingRight: 5,
									paddingLeft: 10
								}}
							>
								<Text style={{ flex: 1 }}>公司名</Text>
								<View
									style={{
										flex: 4,
										borderBottomColor: '#F2F2F2',
										borderBottomWidth: 1
									}}
								>
									<TextInput
										style={{ padding: 0 }}
										onChangeText={this._initCompanyShort}
										value={this.state.companyshort}
										placeholder="输入公司名"
										placeholderTextColor="#808080"
										autoFocus={false}
										underlineColorAndroid="transparent"
									/>
								</View>
							</View>
							<View
								style={{
									height: 1,
									backgroundColor: '#F2F2F2',
									marginVertical: 5
								}}
							/>
						</View>
						<View
							style={{
								height: 50,
								backgroundColor: '#FFF',
								flexDirection: 'column'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									paddingTop: 5,
									paddingBottom: 5,
									paddingRight: 5,
									paddingLeft: 10
								}}
							>
								<Text style={{ flex: 1 }}>手机号</Text>
								<View
									style={{
										flex: 4,
										borderBottomColor: '#F2F2F2',
										borderBottomWidth: 1
									}}
								>
									<TextInput
										style={{ padding: 0 }}
										onChangeText={this._initMobile}
										keyboardType="numeric"
										value={this.state.mobile}
										placeholder="输入手机号"
										placeholderTextColor="#808080"
										autoFocus={false}
										underlineColorAndroid="transparent"
									/>
								</View>
							</View>
							<View
								style={{
									height: 1,
									backgroundColor: '#F2F2F2',
									marginVertical: 5
								}}
							/>
						</View>
						<View
							style={{
								backgroundColor: '#FFF',
								flexDirection: 'column'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									paddingTop: 5,
									paddingBottom: 5,
									paddingRight: 5,
									paddingLeft: 10
								}}
							>
								<View
									style={{
										flex: 5,
										borderBottomColor: '#F2F2F2',
										borderBottomWidth: 1
									}}
								>
									{this.inputView()}
								</View>
							</View>
							<View
								style={{
									height: 1,
									backgroundColor: '#F2F2F2',
									marginVertical: 5
								}}
							/>
						</View>
					</View>
				</ScrollView>
			);
		}
	}
}
