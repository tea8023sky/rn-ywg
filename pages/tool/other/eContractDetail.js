import React, { Component } from "react";
import {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	View,
	FlatList,
	Alert,
	Button,
	TouchableWithoutFeedback,
	TouchableOpacity,
	TouchableHighlight,
	Linking,
	Dimensions,
	Keyboard,
	CameraRoll,
	ScrollView
} from "react-native";
import net from "../../../logic/net";
import fileDownloadUtil from "../../../logic/fileDownloadUtil";
import PageHelper from "../../../logic/pageHelper";
import Upload from "../../../logic/imgUtil";
import Toast from "react-native-root-toast";
import { Loading } from "../../loading";
import skin from "../../../style";
import Icon from 'react-native-vector-icons/Ionicons';

//获取屏幕宽高
let { width, height } = Dimensions.get("window");
/**
 *电子合同详情页
 *
 * @author zhangchao
 * @export
 * @class ContractDetail
 * @extends {Component}
 */
export class ContractDetail extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: navigation.state.params.name,
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
					disabled={navigation.state.params.isDisable}
				>
					<View>
						<Text style={{ color: "#FFF", paddingRight: 10 }}>
							生成
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
			datas: this.props.navigation.state.params,
			settings: JSON.parse(this.props.navigation.state.params.settings)
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
		let settings = this.state.settings;
		let arrs = [];
		let initdatas = {};
		for (let index in settings) {
			initdatas[index] = "";
		}
		this.setState(initdatas);
		this.props.navigation.setParams({
			_savePress: this._saveContract,
			isDisable: false
		});
		PageHelper.pushPageKey("eContractDetail", this.nav.state.key);
	}

	_saveContract = async () => {
		this.props.navigation.setParams({ isDisable: true }); //避免重复点击‘生成’按钮（禁用按钮）
		//生成合同前隐藏键盘
		Keyboard.dismiss();
		let id = this.state.datas.id;
		let keys = Object.keys(this.state.settings);
		let datas = {};
		let isflag = true; //标志字段是否填写完善，isflag为true时表示填写完善，isflag为false时表示未填写完善
		for (let key of keys) {
			datas[key] = this.state[key];
			if (!this.state[key]) {
				isflag = false;
			}
		}
		if (!isflag) {
			Alert.alert(
				"",
				"还有字段未完善，确定生成该合同？",
				[
					{
						text: "取消",
						onPress: () => {
							this.props.navigation.setParams({
								isDisable: false
							}); //避免重复点击‘生成’按钮（启用按钮）
						},
						style: "cancel"
					},
					{
						text: "确认生成",
						onPress: async () => {
							this.refs.loading.Isvisible(true);
							let result = await generateContract(id, datas);
							if (result.length > 0) {
								this.nav.navigate("eContractImage", {
									title: "电子合同",
									imgagearrs: result
								}); //跳转图片生成页
								this.props.navigation.setParams({
									isDisable: false
								}); //避免重复点击‘生成’按钮（启用按钮）
							} else {
								Toast.show(
									"电子合同生成失败，请稍后重新生成！",
									{
										duration: Toast.durations.SHORT,
										position: Toast.positions.BOTTOM
									}
								);
							}
							this.refs.loading.Isvisible(false);
						}
					}
				],
				{ cancelable: false }
			);
		} else {
			this.refs.loading.Isvisible(true);
			let result = await generateContract(id, datas);
			if (result.length > 0) {
				this.nav.navigate("eContractImage", {
					title: "电子合同",
					imgagearrs: result
				}); //跳转图片生成页
				this.props.navigation.setParams({ isDisable: false }); //避免重复点击‘生成’按钮（启用按钮）
			} else {
				Toast.show("电子合同生成失败，请稍后重新生成！", {
					duration: Toast.durations.SHORT,
					position: Toast.positions.BOTTOM
				});
				this.props.navigation.setParams({ isDisable: false }); //避免重复点击‘生成’按钮（启用按钮）
			}
			this.refs.loading.Isvisible(false);
		}
	};

	//保存图片到相册
	saveImgs = async path => {
		CameraRoll.saveToCameraRoll(path).then(
			function(success) {
				console.log("图片保存到相册成功");
				console.log(success);
				fileDownloadUtil.deleteFile(path);
			},
			function(error) {
				console.log("图片保存到相册失败");
				console.log(error);
			}
		);
	};

	render() {
		let arrs = Object.keys(this.state.settings);
		let objs = this.state.settings;
		return (
			<ScrollView
				style={{ backgroundColor: "#fff" }}
				keyboardShouldPersistTaps={"handled"}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: "#FFF",
						flexDirection: "column"
					}}
				>
					{arrs.map((item, index) => {
						return (
							<View
								key={index}
								style={{
									height: 50,
									backgroundColor: "#FFF",
									flexDirection: "column"
								}}
							>
								<View
									style={{
										flexDirection: "row",
										justifyContent: "center",
										alignItems: "center",
										padding: 10,
										height: 40
									}}
								>
									<Text style={{ flex: 1, fontSize: 14 }}>
										{objs[item]}
									</Text>

									<TextInput
										style={{
											padding: 0,
											flex: 4,
											fontSize: 14
										}}
										onChangeText={text => {
											let obj = {};
											obj[item] = text;
											this.setState(obj);
										}}
										value={this.state[item]}
										placeholder="选填"
										placeholderTextColor="#808080"
										autoFocus={false}
										underlineColorAndroid="transparent"
									/>
								</View>
								<View
									style={{
										height: 1,
										backgroundColor: "#F2F2F2",
										marginVertical: 5
									}}
								/>
							</View>
						);
					})}
				</View>
				<Loading text="正在生成图片..." ref="loading" />
			</ScrollView>
		);
	}
}

/**
 * 电子合同生成图片
 * @param {int} id 电子合同id
 * @param {Object} params 参数对象 例如：{  替换的key: 输入框内容 }
 */
let generateContract = async function(id, params) {
	let result = await net.MaterialPost("doecontract.ashx", {
		id: id.toString(),
		data: JSON.stringify(params)
	});
	if (result != null && result.status == 1) {
		return result.data;
	}
	return null;
};
