import React, { Component } from 'react';
import {
	Text,
	View,
	FlatList,
	Alert,
	Button,
	Image,
	TouchableWithoutFeedback,
	Linking,
	TouchableHighlight
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import net from '../../../logic/net';
import event from '../../../logic/event';
import Toast from 'react-native-root-toast';
import image from '../../../logic/image';
import skin from '../../../style';

/**
 *电子合同模板列表页面
 *
 * @author zhangchao
 * @export
 * @class ECHome
 * @extends {Component}
 */
export class ECHome extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '合同模板',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: '#FFF'
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
				<TouchableWithoutFeedback onPress={() => navigation.navigate('eCStatement')}>
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
			refreshing: false,
			//loading：表示当前的加载状态
			//0：没有开始加载,可以显示提示用户滑动加载的相关提示
			//1：正在加载,可以显示正在加载的相关提示,并且如果为1时需要禁止其他的重复加载
			//-1：禁用加载,可以显示没有更多内容的相关提示
			loading: 0,
			list: []
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.Refresh();
		//订阅保存合同事件,以便刷新界面数据
		event.Sub(this, event.Events.tool.addEContract, this.addEContract);
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}
	addEContract = () => {
		this.Refresh();
	};
	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		//移除保存合同事件订阅
		event.UnSub(this);
	}

	//刷新数据
	Refresh = async () => {
		this.setState({ refreshing: true, loading: 1 });
		this.page = 1;
		let listdata = await _getContractDatas(this.page++);
		for (var index = 0; index < listdata.length; index++) {
			var element = listdata[index];
			listdata[index].key = element.id + ':' + new Date().getTime();
		}
		let loadingState = 0; //设置为0,可以
		if (listdata != null && listdata.length > 0) {
			this.setState({
				list: listdata,
				refreshing: false
			});
		} else {
			loadingState = -1; //设置为-1,禁用加载.
			this.setState({
				list: [],
				refreshing: false
			});
		}
		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};

	//加载更多
	loadMore = async info => {
		if (
			this.state.list == null ||
			this.state.list.length == 0 ||
			this.state.refreshing ||
			this.state.loading != 0
		) {
			return;
		}
		this.setState({ loading: 1 });
		let lastNews = this.state.list[this.state.list.length - 1];
		let listdata = await _getContractDatas(this.page++);
		for (var index = 0; index < listdata.length; index++) {
			var element = listdata[index];
			listdata[index].key = element.id + ':' + new Date().getTime();
		}
		let loadingState = 0;
		if (listdata != null && listdata.length > 0) {
			this.setState({ list: this.state.list.concat(listdata) });
		} else {
			loadingState = -1; //设置为-1,底部控件显示没有更多数据,同时不再进行加载.
		}
		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};

	//长按删除合同模板事件
	_ondelContract = async item => {
		let result = await delContract(item.id);
		if (result != null) {
			let list = this.state.list;
			for (let i = 0; i < list.length; i++) {
				if (item.id === list[i].id) {
					list.splice(i, 1);
					break;
				}
			}
			this.setState({ list: list });
		}
	};

	/**
	 * 电子合同模板item
	 * @param {int,Object} { index, item }
	 */

	createCollectItem = ({ index, item }) => {
		return (
			<TouchableHighlight
				onPress={() => {
					this.itemPress(item);
				}}
				onLongPress={() => {
					this.itemLongPress(item);
				}}
				activeOpacity={1}
				underlayColor={'#fff'}
			>
				<View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>
					<Text style={{ paddingLeft: 10, flex: 8, fontSize: 15, color: '#5c5c5c' }} numberOfLines={1}>
						{item.name}
					</Text>
					<View style={{ flex: 1, alignItems: 'flex-end' }}>
						<Icon name="ios-arrow-forward-outline" size={22} color={'#ccc'} />
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	itemPress = item => {
		//判断模板是否审核通过
		if (item.state == -1) {
			Toast.show('审核中...', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else {
			//跳转到电子合同详情页
			this.nav.navigate('eContractDetail', item);
		}
	};

	itemLongPress = item => {
		Alert.alert(
			'',
			'是否删除合同模板',
			[
				{ text: '取消', onPress: () => {}, style: 'cancel' },
				{ text: '删除', onPress: () => this._ondelContract(item) }
			],
			{ cancelable: true }
		);
	};

	render() {
		if (this.state.list.length == 0) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'column',
						justifyContent: 'flex-start',
						alignItems: 'center',
						backgroundColor: '#FFF',
						paddingTop: 50
					}}
				>
					<Image style={{ height: 80, width: 80 }} source={image.tool.toolnull} />
					<Text style={{ fontSize: 14, color: '#ccc', textAlign: 'center', paddingTop: 30 }}>
						暂无模板,点击右上角添加!
					</Text>
				</View>
			);
		} else {
			return (
				<View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#FFF' }}>
					<FlatList
						refreshing={this.state.refreshing}
						data={this.state.list}
						extraData={this.state}
						renderItem={this.createCollectItem}
						ItemSeparatorComponent={_itemSteelSeparator}
						onRefresh={this.Refresh}
						onEndReached={this.loadMore}
					/>
				</View>
			);
		}
	}
}

/**
 * 获取电子合同模板
 * @param {int} page 页码
 */
let _getContractDatas = async function(page) {
	let result = await net.ApiPost('contract', 'GetAllContract', {
		page: page
	});
	if (result != null && result.status == 1) {
		return result.data;
	}
	return null;
};

/**
 * 删除电子合同模板
 * @param {int} eid 合同模板ID
 */
let delContract = async function(eid) {
	let result = await net.ApiPost('contract', 'DelContract', {
		eid: eid
	});
	if (result != null && result.status == 1) {
		return result.data;
	}
	return null;
};

//列表分割线控件
let _itemSteelSeparator = () => {
	return <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />;
};

//列表空时显示控件
let _listEmpty = () => {
	return (
		<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30 }}>
			<Text style={{ fontSize: 16, color: '#555555' }}>加载数据中...</Text>
		</View>
	);
};
