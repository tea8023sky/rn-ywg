import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableWithoutFeedback,
	TouchableHighlight,
	BackHandler,
	Platform
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/Ionicons';
import skin from '../../style';
import Header from '../header';
import event from '../../logic/event';
import cache from '../../logic/cache';
import config from '../../config';
let Dimensions = require('Dimensions');
let { width, height } = Dimensions.get('window');

/**
 *
 * 动态中的九宫格图片展示(带删除功能：上传图片能用到的大图展示组件)
 * @author zhengyeye
 * @export
 * @class imgsCanDel
 * @extends {Component}
 */
export default class imgsCanDel extends Component {
	static navigationOptions = {
		header: (headerProps) => {
			return (
				<View>
					<Header color="#000" />
				</View>
			);
		}
	};

	//构造方法
	constructor(props) {
		super(props);
		this.nav = this.props.navigation; //获取导航对象
		this.params = this.nav.state.params; //获取参数
		this.state = {
			index: this.params.index,
			simgsArr: this.params.simgsArr,
			bimgsArr: this.params.bimgsArr,
			imgcount: this.params.bimgsArr.length
		};
	}

	//点击返回事件
	_goBackPage = () => {
		event.Send(event.Events.dynamic.delImg, { simgsArr: this.state.simgsArr, bimgsArr: this.state.bimgsArr });
		this.nav.goBack();
	};

	_onDelImages = async () => {
		let currentIndex = this.state.index; //当前图片下标
		let newIndex = 0; //图片下标
		let imgcount = 0; //图片总数

		let simgsArr = this.state.simgsArr;
		let bimgsArr = this.state.bimgsArr;

		let initSimgsArr = []; //初始化小图
		let initBimgsArr = []; //初始化大图
		let simgindex = -1; //小图下标
		for (let index in bimgsArr) {
			if (index == currentIndex) {
				continue;
			}
			++simgindex;
			initSimgsArr.push({ index: simgindex, url: simgsArr[index].url });
			initBimgsArr.push(bimgsArr[index]);
		}
		imgcount = initSimgsArr.length;

		if (currentIndex == 0) {
			newIndex = 0;
		} else if (currentIndex > 0) {
			newIndex = currentIndex - 1;
		}

		if (initSimgsArr.length == 0) {
			event.Send(event.Events.dynamic.delImg, { simgsArr: [], bimgsArr: [] });
			this.nav.goBack();
		} else {
			this.setState({
				index: newIndex,
				simgsArr: initSimgsArr,
				bimgsArr: initBimgsArr,
				imgcount: imgcount
			});
		}
	};

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: '#000000' }}>
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'center',
						height: 40
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
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={this._goBackPage}
						>
							<View
								style={{
									flex: 1,
									height: 32,
									width: 32,
									paddingLeft: 10,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Icon name="ios-arrow-back" size={24} style={{ color: '#FFF' }} />
							</View>
						</TouchableHighlight>
						<View style={{ flex: 8 }} />
						<View style={{ flex: 2 }}>
							<Text
								style={{ color: '#FFF', fontSize: 16, justifyContent: 'center', alignItems: 'center' }}
							>
								{this.state.index + 1 + '/' + this.state.imgcount}
							</Text>
						</View>

						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={this._onDelImages}
						>
							<View
								style={{
									flex: 2,
									height: 32,
									justifyContent: 'center',
									alignItems: 'center',
									paddingRight: 20
								}}
							>
								<Icon name="ios-trash-outline" size={24} style={{ color: '#FFF' }} />
							</View>
						</TouchableHighlight>
					</View>
				</View>
				<View style={{ flex: 10 }}>
					<ImageViewer
						index={this.state.index}
						imageUrls={this.state.bimgsArr}
						saveToLocalByLongPress={false}
						onChange={(index) => {
							this.setState({ index: index });
						}}
						renderHeader={() => {
							return null;
						}}
						renderFooter={() => {
							return null;
						}}
						//索引指示器重写
						renderIndicator={(currentIndex, allSize) => {
							return null;
						}}
					/>
				</View>
			</View>
		);
	}
}
