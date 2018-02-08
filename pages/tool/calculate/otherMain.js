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
import config from '../../../config';
import TimeUtil from '../../../logic/TimeUtil';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/Ionicons';
import { SelectType } from './jcMain';

//获取屏幕宽高
let { width, height } = Dimensions.get('window');

/**
 * 板材 型材 管材 计算器
 *
 * @author NongHuaQiang
 * @export
 * @class OtherMain
 * @extends {Component}
 */
export default class OtherMain extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: navigation.state.params.title,
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
			islaod: 0, //0 加载中 1加载成功  -1 加载失败
			tradeData: {},
			weigthPoperty: '', //isval==1  的属性值
			lizhong: '', //理重值
			lizhongIsFocus: false,
			Kvalue: '否',
			inputCount: '', //件数
			Weight: '', //重量
			inputCountIsFocus: false,
			WeightIsFocus: false,
			totalnum: '',
			totalweight: '',
			calcvalsText : [], //存文本框的text值
			uinputsText : []  //uinputs输入文本
		};
		this.nav = this.props.navigation;
		this.trade = this.nav.state.params.trade; //获取传过来的品名
		//this.tradeData = {};
		this.showvals = []; //输入值名称
		this.calcvals = []; //输入值表达式
		// this.calcvalsText = []; //存文本框的text值
		this.uinputs = { keys: [], values: [] }; //L长 W宽
		// this.uinputsText = []; //uinputs输入文本
		this.weightRgx = ''; //重量表达式 isval==0
		this.weightList = { keys: [], values: [] }; //重量列表 isval==1
		this.weightJson = {}; //weight Json格式
		//是否有K值 毛边板k值计算公式 "K":"(T*0.0003+1.0173)"
		this.IsK = this.nav.state.params.title.indexOf('毛边板') >= 0 ? true : false;
		this.K = 1;
		this.KValues = [ '是', '否' ]; //K值列表选择
		this.sumweightRex = ''; //计算总重量表达式
		this.sumnumRex = ''; //件数表达式
		this.TotalData = {
			totalnum: '0',
			totalweight: '0',
			datas: []
		}; //总计数据
	}

	//组件初始化完毕
	componentDidMount() {
		this.TradeByTidLoad();
		this.GetTotalData();
		//订阅用户修改圈子事件,以便刷新界面数据
		event.Sub(this, event.Events.tool.weightProperySelect, this.weightProperySelected);
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

	async TradeByTidLoad() {
		let result = await _getTradeByTid(this.trade.id);
		if (result) {
			this.showvals = result.showvals.split('\\t');
			this.calcvals = result.calcvals.split('\\t');
			// this.calcvalsText = new Array(this.calcvals.length);
			this.setState({calcvalsText:new Array(this.calcvals.length)});
			if (result.isval == 0) {
				this.weightRgx = result.weight;
			} else {
				try {
					let json = JSON.parse(result.weight);
					this.weightJson = json;
					for (let key in json) {
						this.weightList.keys.push(key); //属性值
						this.weightList.values.push(json[key]); //属性值对应的理重
					}
					if (this.weightList.keys.length > 0) {
						//初始化属性值和理重
						this.setState({ weigthPoperty: this.weightList.keys[0], lizhong: this.weightList.values[0] });
					}
				} catch (error) {}
			}

			if (result.uinputs) {
				//处理uinputs，提取 key value 值
				let json = JSON.parse(result.uinputs);
				for (let key in json) {
					this.uinputs.keys.push(key);
					this.uinputs.values.push(json[key]);
				}
				// this.uinputsText = new Array(this.uinputs.keys.length);
				this.setState({uinputsText:new Array(this.uinputs.keys.length)});
			}
			this.sumweightRex = result.sumweight;
			this.sumnumRex = result.sumnum;
			//this.state.tradeData = result;
			this.setState({ islaod: 1, tradeData: result }); //加载成功
		} else {
			this.setState({ islaod: -1 }); //加载失败
		}
	}
	//加入累计
	_onPressAddTotal = () => {
		if (this.state.tradeData.isval == 0) {
			let showvalserr = '';
			for (let i = 0; i < this.state.calcvalsText.length; i++) {
				try {
					if (this.state.calcvalsText[i].length > 0) {
						value = eval(this.state.calcvalsText[i]);
					} else {
						showvalserr = showvalserr + this.showvals[i] + ' ';
						continue;
					}
				} catch (error) {
					showvalserr = showvalserr + this.showvals[i] + ' ';
				}
			}
			if (showvalserr.length > 0) {
				Toast.show('请输入 ' + showvalserr, {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				return;
			}
		}
		let uinputserr = '';
		for (let i = 0; i < this.state.uinputsText.length; i++) {
			try {
				if (this.state.uinputsText[i].length > 0) {
					value = eval(this.state.uinputsText[i]);
				} else {
					uinputserr = uinputserr + this.uinputs.values[i] + ' ';
					continue;
				}
			} catch (error) {
				uinputserr = uinputserr + this.uinputs.values[i] + ' ';
			}
		}
		if (uinputserr.length > 0) {
			Toast.show('请输入 ' + uinputserr, {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
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
			if (parseInt(this.state.inputCount) === 0) {
				Toast.show('请输入大于0的件数', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				return;
			}
			if (this.state.inputCount.indexOf('.') > 0) {
				Toast.show('件数应该为整数', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				return;
			}
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

	/**
	 * 缓存数据
	 *
	 * @author NongHuaQiang
	 * @memberof OtherMain
	 */
	SaveTotalData() {
		if (this.TotalData && this.TotalData.datas && this.TotalData.datas.length >= 40) {
			Toast.show('最多能添加40条数据!', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		this.state.totalnum = parseInt(this.state.totalnum) + parseInt(this.state.inputCount);
		this.state.totalweight = TimeUtil.getFloat(
			parseFloat(this.state.totalweight) + parseFloat(this.state.Weight),
			3
		);
		this.TotalData.totalnum = this.state.totalnum;
		this.TotalData.totalweight = this.state.totalweight;
		let json = { trade: this.nav.state.params.title, num: this.state.inputCount, weight: this.state.Weight };
		if (this.state.tradeData.isval == 1) {
			json['standard'] = this.showvals[0] + '：' + this.state.weigthPoperty + '  ';
		} else {
			json['standard'] = '';
			for (let i = 0; i < this.showvals.length; i++) {
				json['standard'] = json['standard'] + this.showvals[i] + '：' + this.state.calcvalsText[i] + '  '+'  '+'  ';
			}
		}
		for (let i = 0; i < this.state.uinputsText.length; i++) {
			json['standard'] = json['standard'] + this.uinputs.values[i] + '：' + this.state.uinputsText[i] + '  '+'  '+'  ';
		}
		this.TotalData.datas.push(json);
		if (this.TotalData) {
			this.setState({ totalnum: this.state.totalnum + '', totalweight: this.state.totalweight + '' });
			cache.SaveToFile(config.ToolCalculationOtherKey, this.TotalData);
		}
	}
	//查看累计
	_onPressViewTotal = () => {
		this.nav.navigate('totalListView', { type: 1 });
	};

	/**
	 * 读取累计数据
	 *
	 * @author NongHuaQiang
	 * @memberof OtherMain
	 */
	async GetTotalData() {
		let result = await cache.LoadFromFile(config.ToolCalculationOtherKey);
		if (result) {
			this.TotalData = result;
			this.setState({ totalnum: result.totalnum, totalweight: result.totalweight });
		} else {
			this.setState({ totalnum: '0', totalweight: '0' });
		}
	}

	_onChange = (e) => {
		//
	};

	/**
	 * Showvals文本框变化事件
	 * 输入值替换成表达式并计算出理重值
	 */
	_onChangShowvals = (text) => {
		for (let i = 0; i < this.calcvals.length; i++) {
			let input = this.refs[this.calcvals[i]];
			let calcvalsTextVal=this.state.calcvalsText;
			if (input.isFocused()) {
				if (text.length == 0) {
					//文本框被清空后
					calcvalsTextVal[i]=text;
					this.setState({calcvalsText: calcvalsTextVal});
				}else if(parseFloat(text)<0){
					calcvalsTextVal[i]='';
					this.setState({calcvalsText: calcvalsTextVal});
				}else{
					if (text.indexOf('.') > 0) {
						let len = text.length - text.indexOf('.');
						if (len > 4) {
							text = text.substring(0, text.indexOf('.') + 5);
						}
					}
					calcvalsTextVal[i]= text +'';
					this.setState({calcvalsText: calcvalsTextVal});
				}
	
				// this.calcvalsText[i] = text;
				if (this.IsK && this.calcvals[i] == 'T') {
					if (this.state.Kvalue == '是') {
						try {
							this.K = eval(text * 0.0003 + 1.0173);
						} catch (error) {
							this.K = 1;
						}
					} else {
						this.K = 1;
					}
				}
				break;
			}
		}

		// this.weightRgx = this.weightRgx.replace(this.calcvals[i], text);
		let Reg = this.weightRgx;
		for (let i = 0; i < this.calcvals.length; i++) {
			if (this.state.calcvalsText[i]) {
				Reg = Reg.replace(this.calcvals[i], this.state.calcvalsText[i]);
			} else {
				break;
			}
			try {
				let value = eval(Reg);
				if (this.IsK && this.state.Kvalue == '是') {
					value = value * this.K;
				}

				this.setState({ lizhong: TimeUtil.getFloat(value, 3) + '', inputCount: '', Weight: '' });
			} catch (error) {}
		}
	};

	/**
	 * Uinputs 文本框变化事件
	 * 记录输入值text 到 uinputsText
	 */
	_onChangUinputs = (text) => {
		for (let i = 0; i < this.uinputs.keys.length; i++) {
			let input = this.refs[this.uinputs.keys[i]];
			let uinputsTextVal=this.state.uinputsText;
			if (input.isFocused()) {
				// this.uinputsText[i] = text;
				// this.setState({ inputCount: '', Weight: '' });
				// break;
				if (text.length == 0) {
					//文本框被清空后
					uinputsTextVal[i]=text;
					this.setState({uinputsText: uinputsTextVal, inputCount: '', Weight: '' });
					break;	
				}else if(parseFloat(text)<0){
					uinputsTextVal[i]='';
					this.setState({uinputsText: uinputsTextVal, inputCount: '', Weight: '' });
					break;
				}else{
					if (text.indexOf('.') > 0) {
						let len = text.length - text.indexOf('.');
						if (len > 4) {
							text = text.substring(0, text.indexOf('.') + 5);
						}
					}
					uinputsTextVal[i]= text +'';
					this.setState({uinputsText: uinputsTextVal, inputCount: '', Weight: '' });
					break;
					// this.setState({ lizhong: text + '', inputCount: '', Weight: '' });	
				}
			}
		}
	};

	//点击选择属性值
	_onPressWeightProperty = () => {
		this.nav.navigate('jcSelect', {
			title: this.showvals[0],
			type: SelectType.WeightProperty,
			data: this.weightList.keys,
			checkedValue:this.state.weigthPoperty
		});
	};
	//点击选择K值
	_onPressKvalue = () => {
		this.nav.navigate('jcSelect', {
			title: '选择K值',
			type: SelectType.Kvalue,
			data: this.KValues
		});
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

	//选择属性值返回数据
	weightProperySelected = (item) => {
		if (item.type == SelectType.WeightProperty) {
			this.setState({
				weigthPoperty: item.name,
				lizhong: this.weightJson[item.name],
				inputCount: '',
				Weight: ''
			});
		} else {
			let Reg = this.weightRgx;
			for (let i = 0; i < this.calcvals.length; i++) {
				if (this.state.calcvalsText[i]) {
					Reg = Reg.replace(this.calcvals[i], this.state.calcvalsText[i]);
				} else {
					break;
				}
				if (this.calcvals[i] == 'T') {
					//计算K值
					if (item.name == '是') {
						try {
							this.K = eval(this.state.calcvalsText[i] * 0.0003 + 1.0173);
						} catch (error) {
							this.K = 1;
						}
					} else {
						this.K = 1;
					}
				}
				try {
					let value = eval(Reg);

					value = value * this.K;

					this.setState({
						Kvalue: item.name,
						lizhong: TimeUtil.getFloat(value, 3) + '',
						inputCount: '',
						Weight: ''
					});
				} catch (error) {}
			}
		}
	};

	//理重文本框变化处理
	_onChangelizhong = (text) => {
		if (text.length == 0) {
			//文本框被清空后
			this.setState({ lizhong: text, inputCount: '', Weight: '' });
			//Keyboard.dismiss(); //隐藏键盘
		} else if(parseFloat(text)<0){
			this.setState({ lizhong: '', inputCount: '', Weight: '' });
		}else {
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

			if (text.length > 10) {
				text = text.substring(0, 10);
			}
			let Reg = this.sumweightRex;
			Reg = Reg.replace('weight', this.state.lizhong);
			Reg = Reg.replace('N', text);
			if (this.uinputs.keys.length > 0) {
				let error = '';
				for (let i = 0; i < this.uinputs.keys.length; i++) {
					if (this.state.uinputsText[i]) {
						Reg = Reg.replace(this.uinputs.keys[i], this.state.uinputsText[i]);
					} else {
						error = error + this.uinputs.values[i] + ' ';
					}
				}
				if (error.length > 0) {
					Toast.show('请输入' + error, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
					return;
				}
			}
			try {
				if (regular.IsInteger(text)) {
					let value = eval(Reg);
					value = TimeUtil.getFloat(value, 3);
					this.setState({ inputCount: text, Weight: value + '' });
				} else {
					Toast.show('请输入大于0且是整数的件数', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
					this.setState({ inputCount: text, Weight: '' });
				}
			} catch (error) {
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
				this.setState({ inputCount: '', Weight: text });
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

			let Reg = this.sumnumRex;
			Reg = Reg.replace('weight', this.state.lizhong);
			Reg = Reg.replace('total', text);

			if (this.uinputs.keys.length > 0) {
				for (let i = 0; i < this.uinputs.keys.length; i++) {
					Reg = Reg.replace(this.uinputs.keys[i], this.state.uinputsText[i]);
				}
			}
			try {
				let value = eval(Reg);
				this.setState({ inputCount: Math.floor(value) + '', Weight: text });
			} catch (error) {
				this.setState({ inputCount: '', Weight: text });
			}
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
		return this.state.islaod == 0 ? (
			<Text style={{ flex: 1, textAlign: 'center' }}>数据加载中</Text>
		) : this.state.islaod == 1 ? ( //数据加载成功
			<ScrollView keyboardShouldPersistTaps="handled">
				<View style={{ backgroundColor: '#fff', height: height }}>
					{this.state.tradeData.isval == 0 ? ( //showvals界面生成 isval==0生成输入框
						this.showvals.map((item, index) => {
							return (
								<View
									style={{
										flexDirection: 'column'
									}}
									key={item}
								>
									<View
										style={{
											flexDirection: 'row',
											padding: 5,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Text style={{ flex: 1, color: '#999999', fontSize: 14 }}>{item}</Text>
										<View
											style={{
												flex: 3,
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
												ref={this.calcvals[index]}
												underlineColorAndroid="transparent"
												keyboardType="numeric"
												placeholder="填写"
												placeholderTextColor="#ACACAC"
												//onChange={this._onChange}
												onChangeText={(text)=>this._onChangShowvals(text)}
												//onFocus={this._onFocuslizhong}
												//onBlur={this._onBlurlizhong}
												value={this.state.calcvalsText[index]}
												style={{
													flex: 1,
													color: '#5c5c5c',
													fontSize: 14,
													textAlign: 'center',
													padding: 0
												}}
											/>
										</View>
									</View>
									<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />
								</View>
							);
						})
					) : (
						//isval==1 生成选择框
						<View
							style={{
								flexDirection: 'column'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									padding: 10,
									height: 40,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Text style={{ flex: 1, color: '#999999', fontSize: 14 }}>规格属性名</Text>
								<Text style={{ flex: 1, color: '#5c5c5c', fontSize: 14, textAlign: 'right' }}>
									{this.showvals[0]}
								</Text>
							</View>
							<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />

							<View
								style={{
									flexDirection: 'row',
									padding: 10,
									height: 40,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Text style={{ flex: 1, color: '#999999', fontSize: 14 }}>规格属性值</Text>
								<TouchableWithoutFeedback onPress={this._onPressWeightProperty}>
									<View style={{ flex: 1, flexDirection: 'row' }}>
										<Text style={{ flex: 1, color: '#5c5c5c', fontSize: 14, textAlign: 'right' }}>
											{this.state.weigthPoperty}
										</Text>
										<Image
											style={{ width: 16, height: 16, paddingRight: 10 }}
											source={image.tool.next}
										/>
									</View>
								</TouchableWithoutFeedback>
							</View>
							<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />
						</View>
					)}

					{this.uinputs.values.map((item, index) => {
						//uinputs界面生成
						return (
							<View
								style={{
									flexDirection: 'column'
								}}
								key={item}
							>
								<View
									style={{
										flexDirection: 'row',
										padding: 10,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Text style={{ flex: 1, color: '#999999', fontSize: 14 }}>{item}</Text>
									<View
										style={{
											flex: 3,
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
											ref={this.uinputs.keys[index]}
											underlineColorAndroid="transparent"
											keyboardType="numeric"
											placeholder="填写"
											placeholderTextColor="#ACACAC"
											//onChange={this._onChange}
											onChangeText={this._onChangUinputs}
											//onFocus={this._onFocuslizhong}
											//onBlur={this._onBlurlizhong}
											value={this.state.uinputsText[index]}
											style={{
												flex: 1,
												color: '#5c5c5c',
												fontSize: 14,
												textAlign: 'center',
												padding: 0
											}}
										/>
									</View>
								</View>
								<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />
							</View>
						);
					})}

					{//K值处理
					this.IsK ? (
						<View
							style={{
								flexDirection: 'column'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									padding: 10,
									height: 40,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Text style={{ flex: 1, color: '#999999', fontSize: 14 }}>K值</Text>
								<TouchableWithoutFeedback onPress={this._onPressKvalue}>
									<View style={{ flex: 1, flexDirection: 'row' }}>
										<Text style={{ flex: 1, color: '#5c5c5c', fontSize: 14, textAlign: 'right' }}>
											{this.state.Kvalue}
										</Text>
										<Image
											style={{ width: 16, height: 16, paddingRight: 10 }}
											source={image.tool.next}
										/>
									</View>
								</TouchableWithoutFeedback>
							</View>
							<View style={{ height: 1, backgroundColor: '#f3f3f3' }} />
						</View>
					) : (
						<View style={{ height: 0 }} />
					)}
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
		) : (
			<Text style={{ flex: 1, textAlign: 'center' }}>数据加载失败</Text>
		);
	}
}

/*通过品名id获取品名数据
*
*tid 品名id
*/
let _getTradeByTid = async function(tid) {
	let result = await net.ApiPost('tools', 'GetTradeByTid', {
		tid: tid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};
