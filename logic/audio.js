//var Sound = require('react-native-sound');
import Sound from 'react-native-sound';
//import React, { Component } from 'react';
//import { Platform, StyleSheet, Text, View, Alert, TouchableHighlight } from 'react-native';

// Enable playback in silence mode (iOS only)
Sound.setCategory('Playback');

/**
 * 音频播放
 * 
 * @author NongHuaQiang
 * @export
 * @class audio
 */
export default class audio {
	static _sound = null; //音频对象

	/**
	 * //初始化函数  加载网络音频 成功返回音频对象 失败返回error
	 * @static
	 * @memberof audio
	 */
	static init = function(path) {
		// if (_sound !== null) {
		// 	try {
		// 		_sound.stop().release(); //停止 释放文件
		// 		_sound = null;
		// 	} catch (error) {
		// 		_sound = null;
		// 	}
		// }
		return new Promise(function(resolve, reject) {
			_sound = new Sound(path, '', error => {
				if (error) {
					return reject(error);
				} else {
					return resolve(_sound);
				}
			});
		});
	};

	/**
	 * 播放音频
	 * 
	 * @static
	 * @memberof audio
	 */
	static Play = function() {
		return new Promise(function(resolve, reject) {
			//sound.setCurrentTime(sound.getDuration() - 20);
			if (_sound === null) {
				return reject(false); //没有初始化音频文件
			}
			_sound.play(success => {
				if (success) {
					_sound.release(); //播放完成释放文件
					return resolve(true);
				} else {
					return reject(false);
				}
			});
		});
	};

	/**
	 * 停止播放
	 * 
	 * @static
	 * @memberof audio
	 */
	static Stop = function() {
		try {
			_sound.stop().release(); //停止 释放文件
		} catch (error) {
			_sound = null;
		}
	};

	/**
	 * 暂停
	 * 
	 * @static
	 * @memberof audio
	 */
	static Pause = function() {
		try {
			_sound.pause(); //暂停
		} catch (error) {}
	};

	/**
	 * 继续播放
	 * 没有resume() 方法，直接调用play方法
	 * @static
	 * @memberof audio
	 */
	static Resume = function() {
		try {
			_sound.play(success => {
				if (success) {
					_sound.release(); //播放完成释放文件
				} else {
				}
			});
		} catch (error) {}

		//Alert.alert(JSON.stringify(sound));
		//_sound.resume(); //继续 (此方法有问题)
	};

	/**
	 * 获取音频总时长
	 * 
	 * @static
	 * @memberof audio
	 */
	static getDuration = function() {
		try {
			return _sound.getDuration(); //继续
		} catch (error) {
			return -1;
		}
	};

	/**
	 * 设置播放进度
	 * 
	 * @static
	 * @memberof audio
	 */
	static setCurrentTime = function(time) {
		try {
			_sound.setCurrentTime(time);
		} catch (error) {}
	};

	/**
	 * 获取播放进度
	 * 
	 * @static
	 * @memberof audio
	 */
	static getCurrentTime = function(time) {
		try {
			_sound.getCurrentTime((seconds, isPlaying) => {
				return seconds;
			});
		} catch (error) {
			return -1;
		}
	};
}
