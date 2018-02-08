//列表item
import React, { Component, PureComponent } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	View,
	FlatList,
	TouchableHighlight,
	TouchableWithoutFeedback,
	WebView,
	Modal,
	Alert,
	Slider,
	ScrollView,
	CameraRoll,
	NativeModules,
	DeviceEventEmitter,
	NativeAppEventEmitter,
	Platform,
	AppState
} from 'react-native';
import TimeUtil from '../../logic/TimeUtil';
import net from '../../logic/net';
import image from '../../logic/image';
import cache from '../../logic/cache';
//import audio from '../../logic/audio';
import Sound from 'react-native-sound';
import user from '../../logic/user';
import device from '../../logic/device';
import config from '../../config';
import fileDownloadUtil from '../../logic/fileDownloadUtil';
import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs';
import ImageViewer from 'react-native-image-zoom-viewer';
import Toast from 'react-native-root-toast';
import CloneUtil from 'lodash'; //深拷贝
import PopupDialog, {
	DialogTitle,
	DialogButton
	//SlideAnimation,
	//ScaleAnimation,
	//FadeAnimation,
} from 'react-native-popup-dialog';
import skin from '../../style';
import SharePlatform from '../../logic/SharePlatform';
import Icon from 'react-native-vector-icons/Ionicons';
import event from '../../logic/event';
import { Loading } from '../loading';
import { ChatMessage } from '../../logic/chat';
import { Location } from './newsIndex';
import MarqueeLabelVertical from '../marqueeVertical';
//正常新闻内页
export class NewsView extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: '#FFF'
			},
			headerStyle: {
				backgroundColor: navigation.state.params.type == 2 ? '#000' : skin.main //导航条背景色
			},
			headerLeft: (
				<TouchableWithoutFeedback
					onPress={() => {
						navigation.state.params.goBackPage();
					}}
				>
					<View style={{ paddingLeft: 20 }}>
						<Icon name="ios-arrow-round-back-outline" size={30} style={{ color: '#FFF' }} />
					</View>
				</TouchableWithoutFeedback>
			),
			headerRight: (
				<TouchableWithoutFeedback
					onPress={() => {
						navigation.state.params._onPressShare();
					}}
				>
					<View style={{ paddingRight: 20 }}>
						<Icon name="ios-more" size={24} style={{ color: '#FFF' }} />
					</View>
				</TouchableWithoutFeedback>
			)
		};
	};
	//构造方法
	constructor(props) {
		super(props);
		//this.data = this.props.data;
		this.nav = this.props.navigation; //获取导航对象
		this.params = this.nav.state.params; //获取参数
		//this.id = this.params.id; //文章id
		this.type = this.params.type; //文章类型isimg属性
		this.collectflag = this.params.collectflag; //collectflag为true，表示从我的收藏中点击查看的详情；若为undefined的表示，在首页点击查看的文章
	}
	//组件初始化完毕
	componentDidMount() {}

	render() {
		switch (this.type) {
			case 1: //普通文章
				return (
					<TextContent
						id={this.params.id}
						navigation={this.props.navigation}
						collectflag={this.collectflag}
						tid={this.params.tid}
						type={this.params.type}
					/>
				);
			case 2: //图集文章
				return (
					<ImageContent
						id={this.params.id}
						navigation={this.props.navigation}
						collectflag={this.collectflag}
						tid={this.params.tid}
						type={this.params.type}
					/>
				);
			case 3: //音频文章
				return (
					<AudioContent
						id={this.params.id}
						navigation={this.props.navigation}
						collectflag={this.collectflag}
						tid={this.params.tid}
						type={this.params.type}
					/>
				);
			default:
				return (
					<TextContent
						id={this.params.id}
						navigation={this.props.navigation}
						collectflag={this.collectflag}
						tid={this.params.tid}
						type={this.params.type}
					/>
				);
		}
	}
}
let Dimensions = require('Dimensions');
let { width, height } = Dimensions.get('window');
const FONT_SIZE = [ 14, 16, 20, 24 ];
class TextContent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			load: false,
			isVideo: false,
			islike: false,
			iscollect: false,
			likecount: 0,
			isFontShow: false,
			ttsState: -1, //-1 没有播放内容  0就绪 1 暂停 2播放
			SliderValue: 1,
			isShareMenuShow: false //分享面板
		};
		this.nav = this.props.navigation;
		this.params = this.props.navigation.state.params;
		this.videourl = '';
		this.article = {};
		this.isLogin = false;
		this.imgUrls = [];
		this.articleContent = '';
		this.isClose = false;
	}
	componentWillMount() {
		//监听状态改变事件
		if (Platform.OS === 'android') {
			DeviceEventEmitter.addListener('onSpeechFinish', this.onSpeechFinished);
			DeviceEventEmitter.addListener('onSpeechError', this.onSpeechErrored);
		} else {
			// NativeAppEventEmitter.addListener(
			//   "onSpeechFinish",
			//   this.onSpeechFinished
			// );
			// this.subscription = NativeAppEventEmitter.addListener(
			//   "onSpeechFinish",
			//   body => {
			//     alert(body);
			//   }
			// );
		}
	}
	componentDidMount() {
		this.getUseLoginstate();
		if (Platform.OS === 'android') {
			NativeModules.BaiduVoiceModule.init();
		}
		AppState.addEventListener('change', this.handleAppStateChange);
		this.props.navigation.setParams({
			goBackPage: this._goBackPage,
			_onPressShare: this._onPress_share
		});
	}
	//返回上一页
	_goBackPage = () => {
		if (this.props.collectflag) {
			//发送事件，通知我的收藏刷新页面
			event.Send(event.Events.collect.mycollectsearch);
		}
		this.nav.goBack();
	};
	componentWillUnmount() {
		if (Platform.OS === 'android') {
			DeviceEventEmitter.removeListener('onSpeechFinish'); //移除监听
			DeviceEventEmitter.removeListener('onSpeechError'); //移除监听
		} else {
			//NativeAppEventEmitter.removeListener("onSpeechFinish"); //移除监听
		}
		//删除状态改变事件监听
		AppState.removeEventListener('change', this.handleAppStateChange);
		if (this.articleContent) {
			NativeModules.BaiduVoiceModule.stop();
			// if (Platform.OS === 'android') {
			// 	NativeModules.BaiduVoiceModule.release();
			// } else {
			// 	NativeModules.BaiduVoiceModule.releaseIOS();
			// }
		}
		this.isClose = true;
		this.timer && clearInterval(this.timer);
	}
	//APP状态改变响应
	handleAppStateChange = (appState) => {
		//console.log('当前状态为:' + appState);
		if (appState == 'active' && this.state.ttsState == 1) {
			NativeModules.BaiduVoiceModule.resume();
			this.setState({ ttsState: 2, ttsText: '播放中' });
			//console.log('jixu:');
		} else if (appState == 'background' && this.state.ttsState == 2) {
			NativeModules.BaiduVoiceModule.pause();
			this.setState({ ttsState: 1, ttsText: '暂停中' });
			//console.log('暂停:');
		}
		//视频暂停和播放
		if (this.state.isVideo) {
			if (appState == 'active') {
				if (this.refs.webView) {
					//视频继续播放
					this.refs.webView.injectJavaScript('player.playVideo()');
				}
			} else if (appState == 'background') {
				if (this.refs.webView) {
					//视频暂停播放
					this.refs.webView.injectJavaScript('player.pauseVideo()');
				}
			}
		}
	};
	//获取登录状态
	async getUseLoginstate() {
		this.isLogin = await user.IsLogin();
		let size = await getFontSize();
		if (size && size >= 0) {
			this.setState({ SliderValue: size });
		} else {
			this.setState({ SliderValue: 1 });
		}
	}

	onSpeechFinished = () => {
		if (!this.isClose) {
			this.setState({ ttsState: 0, ttsText: '听新闻' });
			Toast.show('播放结束', {
				duration: Toast.durations.LONG,
				position: Toast.positions.BOTTOM
			});
		}
	};
	onSpeechErrored = (error) => {
		this.setState({ ttsState: 0, ttsText: '听新闻' });
		Toast.show('播放错误', {
			duration: Toast.durations.LONG,
			position: Toast.positions.BOTTOM
		});
		console.log('播放错误' + JSON.stringify(error));
	};
	//点击听新闻
	_onPress_tts = () => {
		if (this.state.ttsState == 0) {
			//就绪
			console.log(this.articleContent);
			NativeModules.BaiduVoiceModule.batchSpeak(this.articleContent);
			if (Platform.OS === 'ios') {
				this.timer = setInterval(() => {
					NativeModules.BaiduVoiceModule.IsPlayFinishIOS((error, events) => {
						if (error) {
							console.warn(error);
						} else {
							if (events == 'ok') {
								Toast.show('播放完毕', {
									duration: Toast.durations.SHORT,
									position: Toast.positions.BOTTOM
								});
								this.timer && clearInterval(this.timer);
								this.setState({
									ttsState: 0,
									ttsText: '听新闻'
								});
							}
						}
					});
				}, 1000);
			}
			this.setState({ ttsState: 2, ttsText: '播放中' });
		} else if (this.state.ttsState == 1) {
			//暂停中
			NativeModules.BaiduVoiceModule.resume();
			this.setState({ ttsState: 2, ttsText: '播放中' });
		} else if (this.state.ttsState == 2) {
			//播放中
			NativeModules.BaiduVoiceModule.pause();
			this.setState({ ttsState: 1, ttsText: '暂停中' });
		}
	};
	//点击设置字体
	_onPress_FontChange = () => {
		this.setState({ isFontShow: true });
	};

	//设置字体拖动条拖动事件
	_OnFontSizeSliderChange = (size) => {
		const script = 'doZoom(' + FONT_SIZE[size] + ')';
		this.setState({ SliderValue: size });
		if (this.refs.webView) {
			this.refs.webView.injectJavaScript(script);
		}
		saveFontSize(size);
		event.Send(event.Events.news.FontSizeChange, FONT_SIZE[size]);
	};
	//点击收藏
	_onPress_collection = async () => {
		//点赞之前，应该判断一下用户登陆状态
		this.isLogin = await user.IsLogin();
		if (this.isLogin) {
			if (this.state.iscollect) {
				let result = await _DelcollectArticle(this.article.collectid);
				if (result && result.status == 1) {
					this.setState({
						iscollect: false
					});
					this.article.collectid = 0;
					saveArticleCache(this.article);
				} else if (result && result.status == 0) {
					this.state.article.collectid = 0;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
				}
			} else {
				let postdata = {
					type: '1',
					linkid: this.article.id,
					name: this.article.title,
					img: this.article.img,
					content: this.article.content
				};
				let result = await _collectArticle(postdata);
				if (result && result.status == 1) {
					this.setState({
						iscollect: true
					});
					this.article.collectid = result.data;
					saveArticleCache(this.article);
				} else if (result && result.status == 0) {
					this.state.article.collectid = 1;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
					Toast.show(result.error, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		} else {
			//未登录时跳转到登录页面
			if (this.state.ttsState == 2) {
				//听新闻暂停
				NativeModules.BaiduVoiceModule.pause();
				this.setState({ ttsState: 1, ttsText: '暂停中' });
			}
			if (this.state.isVideo && this.refs.webView) {
				//视频暂停
				this.refs.webView.injectJavaScript('player.pauseVideo()');
			}
			this.nav.navigate('login');
		}
	};
	//点赞
	_onPress_like = async () => {
		if (this.state.islike) {
			let result = await _DelPraise(this.article.id);
			if (result && result.status == 1) {
				this.setState({
					likecount: result.data,
					islike: false
				});
				this.article.islike = false;
				this.article.likecount = result.data;
				this._saveLikeCache(this.article);
			}
		} else {
			let result = await _Praise(this.article.id);
			if (result && result.status == 1) {
				this.setState({
					likecount: result.data,
					islike: true
				});
				this.article.islike = true;
				this.article.likecount = result.data;
				this._saveLikeCache(this.article);
			}
		}
	};

	/**
	 * 保存点赞
	 * item 文章对象 {obj}
	 */
	_saveLikeCache = async (item) => {
		let articleList = await cache.LoadFromFile(config.InfoLikeCache);
		let datas = [];
		if (articleList) {
			datas = articleList;
			let isflag = true;
			for (let data of datas) {
				if (data.id == item.id) {
					data.likecount = item.likecount;
					data.islike = item.islike;
					isflag = false;
					break;
				}
			}
			if (isflag) {
				let obj = {
					id: item.id,
					likecount: item.likecount,
					islike: item.islike
				};
				datas.push(obj);
			}
		} else {
			let obj = {
				id: item.id,
				likecount: item.likecount,
				islike: item.islike
			};
			datas.push(obj);
		}
		await cache.SaveToFile(config.InfoLikeCache, datas);
	};

	//点击分享
	_onPress_share = () => {
		if (this.state.ttsState == 2) {
			//播放中
			NativeModules.BaiduVoiceModule.pause();
			this.setState({ ttsState: 1, ttsText: '暂停中' });
		}
		if (this.state.isVideo && this.refs.webView) {
			//视频暂停
			this.refs.webView.injectJavaScript('player.pauseVideo()');
		}
		this.setState({ isShareMenuShow: true });
	};

	shareWeixin = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			this.article.title,
			this.article.scontent ? this.article.scontent : this.article.title,
			config.getWebUrl() + 'share?id=' + this.article.id,
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
			this.article.title,
			this.article.scontent ? this.article.scontent : this.article.title,
			config.getWebUrl() + 'share?id=' + this.article.id,
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
			this.article.title,
			this.article.scontent ? this.article.scontent : this.article.title,
			config.getWebUrl() + 'share?id=' + this.article.id,
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
			this.article.title,
			this.article.scontent ? this.article.scontent : this.article.title,
			config.getWebUrl() + 'share?id=' + this.article.id,
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
	//加载缓存数据，没有人没有缓存区服务器数据
	getData = async () => {
		this.article = await getArticleCache(this.params.item);
		if (!this.article) {
			this.article = await _getArticle(this.props.id);
			if (this.article) {
				this.article.islike = false;
			}
		}
		//获取点赞缓存
		let likeCacheList = await cache.LoadFromFile(config.InfoLikeCache);
		if (likeCacheList) {
			for (let obj of likeCacheList) {
				if (this.article.id == obj.id) {
					this.article.likecount = obj.likecount;
					this.article.islike = obj.islike;
					break;
				}
			}
		}

		let count = await _upReadArticleCount(this.article.id, Location.registrationid);
		if (count && count > 0) {
			this.article.randomread = count;
		}
		if (this.article) {
			saveArticleCache(this.article); //缓存
			if (this.article.content.indexOf('//player.youku.com') > 0) {
				this.videourl = config.getWebUrl() + 'yw?id=' + this.article.id;
				this.setState({ isVideo: true });
			} else {
				let hots = await _getFiveArticle(this.props.tid);
				this.article.hots = hots;
				//因为article.content会变可能影响到缓存点赞收藏等功能，所以此处 处理的是局部变量_article
				let _article = CloneUtil.cloneDeep(this.article); //调用系统自带深拷贝
				if (_article.content.indexOf('<img') >= 0) {
					this.imgUrls = _getImgUrls(_article.content);
					_article.content = _ImgReplace(_article.content);
				}
				_article.retime = TimeUtil.getTime(_article.retime, 'yyyy-MM-dd hh:mm');
				this.refs.webView.postMessage(JSON.stringify(_article));

				this.articleContent = await _getArticleContent(this.props.id); //获取完整文本内容
				if (this.articleContent) {
					this.setState({ ttsState: 0, ttsText: '听新闻' });
				}
				const script = 'doZoom(' + FONT_SIZE[this.state.SliderValue] + ')';
				if (this.refs.webView) {
					this.refs.webView.injectJavaScript(script);
				}
			}

			this.setState({
				islike: this.article.islike,
				iscollect: this.article.collectid > 0 && this.isLogin ? true : false,
				likecount: this.article.likecount
			});
		} else {
			Toast.show('文章加载失败', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	onMessage = (e) => {
		//IOS闪退问题
		if (!e.nativeEvent.data) {
			return;
		}
		try {
			let data = JSON.parse(e.nativeEvent.data);
			switch (data.type) {
				case 'open':
					if (this.state.ttsState != 0) {
						NativeModules.BaiduVoiceModule.stop();
						this.setState({ ttsState: 0, ttsText: '听新闻' });
					}
					this.nav.navigate('newsView', {
						id: data.id,
						type: data.isimg,
						tid: this.props.tid,
						item: data
					});
					break;
				case 'onClickImg':
					//alert(`图片点击${data.index}`);
					if (this.imgUrls && this.imgUrls.length > 0) {
						//this.nav.navigate('dynamicImgs', { bigimgsdata: this.imgUrls, index: data.index });
						this.nav.navigate('dynamicImgs', {
							simgsArr: this.imgUrls,
							bimgsArr: this.imgUrls,
							index: data.index
						});
					}
					break;
				default:
					alert(`针对类型为${data.type}的功能未能处理,请更新你的业务GO.`);
					break;
			}
		} catch (error) {}
	};

	render() {
		if (this.state.load === false) {
			let sourceUrl = { uri: 'file:///android_asset/newstemplate.html' };
			if (Platform.OS == 'ios') {
				sourceUrl = require('../../static/newstemplate.html');
			}
			return (
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: '#fff'
					}}
				>
					<WebView
						source={this.state.isVideo ? { uri: this.videourl } : sourceUrl}
						onLoadEnd={() => {
							this.state.isVideo ? '' : this.getData();
						}}
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
							width: width
						}}
						ref="webView"
						onMessage={this.onMessage}
					/>
					<View
						style={{
							flexDirection: 'row',
							width: width,
							//height: 40,
							justifyContent: 'flex-end',
							backgroundColor: '#fff',
							padding: 8,
							borderTopWidth: 1,
							borderTopColor: '#f3f3f3'
						}}
					>
						<TouchableWithoutFeedback onPress={this._onPress_tts}>
							<View
								style={{
									width: 90,
									height: 30,
									//backgroundColor: 'green',
									justifyContent: 'center',
									alignItems: 'center',
									position: 'absolute',
									bottom: 8,
									left: 15
								}}
							>
								{this.state.ttsState >= 0 ? (
									<View>
										<Image
											style={{ width: 90, height: 30 }}
											source={
												this.state.ttsState == 2 ? (
													image.newsimages.play
												) : (
													image.newsimages.pause
												)
											}
										/>
										<Text
											style={{
												fontSize: 12,
												color: '#4bc1d2',
												position: 'absolute',
												bottom: 9,
												right: 20
											}}
										>
											{this.state.ttsText}
										</Text>
									</View>
								) : (
									<View />
								)}
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_FontChange}>
							<View
								style={{
									width: 50,
									height: 30,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Text style={{ color: '#5c5c5c', fontSize: 16 }}>Aa</Text>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_collection}>
							<View
								style={{
									width: 50,
									height: 30,
									//backgroundColor: 'green',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image
									style={{ width: 20, height: 20 }}
									source={
										this.state.iscollect ? (
											image.newsimages.collectioned
										) : (
											image.newsimages.collection
										)
									}
								/>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_like}>
							<View
								style={{
									flexDirection: 'row',
									width: 70,
									height: 30,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image
									style={{ width: 20, height: 20 }}
									source={this.state.islike ? image.newsimages.xinshi : image.newsimages.xinkong}
								/>
								<Text
									style={{
										color: '#5c5c5c',
										fontSize: 16,
										textAlign: 'center'
									}}
								>
									{this.state.likecount}
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_share}>
							<View
								style={{
									width: 50,
									height: 30,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ width: 20, height: 20 }} source={image.newsimages.share} />
							</View>
						</TouchableWithoutFeedback>
					</View>

					<Modal
						style={{
							backgroundColor: '#00000011',
							width: width,
							height: height
						}}
						animationType={'fade'}
						transparent={true}
						visible={this.state.isFontShow}
						onRequestClose={() => {
							//alert('Modal has been closed.');
							this.setState({ isFontShow: false });
						}}
					>
						<TouchableWithoutFeedback
							onPress={() => {
								this.setState({ isFontShow: false });
							}}
						>
							<View
								style={{
									backgroundColor: '#00000055',
									width: width,
									height: height
								}}
							/>
						</TouchableWithoutFeedback>
						<View
							style={{
								backgroundColor: '#fff',
								flexDirection: 'column',
								position: 'absolute',
								bottom: 0,
								right: 0,
								borderTopWidth: 1,
								borderTopColor: '#f3f3f3'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									height: 60,
									padding: 10
								}}
							>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 14,
											color: this.state.SliderValue == 0 ? '#4BC1D2' : '#666666'
										}}
									>
										小号
									</Text>
								</View>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 16,
											color: this.state.SliderValue == 1 ? '#4BC1D2' : '#666666'
										}}
									>
										标准
									</Text>
								</View>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 20,
											color: this.state.SliderValue == 2 ? '#4BC1D2' : '#666666'
										}}
									>
										大号
									</Text>
								</View>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 24,
											color: this.state.SliderValue == 3 ? '#4BC1D2' : '#666666'
										}}
									>
										特大
									</Text>
								</View>
							</View>
							<View
								style={{
									paddingLeft: 40,
									paddingRight: 40,
									paddingTop: 0,
									paddingBottom: 0
								}}
							>
								<Slider
									style={{}}
									disabled={false}
									thumbImage={image.audio.dian}
									value={this.state.SliderValue}
									step={1}
									minimumValue={0}
									maximumValue={3}
									onValueChange={this._OnFontSizeSliderChange}
								/>
							</View>

							<View
								style={{
									width: width,
									height: 5,
									backgroundColor: '#e0e0e0'
								}}
							/>
							<TouchableWithoutFeedback
								onPress={() => {
									this.setState({ isFontShow: false });
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
											color: '#333333'
										}}
									>
										关闭
									</Text>
								</View>
							</TouchableWithoutFeedback>
						</View>
					</Modal>
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.weixin} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.pengyouq} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.qq} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.qqzone} />
									<Text>QQ空间</Text>
								</View>
							</TouchableHighlight>
						</View>
					</Modal>
				</View>
			);
		}
	}
}

//图集视图
class ImageContent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			load: false,
			article: {},
			desc: '',
			isMenuShow: false,
			isFontShow: false,
			SliderValue: 1,
			imageinfos: [],
			isShareMenuShow: false //分享面板
		};
		this.nav = this.props.navigation;
		this.params = this.props.navigation.state.params;
		this.index = 0;
		this.Images = [];
		this.Clickindex = -1;
		this.isLogin = false;
	}

	componentDidMount() {
		this.getUseLoginstate();
		this.getData();
		this.props.navigation.setParams({
			goBackPage: this._goBackPage,
			_onPressShare: this._onPress_share
		});
	}
	//返回上一页
	_goBackPage = () => {
		if (this.props.collectflag) {
			//发送事件，通知我的收藏刷新页面
			event.Send(event.Events.collect.mycollectsearch);
		}
		this.nav.goBack();
	};
	//获取登录状态
	async getUseLoginstate() {
		this.isLogin = await user.IsLogin();
		let size = await getFontSize();
		if (size && size >= 0) {
			this.setState({ SliderValue: size });
		} else {
			this.setState({ SliderValue: 1 });
		}
	}
	_onPress_FontChange = () => {
		this.setState({ isFontShow: true });
	};

	//设置字体拖动条拖动事件
	_OnFontSizeSliderChange = (size) => {
		//const script = 'doZoom(' + FONT_SIZE[size] + ')';
		this.setState({ SliderValue: size });
		// if (this.refs.webView) {
		// 	this.refs.webView.injectJavaScript(script);
		// }
		saveFontSize(size);
		event.Send(event.Events.news.FontSizeChange, FONT_SIZE[size]);
	};
	//请求数据
	getData = async () => {
		let article = await getArticleCache(this.params.item);
		if (!article) {
			article = await _getArticle(this.props.id);
			article.islike = false;
			saveArticleCache(article);
		}
		//获取点赞缓存
		let likeCacheList = await cache.LoadFromFile(config.InfoLikeCache);
		if (likeCacheList) {
			for (let obj of likeCacheList) {
				if (article.id == obj.id) {
					article.likecount = obj.likecount;
					article.islike = obj.islike;
					break;
				}
			}
		}
		if (article) {
			let imageinfos = JSON.parse(article.content);
			this.Images = imageinfos;
			let desc = '';
			if (this.Images && this.Images.length > 0 && this.Images[0].desc) {
				desc = this.Images[0].desc;
			}
			this.setState({
				article: article,
				load: true,
				desc: desc,
				imageinfos: imageinfos
			});
			_upReadArticleCount(article.id, Location.registrationid);
		}
	};

	//点击收藏
	_onPress_collection = async () => {
		//点赞之前，应该判断一下用户登陆状态
		this.isLogin = await user.IsLogin();
		if (this.isLogin) {
			if (this.state.article.collectid > 0) {
				let result = await _DelcollectArticle(this.state.article.collectid);
				if (result && result.status == 1) {
					this.state.article.collectid = 0;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
				} else if (result && result.status == 0) {
					this.state.article.collectid = 0;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
				}
			} else {
				let postdata = {
					type: '2',
					linkid: this.state.article.id,
					name: this.state.article.title,
					img: this.state.article.img,
					content: this.state.article.content
				};
				let result = await _collectArticle(postdata);
				if (result && result.status == 1) {
					this.state.article.collectid = result.data;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
				} else if (result && result.status == 0) {
					this.state.article.collectid = 1;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
					Toast.show(result.error, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	};
	//点赞
	_onPress_like = async () => {
		if (this.state.article.islike) {
			let result = await _DelPraise(this.state.article.id);
			if (result && result.status == 1) {
				this.state.article.islike = false;
				this.state.article.likecount = result.data;
				this.setState({
					article: this.state.article
				});

				this._saveLikeCache(this.state.article);
			}
		} else {
			let result = await _Praise(this.state.article.id);
			if (result && result.status == 1) {
				this.state.article.islike = true;
				this.state.article.likecount = result.data;
				this.setState({
					article: this.state.article
				});
				this._saveLikeCache(this.state.article);
			}
		}
	};
	/**
	 * 保存点赞
	 * item 文章对象 {obj}
	 */
	_saveLikeCache = async (item) => {
		let articleList = await cache.LoadFromFile(config.InfoLikeCache);
		let datas = [];
		if (articleList) {
			datas = articleList;
			let isflag = true;
			for (let data of datas) {
				if (data.id == item.id) {
					data.likecount = item.likecount;
					data.islike = item.islike;
					isflag = false;
					break;
				}
			}
			if (isflag) {
				let obj = {
					id: item.id,
					likecount: item.likecount,
					islike: item.islike
				};
				datas.push(obj);
			}
		} else {
			let obj = {
				id: item.id,
				likecount: item.likecount,
				islike: item.islike
			};
			datas.push(obj);
		}
		await cache.SaveToFile(config.InfoLikeCache, datas);
	};

	//点击分享
	_onPress_share = () => {
		this.setState({ isShareMenuShow: true });
	};

	shareWeixin = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			this.state.article.title,
			this.state.article.scontent,
			config.getWebUrl() + 'share?id=' + this.state.article.id,
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
			this.state.article.title,
			this.state.article.scontent,
			config.getWebUrl() + 'share?id=' + this.state.article.id,
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
			this.state.article.title,
			this.state.article.scontent,
			config.getWebUrl() + 'share?id=' + this.state.article.id,
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
			this.state.article.title,
			this.state.article.scontent,
			config.getWebUrl() + 'share?id=' + this.state.article.id,
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
	//下载图片
	downLoad2 = (url) => {
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
				//console.log('The file saved to ', res.path());
				// Beware that when using a file path as Image source on Android,
				// you must prepend "file://"" before the file path
				this.path = res.path();
				this.save(res.path());
			});
	};

	// async downLoad(url) {
	// 	let path = await fileDownloadUtil.downloadImage(url);
	// 	if (path) {
	// 		this.path = path;
	// 		this.save(path);
	// 	} else {
	// 		Toast.show('下载失败', {
	// 			duration: Toast.durations.SHORT,
	// 			position: Toast.positions.BOTTOM
	// 		});
	// 	}
	// }
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
	async publishDy(burl) {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			//burl:为大图路径 长按图片发表动态 读取缓存中动态内容文本
			let cacheDatas = await cache.LoadFromFile(config.PublishDynamicKey);
			if (cacheDatas == null || cacheDatas.length == 0) {
				//往动态缓存中存取信息
				await cache.SaveToFile(config.PublishDynamicKey, {
					content: '',
					simgsArr: [ { index: 0, url: burl } ],
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
					simgsArr.push({ index: simgsArr.length, url: burl }), bimgsArr.push({ url: burl });
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

	//发送给联系人
	sendFriend = async () => {
		//获取用户登录状态
		let isLogin = await user.IsLogin();
		if (isLogin) {
			if (this.Images[this.index].url && this.index >= 0) {
				const chatMsg = {
					content: this.Images[this.index].url + ',' + this.Images[this.index].url,
					contentType: ChatMessage.ContentType.Chat_Image
				};
				//跳转到多选页面
				this.nav.navigate('multipleChoice', {
					confirmNum: 0,
					chatMessage: chatMsg
				});
			} else {
				Toast.show('发送给联系人失败,请稍后重试.', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		} else {
			//未登录时跳转到登录页面
			this.nav.navigate('login');
		}
	};

	render() {
		if (this.state.load === false) {
			return (
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Text>正在加载数据...</Text>
				</View>
			);
		} else {
			return (
				<View style={{ flex: 1, flexDirection: 'column' }}>
					<ImageViewer
						index={this.index}
						style={{ flex: 10 }}
						imageUrls={this.state.imageinfos}
						saveToLocalByLongPress={false} //关闭长按保存图片自带的功能
						onLongPress={() => {
							this.setState({ isMenuShow: true });
						}}
						onChange={(index) => {
							this.index = index;
							if (this.Images[index].desc && this.Images[index].desc.length < 20) {
								this.setState({
									desc: this.Images[index].desc + TimeUtil.Nspace(index + 1)
								}); //字数过少
							} else {
								this.setState({
									desc: this.Images[index].desc
								});
							}
						}}
						//索引指示器重写
						renderIndicator={(currentIndex, allSize) => {
							return null;
						}}
					/>

					<View
						style={{
							backgroundColor: '#000',
							position: 'absolute',
							width: width,
							height: 120,
							bottom: 0,
							backgroundColor: '#00000000'
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								height: 30,
								paddingLeft: 10,
								paddingBottom: 0,
								backgroundColor: '#00000000'
							}}
						>
							<Text numberOfLines={1} style={{ flex: 5, color: '#fff', fontSize: 16 }}>
								{this.state.article.title}
							</Text>
							<Text style={{ flex: 1, color: '#fff', fontSize: 16 }}>
								{this.index + 1 + '/' + this.Images.length}
							</Text>
						</View>
						<MarqueeLabelVertical
							speed={20}
							textStyle={{
								fontSize: this.state.SliderValue >= 0 ? FONT_SIZE[this.state.SliderValue] : 12,
								color: '#999999',
								height: 200
							}}
							bgViewStyle={{
								height: 60,
								width: width,
								paddingLeft: 20,
								//paddingBottom: 10,
								backgroundColor: '#00000000'
							}}
						>
							{this.state.desc.length > 0 ? this.state.desc : '0000'}
						</MarqueeLabelVertical>
					</View>
					<View
						style={{
							position: 'absolute',
							flexDirection: 'row',
							width: width,
							height: 40,
							padding: 8,
							bottom: 0,
							paddingBottom: 0,
							justifyContent: 'flex-end',
							backgroundColor: '#00000000'
						}}
					>
						<TouchableWithoutFeedback onPress={this._onPress_FontChange}>
							<View
								style={{
									width: 50,
									height: 30,

									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Text style={{ color: '#fff', fontSize: 16 }}>Aa</Text>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_collection}>
							<View
								style={{
									width: 50,
									height: 30,
									//backgroundColor: 'green',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image
									style={{ width: 20, height: 20 }}
									source={
										this.state.article.collectid > 0 ? (
											image.newsimages.collectioned
										) : (
											image.newsimages.collection
										)
									}
								/>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_like}>
							<View
								style={{
									flexDirection: 'row',
									width: 70,
									height: 30,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image
									style={{ width: 20, height: 20 }}
									source={
										this.state.article.islike ? image.newsimages.xinshi : image.newsimages.xinkong
									}
								/>
								<Text
									style={{
										color: '#fff',
										fontSize: 16,
										textAlign: 'center'
									}}
								>
									{this.state.article.likecount}
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_share}>
							<View
								style={{
									width: 50,
									height: 30,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ width: 20, height: 20 }} source={image.newsimages.share} />
							</View>
						</TouchableWithoutFeedback>
					</View>
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
							//alert('长按 站内按钮弹出 Modal has been closed.');
							this.setState({ isMenuShow: false });
						}}
					>
						<TouchableWithoutFeedback
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
						</TouchableWithoutFeedback>
						<View
							style={{
								backgroundColor: '#fff',
								flexDirection: 'column',
								position: 'absolute',
								bottom: 0,
								right: 0,
								borderTopWidth: 1,
								borderTopColor: '#f3f3f3'
							}}
						>
							<View style={{ flexDirection: 'column' }}>
								<TouchableWithoutFeedback
									onPress={() => {
										this.setState({ isMenuShow: false });
										this.sendFriend();
									}}
								>
									<View
										style={{
											flex: 1,
											justifyContent: 'center',
											alignItems: 'center',
											borderBottomWidth: 1,
											borderBottomColor: '#f3f3f3',
											height: 40
										}}
									>
										<Text
											style={{
												fontSize: 14,
												color: '#666666',
												textAlignVertical: 'center'
											}}
										>
											发给联系人
										</Text>
									</View>
								</TouchableWithoutFeedback>
								<TouchableWithoutFeedback
									onPress={() => {
										this.setState({ isMenuShow: false });
										if (this.Images[this.index].url && this.index >= 0) {
											this.publishDy(this.Images[this.index].url);
										} else {
											Toast.show('发表动态失败,请稍后重试.', {
												duration: Toast.durations.SHORT,
												position: Toast.positions.BOTTOM
											});
										}
									}}
								>
									<View
										style={{
											flex: 1,
											justifyContent: 'center',
											alignItems: 'center',
											borderBottomWidth: 1,
											borderBottomColor: '#f3f3f3',
											height: 40
										}}
									>
										<Text
											style={{
												fontSize: 14,
												color: '#666666',
												textAlignVertical: 'center'
											}}
										>
											发表动态
										</Text>
									</View>
								</TouchableWithoutFeedback>
								<TouchableWithoutFeedback
									onPress={() => {
										this.setState({ isMenuShow: false });
										if (this.Images && this.Images.length > 0 && this.index >= 0) {
											this.downLoad2(this.Images[this.index].url);
										} else {
											Toast.show('保存图片失败', {
												duration: Toast.durations.SHORT,
												position: Toast.positions.BOTTOM
											});
										}
									}}
								>
									<View
										style={{
											flex: 1,
											justifyContent: 'center',
											alignItems: 'center',
											borderBottomWidth: 1,
											borderBottomColor: '#f3f3f3',
											height: 40
										}}
									>
										<Text
											style={{
												fontSize: 14,
												color: '#666666',
												textAlignVertical: 'center'
											}}
										>
											保存图片
										</Text>
									</View>
								</TouchableWithoutFeedback>
							</View>

							<View
								style={{
									width: width,
									height: 5,
									backgroundColor: '#e0e0e0'
								}}
							/>
							<TouchableWithoutFeedback
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
											color: '#4BC1D2'
										}}
									>
										取消
									</Text>
								</View>
							</TouchableWithoutFeedback>
						</View>
					</Modal>

					<Modal
						style={{
							backgroundColor: '#00000011',
							width: width,
							height: height
						}}
						animationType={'fade'}
						transparent={true}
						visible={this.state.isFontShow}
						onRequestClose={() => {
							//alert('字体设置 Modal has been closed.');
							this.setState({ isFontShow: false });
						}}
					>
						<TouchableWithoutFeedback
							onPress={() => {
								this.setState({ isFontShow: false });
							}}
						>
							<View
								style={{
									backgroundColor: '#00000055',
									width: width,
									height: height
								}}
							/>
						</TouchableWithoutFeedback>
						<View
							style={{
								backgroundColor: '#fff',
								flexDirection: 'column',
								position: 'absolute',
								bottom: 0,
								right: 0,
								borderTopWidth: 1,
								borderTopColor: '#f3f3f3'
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									height: 60,
									padding: 10
								}}
							>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 14,
											color: this.state.SliderValue == 0 ? '#4BC1D2' : '#666666'
										}}
									>
										小号
									</Text>
								</View>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 16,
											color: this.state.SliderValue == 1 ? '#4BC1D2' : '#666666'
										}}
									>
										标准
									</Text>
								</View>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 20,
											color: this.state.SliderValue == 2 ? '#4BC1D2' : '#666666'
										}}
									>
										大号
									</Text>
								</View>
								<View style={{ flex: 1, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 24,
											color: this.state.SliderValue == 3 ? '#4BC1D2' : '#666666'
										}}
									>
										特大
									</Text>
								</View>
							</View>
							<View
								style={{
									paddingLeft: 40,
									paddingRight: 40,
									paddingTop: 0,
									paddingBottom: 0
								}}
							>
								<Slider
									style={{}}
									disabled={false}
									thumbImage={image.audio.dian}
									value={this.state.SliderValue}
									step={1}
									minimumValue={0}
									maximumValue={3}
									onValueChange={this._OnFontSizeSliderChange}
								/>
							</View>

							<View
								style={{
									width: width,
									height: 5,
									backgroundColor: '#e0e0e0'
								}}
							/>
							<TouchableWithoutFeedback
								onPress={() => {
									this.setState({ isFontShow: false });
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
											color: '#333333'
										}}
									>
										关闭
									</Text>
								</View>
							</TouchableWithoutFeedback>
						</View>
					</Modal>
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.weixin} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.pengyouq} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.qq} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.qqzone} />
									<Text>QQ空间</Text>
								</View>
							</TouchableHighlight>
						</View>
					</Modal>
				</View>
			);
		}
	}
}

const ScrollviewHeight = Platform.OS == 'ios' ? height - 60 : height - 80;
//语音播报视图
class AudioContent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			article: {},
			bgimg: '',
			load: false,
			isPlay: false,
			title: '标题',
			countAndtime: '',
			playIndex: 0,
			totalTime: 0,
			currentTime: 0,
			hots: [],
			playList: [],
			isShareMenuShow: false, //分享面板
			playList: []
		};
		this.nav = this.props.navigation;
		this.list = [];
		this.isLogin = false;
		//this.isLoadSuccess = false;
		Sound.setCategory('Playback', true); // true = mixWithOthers
	}
	//组件初始化
	componentWillMount() {
		this.loadHotsNews();
	}
	//组件准备显示
	componentDidMount() {
		this.loadedCache();
		this.timer = setInterval(() => {
			if (this.state.isPlay) {
				let time = this.state.currentTime + 1;
				this.setState({ currentTime: time });
			}
		}, 1000);
		this.getUseLoginstate();
		this.props.navigation.setParams({
			goBackPage: this._goBackPage,
			_onPressShare: this._onPress_share
		});
	}
	//组件销毁时
	componentWillUnmount() {
		this.timer && clearInterval(this.timer);
		this.timeout && clearTimeout(this.timeout);
		this.loading_timer && clearTimeout(this.loading_timer);
		if (this.state.isPlay) {
			//audio.Stop();
			this.stop();
			//this.setState({ isPlay: false, currentTime: 0 });
			this.setState({ isPlay: false, currentTime: this.state.totalTime });
		}
	}
	//加载热门文章
	async loadHotsNews() {
		let hots = await _getFiveArticle('0');
		if (hots) {
			this.setState({ hots: hots });
		}
	}
	//返回上一页
	_goBackPage = () => {
		if (this.props.collectflag) {
			//发送事件，通知我的收藏刷新页面
			event.Send(event.Events.collect.mycollectsearch);
		}
		this.nav.goBack();
	};
	//获取登录状态
	async getUseLoginstate() {
		this.isLogin = await user.IsLogin();
	}
	//加载语音播报列表
	async loadedCache() {
		let result = await cache.LoadFromFile(config.AudioListKey);
		if (!result) {
			result = await _getData(122, 0, 0);
		}
		if (result) {
			this.list = result;
			this.setState({ playList: result });
			let item = this.nav.state.params.item;
			if (item) {
				for (let i = 0; i < this.list.length; i++) {
					if (item.id == this.list[i].id) {
						this.setState({ playIndex: i });
						break;
					}
				}
			}
			this.PlayByIndex(this.state.playIndex);
		} else {
			Toast.show('播放列表获取失败!', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	}

	//初始化语音
	init = (url, article) => {
		callback = (error, url, article) => {
			if (error) {
				this.refs.loading.Isvisible(false);
				Toast.show('播放失败', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				this.setState({
					isPlay: false,
					bgimg: article.img.split(',')[0],
					title: article.title,
					countAndtime: article.randomread + '次播放' + TimeUtil.getTime(article.retime, 'MM-dd hh:mm')
				});
				return;
			}
			this.setState({
				isPlay: true,
				bgimg: article.img.split(',')[0],
				title: article.title,
				countAndtime: article.randomread + '次播放' + TimeUtil.getTime(article.retime, 'MM-dd hh:mm'),
				totalTime: this.getDuration()
			});
			this.play();
			//this.isLoadSuccess = true;
			this.refs.loading.Isvisible(false);
		};
		this.sound = new Sound(url, '', (error) => callback(error, url, article));
	};
	//暂停
	pause = () => {
		try {
			this.sound.pause();
		} catch (error) {}
	};
	//播放
	play = () => {
		this.sound.play(() => {
			// Success counts as getting to the end
			this.sound.release();
			Toast.show('播放完成', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			this.setState({ isPlay: false, currentTime: this.state.totalTime });
		});
	};
	//停止并释放
	stop = () => {
		try {
			this.sound.stop().release(); //停止 释放文件
		} catch (error) {
			this.sound = null;
		}
	};
	//获取总时长
	getDuration = () => {
		return this.sound.getDuration();
	};
	//通过索引播放语音播放列表
	async PlayByIndex(index) {
		//如果正在播放先停止
		if (this.state.isPlay) {
			//audio.Stop();
			this.stop();
		}
		this.setState({ isPlay: false, currentTime: 0 });
		let article = await getArticleCache(this.list[index]);
		if (!article) {
			article = await _getArticle(this.list[index].id); //或播报文章
			article.islike = false;
		}

		//获取点赞缓存
		let likeCacheList = await cache.LoadFromFile(config.InfoLikeCache);
		if (likeCacheList) {
			for (let obj of likeCacheList) {
				if (article.id == obj.id) {
					article.likecount = obj.likecount;
					article.islike = obj.islike;
					break;
				}
			}
		}

		if (article) {
			let count = await _upReadArticleCount(article.id, Location.registrationid);
			if (count && count > 0) {
				article.randomread = count;
			}
			this.setState({ article: article });
			saveArticleCache(article);
		}

		if (article.content) {
			this.refs.loading.Isvisible(true);
			this.setState({
				isPlay: false,
				bgimg: article.img.split(',')[0],
				title: article.title,
				countAndtime: article.randomread + '次播放' + TimeUtil.getTime(article.retime, 'MM-dd hh:mm')
			});
			//this.downLoad2(article);
			//this.isLoadSuccess = false;
			// this.loading_timer && clearTimeout(this.loading_timer);
			// this.loading_timer = setTimeout(() => {
			// 	if (!this.isLoadSuccess) {
			// 		this.refs.loading.Isvisible(false);
			// 		Alert.alert('', '加载超时!');
			// 	}
			// }, 8000);
			this.init(article.content, article);
		} else {
			Toast.show('没有找到音频', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	}
	//下载
	downLoad2 = (article) => {
		RNFetchBlob.config({
			fileCache: true,
			// by adding this option, the temp files will have a file extension
			appendExt: 'mp3'
		})
			.fetch('get', article.content, {})
			.then((res) => {
				console.log('mp3===' + res.path());
				this.init(res.path(), article);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	//播放或暂停
	OnPress_play = () => {
		if (this.state.isPlay === true) {
			//audio.Pause();
			this.pause();
			this.setState({ isPlay: false });
		} else {
			if (this.state.currentTime == this.state.totalTime) {
				//播放完成重新播放
				this.PlayByIndex(this.state.playIndex);
			} else {
				//暂停继续播放
				//audio.Resume();
				this.play();
				this.setState({ isPlay: true });
			}
		}
	};

	//播放上一首
	OnPress_pre = () => {
		if (this.state.playIndex > 0) {
			this.state.playIndex -= 1;
			this.PlayByIndex(this.state.playIndex);
		}
	};

	//播放下一首 <Image source={this.state.bgimg} style={{ width: width, height: 335 }} />
	OnPress_next = () => {
		if (this.state.playIndex < this.list.length - 1) {
			this.state.playIndex += 1;
			this.PlayByIndex(this.state.playIndex);
		}
	};

	//点击收藏
	_onPress_collection = async () => {
		//点赞之前，应该判断一下用户登陆状态

		this.isLogin = await user.IsLogin();
		if (this.isLogin) {
			if (this.state.article.collectid > 0) {
				let result = await _DelcollectArticle(this.state.article.collectid);
				if (result && result.status == 1) {
					this.state.article.collectid = 0;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
				} else if (result && result.status == 0) {
					this.state.article.collectid = 0;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
				}
			} else {
				let postdata = {
					type: '3',
					linkid: this.state.article.id,
					name: this.state.article.title,
					img: this.state.article.img,
					content: this.state.article.content
				};
				let result = await _collectArticle(postdata);
				if (result && result.status == 1) {
					this.state.article.collectid = result.data;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
				} else if (result && result.status == 0) {
					this.state.article.collectid = 1;
					this.setState({
						article: this.state.article
					});
					saveArticleCache(this.state.article);
					Toast.show(result.error, {
						duration: Toast.durations.SHORT,
						position: Toast.positions.BOTTOM
					});
				}
			}
		} else {
			//未登录时跳转到登录页面
			this.pause();
			this.setState({ isPlay: false });
			this.nav.navigate('login');
		}
	};
	//点赞
	_onPress_like = async () => {
		if (this.state.article.islike) {
			let result = await _DelPraise(this.state.article.id);
			if (result && result.status == 1) {
				this.state.article.islike = false;
				this.state.article.likecount = result.data;
				this.setState({
					article: this.state.article
				});

				this._saveLikeCache(this.state.article);
			}
		} else {
			let result = await _Praise(this.state.article.id);
			if (result && result.status == 1) {
				this.state.article.islike = true;
				this.state.article.likecount = result.data;
				this.setState({
					article: this.state.article
				});
				this._saveLikeCache(this.state.article);
			}
		}
	};

	/**
	 * 保存点赞
	 * item 文章对象 {obj}
	 */
	_saveLikeCache = async (item) => {
		let articleList = await cache.LoadFromFile(config.InfoLikeCache);
		let datas = [];
		if (articleList) {
			datas = articleList;
			let isflag = true;
			for (let data of datas) {
				if (data.id == item.id) {
					data.likecount = item.likecount;
					data.islike = item.islike;
					isflag = false;
					break;
				}
			}
			if (isflag) {
				let obj = {
					id: item.id,
					likecount: item.likecount,
					islike: item.islike
				};
				datas.push(obj);
			}
		} else {
			let obj = {
				id: item.id,
				likecount: item.likecount,
				islike: item.islike
			};
			datas.push(obj);
		}
		await cache.SaveToFile(config.InfoLikeCache, datas);
	};

	//点击分享
	_onPress_share = () => {
		this.pause();
		this.setState({ isPlay: false });
		this.setState({ isShareMenuShow: true });
	};
	//点击热门新闻
	_onPressHots = (item) => {
		// this.componentWillUnmount();
		this.pause();
		this.setState({ isPlay: false });
		this.nav.navigate('newsView', {
			id: item.id,
			type: item.isimg,
			tid: this.props.tid,
			item: item
		});
	};

	//点击播放列表
	_onPressPlayList = () => {
		this.playListpage.show();
	};

	//点击列表播放歌曲
	_onPressPlayListItem = (index) => {
		this.setState({ playIndex: index });
		this.PlayByIndex(index);
		this.playListpage.dismiss();
	};
	shareWeixin = () => {
		this.setState({ isShareMenuShow: false });
		NativeModules.sharemodule.share(
			this.state.article.title,
			this.state.article.scontent,
			config.getWebUrl() + 'share?id=' + this.state.article.id,
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
			this.state.article.title,
			this.state.article.content,
			config.getWebUrl() + 'share?id=' + this.state.article.id,
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
			this.state.article.title,
			this.state.article.scontent,
			config.getWebUrl() + 'share?id=' + this.state.article.id,
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
			this.state.article.title,
			this.state.article.scontent,
			config.getWebUrl() + 'share?id=' + this.state.article.id,
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
		if (this.state.load === false) {
			return (
				<View>
					<ScrollView
						style={{
							height: ScrollviewHeight
						}}
					>
						<View
							style={{
								flex: 1,
								justifyContent: 'flex-start',
								alignItems: 'center',
								backgroundColor: '#fff'
							}}
						>
							{this.state.bgimg ? (
								<Image source={{ uri: this.state.bgimg }} style={{ width: width, height: 275 }} />
							) : (
								<Image source={image.audio.bgimage} style={{ width: width, height: 275 }} />
							)}
							<TouchableWithoutFeedback onPress={this._onPressPlayList}>
								<View
									style={{
										position: 'absolute',
										right: 10,
										top: 10,
										backgroundColor: '#00000000'
									}}
								>
									<Text style={{ color: '#fff', fontSize: 16 }}>播放列表</Text>
								</View>
							</TouchableWithoutFeedback>
							<Slider
								style={{ width: width }}
								disabled={false}
								thumbImage={image.audio.dian}
								thumbTintColor={skin.main}
								value={this.state.currentTime}
								maximumTrackTintColor={Platform.OS == 'ios' ? skin.lightSeparate : skin.main}
								minimumTrackTintColor={Platform.OS == 'ios' ? skin.main : skin.inactiveTint}
								maximumValue={this.state.totalTime}
							/>
							<View
								style={{
									width: width,
									height: 20,
									flexDirection: 'row'
								}}
							>
								<Text style={{ paddingLeft: 10 }}>{TimeUtil.getAudioTime(this.state.currentTime)}</Text>
								<Text style={{ position: 'absolute', right: 10 }}>
									{TimeUtil.getAudioTime(this.state.totalTime)}
								</Text>
							</View>
							<View
								style={{
									width: width,
									height: 80,
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									margin: 10
								}}
							>
								<TouchableWithoutFeedback onPress={this.OnPress_pre}>
									<View
										style={{
											width: 80,
											height: 80,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										{this.state.playIndex === 0 ? (
											<Image
												style={{
													width: 28,
													height: 28
												}}
												source={image.audio.pre_no}
											/>
										) : (
											<Image
												style={{
													width: 28,
													height: 28
												}}
												source={image.audio.pre}
											/>
										)}
									</View>
								</TouchableWithoutFeedback>
								<TouchableWithoutFeedback onPress={this.OnPress_play}>
									<View
										style={{
											width: 80,
											height: 80,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										{this.state.isPlay ? (
											<Image
												style={{
													width: 72,
													height: 72
												}}
												source={image.audio.pause}
											/>
										) : (
											<Image
												style={{
													width: 72,
													height: 72
												}}
												source={image.audio.play}
											/>
										)}
									</View>
								</TouchableWithoutFeedback>
								<TouchableWithoutFeedback onPress={this.OnPress_next}>
									<View
										style={{
											width: 80,
											height: 80,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										{this.state.playIndex === this.list.length - 1 ? (
											<Image
												style={{
													width: 28,
													height: 28
												}}
												source={image.audio.next_no}
											/>
										) : (
											<Image
												style={{
													width: 28,
													height: 28
												}}
												source={image.audio.next}
											/>
										)}
									</View>
								</TouchableWithoutFeedback>
							</View>
							<View
								style={{
									width: width,
									height: 10,
									backgroundColor: '#f3f3f3'
								}}
							/>
							<View
								style={{
									flexDirection: 'column',
									width: width
									//height: 70
								}}
							>
								<Text
									style={{
										fontSize: 18,
										color: '#333333',
										paddingLeft: 15,
										paddingTop: 14
									}}
								>
									{this.state.title}
								</Text>
								<Text
									style={{
										fontSize: 12,
										color: '#222222',
										paddingLeft: 15
									}}
								>
									{this.state.countAndtime}{' '}
								</Text>
							</View>
							<View
								style={{
									width: width,
									height: 10,
									backgroundColor: '#f3f3f3'
								}}
							/>
							{this.state.hots.length > 0 ? (
								<View
									style={{
										flexDirection: 'column',
										width: width,
										overflow: 'hidden',
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Text
										style={{
											fontSize: 16,
											color: '#333333',
											padding: 10
										}}
									>
										相关新闻
									</Text>
									<TouchableWithoutFeedback
										onPress={this._onPressHots.bind(this, this.state.hots[0])}
									>
										<View
											style={{
												paddingVertical: 10,
												paddingHorizontal: 12,
												flexDirection: 'row'
											}}
										>
											<Image
												style={{
													height: 75,
													width: 100,
													borderRadius: 5
												}}
												source={{
													uri: this.state.hots[0].img,
													cache: 'force-cache'
												}}
											/>
											<View
												style={{
													paddingLeft: 10,
													flex: 1
												}}
											>
												<Text
													style={{
														flex: 1,
														fontSize: 16,
														color: '#555'
													}}
												>
													{this.state.hots[0].title}
												</Text>
												<View
													style={{
														flexDirection: 'row'
													}}
												>
													<Text
														style={{
															flex: 1,
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{this.state.hots[0].source}
													</Text>
													<Text
														style={{
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{TimeUtil.getSeparateDate(this.state.hots[0].retime)}
													</Text>
												</View>
											</View>
										</View>
									</TouchableWithoutFeedback>
									<TouchableWithoutFeedback
										onPress={this._onPressHots.bind(this, this.state.hots[1])}
									>
										<View
											style={{
												paddingVertical: 10,
												paddingHorizontal: 12,
												flexDirection: 'row'
											}}
										>
											<Image
												style={{
													height: 75,
													width: 100,
													borderRadius: 5
												}}
												source={{
													uri: this.state.hots[1].img,
													cache: 'force-cache'
												}}
											/>
											<View
												style={{
													paddingLeft: 10,
													flex: 1
												}}
											>
												<Text
													style={{
														flex: 1,
														fontSize: 16,
														color: '#555'
													}}
												>
													{this.state.hots[1].title}
												</Text>
												<View
													style={{
														flexDirection: 'row'
													}}
												>
													<Text
														style={{
															flex: 1,
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{this.state.hots[1].source}
													</Text>
													<Text
														style={{
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{TimeUtil.getSeparateDate(this.state.hots[1].retime)}
													</Text>
												</View>
											</View>
										</View>
									</TouchableWithoutFeedback>
									<TouchableWithoutFeedback
										onPress={this._onPressHots.bind(this, this.state.hots[2])}
									>
										<View
											style={{
												paddingVertical: 10,
												paddingHorizontal: 12,
												flexDirection: 'row'
											}}
										>
											<Image
												style={{
													height: 75,
													width: 100,
													borderRadius: 5
												}}
												source={{
													uri: this.state.hots[2].img,
													cache: 'force-cache'
												}}
											/>
											<View
												style={{
													paddingLeft: 10,
													flex: 1
												}}
											>
												<Text
													style={{
														flex: 1,
														fontSize: 16,
														color: '#555'
													}}
												>
													{this.state.hots[2].title}
												</Text>
												<View
													style={{
														flexDirection: 'row'
													}}
												>
													<Text
														style={{
															flex: 1,
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{this.state.hots[2].source}
													</Text>
													<Text
														style={{
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{TimeUtil.getSeparateDate(this.state.hots[2].retime)}
													</Text>
												</View>
											</View>
										</View>
									</TouchableWithoutFeedback>
									<TouchableWithoutFeedback
										onPress={this._onPressHots.bind(this, this.state.hots[3])}
									>
										<View
											style={{
												paddingVertical: 10,
												paddingHorizontal: 12,
												flexDirection: 'row'
											}}
										>
											<Image
												style={{
													height: 75,
													width: 100,
													borderRadius: 5
												}}
												source={{
													uri: this.state.hots[3].img,
													cache: 'force-cache'
												}}
											/>
											<View
												style={{
													paddingLeft: 10,
													flex: 1
												}}
											>
												<Text
													style={{
														flex: 1,
														fontSize: 16,
														color: '#555'
													}}
												>
													{this.state.hots[3].title}
												</Text>
												<View
													style={{
														flexDirection: 'row'
													}}
												>
													<Text
														style={{
															flex: 1,
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{this.state.hots[3].source}
													</Text>
													<Text
														style={{
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{TimeUtil.getSeparateDate(this.state.hots[3].retime)}
													</Text>
												</View>
											</View>
										</View>
									</TouchableWithoutFeedback>
									<TouchableWithoutFeedback
										onPress={this._onPressHots.bind(this, this.state.hots[4])}
									>
										<View
											style={{
												paddingVertical: 10,
												paddingHorizontal: 12,
												flexDirection: 'row'
											}}
										>
											<Image
												style={{
													height: 75,
													width: 100,
													borderRadius: 5
												}}
												source={{
													uri: this.state.hots[4].img,
													cache: 'force-cache'
												}}
											/>
											<View
												style={{
													paddingLeft: 10,
													flex: 1
												}}
											>
												<Text
													style={{
														flex: 1,
														fontSize: 16,
														color: '#555'
													}}
												>
													{this.state.hots[4].title}
												</Text>
												<View
													style={{
														flexDirection: 'row'
													}}
												>
													<Text
														style={{
															flex: 1,
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{this.state.hots[4].source}
													</Text>
													<Text
														style={{
															fontSize: 12,
															color: '#9e9e9e'
														}}
													>
														{TimeUtil.getSeparateDate(this.state.hots[4].retime)}
													</Text>
												</View>
											</View>
										</View>
									</TouchableWithoutFeedback>
									<View style={{ height: 40 }} />
								</View>
							) : (
								<View style={{ height: 40 }} />
							)}
						</View>
					</ScrollView>

					<View
						style={{
							//底部 点赞收藏 栏
							//flex: 1,
							flexDirection: 'row',
							width: width,
							justifyContent: 'flex-end',
							alignItems: 'center',
							//height: 40,
							position: 'absolute',
							bottom: 0,
							padding: 10,
							backgroundColor: '#fff'
						}}
					>
						<TouchableWithoutFeedback onPress={this._onPress_collection}>
							<View
								style={{
									width: 50,
									height: 30,
									//backgroundColor: 'green',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image
									style={{ width: 20, height: 20 }}
									source={
										this.state.article.collectid > 0 ? (
											image.newsimages.collectioned
										) : (
											image.newsimages.collection
										)
									}
								/>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_like}>
							<View
								style={{
									flexDirection: 'row',
									width: 70,
									height: 30,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image
									style={{ width: 20, height: 20 }}
									source={
										this.state.article.islike ? image.newsimages.xinshi : image.newsimages.xinkong
									}
								/>
								<Text
									style={{
										color: '#5c5c5c',
										fontSize: 16,
										textAlign: 'center'
									}}
								>
									{this.state.article.likecount}
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this._onPress_share}>
							<View
								style={{
									width: 50,
									height: 30,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<Image style={{ width: 20, height: 20 }} source={image.newsimages.share} />
							</View>
						</TouchableWithoutFeedback>
					</View>
					<Loading text="加载中" ref="loading" timeout={5000} />
					<PopupDialog
						ref={(playListpage) => {
							this.playListpage = playListpage;
						}}
						width={width}
						height={420}
						dialogStyle={{
							position: 'absolute',
							bottom: Platform.OS == 'ios' ? 60 : 80
						}}
						// actions={[
						//   <DialogButton
						//     text="关闭"
						//     onPress={() => {
						//       this.playListpage.dismiss();
						//     }}
						//     key="button-0"
						//     //buttonStyle={{height:40,backgroundColor:'#00000000'}}
						//   />,
						// ]}
					>
						<View
							style={{
								height: 50,
								padding: 10,
								flexDirection: 'row',
								borderBottomWidth: 1,
								borderBottomColor: '#f3f3f3',
								alignContent: 'center'
							}}
						>
							<Image style={{ width: 24, height: 24 }} source={image.newsimages.newsvicoelist} />
							<Text
								style={{
									fontSize: 14,
									height: 24,
									color: '#5c5c5c',
									textAlignVertical: 'center'
								}}
							>
								播放列表
							</Text>
						</View>
						<ScrollView
							style={{
								height: 340,
								padding: 10,
								paddingTop: 0,
								paddingBottom: 20
							}}
						>
							{this.state.playList.length > 0 ? (
								this.state.playList.map((elem, index) => {
									return (
										<TouchableWithoutFeedback
											key={'k' + index}
											onPress={this._onPressPlayListItem.bind(this, index)}
										>
											<View
												style={{
													flexDirection: 'row',
													justifyContent: 'center',
													alignItems: 'center',
													// paddingTop: 0,
													padding: 10,
													height: 44,
													borderBottomWidth: 1,
													borderBottomColor: '#f3f3f3'
													//borderColor: '#f3f3f3',
													//borderWidth: 1,
													//borderRadius: 5
													// lineHeight: 44
												}}
											>
												{this.state.playIndex == index ? (
													<Image
														style={{
															width: 24,
															height: 24
														}}
														source={image.newsimages.newsvicoe_playing}
													/>
												) : (
													<View />
												)}
												<Text
													style={{
														flex: 1,
														fontSize: 14,
														color: this.state.playIndex == index ? '#4db3d3' : '#5c5c5c'
														// lineHeight: 24
													}}
												>
													{elem.title}
												</Text>
											</View>
										</TouchableWithoutFeedback>
									);
								})
							) : (
								<View />
							)}
						</ScrollView>
						<TouchableWithoutFeedback
							onPress={() => {
								this.playListpage.dismiss();
							}}
						>
							<View
								style={{
									height: 40,
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									borderTopWidth: 1,
									borderTopColor: '#f3f3f3'
								}}
							>
								<Text tyle={{ fontSize: 14, color: '#5c5c5c' }}>关闭</Text>
							</View>
						</TouchableWithoutFeedback>
					</PopupDialog>
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.weixin} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.pengyouq} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.qq} />
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
									<Image style={{ width: 30, height: 30 }} source={image.newsimages.qqzone} />
									<Text>QQ空间</Text>
								</View>
							</TouchableHighlight>
						</View>
					</Modal>
				</View>
			);
		}
	}
}

//获取文章数据
let _getArticle = async function(aid) {
	try {
		let result = await net.ApiPost('article', 'GetArticleByID', {
			aid: aid
		});
		if (result != null && result.status == 1) {
			return result.data;
		}
	} catch (error) {
		console.log('新闻数据请求失败:' + JSON.stringify(error));
	}
	return null;
};
/* 
获取新闻数据，
tid，文章分类
aid，最大的文章id，首页传0
retime，最后一篇文章的更新时间，首页传0
*/
let _getData = async function(tid, aid, retime) {
	let result = await net.ApiPost('article', 'GetArticleAllClass2', {
		tid: tid,
		aid: aid,
		retime: retime,
		longitude: Location.longitude ? Location.longitude : config.DefaultLongitude,
		latitude: Location.latitude ? Location.latitude : config.DefaultLatitude
	});
	if (result != null && result.status == 1) {
		//console.log('Location.longitude' + Location.longitude + 'Location.latitude ' + Location.latitude);
		//Alert.alert(JSON.stringify(result));
		return result.data.tuji;
	}
	return null;
};

//获取文章内容
let _getArticleContent = async function(aid) {
	try {
		let result = await net.ApiPost('article', 'GetContentText', {
			aid: aid
		});
		if (result != null && result.status == 1) {
			return result.data.content;
		}
	} catch (error) {
		console.log('新闻内容请求失败:' + JSON.stringify(error));
	}
	return null;
};

//文章阅读数+1
let _upReadArticleCount = async function(aid, deviceid) {
	try {
		let result = await net.ApiPost('article', 'UpReadArticleCount1', {
			aid: aid,
			deviceid: deviceid
		});
		if (result != null && result.status == 1) {
			return result.data.randomread;
		} else if (result != null && result.status == 0) {
			let json = JSON.parse(result.error);
			return json.randomread;
		}
	} catch (error) {
		console.log('新闻内容请求失败:' + JSON.stringify(error));
	}
	return null;
};

//点赞
let _Praise = async function(aid) {
	try {
		let result = await net.ApiPost('article', 'Praise', { aid: aid });
		if (result != null) {
			return result;
		}
	} catch (error) {
		console.log('点赞请求失败:' + JSON.stringify(error));
	}
	return null;
};
//取消点赞
let _DelPraise = async function(aid) {
	try {
		let result = await net.ApiPost('article', 'DelPraise', { aid: aid });
		if (result != null) {
			return result;
		}
	} catch (error) {
		console.log('取消点赞请求失败:' + JSON.stringify(error));
	}
	return null;
};
//收藏
let _collectArticle = async function(postParams) {
	try {
		let result = await net.ApiPost('collect', 'AddCollect', postParams);
		if (result) {
			return result;
		}
	} catch (error) {
		console.log('收藏请求失败:' + JSON.stringify(error));
	}
	return null;
};
//取消收藏
let _DelcollectArticle = async function(aid) {
	try {
		let result = await net.ApiPost('collect', 'DelCollect', { id: aid });
		if (result != null) {
			return result;
		}
	} catch (error) {
		console.log('取消收藏请求失败:' + JSON.stringify(error));
	}
	return null;
};

//加载分类下面的5篇热门文章
let _getFiveArticle = async function(tid) {
	try {
		let result = await net.ApiPost('article', 'GetFiveArticle', {
			tid: tid
		});
		if (result != null && result.status == 1) {
			return result.data;
		}
	} catch (error) {
		console.log('新闻内容请求失败:' + JSON.stringify(error));
	}
	return null;
};

//保存新闻详情缓存
//article文章   uid 如果用户登录传用户id
let saveArticleCache = async function(article) {
	try {
		let articleList = await cache.LoadFromFile(config.NewsDetailCache);
		if (articleList) {
			for (let i = 0; i < articleList.length; i++) {
				if (article.id == articleList[i].id) {
					articleList.splice(i, 1);
					break;
				}
			}
		}
		if (!articleList) {
			articleList = new Array(0);
		}
		articleList.push(article);
		cache.SaveToFile(config.NewsDetailCache, articleList);
	} catch (error) {
		console.log('保存缓存失败:' + JSON.stringify(error));
	}
	return null;
};

//获取新闻详情缓存
//新闻列表item对象   uid 如果用户登录传用户id
let getArticleCache = async function(item) {
	let articleList = await cache.LoadFromFile(config.NewsDetailCache);
	if (articleList) {
		for (let i = 0; i < articleList.length; i++) {
			if (item.id == articleList[i].id) {
				if (articleList[i].uptime == item.uptime) {
					//&& articleList[i].likecount == item.likecount
					return articleList[i];
				} else {
					//重新发布或点赞数改变，移除缓存并返回null
					let list = articleList;
					list.splice(i, 1);
					cache.SaveToFile(config.NewsDetailCache, list);
					return null;
				}
			}
		}
	}
	return null;
};

//保存新闻字体大小
//size字号
let saveFontSize = function(size) {
	try {
		cache.SaveToFile(config.FontSizeCache, size);
	} catch (error) {
		console.log('保存新闻字体大小:' + JSON.stringify(error));
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

let _ImgReplace = function(origin) {
	let p = 0; //搜索索引
	let index = 0; //图片索引下标 从0 开始
	let replaceReg = '<img'; //搜索的字符串
	do {
		p = origin.indexOf(replaceReg, p);
		if (p >= 0) {
			let replaceText = ' onclick ="onClickImg(' + index + ')" '; //替换的字符串
			origin = _strInsert(origin, p + replaceReg.length, replaceText); //调用插入函数
			p = p + replaceReg.length + replaceText.length; //搜索索引网上加
			index += 1; //图片下标加1
		}
	} while (p >= 0); //循环替换<img 直到末尾
	return origin;
};

/**
 * 一个字符串中插入 一段字符串
 * origin 原始字符串
 * postion 插入位置
 * insertvalue 插入的字符串
 * @memberof TextContent
 */
let _strInsert = function(origin, postion, insertvalue) {
	return origin.substr(0, postion) + insertvalue + origin.substr(postion, origin.length);
};

/**
 * 提取图片url
 * @param {*传入字符串} origin
 */
let _getImgUrls = function(origin) {
	//var a = '<P> <img src="40.jpg" >  <img src="455.jpg" ></P>';
	var regex = /<img src=\"([^\"]*?)\" title=\"([^\"]*?)\" alt=\"([^\"]*?)\"\/>/gi; //new RegExp(/<img src="([^"]*?)"\/>/g);
	var imgArray = origin.match(regex);
	var urls = [];
	if (imgArray && imgArray.length > 0) {
		for (var i = 0; i < imgArray.length; i++) {
			imgArray[i] = imgArray[i].replace(regex, '$1');
			//console.log((s[i] = s[i].replace(regex, '$1')));
			urls.push({ url: imgArray[i] });
		}
		return urls;
	}
	return null;
};
