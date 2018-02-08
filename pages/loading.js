'use strict';
import React from 'react';
import { StyleSheet, Dimensions, Text, View, Modal, ActivityIndicator, Alert } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export class Loading extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isShow: this.props.visible ? this.props.visible : false
		};
		this.timeout = this.props.timeout ? this.props.timeout : 3000;
	}
	componentDidMount() {
		this.timer = setTimeout(() => {
			this.setState({ isShow: false });
		}, this.timeout);
	}
	componentWillUnmount() {
		// 请注意Un"m"ount的m是小写
		// 如果存在this.timer，则使用clearTimeout清空。
		// 如果你使用多个timer，那么用多个变量，或者用个数组来保存引用，然后逐个clear
		this.timer && clearTimeout(this.timer);
	}
	Isvisible = visible => {
		this.setState({ isShow: visible });
	};
	render() {
		return (
			<Modal
				style={{ backgroundColor: '#ff0000' }}
				animationType={'fade'}
				transparent={true}
				visible={this.state.isShow}
				onRequestClose={() => {
					//alert('Modal has been closed.');
					this.setState({ isShow: false });
				}}
			>
				<View style={[styles.load_box, this.props.loadingStyle]}>
					<ActivityIndicator
						animating={true}
						color={this.props.color || '#FFF'}
						size={'large'}
						style={styles.load_progress}
					/>
					<Text style={[styles.load_text, this.props.textStyle]}>{this.props.text}</Text>
				</View>
			</Modal>
		);
	}
}
const styles = StyleSheet.create({
	load_box: {
		width: 100,
		height: 100,
		backgroundColor: '#0008',
		alignItems: 'center',
		marginLeft: SCREEN_WIDTH / 2 - 50,
		marginTop: SCREEN_HEIGHT / 2 - 50,
		borderRadius: 10
	},
	load_progress: {
		position: 'absolute',
		width: 100,
		height: 90
	},
	load_text: {
		marginTop: 70,
		color: '#FFF'
	}
});
