import React, { Component } from 'react';
import { Text, Button, View, Dimensions, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PageHelper from '../../../logic/pageHelper';
import event from '../../../logic/event';
import skin from '../../../style';
//获取屏幕宽高
let { width, height } = Dimensions.get('window');
/**
 * 电子合同-添加电子合同-完成页面
 * 
 * @author zhangchao
 * @export
 * @class AddContractPrompt
 * @extends {Component}
 */
export default class AddContractPrompt extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: '完成',
			headerTitleStyle: {
				alignSelf: 'center',
				textAlign: 'center',
				fontSize: 16,
				color: '#FFF',
				paddingRight: 30
			},
			headerLeft: (
				<TouchableWithoutFeedback
					onPress={() => {
						navigation.state.params.goBackAddEC();
					}}
				>
					<View style={{ paddingLeft: 10 }}>
						<Icon name="ios-close-outline" size={40} style={{ color: '#FFF' }} />
					</View>
				</TouchableWithoutFeedback>
			)
		};
	};

	constructor(props) {
		super(props);
		this.state = {};
		this.nav = this.props.navigation;
	}

	//组件初始化完毕
	componentDidMount() {
		this.props.navigation.setParams({ goBackAddEC: this._goBackAddEC });
	}

	//在组件销毁的时候要将其移除
	componentWillUnmount() {}

	//关闭页面，跳转到电子合同首页
	_goBackAddEC = () => {
		//触发一个事件
		event.Send(event.Events.tool.addEContract);
		this.nav.goBack(PageHelper.getPageKey('eCStatement'));
	};
	render() {
		return (
			<View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#f3f3f3', padding: 16 }}>
				<ScrollView>
					<Text style={{ fontSize: 14, paddingBottom: 20 }}>小编提醒您：您的合同正在审核编辑中，请耐心等待！</Text>
				</ScrollView>
			</View>
		);
	}
}
