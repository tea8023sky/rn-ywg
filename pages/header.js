import React, { Component } from 'react';
import { StyleSheet, Platform, View } from 'react-native';

export default class Header extends Component {
	render() {
		let height = Platform.OS == 'ios' ? 20 : 0;
		return (
			<View
				style={{
					height: Platform.OS == 'ios' ? 20 : 0,
					backgroundColor: this.props.color || '#4BC1D2'
				}}
			/>
		);
	}
}

const styles = StyleSheet.create({
	header: {
		height: Platform.OS === 'ios' ? 20 : 0
	}
});
