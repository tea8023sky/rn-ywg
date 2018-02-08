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
	CameraRoll,
	Alert
} from 'react-native';
import Header from '../../header';
import skin from '../../../style';
import image from '../../../logic/image';
import event from '../../../logic/event';
import net from '../../../logic/net';
import cache from '../../../logic/cache';
import fileDownloadUtil from '../../../logic/fileDownloadUtil';
import RNFetchBlob from 'react-native-fetch-blob';
import PageHelper from '../../../logic/pageHelper';
import config from '../../../config';
import TimeUtil from '../../../logic/TimeUtil';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/Ionicons';

//获取屏幕宽高
let { width, height } = Dimensions.get('window');

export default class resultImage extends Component {
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: navigation.state.params.title,
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
		headerRight:
			navigation.state.params.title == '材质书' ? (
				<TouchableWithoutFeedback
					onPress={() => {
						navigation.goBack(PageHelper.getPageKey('statement')); //关闭到主页
					}}
				>
					<View>
						<Text style={{ color: 'white', backgroundColor: skin.main, fontSize: 16, paddingRight: 20 }}>
							关闭
						</Text>
					</View>
				</TouchableWithoutFeedback>
			) : (
				''
			)
	});

	constructor(props) {
		super(props);
		this.state = {};
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
		this.path = '';
		//this.nav.goBack(PageHelper.getPageKey('jcMain'));
	}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	//组件初始化完成
	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		}); 
		this.downLoad2();
	}

	downLoad2 = () => {
		RNFetchBlob.config({
			fileCache: true,
			// by adding this option, the temp files will have a file extension
			appendExt: 'png'
		})
			.fetch(
				'GET',
				this.params.url,
				{
					//some headers ..
				}
			)
			.then((res) => {
				// the temp file path with file extension `png`
				console.log('The file saved to ', res.path());
				// Beware that when using a file path as Image source on Android,
				// you must prepend "file://"" before the file path
				this.save(res.path());
			});
	};

	//下载图片
	// async downLoad() {
	// 	let path = await fileDownloadUtil.downloadImage(this.params.url);
	// 	if (path) {
	// 		this.path = path;
	// 		this.save(path);
	// 	} else {
	// 		Toast.show('下载失败', {
	// 			duration: Toast.durations.SHORT,
	// 			position: Toast.positions.BOTTOM
	// 		});
	// 	}
	//}
	//保存图片到相册
	save = async (path) => {
		CameraRoll.saveToCameraRoll(path).then(
			function(success) {
				Toast.show('图片保存到相册成功', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});

				fileDownloadUtil.deleteFile(path);
			},
			function(error) {
				Toast.show('图片保存到相册失败', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		);
	};
	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		if (this.params.title == '材质书') {
			MaterialDelImg(this.params.url);
		} else {
			_RemoveImg(this.params.url);
		}
	}
	ViewBigImage = () => {
		//this.goBack('jcMain');
		//this.nav.navigate('dynamicImgs', { bigimgsdata: [{ url: this.params.url }], index: 0, type: 'tool' });
		this.nav.navigate('dynamicImgs', {
			simgsArr: [ { url: this.params.url } ],
			bimgsArr: [ { url: this.params.url } ],
			index: 0,
			type: 'tool'
		});
	};
	render() {
		return (
			<View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#f3f3f3', padding: 20 }}>
				<TouchableWithoutFeedback onPress={this.ViewBigImage}>
					<Image
						style={{ width: width - 40, height: height / 2 }}
						resizeMode="center"
						source={{ uri: this.params.url }}
					/>
				</TouchableWithoutFeedback>

				<Text style={{}}>图片已保存到相册</Text>
			</View>
		);
	}
}

//下载后移除图片
let _RemoveImg = async function(url) {
	let filename = url.substring(url.lastIndexOf('/') + 1);
	let result = await net.ApiPost('offer', 'RemoveImg', {
		filename: filename
	});
	if (result != null && result.status == 1) {
		return result.data;
	}

	return null;
};

//材质书删除图片
let MaterialDelImg = async function(url) {
	let filename = url.substring(url.lastIndexOf('/') + 1);
	let result = await net.MaterialPost('DelImg.ashx', {
		img: filename
	});
	if (result != null && result.status == 1) {
		return result.data;
	}

	return null;
};
