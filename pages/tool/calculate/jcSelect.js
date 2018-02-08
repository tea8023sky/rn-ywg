import React, { Component, PureComponent } from 'react';
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
	FlatList,
	Alert,
	Keyboard,
	Platform
} from 'react-native';
import Header from '../../header';
import skin from '../../../style';
import image from '../../../logic/image';
import net from '../../../logic/net';
import event from '../../../logic/event';
import Icon from 'react-native-vector-icons/Ionicons';
import { SelectType } from './jcMain';
//获取屏幕宽高
let { width, height } = Dimensions.get('window');

/**
 * 钢厂 品名 规格 选择界面
 *
 * @author NongHuaQiang
 * @export
 * @class JCSelect
 * @extends {Component}
 */
export default class JCSelect extends Component {
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
			list: [],
			searchKey: '',
			placeholder: '输入中文名称或拼音'
		};
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
		this.origindata = []; //原始数据，搜索用
	}

	//组件初始化完毕
	componentDidMount() {
		if (this.params.type == SelectType.Steel) {
			this.SteelLoaded();
		} else if (this.params.type == SelectType.Trade) {
			this.TradeLoaded();
		} else if (this.params.type == SelectType.Standard) {
			this.setState({ placeholder: '输入规格' });
			this.Standardoaded();
		} else if (this.params.type == SelectType.TradeByType) {
			//板材 型材 管材 获取品名
			this.getTradeByTypeLoaded();
		} else if (this.params.type == SelectType.WeightProperty || this.params.type == SelectType.Kvalue) {
			//属性值选择或K值选择
			let keys = this.params.data;
			let listdata = [];
			for (let i = 0; i < keys.length; i++) {
				if(this.params.checkedValue && this.params.checkedValue == keys[i]){
					listdata.push({ key: 'k' + keys[i], name: keys[i] , visible : true});
				}else{
					listdata.push({ key: 'k' + keys[i], name: keys[i] , visible : false});
				}
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
			if (this.params.type == SelectType.WeightProperty) {
				this.setState({ placeholder: '输入属性' });
			} else {
				this.setState({ placeholder: '' });
			}
		}
		this.props.navigation.setParams({ goBackPage: this._goBackPage });
	}
	//返回到上一页
	_goBackPage = async () => {
		Keyboard.dismiss();
		this.nav.goBack();
	};

	//搜索框变化处理
	_onChangeSearch = (text) => {
		let listdata = [];
		if (text.length > 0) {
			this.state.list = this.origindata; //还原原始数据
			if (
				this.params.type == SelectType.Steel ||
				this.params.type == SelectType.Trade ||
				this.params.type == SelectType.TradeByType
			) {
				//中文 拼音
				for (let i = 0; i < this.state.list.length; i++) {
					if (this.state.list[i].name.indexOf(text) >= 0 || this.state.list[i].pinyin.indexOf(text) >= 0) {
						listdata.push(this.state.list[i]);
					}
				}
			} else if (this.params.type == SelectType.Standard) {
				//content
				for (let i = 0; i < this.state.list.length; i++) {
					if (this.state.list[i].content.indexOf(text) >= 0) {
						listdata.push(this.state.list[i]);
					}
				}
			} else {
				//SelectType.WeightProperty  SelectType.Kvalue  name
				for (let i = 0; i < this.state.list.length; i++) {
					if (this.state.list[i].name.indexOf(text) >= 0) {
						listdata.push(this.state.list[i]);
					}
				}
			}
			this.setState({ list: listdata, searchKey: text });
		} else {
			this.setState({ list: this.origindata, searchKey: '' }); //还原原始数据
		}
	};

	//加载钢厂数据
	async SteelLoaded() {
		let listdata = await _getSteel();
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = 'k' + listdata[i].id;
				if (this.params.steel.id == listdata[i].id) {
					listdata[i].visible = true;
				} else {
					listdata[i].visible = false;
				}
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
			//this.flatList.scrollToIndex({ viewPosition: 0, index: 5 }); //滚动到第一页
		}
	}
	//加载品名
	async TradeLoaded() {
		let listdata = await _getTrade(this.params.stid);
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = 'k' + listdata[i].id;
				if (this.params.trade.id == listdata[i].id) {
					listdata[i].visible = true;
				} else {
					listdata[i].visible = false;
				}
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}

	//加载通过type获取品名
	async getTradeByTypeLoaded() {
		let listdata = await _getTradeByType(this.params.typeid);
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = 'k' + listdata[i].id;
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}

	//加载规格
	async Standardoaded() {
		let listdata = await _getStandard(this.params.stid, this.params.tid);
		if (listdata != null) {
			for (let i in listdata) {
				listdata[i].key = 'k' + listdata[i].id;
				if (this.params.standard.id == listdata[i].id) {
					listdata[i].visible = true;
				} else {
					listdata[i].visible = false;
				}
			}
			this.setState({ list: listdata });
			this.origindata = listdata;
		}
	}

	ItemPress = (item) => {
		Keyboard.dismiss();
		if (this.params.type == SelectType.Steel) {
			//钢厂选择
			event.Send(event.Events.tool.steelSelect, item);
			this.nav.goBack();
		} else if (this.params.type == SelectType.Trade) {
			//品名选择
			event.Send(event.Events.tool.tradeSelect, item);
			this.nav.goBack();
		} else if (this.params.type == SelectType.Standard) {
			//规格选择
			event.Send(event.Events.tool.standardSelect, item);
			this.nav.goBack();
		} else if (this.params.type == SelectType.TradeByType) {
			//板材 型材 管材 品名选择
			this.nav.navigate('otherMain', { title: item.name, trade: item });
		} else if (this.params.type == SelectType.WeightProperty || this.params.type == SelectType.Kvalue) {
			//属性选择和K值选择
			item.type = this.params.type;
			event.Send(event.Events.tool.weightProperySelect, item);
			this.nav.goBack();
		}
	};

	//模板选择
	createListItem = ({ item }) => {
		return <ListdatatItem ItemPress={this.ItemPress} data={item} type={this.params.type} />;
	};

	render() {
		return (
			<View style={{ backgroundColor: '#f3f3f3' }}>
				<View
					style={{
						flexDirection: 'row',
						margin: 5,
						backgroundColor: '#fff'
					}}
				>
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Image style={{ width: 16, height: 16 }} source={image.newsimages.search} />
					</View>
					<TextInput
						style={{
							flex: 9,
							color: '#5c5c5c',
							fontSize: 12,
							padding: 10,
							paddingBottom: 10
						}}
						placeholder={this.state.placeholder}
						placeholderTextColor="#808080"
						autoFocus={false}
						underlineColorAndroid="transparent"
						onChangeText={this._onChangeSearch}
						//onFocus={this._onFocuslizhong}
						//onBlur={this._onBlurlizhong}
						value={this.state.searchKey}
					/>
				</View>
				<FlatList
					ref={(flatList) => {
						this.flatList = flatList;
					}}
					keyboardShouldPersistTaps="always"
					style={{
						height: Platform.OS == 'ios' ? height - 105 : height - 140
					}}
					data={this.state.list}
					extraData={this.state}
					renderItem={this.createListItem}
					ItemSeparatorComponent={_itemSeparator}
				/>
			</View>
		);
	}
}

//列表分割线控件
let _itemSeparator = () => {
	return <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />;
};

//获取钢厂
let _getSteel = async function() {
	let result = await net.ApiPost('tools', 'GetCumulativeSteel', {});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

//获取品名
let _getAllTrade = async function() {
	let result = await net.ApiPost('tools', 'GetAllTrade', {});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

/*获取品名
*stid 钢厂id
*/
let _getTrade = async function(stid) {
	let result = await net.ApiPost('tools', 'GetCumulativeTrade', {
		stid: stid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

/*获取板材 型材 管材 获取品名
*  typeid  型材2 板材3 管材4
*/
let _getTradeByType = async function(typeid) {
	let result = await net.ApiPost('tools', 'GetAllTradeByType', {
		typeid: typeid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

/*获取规格
*stid 钢厂id
*tid 品名id
*/
let _getStandard = async function(stid, tid) {
	let result = await net.ApiPost('tools', 'GetCumulativeStandard', {
		stid: stid,
		tid: tid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

//列表模板
class ListdatatItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	//选择显示的字段
	_Selectcontent = (type) => {
		if (type == SelectType.Standard) {
			//规格显示content
			return this.props.data.content;
		} else {
			return this.props.data.name; //钢厂品名显示name
		}
	};
	render() {
		return (
			<TouchableWithoutFeedback onPress={this._onPress}>
				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						alignContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						height: 40,
						backgroundColor: '#fff'
					}}
				>
					<Text
						style={{
							fontSize: 14,
							color: '#5c5c5c',
							paddingLeft: 10
						}}
					>
						{this._Selectcontent(this.props.type)}
					</Text>
					{this.props.data.visible ? (
						<View
							style={{
								position: 'absolute',
								right: 20,
								top: 8
							}}
						>
							<Image style={{ height: 24, width: 24 }} source={image.tool.select_check} />
						</View>
					) : (
						<View />
					)}
				</View>
			</TouchableWithoutFeedback>
		);
	}
}
