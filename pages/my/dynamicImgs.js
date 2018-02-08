import React, { Component } from 'react';
import { View, Text, StyleSheet, Modal, TouchableHighlight, CameraRoll } from 'react-native';
import Toast from 'react-native-root-toast';
import ImageViewer from 'react-native-image-zoom-viewer';
let Dimensions = require('Dimensions');
import skin from '../../style';
import Header from '../header';
import Icon from 'react-native-vector-icons/Ionicons';
import fileDownloadUtil from '../../logic/fileDownloadUtil';
import RNFetchBlob from 'react-native-fetch-blob';
import cache from '../../logic/cache';
import config from '../../config';
let { width, height } = Dimensions.get('window');
import { ChatMessage } from '../../logic/chat';
import user from '../../logic/user';
/**
 *
 * 动态中的九宫格图片展示(不带删除功能，只是展示而已)
 * @author zhengyeye
 * @export
 * @class dynamicImgs
 * @extends {Component}
 */
export default class dynamicImgs extends Component {
	static navigationOptions = {
		header: (headerProps) => {
			return (
				<View>
					<Header color="#000" />
				</View>
			);
		}
	};

	constructor(props) {
		//构造方法
		super(props);
		this.nav = this.props.navigation; //获取导航对象
		this.params = this.nav.state.params; //获取参数
		this.state = {
			isMenuShow: false,
			index: this.params.index,
			simgsArr: this.params.simgsArr,
			bimgsArr: this.params.bimgsArr,
			imgcount: this.params.simgsArr.length
		};
	}

	componentDidMount() {
		//组件初始化完毕
	}

	async downLoad(url) {
		//下载图片
		// let path = await fileDownloadUtil.downloadImage(url);
		// if (path) {
		// 	this.path = path;
		// 	this.save(path);
		// } else {
		// 	Toast.show('下载失败', {
		// 		duration: Toast.durations.SHORT,
		// 		position: Toast.positions.BOTTOM
		// 	});
		// }

		RNFetchBlob.config({
			fileCache: true,
			// by adding this option, the temp files will have a file extension
			appendExt: 'png'
		})
			.fetch(
				'GET',
				url,
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
	}

	save = async (path) => {
		//长按图片保存到相册
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

	async publishDy(burl) {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			//burl:为大图路径 长按图片发表动态
			//读取缓存中动态内容文本
			let cacheDatas = await cache.LoadFromFile(config.PublishDynamicKey);
			if (cacheDatas == null || cacheDatas.length == 0) {
				//往动态缓存中存取信息
				await cache.SaveToFile(config.PublishDynamicKey, {
					content: '',
					simgsArr: [ { index: 0, url: this.state.simgsArr[this.state.index].url } ],
					bimgsArr: [ { url: burl } ],
					url: ''
				});
			} else {
				let content = cacheDatas.content ? cacheDatas.content : '';
				let simgsArr = cacheDatas.simgsArr ? cacheDatas.simgsArr : [];
				let bimgsArr = cacheDatas.bimgsArr ? cacheDatas.bimgsArr : [];
				let url = cacheDatas.url ? cacheDatas.url : '';
				let isflag = true; //验证图片发表的图片是否重复，为true表示不重复，为false时表示重复
				for (let item of bimgsArr) {
					if (item.url === burl) {
						isflag = false;
						break;
					}
				}
				//isflag=true表示不重复,否则重复
				if (isflag) {
					simgsArr.push({ index: simgsArr.length, url: this.state.simgsArr[this.state.index].url }),
						bimgsArr.push({ url: burl });
					//往动态缓存中存取信息
					await cache.SaveToFile(config.PublishDynamicKey, {
						content: content,
						simgsArr: simgsArr,
						bimgsArr: bimgsArr,
						url: url
					});
				} else {
					Toast.show('图片已存在列表中.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
			this.nav.navigate('publish');
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	}

	async sendFriend() {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			//发送给联系人
			if (this.state.bimgsArr && this.state.simgsArr && this.state.index >= 0) {
				const chatMsg = {
					content:
						this.state.simgsArr[this.state.index].url + ',' + this.state.bimgsArr[this.state.index].url,
					contentType: ChatMessage.ContentType.Chat_Image
				};
				//跳转到多选页面
				this.nav.navigate('multipleChoice', { confirmNum: 0, chatMessage: chatMsg });
			} else {
				Toast.show('发送给联系人失败,请稍后重试.', {
					duration: Toast.durations.LONG,
					position: Toast.positions.CENTER
				});
			}
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	}

	_goBackPage = () => {
		//点击返回事件
		this.nav.goBack();
	};
	render() {
		return (
			<View style={dyImgsStyle.container}>
				<View style={dyImgsStyle.navationSelf}>
					<View style={dyImgsStyle.goBackContainer}>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={this._goBackPage}
						>
							<View style={dyImgsStyle.goBackSty}>
								<Icon name="ios-arrow-back" size={24} style={{ color: skin.tint }} />
							</View>
						</TouchableHighlight>
						<View style={{ flex: 7 }} />
						<View style={{ flex: 2 }}>
							<Text style={dyImgsStyle.indexText}>
								{this.state.index + 1 + '/' + this.state.imgcount}
							</Text>
						</View>
					</View>
				</View>
				<View style={{ flex: 10 }}>
					<ImageViewer
						index={this.state.index}
						imageUrls={this.state.bimgsArr}
						onChange={(index) => {
							this.setState({ index: index });
						}}
						saveToLocalByLongPress={false}
						onLongPress={() => {
							if (this.params.type == 'tool') {
							} else {
								this.setState({ isMenuShow: true });
							}
						}}
						//索引指示器重写
						renderIndicator={(currentIndex, allSize) => {
							return null;
						}}
					/>
					<Modal
						style={{ backgroundColor: '#00000011', width: width, height: height }}
						animationType={'fade'}
						transparent={true}
						visible={this.state.isMenuShow}
						onRequestClose={() => {
							this.setState({ isMenuShow: false });
						}}
					>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => {
								this.setState({ isMenuShow: false });
							}}
						>
							<View style={{ backgroundColor: '#00000055', width: width, height: height }} />
						</TouchableHighlight>
						<View style={dyImgsStyle.modalContainer}>
							<View style={{ flexDirection: 'column' }}>
								<TouchableHighlight
									activeOpacity={1}
									underlayColor={skin.transparentColor}
									onPress={() => {
										this.setState({ isMenuShow: false });
										if (this.state.bimgsArr && this.state.imgcount > 0 && this.state.index >= 0) {
											this.sendFriend();
										} else {
											Toast.show('发送给联系人失败,请稍后重试.', {
												duration: Toast.durations.SHORT,
												position: Toast.positions.BOTTOM
											});
										}
									}}
								>
									<View style={dyImgsStyle.modalTextOuter}>
										<Text style={dyImgsStyle.modalText}>发送给联系人</Text>
									</View>
								</TouchableHighlight>
								<TouchableHighlight
									activeOpacity={1}
									underlayColor={skin.transparentColor}
									onPress={() => {
										this.setState({ isMenuShow: false });
										if (this.state.bimgsArr && this.state.imgcount > 0 && this.state.index >= 0) {
											this.publishDy(this.state.bimgsArr[this.state.index].url);
										} else {
											Toast.show('发表动态失败,请稍后重试.', {
												duration: Toast.durations.SHORT,
												position: Toast.positions.BOTTOM
											});
										}
									}}
								>
									<View style={dyImgsStyle.modalTextOuter}>
										<Text style={dyImgsStyle.modalText}>发表动态</Text>
									</View>
								</TouchableHighlight>
								<TouchableHighlight
									activeOpacity={1}
									underlayColor={skin.transparentColor}
									onPress={() => {
										this.setState({ isMenuShow: false });
										if (this.state.bimgsArr && this.state.imgcount > 0 && this.state.index >= 0) {
											this.downLoad(this.state.bimgsArr[this.state.index].url);
										} else {
											Toast.show('保存图片失败,请稍后重试.', {
												duration: Toast.durations.SHORT,
												position: Toast.positions.BOTTOM
											});
										}
									}}
								>
									<View style={dyImgsStyle.modalTextOuter}>
										<Text style={dyImgsStyle.modalText}>保存图片</Text>
									</View>
								</TouchableHighlight>
							</View>

							<View style={{ width: width, height: 5, backgroundColor: '#e0e0e0' }} />
							<TouchableHighlight
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								onPress={() => {
									this.setState({ isMenuShow: false });
								}}
							>
								<View
									style={{
										width: width,
										height: 48,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Text style={{ fontSize: 16, color: skin.main }}>取消</Text>
								</View>
							</TouchableHighlight>
						</View>
					</Modal>
				</View>
			</View>
		);
	}
}

const dyImgsStyle = StyleSheet.create({
	//设置样式
	//最外层的容器
	container: {
		flex: 1,
		backgroundColor: skin.tujibg
	},
	navationSelf: {
		//自定义导航栏
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		height: 40
	},
	goBackContainer: {
		//自定义导航栏中返回按钮
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	goBackSty: {
		flex: 1,
		height: 32,
		width: 32,
		paddingLeft: 10,
		justifyContent: 'center',
		alignItems: 'center'
	},
	//图片下标样式开始
	indexOuterStyle: {
		backgroundColor: skin.tujibg,
		position: 'absolute',
		width: width,
		bottom: 0,
		paddingLeft: width - 40
	},
	indexText: {
		color: skin.background,
		fontSize: 16,
		justifyContent: 'center',
		alignItems: 'center'
	},
	//图片下标样式结束

	modalContainer: {
		backgroundColor: '#fff',
		flexDirection: 'column',
		position: 'absolute',
		bottom: 0,
		right: 0,
		borderTopWidth: 1,
		borderTopColor: '#f3f3f3'
	},

	modalTextOuter: {
		//弹框最外层
		flex: 1,
		borderBottomWidth: 1,
		borderBottomColor: '#f3f3f3',
		alignItems: 'center',
		justifyContent: 'center',
		height: 40
	},
	modalText: {
		fontSize: 14,
		color: '#666666',
		textAlign: 'center'
	}
});
