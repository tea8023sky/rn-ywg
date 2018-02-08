import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Image,
	View,
	TextInput,
	TouchableHighlight,
	Keyboard,
	ScrollView,
	Platform,
	KeyboardAvoidingView
} from 'react-native';
import Dimensions from 'Dimensions';
let { width, height } = Dimensions.get('window');
import image from '../../logic/image';
import skin from '../../style';
import net from '../../logic/net';
import user from '../../logic/user';
import Regular from '../../logic/regular';
import Upload from '../../logic/imgUtil';
import event from '../../logic/event';
import ImagePicker from 'react-native-syan-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-root-toast';
import cache from '../../logic/cache';
import config from '../../config';
import { dynamicView } from './chatIndexView';

/**
 * 圈子-动态--->发表动态
 *
 * @author zhengyeye
 * @export
 * @class publish
 * @extends {Component}
 */
export default class publish extends Component {
	static navigationOptions = ({ navigation, screenProps }) => {
		return {
			headerTitle: '发表动态',
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
			headerRight: <View />
		};
	};
	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.params = this.nav.state.params; //获取参数
		this.state = {
			content: '', //存储动态内容
			url: '', //存储外部链接
			simgsArr: [], //小图图片地址 [{index:0,url:"xxx"},{index:1,url:"xxx"},...{index:5,url:"xxx"}]
			bimgsArr: [], //大图图片地址[{url:"xxx"},{url:"xxx"},...{url:"xxx"}]
			canClick: false, //	//避免重复点击发布按钮
			canClickAdd: false, //避免点击上传图片按钮
			urlHasFocus: false, //ios：url是否是否获得焦点
			isgoback: this.params ? (this.params.isgoback ? this.params.isgoback : false) : false,
			newValue: ''
		};
	}
	//组件初始化完毕
	componentDidMount() {
		// 订阅消息列表更新事件
		event.Sub(this, event.Events.dynamic.delImg, this.updateImgList);
		this.getDyData();
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	updateImgList = async item => {
		await cache.SaveToFile(config.PublishDynamicKey, {
			content: this.state.content,
			simgsArr: item.simgsArr,
			bimgsArr: item.bimgsArr,
			url: this.state.url
		});
		this.setState({
			simgsArr: item.simgsArr,
			bimgsArr: item.bimgsArr
		});
	};

	getDyData = async () => {
		//读取缓存中动态内容文本
		let cacheDynamic = await cache.LoadFromFile(config.PublishDynamicKey);
		if (cacheDynamic != null) {
			this.setState({
				content: cacheDynamic.content ? cacheDynamic.content : '',
				simgsArr: cacheDynamic.simgsArr ? cacheDynamic.simgsArr : [],
				bimgsArr: cacheDynamic.bimgsArr ? cacheDynamic.bimgsArr : [],
				url: cacheDynamic.url ? cacheDynamic.url : '',
				newValue: cacheDynamic.content ? cacheDynamic.content : ''
			});
		}
	};
	//在组件销毁的时候要将订阅事件移除
	componentWillUnmount() {
		event.UnSub(this);
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}
	_keyboardDidShow(e) {
		this.setState({ urlHasFocus: true });
	}

	_keyboardDidHide(e) {
		this.setState({ urlHasFocus: false });
	}

	componentWillMount() {
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
	}

	/**
	 * 赋值操作
	 * 
	 * @memberof publish
	 */
	setValue = text => {
		let value = text;
		if (text.length >= 140) {
			value = text.substr(0, 140);
		}
		this.setState({ newValue: value });
		this._contentChange(value);
	};

	/**
	 * 文本输入视图
	 * 
	 * @returns 
	 * @memberof publish
	 */
	inputView() {
		if (Platform.Version.indexOf('9.') == 0) {
			return (
				<TextInput
					style={publishStyle.contentText}
					clearButtonMode="while-editing"
					returnKeyType="done"
					ref="input"
					onBlur={Keyboard.dismiss}
					underlineColorAndroid="transparent"
					multiline={true}
					onChangeText={text => {
						this.setValue(text);
					}}
					maxLength={140}
					placeholder="这一刻的想法...(140个字符以内)."
					placeholderTextColor={skin.subtitle}
					enablesReturnKeyAutomatically={true}
					blurOnSubmit={true}
					defaultValue={this.state.content}
					value={this.state.newValue}
					onSubmitEditing={this._onSubmitEditing}
				/>
			);
		}

		return (
			<TextInput
				style={publishStyle.contentText}
				clearButtonMode="while-editing"
				returnKeyType="done"
				ref="input"
				onBlur={Keyboard.dismiss}
				underlineColorAndroid="transparent"
				multiline={true}
				onChangeText={this._contentChange}
				maxLength={140}
				placeholder="这一刻的想法...(140个字符以内)."
				placeholderTextColor={skin.subtitle}
				enablesReturnKeyAutomatically={true}
				blurOnSubmit={true}
				defaultValue={this.state.content}
				onSubmitEditing={this._onSubmitEditing}
			/>
		);
	}
	render() {
		if (Platform.OS === 'ios') {
			return (
				<KeyboardAvoidingView behavior="padding" style={{ backgroundColor: skin.tint, flex: 1 }}>
					<ScrollView
						style={{ backgroundColor: skin.tint }}
						ref={scrollView => {
							_scrollView = scrollView;
						}}
					>
						<View style={publishStyle.container}>
							<View style={publishStyle.contentOuter}>{this.inputView()}</View>

							<View
								style={{
									marginTop: 10,
									height: 250,
									marginBottom: 10
								}}
							>
								{this.createImageItem()}
							</View>
							<View
								style={{
									height: 10,
									backgroundColor: '#F2F2F2'
								}}
							/>
							<View style={publishStyle.urlOuter}>
								<Text
									style={{
										color: skin.subtitle,
										flex: 1
									}}
								>
									链接
								</Text>
								<TextInput
									style={publishStyle.urlText}
									clearButtonMode="while-editing"
									returnKeyType="done"
									underlineColorAndroid="transparent"
									placeholderTextColor={skin.subtitle}
									multiline={true}
									placeholder="外部链接"
									onChangeText={this._urlChange}
									onBlur={Keyboard.dismiss}
									defaultValue={this.state.url}
									enablesReturnKeyAutomatically={true}
									blurOnSubmit={true}
									onSubmitEditing={this._onSubmitEditing}
									onFocus={this._urlOnFocus}
								/>
							</View>
							<TouchableHighlight
								onPress={this.clickPublish}
								activeOpacity={1}
								underlayColor={skin.transparentColor}
								style={publishStyle.buttonOuter}
								disabled={this.state.canClick}
							>
								<View style={publishStyle.buttonText}>
									<Text
										style={{
											color: skin.tint,
											fontSize: 16
										}}
									>
										发布
									</Text>
								</View>
							</TouchableHighlight>
							{this.state.urlHasFocus ? <View style={{ height: 60 }} /> : null}
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			);
		} else {
			return (
				<ScrollView style={{ backgroundColor: skin.tint }}>
					<View style={publishStyle.container}>
						<View style={publishStyle.contentOuter}>
							<TextInput
								style={publishStyle.contentText}
								clearButtonMode="while-editing"
								returnKeyType="done"
								ref="input"
								onBlur={Keyboard.dismiss}
								underlineColorAndroid="transparent"
								multiline={true}
								onChangeText={this._contentChange}
								maxLength={140}
								enablesReturnKeyAutomatically={true}
								blurOnSubmit={true}
								placeholder="这一刻的想法...(140个字符以内)"
								placeholderTextColor={skin.subtitle}
								defaultValue={this.state.content}
								onSubmitEditing={this._onSubmitEditing}
							/>
						</View>

						<View
							style={{
								marginTop: 10,
								height: 250,
								marginBottom: 10
							}}
						>
							{this.createImageItem()}
						</View>
						<View style={{ height: 10, backgroundColor: '#F2F2F2' }} />
						<View style={publishStyle.urlOuter}>
							<Text
								style={{
									color: skin.subtitle,
									flex: 1
								}}
							>
								链接
							</Text>
							<TextInput
								style={publishStyle.urlText}
								clearButtonMode="while-editing"
								returnKeyType="done"
								underlineColorAndroid="transparent"
								placeholderTextColor={skin.subtitle}
								multiline={true}
								placeholder="外部链接"
								onChangeText={this._urlChange}
								onBlur={Keyboard.dismiss}
								defaultValue={this.state.url}
								enablesReturnKeyAutomatically={true}
								blurOnSubmit={true}
								onSubmitEditing={this._onSubmitEditing}
							/>
						</View>
						<TouchableHighlight
							onPress={this.clickPublish}
							activeOpacity={1}
							underlayColor={skin.transparentColor}
							style={publishStyle.buttonOuter}
							disabled={this.state.canClick}
						>
							<View style={publishStyle.buttonText}>
								<Text style={{ color: skin.tint, fontSize: 16 }}>发布</Text>
							</View>
						</TouchableHighlight>
					</View>
				</ScrollView>
			);
		}
	}

	//动态内容改变事件
	_contentChange = async text => {
		if (text.length == 0) {
			//文本框被清空后
			Keyboard.dismiss(); //隐藏键盘
		}
		//缓存中存储信息
		let cacheContent = await cache.LoadFromFile(config.PublishDynamicKey);
		if (cacheContent == null || cacheContent.length == 0) {
			//往动态缓存中存取信息
			await cache.SaveToFile(config.PublishDynamicKey, {
				content: text,
				simgsArr: [],
				bimgsArr: [],
				url: ''
			});
		} else {
			cacheContent.content = text;
		}
		this.setState({ content: text });
	};
	_onSubmitEditing() {
		//文本框被清空后
		Keyboard.dismiss(); //隐藏键盘
	}
	_urlOnFocus = async () => {
		_scrollView.scrollToEnd({ animated: true });
		this.setState({ urlHasFocus: true });
	};
	//外部链接改变事件
	_urlChange = async text => {
		if (text.length == 0) {
			//文本框被清空后
			Keyboard.dismiss(); //隐藏键盘
		}
		//缓存中存储信息
		let cacheContent = await cache.LoadFromFile(config.PublishDynamicKey);
		if (cacheContent == null || cacheContent.length == 0) {
			//往动态缓存中存取信息
			await cache.SaveToFile(config.PublishDynamicKey, {
				content: '',
				simgsArr: [],
				bimgsArr: [],
				url: text
			});
		} else {
			cacheContent.url = text;
		}
		this.setState({ url: text });
	};
	onPress = async () => {
		this.setState({ canClickAdd: true });
		//缓存中存储信息
		let uriArray = []; //图片上传组件的本地路径数组集合
		let simgsArr = this.state.simgsArr == '' ? [] : this.state.simgsArr; //小图路径
		let bimgsArr = this.state.bimgsArr == '' ? [] : this.state.bimgsArr; //大图路径
		let imgLength = 9;
		let nowImgsLen = this.state.simgsArr.length == 0 ? 0 : this.state.simgsArr.length;
		let len = imgLength - nowImgsLen;
		//上传图片
		ImagePicker.showImagePicker(image.ImagePickerMultiOptions(len), async (err, selectedPhotos) => {
			//selectedPhotos为选中的图片数组
			if (err) {
				// 取消选择
				this.setState({
					canClickAdd: false
				});
				return;
			}
			let index = 0;
			let result = selectedPhotos;
			let len = result.length;
			//处理上传的图片
			for (let i = 0, len = result.length; i < len; i++) {
				simgsArr.length == 0 ? 0 : simgsArr.length + 1;
				let uploadres = await Upload.UploadImg(result[i], 'ywg_dynamic');
				simgsArr.push({
					index: simgsArr.length,
					url: uploadres.split(',')[0]
				});
				bimgsArr.push({ url: uploadres.split(',')[1] });
			}
			//往动态缓存中存取信息
			await cache.SaveToFile(config.PublishDynamicKey, {
				content: '',
				simgsArr: simgsArr,
				bimgsArr: bimgsArr,
				url: ''
			});
			this.setState({
				simgsArr: simgsArr,
				bimgsArr: bimgsArr,
				canClickAdd: false
			});
			this.createImageItem();
			//上传图片完成后的提示
			Toast.show('成功上传' + len + '张图片', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		});
	};
	clickPublish = async () => {
		//发布事件并对动态内容进行校验
		if (this.state.content == null || this.state.content == '') {
			Toast.show('请输入内容.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		if (this.state.content.length > 140) {
			Toast.show('动态内容不超过140个字符.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		let isUrl = Regular.isUrl(this.state.url ? this.state.url.trim() : '');
		if (this.state.url && !isUrl) {
			Toast.show('请输入正确的链接地址.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
			return;
		}
		//处理保存在数据库中的图片地址
		let sImgs = this.state.simgsArr; //小图地址
		let bImg = this.state.bimgsArr; //大图地址
		let saveImg = '';
		for (let j = 0, len = sImgs.length; j < len; j++) {
			if (sImgs.length == 1) {
				saveImg += sImgs[j].url + ',' + bImg[j].url;
			} else if (j == len - 1) {
				saveImg += sImgs[j].url + ',' + bImg[j].url;
			} else {
				saveImg += sImgs[j].url + ',' + bImg[j].url + '|';
			}
		}

		let userData = await cache.LoadFromFile(config.UserInfoSaveKey); //获取缓存中的用户信息
		if (userData == null) {
			return;
		}
		//增加动态，请求接口
		if (!this.state.canClick) {
			let addRes = await addData(userData.id, 0, this.state.content, this.state.url, saveImg);
			if (addRes != null && addRes == 1) {
				//发布动态成功后，删除掉动态中的缓存
				await cache.RemoveCache(config.PublishDynamicKey);
				this.setState({ canClick: true });

				if (this.state.isgoback) {
					this.nav.goBack();
				} else {
					this.nav.navigate('chat', {
						chatSelected: false,
						dySelected: true
					});
				}
			} else {
				Toast.show('发布失败，请稍后重试.', {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		} else {
			Toast.show('点击频率过快，请稍后重试.', {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	/**
	 * 动态图片(最多九张图)选择显示
	 *
	 * @author zhengyeye
	 * @returns
	 * @memberof publish
	 */
	createImageItem() {
		let defaultImgView;
		if (this.state.simgsArr != null && this.state.simgsArr.length >= 9) {
			defaultImgView = null;
		} else {
			defaultImgView = (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor={skin.transparentColor}
					disabled={this.state.canClickAdd}
					onPress={() => {
						this.onPress();
					}}
				>
					<Image source={image.chat.addimg} style={{ width: 70, height: 70 }} />
				</TouchableHighlight>
			);
		}

		return (
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap'
				}}
			>
				{this.state.simgsArr
					? this.state.simgsArr.map(i => (
							<View
								key={i.index + new Date().getTime()}
								style={{
									width: 80,
									height: 80,
									marginTop: 5,
									marginLeft: (width - 4 * 80) / 5
								}}
							>
								<TouchableHighlight
									activeOpacity={1}
									underlayColor={skin.transparentColor}
									onPress={() => this.ItemPress(i.index)}
								>
									<Image style={{ width: 80, height: 70 }} source={{ uri: i.url }} />
								</TouchableHighlight>
							</View>
						))
					: null}
				<View
					style={{
						width: 70,
						height: 70,
						marginLeft: (width - 4 * 70) / 5,
						marginTop: 5
					}}
				>
					{defaultImgView}
				</View>
			</View>
		);
	}

	ItemPress = index => {
		//点击小图查看大图(跳转到有删除事件的页面)
		this.props.navigation.navigate('imgsCanDel', {
			simgsArr: this.state.simgsArr, //小图数据
			bimgsArr: this.state.bimgsArr, //大图数据
			index: index //图片下标
		});
	};
}

/**
 * 增加动态
 * @param {*int} uid
 * @param {*int} cid
 * @param {*string} content
 * @param {*string} link
 * @param {*string} imgs
 */
let addData = async function(uid, cid, content, link, imgs) {
	let result = await net.ApiPost('circledynamic', 'AddDynamic', {
		uid: uid,
		cid: cid,
		content: content,
		link: link,
		imgs: imgs
	});
	if (result != null && result.status == 1) {
		return result.status;
	}
	return null;
};
//设置样式
const publishStyle = StyleSheet.create({
	container: {
		//最外层容器
		justifyContent: 'flex-start',
		flex: 1,
		backgroundColor: skin.tint
	},
	contentOuter: {
		//动态内容最外层
		borderBottomWidth: 1,
		height: 150,
		marginLeft: 20,
		marginRight: 20,
		marginTop: 10,
		borderColor: '#EEE',
		flex: 1
	},
	contentText: {
		//动态内容文本
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		textAlignVertical: 'top',
		color: skin.title,
		height: 130,
		padding: 0
	},
	urlOuter: {
		//动态链接最外层
		flexDirection: 'row',
		marginTop: 10,
		marginLeft: 20,
		marginRight: 20,
		justifyContent: 'center',
		alignItems: 'center'
	},
	urlText: {
		//url文本
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		color: skin.title,
		padding: 0,
		flex: 5,
		borderColor: '#EEE',
		borderBottomWidth: 1,
		fontSize: 12
	},
	buttonOuter: {
		//发布按钮最外层
		flexDirection: 'row',
		marginHorizontal: 40,
		marginTop: 25,
		borderRadius: 5,
		marginBottom: 25
	},
	buttonText: {
		//发布按钮文本
		flex: 1,
		backgroundColor: skin.main,
		justifyContent: 'center',
		alignItems: 'center',
		height: 40,
		borderRadius: 5
	}
});
