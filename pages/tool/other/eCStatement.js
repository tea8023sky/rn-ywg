import React, { Component } from "react";
import {
	Text,
	Button,
	View,
	Dimensions,
	ScrollView,
	TouchableHighlight
} from "react-native";
import PageHelper from "../../../logic/pageHelper";
import skin from "../../../style";
import Icon from 'react-native-vector-icons/Ionicons';

//获取屏幕宽高
let { width, height } = Dimensions.get("window");
/**
 * 电子合同-添加电子合同说明
 *
 * @author zhangchao
 * @export
 * @class ECStatement
 * @extends {Component}
 */
export default class ECStatement extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: "电子合同",
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
			headerRight: <View />
		};
	};

	
	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	constructor(props) {
		super(props);
		this.state = {};
		this.nav = this.props.navigation;
		PageHelper.pushPageKey("eCStatement", this.nav.state.key);
	}

	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {}

	//跳转到添加电子合同页面
	_goBackAddEC = () => {
		this.nav.navigate("addContract");
	};
	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: "column",
					backgroundColor: "#f3f3f3",
					padding: 16
				}}
			>
				<ScrollView>
					<Text style={{ fontSize: 14, paddingBottom: 20 }}>
						1、电子合同工具是为业务员提供合同签署的便捷工具；
					</Text>
					<Text style={{ fontSize: 14, paddingBottom: 20 }}>
						2、先上传电子合同图片，由业务GO后台工作人员进行审核编制后，方可使用；
					</Text>
					<Text style={{ fontSize: 14, paddingBottom: 20 }}>
						3、业务GO仅作为合同签署的便捷工具。若线下涉及相关法律问题，与业务GO无关；
					</Text>
					<Text style={{ fontSize: 14, paddingBottom: 20 }}>
						4、上传合同图片，保证图片清晰。
					</Text>

					<TouchableHighlight
						activeOpacity={1}
						underlayColor={"#FFF"}
						onPress={this._goBackAddEC}
						style={{
							flexDirection: "row",
							marginHorizontal: 20,
							marginTop: 25,
							borderRadius: 5
						}}
					>
						<View
							style={{
								flex: 1,
								backgroundColor: "#4BC1D2",
								justifyContent: "center",
								alignItems: "center",
								height: 40,
								borderRadius: 5
							}}
						>
							<Text style={{ color: "#FFF" }}>同意</Text>
						</View>
					</TouchableHighlight>
				</ScrollView>
			</View>
		);
	}
}
