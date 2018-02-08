import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	Image,
	View,
	TouchableWithoutFeedback,
	Dimensions,
	TouchableOpacity,
	CameraRoll
} from 'react-native';
import skin from '../../../style';
import net from '../../../logic/net';
import PageHelper from '../../../logic/pageHelper';
import Toast from 'react-native-root-toast';
import fileDownloadUtil from '../../../logic/fileDownloadUtil';
import Upload from '../../../logic/imgUtil';
import RNFetchBlob from 'react-native-fetch-blob';
//获取屏幕宽高
let { width, height } = Dimensions.get('window');
/**
 * 图片展示（生成的电子合同）
 *
 * @author zhangchao
 * @export
 * @class EContractImage
 * @extends {Component}
 */
export class EContractImage extends Component {
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: navigation.state.params.title,
		headerTitleStyle: {
			alignSelf: 'center',
			textAlign: 'center',
			fontSize: 16,
			color: '#FFF'
		},
		headerRight:
			navigation.state.params.title == '电子合同' ? (
				<TouchableWithoutFeedback
					onPress={() => {
						navigation.goBack(PageHelper.getPageKey('eContractDetail')); //关闭到主页
					}}
				>
					<View>
						<Text
							style={{
								color: 'white',
								backgroundColor: skin.main,
								fontSize: 16,
								paddingRight: 20
							}}
						>
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
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
		this.state = {
			title: '电子合同',
			imgagearrs: []
		};
	}

	//组件初始化完毕
	componentDidMount() {
		let imgages = [];
		let result = this.params.imgagearrs;
		for (let item of result) {
			imgages.push({ index: imgages.length, url: item });
		}
		this.setState({
			imgagearrs: imgages
		});
		this.downLoad2();
	}

	//下载图片
	downLoad2 = () => {
		let result = this.params.imgagearrs;
		this.recursionIndex(0, result.length, result);
	};

	recursionIndex = (index, count, result) => {
		if (index < count) {
			RNFetchBlob.config({
				fileCache: true,
				// by adding this option, the temp files will have a file extension
				appendExt: 'png'
			})
				.fetch(
					'GET',
					result[index],
					{
						//some headers ..
					}
				)
				.then((res) => {
					this.saveImgs(res.path());
					++index;
					this.recursionIndex(index, count, result);
				});
		} else {
			Toast.show('图片保存到相册成功！', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	//下载图片到本地
	onDownloadImg = async () => {
		let result = this.params.imgagearrs;
		for (let item of result) {
			//下载生成的电子合同到本地
			let path = await fileDownloadUtil.downloadImage(item);
			if (path) {
				this.saveImgs(path);
			}
		}
		if (result.length > 0) {
			Toast.show('图片保存到相册成功！', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		} else {
			Toast.show('图片保存到相册失败！', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	//保存图片到相册
	saveImgs = async (path) => {
		CameraRoll.saveToCameraRoll(path).then(
			function(success) {
				// console.log('图片保存到相册成功');
				// console.log(success);
				fileDownloadUtil.deleteFile(path);
			},
			function(error) {
				// console.log('图片保存到相册失败');
				// console.log(error);
			}
		);
	};

	//在组件销毁的时候要将其移除
	componentWillUnmount = async () => {
		for (let item of result) {
			await ECDelImg(item);
		}
	};
	//查看生成的电子合同大图
	ViewBigImage = (item) => {
		this.nav.navigate('eContractBigImg', {
			imgagearrs: this.state.imgagearrs,
			index: item.index
		});
	};
	render() {
		if (this.state.imgagearrs.length > 0) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						flexWrap: 'wrap',
						backgroundColor: '#fff'
					}}
				>
					{this.state.imgagearrs.map((item, index) => (
						<View
							key={index + new Date().getTime() + 1}
							style={{
								width: 80,
								height: 112,
								marginTop: 10,
								marginLeft: (width - 4 * 80) / 5
							}}
						>
							<TouchableOpacity
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								key={index + new Date().getTime()}
								onPress={() => {
									this.ViewBigImage(item);
								}}
							>
								<Image style={{ width: 80, height: 112 }} source={{ uri: item.url }} />
							</TouchableOpacity>
						</View>
					))}
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
				/>
			);
		}
	}
}

//电子合同删除图片
let ECDelImg = async function(url) {
	let filename = url.substring(url.lastIndexOf('/') + 1);
	let result = await net.MaterialPost('DelImg.ashx', {
		img: filename
	});
	if (result != null && result.status == 1) {
		return result.data;
	}

	return null;
};
