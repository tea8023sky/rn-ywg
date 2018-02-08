import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Modal,
	TouchableHighlight,
	CameraRoll,
	Image,
	NativeModules,
	Platform
} from 'react-native';
import Toast from 'react-native-root-toast';
import ImageViewer from 'react-native-image-zoom-viewer';
let Dimensions = require('Dimensions');
import skin from '../../../style';
import Header from '../../header';
import Icon from 'react-native-vector-icons/Ionicons';
import cache from '../../../logic/cache';
import config from '../../../config';
import image from '../../../logic/image';
import SharePlatform from '../../../logic/SharePlatform';
import { ChatMessage } from '../../../logic/chat';
import fileDownloadUtil from '../../../logic/fileDownloadUtil';
import Upload from '../../../logic/imgUtil';
import { Loading } from '../../loading';
let { width, height } = Dimensions.get('window');
import RNFetchBlob from 'react-native-fetch-blob';

/**
 *
 * 工具-电子合同-查看大图
 * @author zhangchao
 * @export
 * @class EContractBigImg
 * @extends {Component}
 */
export default class EContractBigImg extends Component {
	static navigationOptions = {
		header: headerProps => {
			return (
				<View>
					<Header />
				</View>
			);
		}
	};

	constructor(props) {
		//构造方法
		super(props);
		this.nav = this.props.navigation; //获取导航对象
		this.params = this.nav.state.params; //获取参数
		this.path = null;
		this.state = {
			isMenuShow: false,
			index: this.params.index,
			imgagearrs: this.params.imgagearrs,
			imgcount: this.params.imgagearrs.length,
			isShareMenuShow: false //分享面板
		};
	}

	//组件初始化完毕
	componentDidMount() {
		this.downLoad2(this.state.index);
	}
	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		fileDownloadUtil.deleteFile(this.path);
	}
	//下载图片
	downLoad2 = index => {
		RNFetchBlob.config({
			fileCache: true,
			// by adding this option, the temp files will have a file extension
			appendExt: 'png'
		})
			.fetch('GET', this.state.imgagearrs[index].url, {
				//some headers ..
			})
			.then(res => {
				this.path = 'file:///' + res.path();
			});
	};

	/*
	*发表动态
	* burl {string} 图片路径
	*/
	async publishDy(burl) {
		this.refs.loading.Isvisible(true);
		//将图片上传到图片站
		let uploadres = null;
		if (this.path != null) {
			uploadres = await Upload.UploadImg(
				{ uri: this.path },
				'ywg_dynamic'
			);
		}
		if (uploadres != null) {
			let imgages = uploadres.split(','); //例：[smallImgUrl,bigImgUrl]
			//读取缓存中动态内容文本
			let cacheDatas = await cache.LoadFromFile(config.PublishDynamicKey);
			if (cacheDatas == null) {
				//往动态缓存中存取信息
				await cache.SaveToFile(config.PublishDynamicKey, {
					content: '',
					simgsArr: [{ index: 0, url: imgages[0] }],
					bimgsArr: [{ url: imgages[1] }],
					url: ''
				});
			} else {
				let content = cacheDatas.content ? cacheDatas.content : '';
				let simgsArr = cacheDatas.simgsArr ? cacheDatas.simgsArr : [];
				let bimgsArr = cacheDatas.bimgsArr ? cacheDatas.bimgsArr : [];
				let url = cacheDatas.url ? cacheDatas.url : '';
				simgsArr.push({ index: simgsArr.length, url: imgages[0] }),
					bimgsArr.push({ url: imgages[1] });
				//往动态缓存中存取信息
				await cache.SaveToFile(config.PublishDynamicKey, {
					content: content,
					simgsArr: simgsArr,
					bimgsArr: bimgsArr,
					url: url
				});
			}
			this.refs.loading.Isvisible(false);
			this.nav.navigate('publish', { isgoback: true });
		} else {
			Toast.show('发表动态失败,请稍后重试.', {
				duration: Toast.durations.LONG,
				position: Toast.positions.CENTER
			});
			this.refs.loading.Isvisible(false);
		}
	}
	/*
	*发送给联系人功能
	* burl {string} 图片路径
	*/
	async sendFriend(burl) {
		this.refs.loading.Isvisible(true);

		//将图片上传到图片站
		let uploadres = null;
		if (this.path != null) {
			uploadres = await Upload.UploadImg(
				{ uri: this.path },
				'ywg_dynamic'
			);
		}

		if (uploadres != null) {
			this.refs.loading.Isvisible(false);
			//跳转到多选页面
			this.nav.navigate('multipleChoice', {
				confirmNum: 0,
				chatMessage: {
					content: uploadres,
					contentType: ChatMessage.ContentType.Chat_Image
				}
			});
		} else {
			this.refs.loading.Isvisible(false);
			Toast.show('发送给联系人失败,请稍后重试.', {
				duration: Toast.durations.LONG,
				position: Toast.positions.CENTER
			});
		}
	}

	_goBackPage = () => {
		//点击返回事件
		this.nav.goBack();
	};
	//点击分享
	_onPress_share = () => {
		this.setState({ isShareMenuShow: true });
	};

	shareWeixin = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'电子合同',
			'电子合同工具是为业务员提供合同签署的便捷工具...',
			this.state.imgagearrs[this.state.index].url,
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.WECHAT,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装微信，需要安装微信方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	sharePyq = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'电子合同',
			'电子合同工具是为业务员提供合同签署的便捷工具...',
			this.state.imgagearrs[this.state.index].url,
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.WECHATMOMENT,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装微信，需要安装微信方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	shareQQ = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'电子合同',
			'电子合同工具是为业务员提供合同签署的便捷工具...',
			this.state.imgagearrs[this.state.index].url,
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.QQ,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装QQ，需要安装QQ方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};
	shareQQZONE = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			'电子合同',
			'电子合同工具是为业务员提供合同签署的便捷工具...',
			this.state.imgagearrs[this.state.index].url,
			'http://yw.gangguwang.com/static/images/logo1.png',
			SharePlatform.QQZONE,
			(code, message) => {
				if (code == 200 || code == '分享成功') {
					//正常
					return;
				} else if (code == '取消分享') {
				} else if (code.indexOf('2008') > -1) {
					Toast.show('检测到系统未安装QQ，需要安装QQ方可使用.', {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				} else {
					Toast.show(code, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		);
	};

	render() {
		return (
			<View style={dyImgsStyle.container}>
				<View style={dyImgsStyle.navationSelf}>
					<View style={dyImgsStyle.goBackContainer}>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.tujibg}
							onPress={this._goBackPage}
						>
							<View style={dyImgsStyle.goBackSty}>
								<Icon
									name="ios-arrow-back"
									size={24}
									style={{ color: skin.tint }}
								/>
							</View>
						</TouchableHighlight>
						<View
							style={{
								flex: 8,
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Text style={dyImgsStyle.indexText}>
								{this.state.index +
									1 +
									'/' +
									this.state.imgcount}
							</Text>
						</View>
					</View>
				</View>
				<View style={{ flex: 10 }}>
					<ImageViewer
						index={this.state.index}
						imageUrls={this.state.imgagearrs}
						onChange={index => {
							this.setState({ index: index });
							this.downLoad2(index);
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
						style={{
							backgroundColor: '#00000011',
							width: width,
							height: height
						}}
						animationType={'fade'}
						transparent={true}
						visible={this.state.isMenuShow}
						onRequestClose={() => {
							this.setState({ isMenuShow: false });
						}}
					>
						<TouchableHighlight
							onPress={() => {
								this.setState({ isMenuShow: false });
							}}
						>
							<View
								style={{
									backgroundColor: '#00000055',
									width: width,
									height: height
								}}
							/>
						</TouchableHighlight>
						<View style={dyImgsStyle.modalContainer}>
							<View style={{ flexDirection: 'column' }}>
								<TouchableHighlight
									onPress={() => {
										this.setState({ isMenuShow: false });
										if (
											this.state.imgagearrs &&
											this.state.imgcount > 0 &&
											this.state.index >= 0
										) {
											this.sendFriend(
												this.state.imgagearrs[
													this.state.index
												].url
											);
										} else {
											Toast.show(
												'发送给联系人失败,请稍后重试.',
												{
													duration:
														Toast.durations.LONG,
													position:
														Toast.positions.CENTER
												}
											);
										}
									}}
								>
									<View style={dyImgsStyle.modalTextOuter}>
										<Text style={dyImgsStyle.modalText}>
											发送给联系人
										</Text>
									</View>
								</TouchableHighlight>
								<TouchableHighlight
									onPress={() => {
										this.setState({ isMenuShow: false });
										if (
											this.state.imgagearrs &&
											this.state.imgcount > 0 &&
											this.state.index >= 0
										) {
											this.publishDy(
												this.state.imgagearrs[
													this.state.index
												].url
											);
										} else {
											Toast.show(
												'发表动态失败,请稍后重试.',
												{
													duration:
														Toast.durations.LONG,
													position:
														Toast.positions.CENTER
												}
											);
										}
									}}
								>
									<View style={dyImgsStyle.modalTextOuter}>
										<Text style={dyImgsStyle.modalText}>
											发表动态
										</Text>
									</View>
								</TouchableHighlight>
							</View>

							<TouchableHighlight
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
									<Text
										style={{
											fontSize: 16,
											color: skin.main
										}}
									>
										取消
									</Text>
								</View>
							</TouchableHighlight>
						</View>
					</Modal>
				</View>
				<View
					style={{
						//自定义导航栏
						flex: 1,
						justifyContent: 'center',
						height: 60
					}}
				>
					<View style={{ flex: 1, height: 19 }} />

					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							height: 40,
							paddingLeft: width - 40
						}}
					>
						<TouchableHighlight onPress={this._onPress_share}>
							<Image
								style={{
									width: 25,
									height: 25,
									alignItems: 'center'
								}}
								source={image.newsimages.share}
							/>
						</TouchableHighlight>
					</View>
				</View>
				<Modal
					style={{
						backgroundColor: '#00000011',
						width: width,
						height: height
					}}
					animationType={'fade'}
					transparent={true}
					visible={this.state.isShareMenuShow}
					onRequestClose={() => {
						this.setState({ isShareMenuShow: false });
					}}
				>
					<TouchableHighlight
						onPress={() => {
							this.setState({ isShareMenuShow: false });
						}}
					>
						<View
							style={{
								backgroundColor: '#00000055',
								width: width,
								height: height
							}}
						/>
					</TouchableHighlight>
					<View
						style={{
							backgroundColor: '#fff',
							flexDirection: 'row',
							position: 'absolute',
							bottom: 0,
							right: 0,
							borderTopColor: '#f3f3f3',
							width: width,
							justifyContent: 'space-around',
							alignItems: 'center',
							height: width / 5
						}}
					>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.shareWeixin()}
						>
							<View
								style={{
									alignItems: 'center',
									justifyContent: 'center',
									flex: 1
								}}
							>
								<Image
									style={{ width: 30, height: 30 }}
									source={image.newsimages.weixin}
								/>
								<Text>微信好友</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.sharePyq()}
						>
							<View
								style={{
									alignItems: 'center',
									justifyContent: 'center',
									flex: 1
								}}
							>
								<Image
									style={{ width: 30, height: 30 }}
									source={image.newsimages.pengyouq}
								/>
								<Text>微信朋友圈</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.shareQQ()}
						>
							<View
								style={{
									alignItems: 'center',
									justifyContent: 'center',
									flex: 1
								}}
							>
								<Image
									style={{ width: 30, height: 30 }}
									source={image.newsimages.qq}
								/>
								<Text>QQ</Text>
							</View>
						</TouchableHighlight>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							onPress={() => this.shareQQZONE()}
						>
							<View
								style={{
									alignItems: 'center',
									justifyContent: 'center',
									flex: 1
								}}
							>
								<Image
									style={{ width: 30, height: 30 }}
									source={image.newsimages.qqzone}
								/>
								<Text>QQ空间</Text>
							</View>
						</TouchableHighlight>
					</View>
				</Modal>
				<Loading text="正在上传图片..." ref="loading" />
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
