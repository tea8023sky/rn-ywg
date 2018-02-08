import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	Button,
	TextInput,
	Image,
	View,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Dimensions,
	ScrollView,
	Alert
} from 'react-native';
import Header from '../../header';
import skin from '../../../style';
import image from '../../../logic/image';
import PageHelper from '../../../logic/pageHelper';
import { SelectType } from './materialSelect';
import Icon from 'react-native-vector-icons/Ionicons';
//获取屏幕宽高
let { width, height } = Dimensions.get('window');

export default class Statement extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '免责声明',
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
		this.state = {};
		this.nav = this.props.navigation;
		this.type = this.nav.state.params.type; //获取参数 type
		PageHelper.pushPageKey('statement', this.nav.state.key);
	}

	componentDidMount() {
		this.props.navigation.setParams({
			goBackPage: this._goBackPage
		});
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {}

	//自定义返回事件
	_goBackPage = () => {
		this.nav.goBack();
	};

	//打开选择钢厂
	SteelSelect = () => {
		this.nav.navigate('materialSelect', {
			title: '选择钢厂',
			selecttype: SelectType.Steel,
			type: this.type
		});
	};
	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					backgroundColor: '#f3f3f3',
					padding: 5
				}}
			>
				<ScrollView>
					<Text style={{ fontSize: 14, paddingBottom: 20, paddingRight: 15 }}>
						1、业务GO材质书板块包含其查询、新增、修改、删除等功能仅供参考学习使用，不做为钢材质量证明依据，任何用户不得将业务GO中的材质书信息参与到业务经营，由此产生的一切问题，业务GO概不负责
						，亦不承担任何法律责任。
					</Text>
					<Text style={{ fontSize: 14, paddingBottom: 20, paddingRight: 15 }}>
						2、任何网友通过业务GO查询、新增、修改、删除 、复制、粘贴材质书信息均代表网友个人行为，并不反应业务GO任何材质书意见，业务GO不为其承担任何法律责任。
					</Text>
					<Text style={{ fontSize: 14, paddingBottom: 20, paddingRight: 15 }}>
						3、任何用户在使用业务GO材质书板块时，有义务自行承担风险，业务GO不做任何形式的保证。因网络状况、通信线路等任何技术原因而导致用户不能正常使用业务GO材质书板块不承担任何法律责任。
					</Text>
					<Text style={{ fontSize: 14, paddingBottom: 20, paddingRight: 15 }}>
						4、任何单位或个人认为业务GO材质书的内容可能涉嫌侵犯其合法权益，应该及时向业务GO或服务网站书面反馈。业务GO在证明确有侵权内容，将会尽快移除被控侵权内容。
					</Text>
					<Text style={{ fontSize: 14, paddingBottom: 20, paddingRight: 15 }}>
						5、凡以任何方式直接、间接使用业务GO材质书用户，视为自愿接受本声明的约束。
					</Text>
					<Text style={{ fontSize: 14, paddingBottom: 20, paddingRight: 15 }}>
						6、本声明以及其修改权、更新权及最终解释权均属业务GO所有。
					</Text>

					<TouchableHighlight
						activeOpacity={1}
						underlayColor={'#FFF'}
						onPress={this.SteelSelect}
						style={{
							flexDirection: 'row',
							marginTop: 25,
							borderRadius: 5
						}}
					>
						<View
							style={{
								flex: 1,
								backgroundColor: '#4BC1D2',
								justifyContent: 'center',
								alignItems: 'center',
								height: 40,
								borderRadius: 5
							}}
						>
							<Text style={{ color: '#FFF' }}>同意</Text>
						</View>
					</TouchableHighlight>
				</ScrollView>
			</View>
		);
	}
}
