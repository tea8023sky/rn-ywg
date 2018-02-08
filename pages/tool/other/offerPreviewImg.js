import React, { Component } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableWithoutFeedback,
	CameraRoll
} from "react-native";
import net from "../../../logic/net";
import fileDownloadUtil from "../../../logic/fileDownloadUtil";
import Toast from "react-native-root-toast";
let Dimensions = require("Dimensions");
let { width, height } = Dimensions.get("window");
import cache from "../../../logic/cache";
import config from "../../../config";
import Upload from "../../../logic/imgUtil";
import { ChatMessage } from "../../../logic/chat";
import RNFetchBlob from "react-native-fetch-blob";
import { Loading } from "../../loading";
/**
 *
 *报价单-选择模板页面-预览生成的报价单
 * @author zhangchao
 * @export
 * @class OfferPreviewImg
 * @extends {Component}
 */
export default class OfferPreviewImg extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: "预览",
			headerTitleStyle: {
				alignSelf: "center",
				textAlign: "center",
				fontSize: 16,
				color: "#FFF"
			}
		};
	};
	//构造方法
	constructor(props) {
		super(props);
		this.nav = this.props.navigation; //获取导航对象
		this.params = this.nav.state.params; //获取参数
		this.path = null;
		this.state = {
			imgUrl: this.params.imgUrl,
			stationImgs: [] //图片站路径   例：[smallUrl,bigUrl]
		};
	}
	//组件初始化完毕
	componentDidMount() {
		this.setState({
			imgUrl: this.params.imgUrl,
			stationImgs: [] //图片站路径   例：[smallUrl,bigUrl]
		});
		this.downLoad2();
	}

	//下载图片
	downLoad2 = () => {
		RNFetchBlob.config({
			fileCache: true,
			// by adding this option, the temp files will have a file extension
			appendExt: "png"
		})
			.fetch("GET", this.params.imgUrl, {
				//some headers ..
			})
			.then(res => {
				this.path = "file:///" + res.path();
				this.save(res.path());
			});
	};

	//下载图片(TODO:暂未使用)
	async downLoad() {
		//将图片下载到本地
		let path = await fileDownloadUtil.downloadImage(this.params.imgUrl);
		if (path) {
			this.path = path;
			//将图片上传到图片站
			let uploadres = await Upload.UploadImg(
				{ uri: path },
				"ywg_dynamic"
			);
			if (uploadres != null) {
				this.setState({
					stationImgs: uploadres.split(",") //图片站路径   例：[smallUrl,bigUrl]
				});
			}

			this.save(path);
		} else {
			Toast.show("下载失败", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	}
	//保存图片到相册
	save = async path => {
		CameraRoll.saveToCameraRoll(path).then(
			function(success) {
				Toast.show("图片保存到相册成功", {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			},
			function(error) {
				Toast.show("图片保存到相册失败", {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
			}
		);
	};
	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		fileDownloadUtil.deleteFile(this.path);
		_RemoveImg(this.params.imgUrl);
	}

	//预览大图
	_onShowBigImg = () => {
		//点击小图查看大图方法
		this.nav.navigate("previewBigImg", { imgUrl: this.params.imgUrl });
	};

	//分享到动态
	_onShareDynamic = async () => {
		this.refs.loading.Isvisible(true);
		let uploadres = null;
		if (this.path != null) {
			//将图片上传到图片站
			uploadres = await Upload.UploadImg(
				{ uri: this.path },
				"ywg_dynamic"
			);
		}

		if (uploadres != null) {
			let result = [];
			result[0] = uploadres.substring(0, uploadres.lastIndexOf(","));
			result[1] = uploadres.substring(
				uploadres.lastIndexOf(",") + 1,
				uploadres.length
			);

			let cacheDatas = await cache.LoadFromFile(config.PublishDynamicKey);
			//缓存中存储信息
			if (cacheDatas == null) {
				//往动态缓存中存取信息
				await cache.SaveToFile(config.PublishDynamicKey, {
					content: "",
					simgsArr: [{ index: 0, url: result[0] }],
					bimgsArr: [{ url: result[1] }],
					url: ""
				});
			} else {
				let content = cacheDatas.content ? cacheDatas.content : "";
				let simgsArr = cacheDatas.simgsArr ? cacheDatas.simgsArr : [];
				let bimgsArr = cacheDatas.bimgsArr ? cacheDatas.bimgsArr : [];
				let url = cacheDatas.url ? cacheDatas.url : "";

				simgsArr.push({
					index: simgsArr.length,
					url: result[0]
				});
				bimgsArr.push({ url: result[1] });
				//往动态缓存中存取信息
				await cache.SaveToFile(config.PublishDynamicKey, {
					content: content,
					simgsArr: simgsArr,
					bimgsArr: bimgsArr,
					url: url
				});
			}
			this.refs.loading.Isvisible(false);
			this.nav.navigate("publish", { isgoback: true });
		} else {
			this.refs.loading.Isvisible(false);
			Toast.show("分享到动态失败，请稍后重试！", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	//分享给朋友
	_onShareFriend = async () => {
		this.refs.loading.Isvisible(true);
		let uploadres = null;
		if (this.path != null) {
			//将图片上传到图片站
			uploadres = await Upload.UploadImg(
				{ uri: this.path },
				"ywg_dynamic"
			);
		}
		if (uploadres != null) {
			this.refs.loading.Isvisible(false);
			this.nav.navigate("multipleChoice", {
				confirmNum: 0,
				chatMessage: {
					content: uploadres,
					contentType: ChatMessage.ContentType.Chat_Image
				}
			});
		} else {
			this.refs.loading.Isvisible(false);
			Toast.show("分享给朋友失败，请稍后重试", {
				duration: Toast.durations.SHORT,
				position: Toast.positions.BOTTOM
			});
		}
	};

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: "#FFF" }}>
				<TouchableWithoutFeedback onPress={this._onShowBigImg}>
					<View
						style={{
							flex: 5,
							alignSelf: "center",
							justifyContent: "center"
						}}
					>
						<Image
							style={{ width: width - 120, height: 250 }}
							resizeMode={Image.resizeMode.contain}
							source={{ uri: this.state.imgUrl }}
						/>
						<Text style={{ textAlign: "center" }}>
							点击查看大图
						</Text>
					</View>
				</TouchableWithoutFeedback>
				<View
					style={{
						flex: 3,
						flexDirection: "row",
						alignSelf: "center"
					}}
				>
					<TouchableWithoutFeedback
						onPress={() => this._onShareDynamic()}
					>
						<View
							style={{
								backgroundColor: "#FFA858",
								justifyContent: "center",
								alignItems: "center",
								width: 120,
								height: 40,
								borderRadius: 5
							}}
						>
							<Text style={{ color: "#FFF" }}>分享到动态</Text>
						</View>
					</TouchableWithoutFeedback>
					<View style={{ width: 30 }} />
					<TouchableWithoutFeedback onPress={this._onShareFriend}>
						<View
							style={{
								backgroundColor: "#4BC1D2",
								justifyContent: "center",
								alignItems: "center",
								width: 120,
								height: 40,
								borderRadius: 5
							}}
						>
							<Text style={{ color: "#FFF" }}>分享给朋友</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
				<Loading text="正在上传图片..." ref="loading" />
			</View>
		);
	}
}

//下载后移除图片
let _RemoveImg = async function(url) {
	let filename = url.substring(url.lastIndexOf("/") + 1);
	let result = await net.ApiPost("offer", "RemoveImg", {
		filename: filename
	});
	if (result != null && result.status == 1) {
		return result.data;
	}

	return null;
};
