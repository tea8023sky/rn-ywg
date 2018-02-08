import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	Image,
	View,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Dimensions,
	ScrollView,
	Alert,
	Keyboard
} from 'react-native';
import Header from '../../header';
import skin from '../../../style';
import image from '../../../logic/image';
import event from '../../../logic/event';
import net from '../../../logic/net';
import regular from '../../../logic/regular';
import cache from '../../../logic/cache';
import PageHelper from '../../../logic/pageHelper';
import config from '../../../config';
import TimeUtil from '../../../logic/TimeUtil';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/Ionicons';
//获取屏幕宽高
let { width, height } = Dimensions.get('window');

//选择类型 钢厂 品名 规格
export class SelectType {
	static Steel = 'Steel'; //钢厂
	static Trade = 'Trade'; //品名
	static Standard = 'Standard'; // 规格

	static TradeByType = 'TradeByType'; //板材 型材 管材 获取品名
	static WeightProperty = 'WeightProperty'; //板材 型材 管材 属性值选择
	static Kvalue = 'Kvalue'; //K值选择
}

/**
 * 建材计算器
 *
 * @author NongHuaQiang
 * @export
 * @class JCMain
 * @extends {Component}
 */
export default class JCMain extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '建材计算器',
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
			headerRight: <View />
		};
	};
	constructor(props) {
		super(props);
		this.state = {
			steel: {}, //钢厂
			trade: {}, //品名
			standard: {}, //规格
			lizhongVals: {}, //理重对象
			lizhong: '', //理重值
			lizhongIsFocus: false,
			inputCount: '', //件数
			Weight: '', //重量
			inputCountIsFocus: false,
			WeightIsFocus: false,
			totalnum: '',
			totalweight: ''
		};
		this.nav = this.props.navigation;
		PageHelper.pushPageKey('jcMain', this.nav.state.key);
		this.TotalData = {
			totalnum: '0',
			totalweight: '0',
			datas: []
		}; //总计数据
	}

	//组件初始化完毕
	componentDidMount() {
		this.GetLastData();
		this.GetTotalData();
		//订阅用户修改圈子事件,以便刷新界面数据
		event.Sub(this, event.Events.tool.steelSelect, this.steelSelected);
		event.Sub(this, event.Events.tool.tradeSelect, this.tradeSelected);
		event.Sub(this, event.Events.tool.standardSelect, this.standardSelected);
		event.Sub(this, event.Events.tool.clearTotalData, this.clearTotalDataed);
		this.props.navigation.setParams({ goBackPage: this._goBackPage });
	}

	//返回到上一页
	_goBackPage = async () => {
		Keyboard.dismiss();
		this.nav.goBack();
	};

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		//移除用户修改圈子事件订阅
		event.UnSub(this);
	}

	//选择钢厂
	_onPressSteel = () => {
		this.nav.navigate('jcSelect', { title: '选择钢厂', type: SelectType.Steel, steel: this.state.steel });
	};

	//选择品名
	_onPressTrade = () => {
		if (this.state.steel.id) {
			this.nav.navigate('jcSelect', {
				title: '选择品名',
				type: SelectType.Trade,
				stid: this.state.steel.id,
				trade: this.state.trade
			});
		} else {
			Toast.show('请选择钢厂', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};
	//选择规格
	_onPressStandard = () => {
		if (this.state.steel.id) {
			if (this.state.trade.id) {
				this.nav.navigate('jcSelect', {
					title: '选择规格',
					type: SelectType.Standard,
					stid: this.state.steel.id,
					tid: this.state.trade.id,
					standard: this.state.standard
				});
			} else {
				Toast.show('请选择品名', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		} else {
			Toast.show('请选择钢厂', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	//加入累计
	_onPressAddTotal = () => {
		if (!this.state.steel.id) {
			Toast.show('请选择钢厂', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (!this.state.trade.id) {
			Toast.show('请选择品名', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (!this.state.standard.id) {
			Toast.show('请选择规格', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (this.state.lizhongVals.lizhong === null || isNaN(this.state.lizhongVals.lizhong)) {
			Alert.alert('没有找到理重，请联系客服!');
			return;
		}
		if (this.state.lizhong.length == 0) {
			Toast.show('请输入理重', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (isNaN(this.state.lizhong)) {
			Toast.show('请输入正确的理重', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (this.state.inputCount.length == 0) {
			Toast.show('请输入件数', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (isNaN(this.state.inputCount)) {
			Toast.show('请输入正确的件数', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		} else {
			if (this.state.inputCount.indexOf('.') > 0) {
				Toast.show('件数应该为整数', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				return;
			}
		}
		if (parseInt(this.state.inputCount) === 0) {
			Toast.show('请输入大于0的件数', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (isNaN(this.state.Weight)) {
			Toast.show('请输入正确的理论重量', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		this.SaveTotalData();
	};

	//查看累计
	_onPressViewTotal = () => {
		this.nav.navigate('totalListView', { type: 0 });
	};

	//选择钢厂后返回的数据
	steelSelected = (steel) => {
		this.setState({
			steel: steel,
			trade: {},
			standard: {},
			lizhong: '',
			inputCount: '',
			Weight: ''
		});
		//this.state.steel = steel;
	};
	//选择品名后返回的数据
	tradeSelected = (trade) => {
		//this.state.trade = trade;
		this.setState({
			trade: trade,
			standard: {},
			lizhong: '',
			inputCount: '',
			Weight: ''
		});
	};

	//选择规格后返回的数据
	standardSelected = (standard) => {
		//this.state.standard = standard;
		this.setState({
			standard: standard,
			lizhong: '',
			inputCount: '',
			Weight: ''
		});
		this.GetLizhongVals(standard); //获取理重值
	};
	//累计详情页清空累计后更新界面
	clearTotalDataed = (TotalData) => {
		if (TotalData) {
			this.TotalData.totalnum = TotalData.totalnum;
			this.TotalData.totalweight = TotalData.totalweight;
			this.TotalData.datas = TotalData.datas;
			this.setState({ totalnum: TotalData.totalnum, totalweight: TotalData.totalweight });
		} else {
			this.TotalData.totalnum = '0';
			this.TotalData.totalweight = '0';
			this.TotalData.datas = [];
			this.setState({ totalnum: '0', totalweight: '0' });
		}
	};

	//获取理重值
	async GetLizhongVals(standard) {
		let result = await _getLizhongVals(this.state.steel.id, this.state.trade.id, standard.id);
		if (result) {
			this.setState({ lizhongVals: result[0], lizhong: result[0].lizhong + '' });
			let lastdata = {
				steel: this.state.steel,
				trade: this.state.trade,
				standard: standard,
				lizhongVals: result[0]
			};

			cache.SaveToFile(config.ToolJCLastLzDatakey, lastdata);
		}
	}

	/**
	 * 获取最后选择的数据
	 *
	 * @author NongHuaQiang
	 * @memberof JCMain
	 */
	async GetLastData() {
		let result = await cache.LoadFromFile(config.ToolJCLastLzDatakey);
		if (result) {
			this.setState({
				steel: result.steel,
				trade: result.trade,
				standard: result.standard,
				lizhongVals: result.lizhongVals,
				lizhong: result.lizhongVals.lizhong + ''
			});
		}
	}

	/**
	 * 添加到累计数据缓存
	 *
	 * @author NongHuaQiang
	 * @memberof JCMain
	 */
	SaveTotalData() {
		if (!this.TotalData.lasttime) {
			//第一次加入累计
			this.TotalData.lasttime = this.state.lizhongVals.uptime;
			this.TotalData.totalnum = this.state.inputCount;
			this.TotalData.totalweight = this.state.Weight;
			this.TotalData.datas = [];
			this.TotalData.datas.push({
				no: 1,
				steelv: this.state.steel.name,
				trade: this.state.trade.name,
				standard: this.state.standard.content,
				num: this.state.inputCount,
				weight: this.state.Weight,
				tag: this.state.steel.id + '_' + this.state.trade.id + '_' + this.state.standard.id
			});
		} else {
			if (this.TotalData.datas.length >= 40) {
				Toast.show('最多能添加40条数据', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});

				return;
			}
			this.TotalData.lasttime = this.state.lizhongVals.uptime;
			this.TotalData.totalnum = parseInt(this.TotalData.totalnum) + parseInt(this.state.inputCount);
			this.TotalData.totalweight = TimeUtil.getFloat(
				parseFloat(this.TotalData.totalweight) + parseFloat(this.state.Weight),
				3
			);
			let isadd = false;
			//合并相同数据
			for (let i = 0; i < this.TotalData.datas.length; i++) {
				if (
					this.TotalData.datas[i].tag ==
					this.state.steel.id + '_' + this.state.trade.id + '_' + this.state.standard.id
				) {
					this.TotalData.datas[i].num =
						parseInt(this.TotalData.datas[i].num) + parseInt(this.state.inputCount);
					this.TotalData.datas[i].weight = TimeUtil.getFloat(
						parseFloat(this.TotalData.datas[i].weight) + parseFloat(this.state.Weight),
						3
					);
					isadd = true;
					break;
				}
			}
			//如果没有相同数据,在末尾添加
			if (!isadd) {
				this.TotalData.datas.push({
					no: 1,
					steelv: this.state.steel.name,
					trade: this.state.trade.name,
					standard: this.state.standard.content,
					num: this.state.inputCount,
					weight: this.state.Weight,
					tag: this.state.steel.id + '_' + this.state.trade.id + '_' + this.state.standard.id
				});
			}
		}
		if (this.TotalData) {
			this.setState({ totalnum: this.TotalData.totalnum, totalweight: this.TotalData.totalweight });
			cache.SaveToFile(config.ToolCalculationKey, this.TotalData);
		}
	}

	/**
	 * 读取累计数据
	 *
	 * @author NongHuaQiang
	 * @memberof JCMain
	 */
	async GetTotalData() {
		let result = await cache.LoadFromFile(config.ToolCalculationKey);
		if (result) {
			this.TotalData = result;
			this.setState({ totalnum: result.totalnum, totalweight: result.totalweight });
		} else {
			this.setState({ totalnum: '0', totalweight: '0' });
		}
	}

	//理重文本框变化处理
	_onChangelizhong = (text) => {
		if (text.length == 0) {
			//文本框被清空后
			this.setState({ lizhong: text, inputCount: '', Weight: '' });
			//Keyboard.dismiss(); //隐藏键盘
		}
		if(parseFloat(text)<0){
			this.setState({ lizhong: '', inputCount: '', Weight: '' });
		} else {
			if (text.indexOf('.') > 0) {
				let len = text.length - text.indexOf('.');
				if (len > 4) {
					text = text.substring(0, text.indexOf('.') + 5);
				}
			}
			this.setState({ lizhong: text + '', inputCount: '', Weight: '' });
		}
	};

	//理重文本框获取焦点处理
	_onFocuslizhong = () => {
		this.setState({
			lizhongIsFocus: true,
			inputCountIsFocus: false,
			WeightIsFocus: false
		});
	};
	//理重文本框失去焦点处理
	_onBlurlizhong = () => {
		//this.setState({ lizhongIsFocus: false });
	};
	//清空理重值
	_onClearlizhong = () => {
		this.setState({ lizhong: '', inputCount: '', Weight: '' });
	};

	//输入件数
	_onChangeInputCount = (text) => {
		if (this.state.lizhong.length == 0) {
			return;
		}
		if (text.length > 0) {
			if (isNaN(this.state.lizhong) || isNaN(text)) {
				this.setState({ inputCount: '', Weight: '' });
				return;
			}
			if (this.state.lizhong==0) {
				this.setState({ inputCount: '', Weight: '' });
				return;
			}
			if(parseFloat(text)<0){
				this.setState({ inputCount: '', Weight: '' });
				return;
			}
			if (regular.IsInteger(text)) {
				if (text.length > 10) {
					text = text.substring(0, 10);
				}
				let total = parseFloat(this.state.lizhong) * parseInt(text);
				total = TimeUtil.getFloat(total, 3);
				this.setState({ inputCount: text, Weight: total + '' });
			} else {
				Toast.show('请输入大于0且是整数的件数', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				this.setState({ inputCount: text, Weight: '' });
			}
		} else {
			this.setState({ inputCount: '', Weight: '' });
		}
	};
	_onFocusInputCount = () => {
		this.setState({
			lizhongIsFocus: false,
			inputCountIsFocus: true,
			WeightIsFocus: false
		});
	};
	_onClearInputCount = () => {
		this.setState({ inputCount: '', Weight: '' });
	};

	//总重量
	_onChangeWeight = (text) => {
		if (this.state.lizhong.length == 0) {
			return;
		}
		if (text.length > 0) {
			if (isNaN(this.state.lizhong) || isNaN(text)) {
				this.setState({ inputCount: '', Weight: '' });
				return;
			}
			if (this.state.lizhong==0) {
				this.setState({ inputCount: '', Weight: '' });
				return;
			}
			if(parseFloat(text)<0 ){
				this.setState({ inputCount: '', Weight: '' });
				return;
			}
			if (text.length > 16) {
				text = text.substring(0, 16);
			}
			if (text.indexOf('.') > 0) {
				let len = text.length - text.indexOf('.');
				if (len > 4) {
					text = text.substring(0, text.indexOf('.') + 5);
				}
			}
			let count = parseFloat(text) / parseFloat(this.state.lizhong);
			this.setState({ inputCount: Math.floor(count) + '', Weight: text });
		} else {
			this.setState({ inputCount: '', Weight: '' });
		}
	};
	_onFocusWeight = () => {
		this.setState({
			lizhongIsFocus: false,
			inputCountIsFocus: false,
			WeightIsFocus: true
		});
	};
	_onClearWeight = () => {
		this.setState({ inputCount: '', Weight: '' });
	};
	render() {
		return (
			<ScrollView keyboardShouldPersistTaps="handled">
				<View style={{ backgroundColor: '#fff', height: height - 60 }}>
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
								{this.state.steel.name}
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
								{this.state.trade.name}
							</Text>
							<Image style={{ width: 16, height: 16, paddingRight: 10 }} source={image.tool.next} />
						</View>
					</TouchableWithoutFeedback>
					<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />
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
								{this.state.standard.content}
							</Text>
							<Image style={{ width: 16, height: 16, paddingRight: 10 }} source={image.tool.next} />
						</View>
					</TouchableWithoutFeedback>
					<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />

					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-end',
							alignItems: 'center',
							height: 60,
							padding: 10
						}}
					>
						<Text style={{ color: '#999999', fontSize: 14, flex: 1.5 }}>理重</Text>
						<View
							style={{
								flex: 8,
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								padding: 0,
								borderColor: '#f3f3f3',
								borderWidth: 1,
								borderRadius: 5
							}}
						>
							<TextInput
								underlineColorAndroid="transparent"
								keyboardType="numeric"
								onChangeText={this._onChangelizhong}
								onFocus={this._onFocuslizhong}
								//onBlur={this._onBlurlizhong}
								value={this.state.lizhong}
								style={{
									color: '#999999',
									fontSize: 14,
									flex: 8,
									height: 32,
									textAlign: 'center',
									padding: 0
								}}
							/>
							{this.state.lizhongIsFocus && this.state.lizhong.length > 0 ? (
								<TouchableWithoutFeedback onPress={this._onClearlizhong}>
									<View
										style={{
											width: 40,
											height: 40,
											padding: 0,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Image style={{ width: 16, height: 16 }} source={image.tool.close} />
									</View>
								</TouchableWithoutFeedback>
							) : (
								<View
									style={{
										width: 40,
										height: 40,
										padding: 0,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								/>
							)}
						</View>

						<Text style={{ fontSize: 12, color: '#5C5C5C', padding: 10 }}>
							{this.state.trade ? this.state.trade.weightunit : ''}
						</Text>
					</View>

					<View
						style={{
							backgroundColor: '#F8F8F8',
							padding: 0,
							paddingBottom: 12,
							paddingTop: 12,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text style={{ color: '#808080', fontSize: 14 }}>
							{this.state.lizhongVals.uptime ? (
								'最后更新' + TimeUtil.getTime(this.state.lizhongVals.uptime, 'yyyy-MM-dd hh:mm:ss')
							) : (
								''
							)}
						</Text>
					</View>

					<View
						style={{
							height: 60,
							padding: 10
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								borderColor: '#f3f3f3',
								borderWidth: 1,
								borderRadius: 5
							}}
						>
							<TextInput
								underlineColorAndroid="transparent"
								keyboardType="numeric"
								onChangeText={this._onChangeInputCount}
								onFocus={this._onFocusInputCount}
								//onBlur={this._onBlurlizhong}
								value={this.state.inputCount}
								style={{
									color: '#5c5c5c',
									fontSize: 16,
									flex: 8,
									height: 32,
									textAlign: 'center',
									padding: 0
								}}
							/>
							{this.state.inputCountIsFocus && this.state.inputCount.length > 0 ? (
								<TouchableWithoutFeedback onPress={this._onClearInputCount}>
									<View
										style={{
											width: 40,
											height: 40,
											padding: 0,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Image style={{ width: 16, height: 16 }} source={image.tool.close} />
									</View>
								</TouchableWithoutFeedback>
							) : (
								<View
									style={{
										width: 40,
										height: 40,
										padding: 0,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								/>
							)}
						</View>
					</View>

					<View style={{ flexDirection: 'row', padding: 10, paddingTop: 0, paddingBottom: 0 }}>
						<Text style={{ flex: 1, color: '#FF8080', fontSize: 14, textAlign: 'left' }}>整件不拆零</Text>
						<Text style={{ flex: 1, color: '#999999', fontSize: 14, textAlign: 'right' }}>理论件数(件)</Text>
					</View>

					<View
						style={{
							padding: 0,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						{this.state.WeightIsFocus ? (
							<Image style={{ width: 38, height: 38 }} source={image.tool.cup} />
						) : (
							<Image style={{ width: 38, height: 38 }} source={image.tool.cdown} />
						)}
					</View>

					<View
						style={{
							height: 60,
							padding: 10
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								borderColor: '#f3f3f3',
								borderWidth: 1,
								borderRadius: 5
							}}
						>
							<TextInput
								underlineColorAndroid="transparent"
								keyboardType="numeric"
								onChangeText={this._onChangeWeight}
								onFocus={this._onFocusWeight}
								//onBlur={this._onBlurlizhong}
								value={this.state.Weight}
								style={{
									color: '#5c5c5c',
									fontSize: 16,
									flex: 8,
									height: 32,
									textAlign: 'center',
									padding: 0
								}}
							/>
							{this.state.WeightIsFocus && this.state.Weight.length > 0 ? (
								<TouchableWithoutFeedback onPress={this._onClearWeight}>
									<View
										style={{
											width: 40,
											height: 40,
											padding: 0,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Image style={{ width: 16, height: 16 }} source={image.tool.close} />
									</View>
								</TouchableWithoutFeedback>
							) : (
								<View
									style={{
										width: 40,
										height: 40,
										padding: 0,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								/>
							)}
						</View>
					</View>

					<View style={{ flexDirection: 'row', padding: 10, paddingTop: 0 }}>
						<Text style={{ flex: 1, color: '#999999', fontSize: 14, textAlign: 'right' }}>理论重量(吨)</Text>
					</View>

					<View style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8 }}>
						<TouchableHighlight
							activeOpacity={0.5}
							underlayColor={'#4bc1d2aa'}
							onPress={this._onPressAddTotal}
						>
							<View
								style={{
									backgroundColor: '#4bc1d2',
									borderRadius: 4,
									height: 32,
									justifyContent: 'center'
								}}
							>
								<Text style={{ color: '#fff', fontSize: 14, textAlign: 'center', padding: 4 }}>
									加入累计
								</Text>
							</View>
						</TouchableHighlight>
					</View>

					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							paddingLeft: 10,
							paddingRight: 10,
							paddingTop: 4,
							paddingBottom: 4
						}}
					>
						<Text style={{ color: '#5c5c5c', fontSize: 12, textAlign: 'center' }}>当前累计:</Text>
						<Text style={{ color: '#FFA858', fontSize: 12, textAlign: 'center', paddingLeft: 10 }}>
							{this.state.totalnum}
						</Text>
						<Text style={{ color: '#FFA858', fontSize: 12, textAlign: 'center' }}>件 </Text>
						<Text style={{ color: '#FFA858', fontSize: 12, textAlign: 'center', paddingLeft: 20 }}>
							{this.state.totalweight}
						</Text>
						<Text style={{ color: '#FFA858', fontSize: 12, textAlign: 'center' }}>吨</Text>
					</View>
					<TouchableWithoutFeedback onPress={this._onPressViewTotal}>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								padding: 10
							}}
						>
							<Text style={{ color: '#4bc1d2', fontSize: 16, textAlign: 'center' }}>点击查看累计列表</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</ScrollView>
		);
	}
}

/*获取理重
*stid 钢厂id
*tid 品名id
sid 规格id
*/
let _getLizhongVals = async function(stid, tid, sid) {
	let result = await net.ApiPost('tools', 'GetLizhongVals', {
		stid: stid,
		tid: tid,
		sid: sid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};
