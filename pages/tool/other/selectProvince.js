import React, { Component, PureComponent } from "react";
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
	Platform
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../../header";
import skin from "../../../style";
import image from "../../../logic/image";
import net from "../../../logic/net";
import event from "../../../logic/event";
import cache from "../../../logic/cache";
import device from "../../../logic/device";
import config from "../../../config";
//获取屏幕宽高
let { width, height } = Dimensions.get("window");

/**
 * 选择省份-城市、定位
 *
 * @author zhangchao
 * @export
 * @class ProvinceHome
 * @extends {Component}
 */
export class ProvinceHome extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: "选择省份",
			headerTitleStyle: {
				alignSelf: "center",
				textAlign: "center",
				fontSize: 16,
				color: "#FFF"
			},
			headerRight: <View />
		};
	};

	constructor(props) {
		super(props);
		this.state = {
			pid: "", //省ID
			cid: "", //市ID
			pname: "", //省名称
			cname: "", //市名称
			isflag: 1, //isflag=1表示省份,isflag=2表示城市
			locatekey: "陕西-西安",
			list: [],
			longitude: "",
			latitude: ""
		};
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		//定位（TODO:每次打开app，首次进入该页面定位）
		this.queryPosition();
		//加载省份数据
		this.ProvinceLoaded();
	}

	//加载省份数据
	async ProvinceLoaded() {
		let listdata = await _getProvinces();
		if (listdata != null) {
			for (var index = 0; index < listdata.length; index++) {
				var element = listdata[index];
				listdata[index].key = element.id + ":" + new Date().getTime();
			}
			let citycache = await cache.LoadFromFile(
				config.ToolLocationInfoKey
			);
			if (citycache) {
				//初始化之前选的省份ID
				this.setState({ pid: citycache.pid });
			}
			//isflag=1表示省份
			this.setState({ list: listdata, isflag: 1 });
		}
	}

	//选择省份，加载城市数据
	_onPressProvince = async item => {
		let listdata = await _getCitys(item.id);
		if (listdata != null) {
			for (var index = 0; index < listdata.length; index++) {
				var element = listdata[index];
				listdata[index].key = element.id + ":" + new Date().getTime();
			}
			this.setState({
				list: listdata,
				pid: item.id,
				pname: item.name,
				isflag: 2
			});
		}
	};

	//选择城市事件
	_onPressCitys = async item => {
		this.setState({
			cid: item.id,
			cname: item.name
		});
		//将省份数据保存到缓存pid：省份ID，pname：省份名，cid：城市ID,cname:城市名
		await cache.SaveToFile(config.ToolLocationInfoKey, {
			pid: this.state.pid,
			pname: this.state.pname.substring(0, 2),
			cid: item.id,
			cname: item.name.substring(0, 2),
			longitude: this.state.longitude,
			latitude: this.state.latitude
		});
		event.Send(event.Events.tool.citySelect);
		this.nav.goBack();
	};

	//获取定位信息(TODO:定位是要加动画，提示正在获取定位)
	async queryPosition() {
		//获取经、纬度，参数传 true 是获取上一次定位
		let location = await device.GetCurrentPosition(true);
		let longitude = location.coords.longitude;
		let latitude = location.coords.latitude;
		if (location != null) {
			let result = await _getLocateiconInfo(latitude, longitude);
			if (location != null) {
				let pdatas = await _getProvinces();
				let pobj = {}; //定位的省
				let cobj = {}; //定位的市
				if (pdatas != null) {
					//遍历查找定位的省市
					for (let item of pdatas) {
						if (item.name === result.province) {
							pobj = item;
							break;
						}
					}
					let cdatas = await _getCitys(pobj.id);
					if (cdatas != null) {
						//遍历查找定位的市
						for (let item of cdatas) {
							if (item.name === result.city) {
								cobj = item;
								break;
							}
						}
						this.setState({
							pid: pobj.id, //省ID
							cid: cobj.id, //市ID
							pname: pobj.name, //省名称
							cname: cobj.name, //市名称
							locatekey:
								result.province.substring(0, 2) +
								"-" +
								result.city.substring(0, 2),
							longitude: config.DefaultLongitude,
							latitude: config.DefaultLatitude
						});
					}
				}
			} else {
				let datas = await _getLocateiconInfo(
					config.DefaultLatitude,
					config.DefaultLongitude
				);
				this.setState({
					pid: 28, //省ID
					cid: 326, //市ID
					pname: "陕西省", //省名称
					cname: "西安市", //市名称
					locatekey:
						datas.province.substring(0, 2) +
						"-" +
						result.city.substring(0, 2),
					longitude: config.DefaultLongitude,
					latitude: config.DefaultLatitude
				});
			}
		}
	}

	//选择定位的城市事件
	_onPressLocateCity = async () => {
		let arrs = this.state.locatekey.split("-");
		await cache.SaveToFile(config.ToolLocationInfoKey, {
			pid: "",
			pname: arrs[0],
			cid: "",
			cname: arrs[1],
			longitude: this.state.longitude,
			latitude: this.state.latitude
		});
		event.Send(event.Events.tool.citySelect);
		this.nav.goBack();
	};

	//模板选择
	createListItem = ({ item }) => {
		//isflag=1表示省份
		if (this.state.isflag == 1) {
			return (
				<ListdatatItem
					ItemPress={this._onPressProvince}
					data={item}
					pid={this.state.pid}
				/>
			);
		}
		//isflag=2表示市
		if (this.state.isflag == 2) {
			return <ListdatatItem ItemPress={this._onPressCitys} data={item} />;
		}
	};

	render() {
		return (
			<View style={{ backgroundColor: "#F2F2F2" }}>
				<View
					style={{
						flexDirection: "row",
						padding: 10,
						backgroundColor: "#F2F2F2"
					}}
				>
					<TouchableWithoutFeedback onPress={this._onPressLocateCity}>
						<View
							style={{
								flex: 1,
								flexDirection: "row",
								alignItems: "center"
							}}
						>
							<Text>当前位置:</Text>
							<Image
								style={{ width: 16, height: 16 }}
								source={image.tool.locateicon}
							/>
							<Text>{this.state.locatekey}</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
				<FlatList
					style={{
						height:
							Platform.OS == "ios" ? height - 98 : height - 125
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
	return <View style={{ height: 1, backgroundColor: "#F2F2F2" }} />;
};

//获取省份
let _getProvinces = async function() {
	let result = await net.ApiPost("card", "GetCardProvince", {});
	if (result != null && result.status == 1) {
		console.log(result);
		//Alert.alert(JSON.stringify(result.data));
		return result.data;
	}
	return null;
};

//获取城市
let _getCitys = async function(pid) {
	let result = await net.ApiPost("card", "GetCardCity", {
		pid: pid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		//Alert.alert(JSON.stringify(result.data));
		return result.data;
	}
	return null;
};
/**
 * 根据经、纬度解析位置信息
 * @param {ing} latitude  纬度
 * @param {int} longitude 经度
 */
let _getLocateiconInfo = async function(latitude, longitude) {
	let result = await net.ApiPost("index", "ReverseAddress", {
		latitude: latitude,
		longitude: longitude
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		//Alert.alert(JSON.stringify(result.data));
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

	render() {
		if (this.props.pid == this.props.data.id) {
			return (
				<TouchableWithoutFeedback onPress={this._onPress}>
					<View
						style={{
							flexDirection: "row",
							padding: 10,
							height: 40,
							backgroundColor: "#fff"
						}}
					>
						<View style={{ flex: 1, alignItems: "flex-start" }}>
							<Text style={{ fontSize: 14, color: "#5c5c5c" }}>
								{this.props.data.name}
							</Text>
						</View>
						<View style={{ flex: 1, alignItems: "flex-end" }}>
							<Icon
								name="ios-checkmark-circle"
								size={22}
								style={{ color: "#4BC1D2" }}
							/>
						</View>
					</View>
				</TouchableWithoutFeedback>
			);
		} else {
			return (
				<TouchableWithoutFeedback onPress={this._onPress}>
					<View
						style={{
							flexDirection: "row",
							padding: 10,
							height: 40,
							backgroundColor: "#fff"
						}}
					>
						<Text style={{ fontSize: 14, color: "#5c5c5c" }}>
							{this.props.data.name}
						</Text>
					</View>
				</TouchableWithoutFeedback>
			);
		}
	}
}
