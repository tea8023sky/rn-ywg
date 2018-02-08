import React, { Component } from "react";
import {
	Text,
	TextInput,
	Image,
	View,
	Alert,
	Button,
	TouchableWithoutFeedback,
	TouchableOpacity,
	TouchableHighlight,
	Linking,
	Dimensions
} from "react-native";
import ImagePicker from "react-native-syan-image-picker";
import net from "../../../logic/net";
import image from "../../../logic/image";
import user from "../../../logic/user";
import Upload from "../../../logic/imgUtil";
import TimeUtil from "../../../logic/TimeUtil";
import PageHelper from "../../../logic/pageHelper";
import event from "../../../logic/event";
import { Loading } from "../../loading";
import skin from "../../../style";
import Icon from 'react-native-vector-icons/Ionicons';

//获取屏幕宽高
let { width, height } = Dimensions.get("window");
/**
 *添加电子合同模板页面
 *
 * @author zhangchao
 * @export
 * @class AddContract
 * @extends {Component}
 */
export class AddContract extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: "上传",
			headerTitleStyle: {
				alignSelf: "center",
				textAlign: "center",
				fontSize: 16,
				color: "#FFF"
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
			headerRight: (
				<TouchableWithoutFeedback
					onPress={() => {
						navigation.state.params._savePress();
					}}
				>
					<View>
						<Text style={{ color: "#FFF", paddingRight: 10 }}>
							提交
						</Text>
					</View>
				</TouchableWithoutFeedback>
			)
		};
	};

	constructor(props) {
		super(props);
		this.nav = this.props.navigation;
		this.state = {
			simgsArr: "", //小图图片地址 [{index:0,url:"xxx"},{index:1,url:"xxx"},...{index:5,url:"xxx"}]
			bimgsArr: "", //大图图片地址[{url:"xxx"},{url:"xxx"},...{url:"xxx"}]
			contractText: "",
			canClickAdd: false //避免点击上传图片按钮
		};
		this.data = {
			time: null
		};
	}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	//组件初始化完毕
	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
		this.props.navigation.setParams({ _savePress: this._saveContract });
		//监听预览大图
		event.Sub(this, event.Events.dynamic.delImg, this._onSaveOfferImages);
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {
		event.UnSub(this);
	}
	//处理回调监听预览大图
	_onSaveOfferImages = datas => {
		this.setState({ simgsArr: datas.simgsArr, bimgsArr: datas.bimgsArr });
	};

	//调用相册上传图片
	_onPress = async () => {
		let uriArray = []; //图片上传组件的本地路径数组集合
		let simgsArr = this.state.simgsArr == "" ? [] : this.state.simgsArr; //小图路径
		let bimgsArr = this.state.bimgsArr == "" ? [] : this.state.bimgsArr; //大图路径
		let imgLength = 12;
		let newImgsLen = this.state.simgsArr.length;
		let imglens = imgLength - newImgsLen;

		//调用相册上传图片（selectedPhotos为选中的图片数组）
		ImagePicker.showImagePicker(
			image.ImagePickerMultiOptions(imglens),
			async (err, selectedPhotos) => {
				this.setState({ canClickAdd: true });
				if (err) {
					// 取消选择
					this.setState({
						canClickAdd: false
					});
					return;
				}
				this.refs.loading.Isvisible(true);
				let index = 0;
				let result = selectedPhotos;

				for (let i = 0, imglens = result.length; i < imglens; i++) {
					simgsArr.length == 0 ? 0 : simgsArr.length + 1;
					let uploadres = await Upload.UploadImg(
						result[i],
						"ywg_dynamic"
					);
					simgsArr.push({
						index: simgsArr.length,
						url: uploadres.split(",")[0]
					});
					bimgsArr.push({ url: uploadres.split(",")[1] });
				}
				this.setState({
					imgs: result,
					simgsArr: simgsArr,
					bimgsArr: bimgsArr,
					canClickAdd: false
				});
				this.createImageItem();
				this.refs.loading.Isvisible(false);
			}
		);
	};

	/**
	 * 动态图片(最多12张图)选择显示
	 */
	createImageItem = () => {
		let defaultImgView;
		if (this.state.simgsArr != null && this.state.simgsArr.length >= 12) {
			defaultImgView = null;
		} else {
			defaultImgView = (
				<TouchableOpacity
					disabled={this.state.canClickAdd}
					onPress={this._onPress}
				>
					<Image
						source={image.chat.addimg}
						style={{ width: 70, height: 70 }}
					/>
				</TouchableOpacity>
			);
		}

		return (
			<View
				style={{
					flexDirection: "row",
					flexWrap: "wrap"
				}}
			>
				{this.state.simgsArr
					? this.state.simgsArr.map(i => (
							<View
								key={i.url}
								style={{
									width: 70,
									height: 70,
									marginTop: 5,
									marginLeft: (width - 4 * 70) / 5
								}}
							>
								<TouchableOpacity
									onPress={() => this.ItemPress(i.index)}
								>
									<Image
										style={{ width: 70, height: 70 }}
										source={{ uri: i.url }}
									/>
								</TouchableOpacity>
							</View>
						))
					: null}
				<View
					style={{
						width: 70,
						height: 70,
						marginTop: 5,
						marginLeft: (width - 4 * 70) / 5
					}}
				>
					{defaultImgView}
				</View>
				<Loading text="正在上传图片..." ref="loading" />
			</View>
		);
	};

	ItemPress = index => {
		//点击小图查看大图
		this.props.navigation.navigate("imgsCanDel", {
			simgsArr: this.state.simgsArr, //小图数据
			bimgsArr: this.state.bimgsArr, //大图数据
			index: index //图片下标
		});
	};

	//监听输入模板名称事件
	_onChangeContract = text => {
		this.setState({
			contractText: text
		});
	};

	_saveContract = async () => {
		//防止多次点击“提交”按钮重复提交
		let nowTime = new Date().getTime();
		if (!this.data.time) {
			this.data.time = nowTime;
		} else {
			let time = nowTime - this.data.time;
			this.data.time = nowTime;
			if (time < 2000) {
				return;
			}
		}
		//获取当前用户信息
		let userInfo = await user.GetUserInfo();
		let companyshort = userInfo.companyshort;

		//验证是否上传了合同模板
		if (this.state.simgsArr.length == 0) {
			Alert.alert("请上传合同模板");
			return;
		}

		//处理保存在数据库中的图片地址
		let sImgs = this.state.simgsArr; //小图地址
		let bImg = this.state.bimgsArr; //大图地址
		let saveImg = "";
		for (let j = 0, len = sImgs.length; j < len; j++) {
			if (sImgs.length == 1) {
				saveImg += sImgs[j].url + "," + bImg[j].url;
				break;
			} else {
				saveImg += sImgs[j].url + "," + bImg[j].url + "|";
			}
		}

		//合同名称默认值（合同模板_时：分：秒）
		let defaultContractText = this.state.contractText;
		if (!this.state.contractText) {
			defaultContractText =
				"合同模板_" + TimeUtil.getTime(null, "hh:mm:ss");
		}
		//保存合同模板
		let addRes = await _AddContract(
			defaultContractText,
			companyshort,
			saveImg
		);
		if (addRes != null && addRes > 0) {
			this.nav.navigate("addContractPrompt");
		} else {
			Alert.alert("保存失败，请稍后重试.");
		}
	};

	render() {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: "#FFF",
					flexDirection: "column"
				}}
			>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						paddingTop: 5,
						paddingBottom: 5,
						paddingRight: 5,
						paddingLeft: 10
					}}
				>
					<Text style={{ flex: 1 }}>模板名称</Text>
					<View
						style={{
							flex: 4,
							borderBottomColor: "#F2F2F2",
							borderBottomWidth: 1
						}}
					>
						<TextInput
							style={{ padding: 0 }}
							onChangeText={this._onChangeContract}
							value={this.state.contractText}
							placeholder="选填"
							placeholderTextColor="#808080"
							autoFocus={false}
							underlineColorAndroid="transparent"
						/>
					</View>
				</View>
				<View
					style={{
						height: 10,
						backgroundColor: "#F2F2F2",
						marginVertical: 5
					}}
				/>
				<View
					style={{
						flexDirection: "row",
						flex: 3
					}}
				>
					{this.createImageItem()}
				</View>
			</View>
		);
	}
}

/**
 * 添加电子合同
 * @param {string} ename  合同名称
 * @param {string} companyshort 公司简称
 * @param {string} upuri 用户ID
 */
let _AddContract = async function(ename, companyshort, upuri) {
	let result = await net.ApiPost("contract", "AddContract", {
		name: ename,
		companyshort: companyshort,
		upuri: upuri
	});
	if (result != null && result.status == 1) {
		return result.data;
	}
	return null;
};
