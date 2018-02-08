/**
 * Day 18
 * Sortable List
 * has some performance issue or potential bug
 * little lag when drag
 * To be made to plugin
 */
'use strict';

import React, { Component } from 'react';
import {
	Image,
	StyleSheet,
	LayoutAnimation,
	Text,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Dimensions,
	PanResponder,
	View,
	Alert,
	NativeModules
} from 'react-native';
import Header from '../header';
import net from '../../logic/net';
import cache from '../../logic/cache';
import image from '../../logic/image';
import config from '../../config';
import event from '../../logic/event';
//获取屏幕宽高
let { width, height } = Dimensions.get('window');
let RowNum = 4;
let CellWidth = (width - (RowNum * 10 + 10)) / RowNum;
let CellHight = (width - (RowNum * 10 + 10)) / RowNum / 2;
const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export default class EditLabel extends Component {
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
			isEdit: false,
			tabs: [],
			recommandTabs: [],
			_RecommandTop: 100
		};
		this.nav = this.props.navigation;
		this._width = CellWidth + 10;
		this.topIndex = 0;
		this.leftIndex = 0;
		this.index = 0;
		this.prev_left = 0;
		this.prev_top = 0;
		this.left = 0;
		this.top = 0;
		this.offset = 90; //偏移
		this.isChange = false;
		this.ClickTime = 0;
	}

	componentWillMount() {
		this.setState({
			tabs: this.nav.state.params.tabs,
			_RecommandTop: 40 + CellHight * (this.nav.state.params.tabs.length / RowNum)
		});
		this.LoadClass();
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onPanResponderGrant: (evt, gestureState) => {
				const { pageX, pageY } = evt.nativeEvent;
				this.topIndex = Math.floor((pageY - this.offset) / (this._width / 2));
				this.leftIndex = Math.floor(pageX / this._width);
				this.index = this.topIndex * 4 + this.leftIndex;
				this.prev_left = this._width * this.leftIndex;
				this.prev_top = this._width / 2 * this.topIndex;
				console.log('按下');
			},
			onPanResponderMove: (evt, gestureState) => {
				if (this.state.isEdit && this.index > 0) {
					this.left = this.prev_left + gestureState.dx;
					this.top = this.prev_top + gestureState.dy;
					if (this.state.tabs[this.index]) {
						let box = this.refs[this.state.tabs[this.index].id];
						box.setNativeProps({
							style: { top: this.top, left: this.left }
						});
						console.log('移动');
					}
				}
			},

			onPanResponderTerminationRequest: (evt, gestureState) => true,
			onPanResponderRelease: (evt, gestureState) => {
				if (this.state.isEdit) {
					if (this.index == 0) {
						return;
					}
					console.log('释放');
					const { pageX, pageY } = evt.nativeEvent;
					let TopIndex = Math.floor((pageY - this.offset) / (this._width / 2));
					let LeftIndex = Math.floor(pageX / this._width);
					let index = TopIndex * 4 + LeftIndex;

					this.prev_left = this._width * TopIndex;
					this.prev_top = this._width / 2 * TopIndex;

					if (index > 0 && this.state.tabs[index]) {
						this.isChange = true;
						if (index == this.index) {
							//删除
							this.onPressLabel(this.state.tabs[index], index);
						} else if (index > this.index) {
							//往后移动
							for (let i = this.index; i < index; i++) {
								if (this.state.tabs[i + 1]) {
									let box2 = this.refs[this.state.tabs[i + 1].id];
									let top2 = Math.floor(i / 4) * (this._width / 2);
									let left2 = (i % 4) * this._width;
									//LayoutAnimation.linear();
									LayoutAnimation.configureNext(
										LayoutAnimation.create(
											200,
											LayoutAnimation.Types.linear,
											LayoutAnimation.Properties.scaleXY
										)
									);
									box2.setNativeProps({
										style: {
											top: top2,
											left: left2
										}
									});
								}
							}
							if (this.state.tabs[this.index]) {
								let box1 = this.refs[this.state.tabs[this.index].id];
								let top1 = Math.floor(index / 4) * (this._width / 2);
								let left1 = (index % 4) * this._width;

								box1.setNativeProps({
									style: {
										top: top1,
										left: left1
									}
								});
								let temp = this.state.tabs[this.index];
								for (let i = this.index; i < index; i++) {
									this.state.tabs[i] = this.state.tabs[i + 1];
								}
								this.state.tabs[index] = temp;
								this.setState({ tabs: this.state.tabs });
							}
						} else if (index < this.index) {
							//往前移动
							for (let i = this.index; i > index; i--) {
								if (this.state.tabs[i - 1]) {
									let box2 = this.refs[this.state.tabs[i - 1].id];
									let top2 = Math.floor(i / 4) * (this._width / 2);
									let left2 = (i % 4) * this._width;
									//LayoutAnimation.linear();
									LayoutAnimation.configureNext(
										LayoutAnimation.create(
											200,
											LayoutAnimation.Types.linear,
											LayoutAnimation.Properties.scaleXY
										)
									);
									box2.setNativeProps({
										style: {
											top: top2,
											left: left2
										}
									});
								}
							}
							if (this.state.tabs[this.index]) {
								let box1 = this.refs[this.state.tabs[this.index].id];
								let top1 = Math.floor(index / 4) * (this._width / 2);
								let left1 = (index % 4) * this._width;

								box1.setNativeProps({
									style: {
										top: top1,
										left: left1
									}
								});
								let temp = this.state.tabs[this.index];
								for (let i = this.index; i > index; i--) {
									this.state.tabs[i] = this.state.tabs[i - 1];
								}
								this.state.tabs[index] = temp;
								this.setState({ tabs: this.state.tabs });
							}
						}
					} else {
						//移出范围，则重新回到原始位置
						if (this.state.tabs[this.index]) {
							let box1 = this.refs[this.state.tabs[this.index].id];
							let top1 = Math.floor(this.index / 4) * (this._width / 2);
							let left1 = (this.index % 4) * this._width;
							LayoutAnimation.linear();
							box1.setNativeProps({
								style: {
									top: top1,
									left: left1
								}
							});
							LayoutAnimation.configureNext(LayoutAnimation.Presets.spring); //系统自带
						}
					}
				} else {
					if (this.isChange) {
						event.Send(event.Events.news.RebindTabs, this.state.tabs);
						cache.SaveToFile(config.NewsSelfClassCachekey, this.state.tabs);
						this.isChange = false;
						this.timer = setTimeout(() => {
							event.Send(event.Events.news.ChangeTabs, this.index);
						}, 10);
					} else {
						event.Send(event.Events.news.ChangeTabs, this.index);
					}
					this.nav.goBack();
				}
			},
			onPanResponderTerminate: (evt, gestureState) => {
				console.log('中断');
			},
			onShouldBlockNativeResponder: (event, gestureState) => true
		});
	}
	componentWillUnmount() {
		this.timer && clearTimeout(this.timer);
	}
	async LoadClass() {
		let self = await cache.LoadFromFile(config.NewsSelfClassCachekey);
		let all = await cache.LoadFromFile(config.NewsAllClassCachekey);
		let newClass = await GetAllClass();
		//Minus(self, all);
		if (self) {
			//如果个人分类存在
			if (all.length == newClass.length) {
				//后台没有操作标签 直接算出推荐标签
				let recommand = Minus(self, all);
				this.setState({ recommandTabs: recommand });
			} else if (all.length > newClass.length) {
				//后台 删除标签
				let delItem = Minus(all, newClass); //获取删除的标签
				let newself = Minus(self, delItem); //我的标签删除掉 删除的标签
				let recommand = Minus(newself, newClass); //根据新的我的标签 算出推荐标签
				this.setState({ tabs: newself, recommandTabs: recommand }); //刷新界面
				event.Send(event.Events.news.RebindTabs, newself); //重新绑定tabs
				cache.SaveToFile(config.NewsSelfClassCachekey, newself); //缓存
				cache.SaveToFile(config.NewsAllClassCachekey, newClass);
			} else {
				//后台添加新标签
				let recommand = Minus(self, newClass); //算出推荐标签
				this.setState({ recommandTabs: recommand }); //刷新推荐界面
				cache.SaveToFile(config.NewsAllClassCachekey, newClass);
			}
		} else {
			//没有设置过个人分类
			if (all.length != newClass.length) {
				//后台 删除标签 或 添加新标签  则重新刷新界面
				this.setState({ tabs: newClass }); //刷新界面
				event.Send(event.Events.news.RebindTabs, newClass); //重新绑定tabs
				cache.SaveToFile(config.NewsAllClassCachekey, newClass); //缓存
			}
		}
	}

	//点击关闭页面
	_ClosePage = () => {
		if (this.isChange) {
			event.Send(event.Events.news.RebindTabs, this.state.tabs);
			cache.SaveToFile(config.NewsSelfClassCachekey, this.state.tabs);
			this.isChange = false;
		}
		this.nav.goBack();
	};

	//点击编辑 完成 按钮
	_onPressEdit = () => {
		if (this.state.isEdit) {
			this.setState({ isEdit: false });
			if (this.isChange) {
				event.Send(event.Events.news.RebindTabs, this.state.tabs);
				cache.SaveToFile(config.NewsSelfClassCachekey, this.state.tabs);
				this.isChange = false;
			}
		} else {
			this.setState({ isEdit: true });
		}
	};

	//我的标签点击
	onPressLabel = (item, index) => {
		if (this.state.isEdit) {
			let t = new Date().getTime();
			if (t - this.ClickTime > 500) {
				this.ClickTime = t;
				if (index > 0) {
					//点击首页无效
					let listre = this.state.recommandTabs;
					listre.push(item);

					let mytabs = this.state.tabs;
					mytabs.splice(index, 1);

					this.setState({ tabs: mytabs, recommandTabs: listre });
					this.isChange = true; //删除则需要重新绑定Tabs
				}
				this.setState({ _RecommandTop: 40 + CellHight * (this.nav.state.params.tabs.length / RowNum) });
			} else {
				console.log('你点击太多了');
			}
		}
	};
	//推荐标签点击
	onPressAddLabel = (item, index) => {
		let t = new Date().getTime();
		if (t - this.ClickTime > 500) {
			this.ClickTime = t;
			let list = this.state.tabs;
			list.push(item);
			this.state.recommandTabs.splice(index, 1);
			this.setState({ tabs: list, recommandTabs: this.state.recommandTabs });
			this.isChange = true;
			this.setState({ _RecommandTop: 40 + CellHight * (this.nav.state.params.tabs.length / RowNum) });
		} else {
			//console.log('你点击太多了');
		}
	};
	render() {
		const boxes = this.state.tabs.map((item, index) => {
			let top = Math.floor(index / 4) * (this._width / 2);
			let left = (index % 4) * this._width;

			return (
				<View
					ref={'' + item.id}
					{...this._panResponder.panHandlers}
					key={'' + item.id}
					style={[ styles.touchBox, { top, left } ]}
				>
					{/* <TouchableWithoutFeedback onPress={this.onPressLabel.bind(this, item, index)}> */}
					<View
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							width: CellWidth,
							height: CellHight,
							backgroundColor: '#f3f3f3',
							borderWidth: 1,
							borderRadius: 5,
							borderColor: '#f3f3f3'
						}}
					>
						{index > 0 && this.state.isEdit ? (
							<Image
								style={{ position: 'absolute', top: 0, right: 0, height: 16, width: 16 }}
								source={image.tool.close}
							/>
						) : (
							<View />
						)}

						<Text style={{ color: index > 0 ? '#5c5c5c' : '#ff0000' }}>{item.name}</Text>
					</View>
				</View>
			);
		});
		const boxes_re = this.state.recommandTabs.map((item, index) => {
			let top = Math.floor(index / 4) * (this._width / 2);
			let left = (index % 4) * this._width;

			return (
				<View
					//ref={'' + item.id}
					//{...this._panResponder.panHandlers}
					key={'' + item.id}
					style={[ styles.touchBox, { top, left } ]}
				>
					<TouchableWithoutFeedback onPress={this.onPressAddLabel.bind(this, item, index)}>
						<View
							style={{
								alignItems: 'center',
								justifyContent: 'center',
								width: CellWidth,
								height: CellHight,
								backgroundColor: '#f3f3f3',
								borderWidth: 1,
								borderRadius: 5,
								borderColor: '#f3f3f3'
							}}
						>
							<Text style={{ color: '#5c5c5c' }}>{item.name}</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
			);
		});
		return (
			<View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
				<TouchableWithoutFeedback onPress={this._ClosePage}>
					<View style={{ height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}>
						<Image style={{ height: 20, width: 20 }} source={require('../../img/news/closegray.png')} />
					</View>
				</TouchableWithoutFeedback>
				<View
					style={{
						flexDirection: 'row',
						height: 40,
						backgroundColor: '#fff',
						padding: 10,
						alignItems: 'center'
					}}
				>
					<Text style={{ fontSize: 16 }}>我的频道</Text>
					<Text style={{ fontSize: 12, color: '#999999', paddingLeft: 10 }}>
						{this.state.isEdit ? '拖拽可进行排序' : '点击进入频道'}
					</Text>
					<TouchableWithoutFeedback onPress={this._onPressEdit}>
						<View
							style={{
								width: 50,
								height: 25,
								backgroundColor: '#d7d7d7',
								position: 'absolute',
								right: 10,
								justifyContent: 'center',
								alignItems: 'center',
								borderRadius: 5
							}}
						>
							<Text style={{ fontSize: 12, color: '#5c5c5c' }}>{this.state.isEdit ? '完成' : '编辑'}</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
				<View
					style={{
						flexDirection: 'column',
						width: width,
						marginTop: 10,
						marginLeft: 10,
						marginBottom: 10
						//marginRight: 10
					}}
				>
					{boxes}
				</View>
				<View
					style={{
						flexDirection: 'row',
						backgroundColor: '#fff',
						top: this.state._RecommandTop,
						padding: 10,
						alignItems: 'center'
					}}
				>
					<Text style={{ fontSize: 16 }}>推荐频道</Text>
					<Text style={{ fontSize: 12, color: '#999999', paddingLeft: 10 }}>点击添加频道</Text>
				</View>
				<View
					style={{
						flexDirection: 'column',
						top: this.state._RecommandTop,
						width: width,
						marginTop: 10,
						marginLeft: 10,
						marginBottom: 10
						//marginRight: 10
					}}
				>
					{boxes_re}
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	touchBox: {
		width: CellWidth,
		height: CellHight,
		backgroundColor: '#fff',
		position: 'absolute',
		left: 0,
		top: 0
	}
});
let GetAllClass = async function() {
	//获取服务器所有分类
	let result = await net.ApiPost('article', 'GetAllClass');
	if (result != null && result.status == 1) {
		let data = result.data.sort(function(a, b) {
			//升序排序
			return a.ordernum - b.ordernum;
		});
		return data;
	}
	return null;
};
//交集
let Intersect = function(a1, a2) {
	let array1 = a1.length > a2.length ? a1 : a2;
	let array2 = a1.length > a2.length ? a2 : a1;
	let map1 = {};
	let result = [];
	for (let i = 0; i < array2.length; i++) {
		map1[array2[i].id] = array2[i];
	}
	for (let i = 0; i < array1.length; i++) {
		//delete map1[array2[i].id];
		if (map1[array1[i].id]) {
			result.push(array1[i]);
		}
	}
	console.log(result);
	return result;
};

//并集
let Union = function(a1, a2) {
	let map1 = {};
	let result = [];
	for (let i = 0; i < a1.length; i++) {
		map1[a1[i].id] = a1[i];
		result.push(a1[i]);
	}
	for (let i = 0; i < a2.length; i++) {
		if (!map1[a2[i].id]) {
			result.push(a2[i]);
		}
	}
	console.log(result);
	return result;
};
let Minus = function(a1, a2) {
	let array1 = a1.length > a2.length ? a1 : a2;
	let array2 = a1.length > a2.length ? a2 : a1;
	let map1 = {};
	let result = [];
	for (let i = 0; i < array2.length; i++) {
		map1[array2[i].id] = array2[i];
	}
	for (let i = 0; i < array1.length; i++) {
		if (!map1[array1[i].id]) {
			result.push(array1[i]);
		}
	}
	console.log(result);
	return result;
};
