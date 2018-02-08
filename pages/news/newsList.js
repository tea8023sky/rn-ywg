//新闻列表页
import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, Image, View, FlatList, Alert, Platform } from 'react-native';
import net from '../../logic/net';
import cache from '../../logic/cache';
import config from '../../config';
import { Location } from './newsIndex';
import {
	TextImageItem,
	ImageItem,
	VideoItem,
	TimeLineItem,
	TimeLineMsgItem,
	NewsAudioItem,
	AudioItem,
	NewsToolItem,
	NewsRecommendItem,
	SwiperImageItem
} from './newsListItem';
import Swiper from 'react-native-swiper';
import image from '../../logic/image';
import event from '../../logic/event';
let Dimensions = require('Dimensions');
let { width, height } = Dimensions.get('window');
/*
列表滑动到什么位置加载下一页数据,参数设置FlatList的onEndReachedThreshold
此参数为一个比例值,详见官方文档
TODO 后期android和ios可以区别对待,ios为负数,android为正数
*/
let _onEndReachedThreshold = 0.1;
const FONT_SIZE = [ 14, 16, 20, 24 ];
//列表item类型，用于item选择模板
class ListItemType {
	static NewsAudio = 'NewsAudio'; //今日早报
	static NewsTool = 'NewsTool'; //首页工具
	static NewsRecommend = 'NewsRecommend'; //推荐文章
	static SwiperImage = 'SwiperImage'; //轮播图集

	static TextImage = 'TextImage'; //图文类型
	static Image = 'Image'; //图片类型
	static Audio = 'Audio'; //音频类型
	static Video = 'Video'; //视频类型
	static TimeLine = 'fast_dt'; //时间线类型，用于快讯  日期
	static TimeLineMsg = 'fast_msg'; //时间线类型，用于快讯  消息
}

//标准列表
export class StandardList extends Component {
	//构造方法
	constructor(props) {
		super(props);
		this.state = {
			refreshing: false,
			//loading,标示当前的加载状态
			//0标示没有开始加载,可以显示提示用户滑动加载的相关提示
			//1标示正在加载,可以显示正在加载的相关提示,并且如果为1时需要禁止其他的重复加载
			//-1标示禁用加载,可以显示没有更多内容的相关提示
			loading: 0,
			list: []
		};
		this.data = {
			list: [],
			id: props.id //分类id
		};
		this.fontSize = 14;
		this.page = 1; //行情快讯页码
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		this.Refresh('初始化刷新');
		event.Sub(this, event.Events.news.ClickTabsForRefresh, (id) => {
			if (this.state.list.length > 0) {
				this.flatList.scrollToIndex({ viewPosition: 0, index: 0 }); //滚动到第一页
				//this.flatList.scrollToOffset({ animated: true, offset: 10 });
			}
			if (id == this.data.id) {
				this.Refresh('手动刷新'); //刷新
			}
		});
		if (this.data.id == 109) {
			this.loadFontsize();
			event.Sub(this, event.Events.news.FontSizeChange, (size) => {
				this.fontSize = size;
				this.Refresh();
			});
		}
	}
	//组件销毁
	componentWillUnmount() {
		this.timeout && clearTimeout(this.timeout);
		this.interval && clearInterval(this.interval);
		//移除用户修改圈子事件订阅
		event.UnSub(this);
	}
	//获取字体大小
	loadFontsize = async () => {
		let size = await getFontSize();
		if (size && size >= 0) {
			this.fontSize = FONT_SIZE[size];
		}
	};
	//刷新数据
	Refresh = async (info) => {
		//console.log(info);
		this.setState({ refreshing: true, loading: 1 });
		this.page = 1;
		let listdata = await _fillData(this.data.id, 0, 0, this.page++);
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
			loadingState = -1; ///, //设置为-1,禁用加载.
			this.setState({
				refreshing: false
			});
		}

		this.timeout = setTimeout(() => {
			this.setState({ loading: loadingState });
			if (Platform.OS == 'ios' && this.state.list.length > 0) {
				this.flatList.scrollToIndex({ viewPosition: 0, index: 0 }); //滚动到第一页
			}
		}, 300);
		if (this.data.id == 109) {
			//快讯加载bug
			this.count = 0;
			this.interval = setInterval(() => {
				if (this.count >= 5) {
					clearInterval(this.interval);
				}
				if (this.state.list.length < 10) {
					this.loadMore();
				} else {
					clearInterval(this.interval);
				}
			}, 1000);
		}
	};

	ItemPress = (item) => {
		if (item.type == ListItemType.TimeLineMsg) {
			//Alert.alert('快讯' + JSON.stringify(item));
			this.nav.navigate('fastDetail', { id: item.id, context: item.context, fontSize: this.fontSize });
		} else {
			this.nav.navigate('newsView', {
				id: item.id,
				type: item.isimg,
				tid: this.data.id,
				item: item
			});
		}
	};

	//加载更多
	loadMore = async (info) => {
		if (
			this.state.list == null ||
			this.state.list.length == 0 ||
			this.state.refreshing ||
			this.state.loading != 0
		) {
			return;
		}
		//console.log(info);
		this.setState({ loading: 1 });
		let lastNews = this.state.list[this.state.list.length - 1];
		let lastids = lastNews.id;
		if (this.data.id != 0 && this.state.list.length > 0) {
			for (let i = this.state.list.length - 2; i > 0; i--) {
				if (lastNews.retime == this.state.list[i].retime) {
					lastids = lastids + ',' + this.state.list[i].id;
				} else {
					break;
				}
			}
		}
		let listdata = await _fillData(this.data.id, lastids, lastNews.retime, this.page++);
		for (var index = 0; index < listdata.length; index++) {
			var element = listdata[index];
			listdata[index].key = element.id + ':' + new Date().getTime();
		}
		let loadingState = 0;
		if (listdata != null && listdata.length > 0) {
			this.setState({ list: this.state.list.concat(listdata) });
		} else {
			loadingState = -1;
			//this.setState({ loading: -1 }); //设置为-1,底部控件显示没有更多数据,同时不再进行加载.
		}
		setTimeout(() => {
			this.setState({ loading: loadingState });
		}, 300);
	};

	//列表底部控件
	listFooter = () => {
		if (this.state.loading == 1) {
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
					<Text style={{ fontSize: 16, color: '#555555' }}>加载中...</Text>
				</View>
			);
		}
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
		} else {
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
		}
	};

	//列表顶部控件
	listHeader = () => {
		if (this.state.refreshing) {
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
					<Text style={{ fontSize: 16, color: '#555555' }}>下拉刷新内容</Text>
				</View>
			);
		} else {
			return null;
		}
	};

	render() {
		return (
			<View style={{ paddingBottom: 0 }}>
				{this.data.id == 122 ? (
					<Image
						resizeMode="contain"
						style={{
							width: width - 20,
							height: width / 3,
							marginBottom: 10,
							marginTop: 0,
							marginLeft: 10,
							marginRight: 10
						}}
						source={image.newsimages.gszb}
					/>
				) : (
					<View />
				)}
				<FlatList
					ref={(flatList) => {
						this.flatList = flatList;
					}}
					refreshing={this.state.refreshing}
					data={this.state.list}
					extraData={this.state}
					renderItem={this.createListItem}
					ItemSeparatorComponent={_itemSeparator}
					ListFooterComponent={this.listFooter}
					//ListHeaderComponent={this.listHeader}
					//ListEmptyComponent={_listEmpty}
					onRefresh={this.Refresh}
					onEndReachedThreshold={_onEndReachedThreshold}
					onEndReached={this.loadMore}
				/>
			</View>
		);
	}
	//创建list item,根据数据不同创建不同的item模板
	createListItem = ({ item }) => {
		switch (item.type) {
			case ListItemType.TextImage:
				return <TextImageItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.Image:
				return <ImageItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.Video:
				return <VideoItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.TimeLine:
				return <TimeLineItem data={item} />;
			case ListItemType.TimeLineMsg:
				return <TimeLineMsgItem ItemPress={this.ItemPress} data={item} fontSize={this.fontSize} />;
			case ListItemType.NewsAudio:
				return <NewsAudioItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.Audio:
				return <AudioItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.NewsTool:
				return <NewsToolItem navigation={this.props.navigation} />;
			case ListItemType.NewsRecommend:
				return <NewsRecommendItem ItemPress={this.ItemPress} data={item} />;
			case ListItemType.SwiperImage:
				return <SwiperImageItem ItemPress={this.ItemPress} data={item.list} />;
			default:
				return <TextImageItem ItemPress={this.ItemPress} data={item} />;
		}
	};
}

/*
获取填充好的数据
*/
let _fillData = async function(tid, aid, retime, page) {
	//this.setState({ refreshing: true });
	let result = null;
	if (tid === 109) {
		result = await _getFastData(page);
		if (result && result.length > 0) {
			let fastmsg = [];
			for (let i = 0; i < result.length; i++) {
				let dts = result[i].dt.split('-');
				fastmsg.push({
					id: 'fast_dt',
					type: ListItemType.TimeLine,
					dtDay: dts[2] + '日',
					dtYearMon: dts[0] + '年' + dts[1] + '月'
				}); //添加快讯日期
				let list = result[i].list;
				//Alert.alert(JSON.stringify(list));
				for (let j = 0; j < list.length; j++) {
					fastmsg.push({
						id: list[j].id,
						type: ListItemType.TimeLineMsg,
						context: list[j].context,
						publishtime: list[j].publishtime
					}); //添加快讯消息
				}
			}
			return fastmsg;
		}
	} else {
		result = await _getData(tid, aid, retime);
	}
	let headlist = [];
	let recommend = result.toutiao;

	let temp = result.list;
	for (let i = 0; i < temp.length; i++) {
		temp[i].key = temp[i].id; //设置key为组件提供唯一标示

		//item模板类型
		if (tid == 123) {
			//视频分类全部为视频item模板显示
			temp[i].type = ListItemType.Image;
		} else if (temp[i].showtype == 1) {
			//图文item模板显示
			temp[i].type = ListItemType.TextImage;
		} else if (temp[i].showtype == 2) {
			//图片item模板显示
			temp[i].type = ListItemType.Image;
		} else if (temp[i].showtype == 3) {
			//音频item模板显示
			temp[i].type = ListItemType.Audio;
		} else {
			//没有判断出来的类型全部设置为图文
			temp[i].type = ListItemType.TextImage;
		}
	}
	if (tid == 0 && aid == 0) {
		//headlist.push({ id: 0, list: result.audios, type: ListItemType.NewsAudio }); //添加语音早报
		cache.SaveToFile(config.AudioListKey, result.audios); //缓存语音播报列表
		let audio0 = result.audios[0]; //取出第一个语音播报
		audio0.type = ListItemType.NewsAudio; //设置类型
		headlist.push(audio0); //添加语音早报
		headlist.push({ id: 1, type: ListItemType.NewsTool }); //添加工具
		for (
			var i = 0;
			i < recommend.length;
			i++ //循环设置推荐类型
		) {
			recommend[i].type = ListItemType.NewsRecommend;
			headlist.push(recommend[i]);
		}
		headlist.push({
			id: 2,
			list: result.tuji,
			type: ListItemType.SwiperImage
		});
		return headlist.concat(temp);
	} else {
		return temp;
	}
};

/* 
获取新闻数据，
tid，文章分类
aid，最大的文章id，首页传0
retime，最后一篇文章的更新时间，首页传0
*/
let _getData = async function(tid, aid, retime) {
	let result = await net.ApiPost('article', 'GetArticleAllClass3', {
		tid: tid,
		aid: aid,
		retime: retime,
		longitude: Location.longitude ? Location.longitude : config.DefaultLongitude,
		latitude: Location.latitude ? Location.latitude : config.DefaultLatitude
	});
	if (result != null && result.status == 1) {
		//console.log('Location.longitude' + Location.longitude + 'Location.latitude ' + Location.latitude);
		if (tid == '128') {
			console.log('aid==' + aid + ' retime===' + retime + JSON.stringify(result));
		}

		return result.data;
	}
	return null;
};

/**
 * 获取行情快讯
 * page 页码
 */
let _getFastData = async function(page) {
	let result = await net.ApiPost('cms', 'GetCMSContent1', {
		page: page,
		longitude: Location.longitude ? Location.longitude : config.DefaultLongitude,
		latitude: Location.latitude ? Location.latitude : config.DefaultLatitude
	});
	if (result != null && result.status == 1) {
		//console.log(result);
		//Alert.alert(JSON.stringify(result));
		return result.data;
	}
	return null;
};

//读取新闻字体大小
//size字号
let getFontSize = async function() {
	try {
		let size = await cache.LoadFromFile(config.FontSizeCache);
		return size;
	} catch (error) {
		console.log('duqu新闻字体大小:' + JSON.stringify(error));
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
		<View
			style={{
				flex: 1,
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				height: 30
			}}
		>
			<Text style={{ fontSize: 16, color: '#555555' }}>加载数据中...</Text>
		</View>
	);
};
