import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import skin from '../../../style';
let Dimensions = require('Dimensions');
let { width, height } = Dimensions.get('window');

/**
 * 查看大图（报价单）
 * @author zhangchao
 * @export
 * @class PreviewBigImg
 * @extends {Component}
 */
export default class PreviewBigImg extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '1/1',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: '#FFF'
			},
			headerStyle: {
				backgroundColor: skin.tujibg, //导航条背景色
				height: 60 //导航条高度,40导航条高度+20沉侵高度
			}
		};
	};
	//构造方法
	constructor(props) {
		super(props);
		this.nav = this.props.navigation; //获取导航对象
		this.params = this.nav.state.params; //获取参数
		this.state = {
			index: 0,
			imgUrl: this.params.imgUrl
		};
	}

	//组件初始化完毕
	componentDidMount() {}

	render() {
		let Images = [];
		Images.push({ url: this.state.imgUrl });
		return (
			<View style={{ flex: 1, flexDirection: 'column' }}>
				<ImageViewer imageUrls={Images} saveToLocalByLongPress={false} />
			</View>
		);
	}
}
