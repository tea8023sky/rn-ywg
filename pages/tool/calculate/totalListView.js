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
	Platform,
	Alert
} from 'react-native';
import Header from '../../header';
import { Loading } from '../../loading';
import skin from '../../../style';
import image from '../../../logic/image';
import net from '../../../logic/net';
import cache from '../../../logic/cache';
import config from '../../../config';
import event from '../../../logic/event';
import { SelectType } from './jcMain';
import TimeUtil from '../../../logic/TimeUtil';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/Ionicons';

//获取屏幕宽高
let { width, height } = Dimensions.get('window');
const FlatListHeight = Platform.OS === 'ios' ? height - 90 : height - 110;
/**
 * 查看累计详情页
 *
 * @author NongHuaQiang
 * @export
 * @class TotalListView
 * @extends {Component}
 */
const TotalData = {}; //总计数据
export default class TotalListView extends Component {
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: '累计详情',
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
			<TouchableWithoutFeedback onPress={() => navigation.state.params.clickCreateImage()}>
				<View>
					<Text style={{ color: 'white', backgroundColor: skin.main, fontSize: 14, paddingRight: 10 }}>
						查看图片
					</Text>
				</View>
			</TouchableWithoutFeedback>
		)
	});
s
	constructor(props) {
		super(props);
		this.state = {
			list: [],
			totalnum: '',
			totalweight: ''
		};
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
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
		this.GetTotalData();
		//this.refs.loading.Isvisible(true);
		this.props.navigation.setParams({
			clickCreateImage: this.createImage
		});
	}

	//生成图片
	createImage = async () => {
		if (TotalData && TotalData.datas && TotalData.datas.length > 0) {
			this.refs.loading.Isvisible(true);
			let res = await _LoadCumulativeImg(TotalData);
			if (res) {
				this.props.navigation.navigate('resultImage', { title: '货物累计', url: res }); //跳转图片生成页
			} else {
				Toast.show('生成图片失败', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
			this.refs.loading.Isvisible(false);
		} else {
			Toast.show('当前理重数据为空!', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	//删除数据
	ItemPress = (item) => {
		Alert.alert('是否删除该数据', item.title, [
			{ text: '取消' },
			{
				text: '删除',
				onPress: () => {
					if (TotalData.datas.length > 1) {
						TotalData.totalnum = parseInt(TotalData.totalnum) - parseInt(item.num);
						TotalData.totalweight = TimeUtil.getFloat(
							parseFloat(TotalData.totalweight) - parseFloat(item.weight),
							3
						);
						TotalData.datas.splice(parseInt(item.no) - 1, 1);
						for (let i = 0; i < TotalData.datas.length; i++) {
							TotalData.datas[i].no = i + 1;
							TotalData.datas[i].key = i + 1;
						}
						event.Send(event.Events.tool.clearTotalData, TotalData); //发送清空消息给jcMain 和otherMain
					} else {
						TotalData.totalnum = 0;
						TotalData.totalweight = 0;
						TotalData.datas = [];
						event.Send(event.Events.tool.clearTotalData); //发送清空消息给jcMain 和otherMain
					}
					this.setState({
						list: TotalData.datas,
						totalnum: TotalData.totalnum,
						totalweight: TotalData.totalweight
					});
					cache.SaveToFile(
						this.nav.state.params.type == 0 ? config.ToolCalculationKey : config.ToolCalculationOtherKey,
						TotalData
					);
				}
			}
		]);
	};
	/**
	 * 读取累计数据
	 *
	 * @author NongHuaQiang
	 * @memberof JCMain
	 */
	async GetTotalData() {
		let result = await cache.LoadFromFile(
			this.nav.state.params.type == 0 ? config.ToolCalculationKey : config.ToolCalculationOtherKey
		);
		if (result) {
			TotalData = result;
			for (let i = 0; i < TotalData.datas.length; i++) {
				TotalData.datas[i].no = i + 1;
				TotalData.datas[i].key = i + 1;
			}
			this.setState({
				list: TotalData.datas,
				totalnum: result.totalnum,
				totalweight: result.totalweight
			});
		} else {
			this.setState({ totalnum: '0', totalweight: '0' });
		}
	}
	//模板选择
	createListItem = ({ item }) => {
		if (this.nav.state.params.type == 0) {
			return <JCListdatatItem ItemPress={this.ItemPress} data={item} />; //建材模板
		} else {
			return <OtherListdatatItem ItemPress={this.ItemPress} data={item} />; //其他模板
		}
	};

	render() {
		return (
			<View style={{ backgroundColor: '#f3f3f3' }}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						paddingLeft: 10,
						paddingRight: 10,
						paddingTop: 7,
						paddingBottom: 7
					}}
				>
					<Text style={{ color: '#5c5c5c', fontSize: 14, textAlign: 'center' }}>当前累计:</Text>
					<Text style={{ color: '#FFA858', fontSize: 14, textAlign: 'center', paddingLeft: 10 }}>
						{this.state.totalnum}
					</Text>
					<Text style={{ color: '#FFA858', fontSize: 14, textAlign: 'center' }}>件 </Text>
					<Text style={{ color: '#FFA858', fontSize: 14, textAlign: 'center', paddingLeft: 20 }}>
						{this.state.totalweight}
					</Text>
					<Text style={{ color: '#FFA858', fontSize: 14, textAlign: 'center' }}>吨</Text>
				</View>
				<FlatList
					style={{ height: FlatListHeight }}
					data={this.state.list}
					extraData={this.state}
					renderItem={this.createListItem}
					ItemSeparatorComponent={_itemSeparator}
				/>
				<Loading text="正在生成图片" ref="loading" />
			</View>
		);
	}
}

///列表分割线控件
let _itemSeparator = () => {
	return <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />;
};

/*计算器图片生成
*
*json 传入json数据
*/
let _LoadCumulativeImg = async function(json, navigation) {
	let data = json;
	data.totalnum = parseInt(data.totalnum);
	data.totalweight = parseFloat(data.totalweight);
	for (let i = 0; i < data.datas.length; i++) {
		data.datas[i].num = parseInt(data.datas[i].num);
		data.datas[i].weight = parseFloat(data.datas[i].weight);
	}
	let result = await net.ApiPost('offer', 'LoadCumulativeImg', {
		text: JSON.stringify(data)
	});
	if (result != null && result.status == 1) {
		return result.data;
	}
	return null;
};

//建材列表模板
class JCListdatatItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<View
				style={{
					flexDirection: 'column',
					//justifyContent: 'center',
					paddingVertical: 10,
					paddingHorizontal: 12,
					backgroundColor: '#fff'
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						backgroundColor: '#f1f1f1'
					}}
				>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						序号：{this.props.data.no}
					</Text>
					<TouchableWithoutFeedback onPress={this._onPress}>
						<View style={{ flex: 1 }}>
							<Text style={{ fontSize: 12, color: '#808080', textAlign: 'right' }}>删除</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>

				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						backgroundColor: '#fff'
					}}
				>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						钢厂：{this.props.data.steelv}
					</Text>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						{' '}
						品名：{this.props.data.trade}
					</Text>
				</View>

				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						backgroundColor: '#fff'
					}}
				>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						规格：{this.props.data.standard}
					</Text>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						{' '}
						件数：{this.props.data.num}
					</Text>
				</View>
				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						backgroundColor: '#fff'
					}}
				>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						重量：{this.props.data.weight}
					</Text>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }} />
				</View>
			</View>
		);
	}
}

//板材 型材  管材 列表模板
class OtherListdatatItem extends PureComponent {
	constructor(props) {
		super(props);
	}

	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<View
				style={{
					flexDirection: 'column',
					//justifyContent: 'center',
					paddingVertical: 10,
					paddingHorizontal: 12,
					backgroundColor: '#fff'
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						backgroundColor: '#f1f1f1'
					}}
				>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						序号：{this.props.data.no}
					</Text>
					<TouchableWithoutFeedback onPress={this._onPress}>
						<View style={{ flex: 1 }}>
							<Text style={{ fontSize: 12, color: '#808080', textAlign: 'right' }}>删除</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>

				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						backgroundColor: '#fff'
					}}
				>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						{' '}
						品名：{this.props.data.trade}
					</Text>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						{' '}
						件数：{this.props.data.num}
					</Text>

					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						重量：{this.props.data.weight}
					</Text>
				</View>

				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						backgroundColor: '#fff'
					}}
				>
					<Text style={{ flex: 1, fontSize: 12, color: '#808080', textAlign: 'left' }}>
						{this.props.data.standard}
					</Text>
				</View>
			</View>
		);
	}
}
