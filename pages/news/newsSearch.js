/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PureComponent } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	View,
	TextInput,
	TouchableHighlight,
	TouchableWithoutFeedback,
	FlatList,
	Keyboard,
	Alert
} from 'react-native';
import Header from '../header';
import Dimensions from 'Dimensions';
import net from '../../logic/net';
import cache from '../../logic/cache';
import image from '../../logic/image';
import config from '../../config';
import Toast from 'react-native-root-toast';
import { TextImageItem, ImageItem, NewsAudioItem, VideoItem } from './newsListItem';

let { width, height } = Dimensions.get('window'); //屏幕宽高
let _onEndReachedThreshold = 0.1; //列表加载跟多数据参数
//列表item类型，用于item选择模板
class ListItemType {
	static TextImage = 'TextImage'; //图文类型
	static Image = 'Image'; //图片类型
	static Audio = 'Audio'; //音频类型
	static Video = 'Video'; //视频类型

	static HistoryKey = 'HistoryKey'; //历史关键词
	static HistoryClear = 'HistoryClear'; //清空历史关键词模板
	static HotHistory = 'HotHistory'; //热门推荐模板
	static HotHistorykey = 'HotHistorykey'; //热门推荐模板
}

/**
 * 文章搜索页
 *
 * @author NongHuaQiang
 * @export
 * @class NewsSearch
 * @extends {Component}
 */
export default class NewsSearch extends Component {
	static navigationOptions = {
		header: (headerProps) => {
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
			//loading,标示当前的加载状态
			//0标示没有开始加载,可以显示提示用户滑动加载的相关提示
			//1标示正在加载,可以显示正在加载的相关提示,并且如果为1时需要禁止其他的重复加载
			//-1标示禁用加载,可以显示没有更多内容的相关提示
			loading: 0,
			searchKey: '',
			list: []
		};
		// this.data = {
		// 	list: [],
		// 	id: props.id //分类id
		// };
		this.clickEnable = true;
		this.loadMoreEnable = false;
		this.searchKeyList = [];
		this.HotsearchKeyList = [];
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		this.loadedSearchKeyListCache();
	}

	componentWillUnmount() {
		this.timer && clearTimeout(this.timer);
		this.timer1 && clearTimeout(this.timer1);
	}
	//加载搜索历史纪录列表
	async loadedSearchKeyListCache() {
		let listdata = [];
		let result = await cache.LoadFromFile(config.SearchHistory);
		if (this.HotsearchKeyList.length === 0) {
			let hotkey = await _getHotSearchkey();
			if (hotkey) {
				for (let i in hotkey) {
					this.HotsearchKeyList.push(hotkey[i].flagname);
				}
			}
		}

		if (result && result.length > 0) {
			this.searchKeyList = result;
			listdata.push({ key: 'hk_clear:', title: '', type: ListItemType.HistoryClear }); //添加清空模板
			for (let i = this.searchKeyList.length - 1; i >= 0; i--) {
				//循环添加历史记录
				listdata.push({
					key: 'hk:' + this.searchKeyList[i],
					title: this.searchKeyList[i],
					type: ListItemType.HistoryKey
				});
			}
		}
		if (this.HotsearchKeyList.length > 0) {
			//添加热门推荐模板
			listdata.push({ key: 'Hotmodel:', title: '', type: ListItemType.HotHistory });
			for (let i = 0; i < this.HotsearchKeyList.length; i++) {
				listdata.push({
					key: 'hothk:' + this.HotsearchKeyList[i],
					title: this.HotsearchKeyList[i],
					type: ListItemType.HotHistorykey
				});
			}
		}
		if (listdata.length > 0) {
			this.setState({ list: listdata });
		}
	}

	//保存搜索历史纪录列表
	SaveSearchKeyListCache(key) {
		for (let i = 0; i < this.HotsearchKeyList.length; i++) {
			if (key == this.HotsearchKeyList[i]) {
				return;
			}
		}
		for (let i = 0; i < this.searchKeyList.length; i++) {
			if (key === this.searchKeyList[i]) {
				this.searchKeyList.splice(i, 1);
				break;
			}
		}
		this.searchKeyList.push(key);
		cache.SaveToFile(config.SearchHistory, this.searchKeyList);
	}

	//点击搜索
	OnSearch = () => {
		Keyboard.dismiss();
		if (this.state.searchKey.length > 0) {
			if (this.clickEnable) {
				this.loadMoreEnable = true;
				this.clickEnable = false;
				this.setState({ list: [] }); //清空列表
				this.SaveSearchKeyListCache(this.state.searchKey);
				this.loadData(this.state.searchKey);
				this.timer = setTimeout(() => {
					this.clickEnable = true;
				}, 1000);
			}
		} else {
			Toast.show('请输入搜索关键词', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	//输入框文本变化事件
	_onChangeText = (text) => {
		if (text.length == 0) {
			//文本框被清空后
			this.loadMoreEnable = false;
			this.setState({ searchKey: text, list: [], loading: 0 }); //清空列表
			Keyboard.dismiss(); //隐藏键盘
			this.loadedSearchKeyListCache();
		} else {
			this.setState({ searchKey: text });
		}
	};

	//点击返回
	OnClosePage = () => {
		this.nav.goBack(); //goBack: (routeKey?: (string | null)) => boolean;
	};

	//列表点击打开文章
	ItemPress = (item) => {
		Keyboard.dismiss();
		if (item.type == ListItemType.HistoryKey || item.type == ListItemType.HotHistorykey) {
			//点击关键词搜索文章
			this.loadMoreEnable = true;
			this.setState({ list: [], searchKey: item.title }); //清空当前列表
			this.loadData(item.title); //加载搜索结果数据
		} else if (item.type == ListItemType.HistoryClear) {
			//点击清空历史记录
			Alert.alert('是否清空所有历史记录?', item.title, [
				{ text: '取消' },
				{
					text: '清空',
					onPress: () => {
						let listdata = [];
						if (this.HotsearchKeyList.length > 0) {
							//添加热门推荐模板
							listdata.push({ key: 'Hothk:', title: '', type: ListItemType.HotHistory });
							for (let i = 0; i < this.HotsearchKeyList.length; i++) {
								listdata.push({
									key: 'hk:' + this.HotsearchKeyList[i],
									title: this.HotsearchKeyList[i],
									type: ListItemType.HistoryKey
								});
							}
						}
						this.searchKeyList = [];
						cache.SaveToFile(config.SearchHistory, this.searchKeyList);
						this.setState({ list: listdata });
					}
				}
			]);
		} else {
			//打开新闻详情
			this.nav.navigate('newsView', { id: item.id, type: item.isimg, tid: 0, item: item });
		}
	};

	//长按删除单个记录 弹出窗口
	ItemLongPress = (item) => {
		Alert.alert('是否删除该记录?', item.title, [
			{ text: '取消' },
			{
				text: '删除',
				onPress: () => {
					for (let i = 0; i < this.searchKeyList.length; i++) {
						if (item.title === this.searchKeyList[i]) {
							this.searchKeyList.splice(i, 1);
							break;
						}
					}
					let listdata = this.state.list;
					for (let i = 0; i < listdata.length; i++) {
						if (item.title === listdata[i].title) {
							listdata.splice(i, 1);
							break;
						}
					}
					if (this.searchKeyList.length === 0) {
						//如果没有历史记录，移除清空模板
						listdata.splice(0, 1);
					}
					this.setState({ list: listdata });
					cache.SaveToFile(config.SearchHistory, this.searchKeyList);
				}
			}
		]);
	};

	//加载数据
	loadData = async (info) => {
		// if (this.state.loading != 0) {
		// 	return;
		// }
		this.setState({ loading: 1 });
		let loadingState = 0;
		let listdata = await _fillData(info, 0);
		if (listdata != null && listdata.length > 0) {
			for (var index = 0; index < listdata.length; index++) {
				var element = listdata[index];
				listdata[index].key = element.id + ':' + new Date().getTime();
			}

			if (this.state.list) {
				this.setState({ list: this.state.list.concat(listdata) });
			} else {
				this.setState({ list: listdata });
			}
		} else {
			//loadingState = -1;
			Toast.show('没有找到 "' + this.state.searchKey + '" 相关数据', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			this.setState({ loading: -2 }); //设置为-1,底部控件显示没有更多数据,同时不再进行加载.
			return;
		}
		this.timer1 = setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};
	//加载更多数据
	loadMore = async () => {
		let lastid = this.state.list.length > 0 ? this.state.list[this.state.list.length - 1].id : 0;
		if (!this.loadMoreEnable || this.state.searchKey.length == 0 || lastid == 0 || this.state.loading != 0) {
			return;
		}
		this.setState({ loading: 1 });
		let loadingState = 0;
		let listdata = await _fillData(this.state.searchKey, lastid);
		if (listdata != null && listdata.length > 0) {
			for (var index = 0; index < listdata.length; index++) {
				var element = listdata[index];
				listdata[index].key = element.id + ':' + new Date().getTime();
			}

			if (this.state.list) {
				this.setState({ list: this.state.list.concat(listdata) });
			} else {
				this.setState({ list: listdata });
			}
		} else {
			Toast.show('没有更多数据', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			this.setState({ loading: -1 }); //设置为-1,底部控件显示没有更多数据,同时不再进行加载.
			return;
		}
		this.timer1 = setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};

	//列表底部控件
	listFooter = () => {
		if (this.state.loading == -1) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						height: 30
					}}
				>
					<Text style={{ fontSize: 16, color: '#555555' }}>没有更多内容了</Text>
				</View>
			);
		} else if (this.loadMoreEnable && this.state.loading == 0 && this.state.list.length > 8) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						height: 30
					}}
				>
					<Text style={{ fontSize: 16, color: '#555555' }}>上拉加载更多</Text>
				</View>
			);
		} else {
			return <View />;
		}
	};
	//模板选择
	createListItem = ({ item }) => {
		switch (item.type) {
			case ListItemType.TextImage:
				return <TextImageItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.Image:
				return <ImageItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.NewsAudio:
				return <NewsAudioItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.Video:
				return <VideoItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.HistoryKey:
				return <HistoryKeyItem ItemPress={this.ItemPress} ItemLongPress={this.ItemLongPress} data={item} />;
			case ListItemType.HotHistorykey:
				return <HotHistoryKeyItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.HistoryClear:
				return <HistoryKeyClearItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.HotHistory:
				return <HotHistoryItem />;
			default:
				return <TextImageItem ItemPress={this.ItemPress} data={item} />;
		}
	};

	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					justifyContent: 'flex-start',
					alignItems: 'center',
					backgroundColor: '#f3f3f3'
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						height: 40,
						justifyContent: 'center',
						backgroundColor: '#FFF'
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
						<TouchableWithoutFeedback onPress={this.OnClosePage}>
							<View style={{ flex: 1, height: 32, width: 32, paddingLeft: 10, justifyContent: 'center' }}>
								<Image
									style={{ height: 20, width: 20, padding: 6 }}
									source={require('../../img/news/pre.png')}
								/>
							</View>
						</TouchableWithoutFeedback>
						<TextInput
							style={{ flex: 10, height: 32, borderColor: '#5c5c5c', padding: 0, paddingLeft: 10 }}
							onChangeText={this._onChangeText}
							value={this.state.searchKey}
							placeholder="输入关键词"
							placeholderTextColor="#808080"
							autoFocus={true}
							underlineColorAndroid="transparent"
						/>
						<TouchableHighlight
							style={{
								flex: 2,
								height: 32
							}}
							activeOpacity={0.9}
							underlayColor="#f3f3f3"
							onPress={this.OnSearch}
						>
							<View
								style={{
									flex: 1,
									height: 32,

									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Text style={{ fontSize: 16, color: '#5c5c5c' }}>搜索</Text>
							</View>
						</TouchableHighlight>
					</View>
				</View>
				<View style={{ width: width, height: 10, backgroundColor: '#F3f3f3' }} />
				<View style={{ width: width, height: height - 70, backgroundColor: '#fff' }}>
					<FlatList
						//refreshing={this.state.refreshing}
						keyboardShouldPersistTaps="always"
						data={this.state.list}
						extraData={this.state}
						renderItem={this.createListItem}
						ItemSeparatorComponent={_itemSeparator}
						ListFooterComponent={this.listFooter}
						//ListHeaderComponent={this.listHeader}
						//ListEmptyComponent={_listEmpty}
						//onRefresh={this.Refresh}
						onEndReachedThreshold={_onEndReachedThreshold}
						onEndReached={this.loadMore}
					/>
				</View>
			</View>
		);
	}
}
/*
获取填充好的数据
*/
let _fillData = async function(key, aid) {
	//this.setState({ refreshing: true });
	let temp = await _getData(key, aid);
	if (temp != null) {
		for (let i = 0; i < temp.length; i++) {
			temp[i].key = temp[i].id; //设置key为组件提供唯一标示

			//item模板类型
			if (temp[i].showtype == 1) {
				//图文item模板显示
				temp[i].type = ListItemType.TextImage;
			} else if (temp[i].showtype == 2) {
				//图片item模板显示
				temp[i].type = ListItemType.Image;
				//temp[i].type = ListItemType.TextImage;
			} else if (temp[i].showtype == 3) {
				//音频item模板显示
				temp[i].type = ListItemType.Audio;
			} else {
				//没有判断出来的类型全部设置为图文
				temp[i].type = ListItemType.TextImage;
			}
		}
	}

	return temp;
};

/* 
获取新闻数据，
tid，文章分类
aid，最大的文章id，首页传0
retime，最后一篇文章的更新时间，首页传0
*/
let _getData = async function(key, aid) {
	let result = await net.ApiPost('article', 'GetArticleSearch', {
		search: key,
		aid: aid
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

//获取热门关键词
let _getHotSearchkey = async function() {
	let result = await net.ApiPost('index', 'IndexHotsearch', {});
	if (result != null && result.status == 1) {
		//console.log(result);
		return result.data;
	}
	return null;
};

//列表分割线控件
let _itemSeparator = () => {
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

//搜索历史记录关键词
class HistoryKeyItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	_onLongPress = () => {
		this.props.ItemLongPress(this.props.data);
	};

	render() {
		return (
			<TouchableWithoutFeedback onPress={this._onPress} onLongPress={this._onLongPress}>
				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						height: 40
					}}
				>
					<Image style={{ width: 16, height: 16 }} source={image.newsimages.search} />
					<Text style={{ fontSize: 14, color: '#5c5c5c', paddingLeft: 10 }}>{this.props.data.title}</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

//热门推荐关键词
class HotHistoryKeyItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableWithoutFeedback onPress={this._onPress}>
				<View
					style={{
						flexDirection: 'row',
						//justifyContent: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						height: 40
					}}
				>
					<Image style={{ width: 16, height: 16 }} source={image.newsimages.search} />
					<Text style={{ fontSize: 14, color: '#5c5c5c', paddingLeft: 10 }}>{this.props.data.title}</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

//清空搜索历史记录
class HistoryKeyClearItem extends PureComponent {
	constructor(props) {
		super(props);
	}
	_onPress = () => {
		this.props.ItemPress(this.props.data);
	};

	render() {
		return (
			<TouchableWithoutFeedback onPress={this._onPress}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						paddingVertical: 10,
						paddingHorizontal: 12,
						height: 40
					}}
				>
					<Image style={{ width: 16, height: 16 }} source={image.newsimages.del} />
					<Text style={{ fontSize: 12, color: '#909090', paddingLeft: 4 }}>清空历史记录</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

//热门推荐
class HotHistoryItem extends PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View
				style={{
					flexDirection: 'row',
					//justifyContent: 'center',
					alignItems: 'center',
					paddingVertical: 10,
					paddingHorizontal: 12,
					height: 40
				}}
			>
				<Text style={{ fontSize: 12, color: '#909090' }}>热门推荐</Text>
			</View>
		);
	}
}
