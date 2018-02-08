import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * 文件下载(图片 文本 音频 视频)
 * 
 * @author NongHuaQiang
 * @export
 * @class FileDownloadUtil
 */
export default class FileDownloadUtil {
	/**
	 * 下载图片
	 * 
	 * @author NongHuaQiang
	 * @static
	 * @param {any} url 
	 * @returns 
	 * @memberof FileDownloadUtil
	 */
	static downloadImage(url) {
		// On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)

		// 图片
		const downloadDest =
			Platform.OS == 'android'
				? `${RNFS.PicturesDirectoryPath}/${(Math.random() * 1000) | 0}.jpg`
				: `${RNFS.MainBundlePath}/${(Math.random() * 1000) | 0}.jpg`;
		//const formUrl = 'http://img4.imgtn.bdimg.com/it/u=1205165919,1619656090&fm=214&gp=0.jpg';

		// 文件
		// const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.zip`;
		// const formUrl = 'http://files.cnblogs.com/zhuqil/UIWebViewDemo.zip';

		// 视频
		// const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.mp4`;
		// http://gslb.miaopai.com/stream/SnY~bbkqbi2uLEBMXHxGqnNKqyiG9ub8.mp4?vend=miaopai&
		// https://gslb.miaopai.com/stream/BNaEYOL-tEwSrAiYBnPDR03dDlFavoWD.mp4?vend=miaopai&
		// const formUrl = 'https://gslb.miaopai.com/stream/9Q5ADAp2v5NHtQIeQT7t461VkNPxvC2T.mp4?vend=miaopai&';

		// 音频
		//const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.mp3`;
		//const formUrl = 'http://wvoice.spriteapp.cn/voice/2015/0818/55d2248309b09.mp3';

		const options = {
			fromUrl: url,
			toFile: downloadDest,
			background: true,
			begin: res => {
				//console.log('begin', res);
				//console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
			},
			progress: res => {
				let pro = res.bytesWritten / res.contentLength;

				// this.setState({
				// 	progressNum: pro
				// });
			}
		};

		return new Promise(function(resolve, reject) {
			const ret = RNFS.downloadFile(options);
			ret.promise
				.then(res => {
					//console.log('success', res);
					//console.log('file://' + downloadDest);
					return resolve('file://' + downloadDest);
				})
				.catch(err => {
					//console.log('err', err);
					return reject(false);
				});
		});
	}

	/**
	 * 下载mp3
	 * 
	 * @author NongHuaQiang
	 * @static
	 * @param {any} url 
	 * @returns 
	 * @memberof FileDownloadUtil
	 */
	static  downloadAudio(url) {
		// On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)

		// 图片
		const downloadDest =
			Platform.OS == 'android'
				? `${RNFS.DocumentDirectoryPath}/`+name
				: `${RNFS.MainBundlePath}/`+name;
		//const formUrl = 'http://img4.imgtn.bdimg.com/it/u=1205165919,1619656090&fm=214&gp=0.jpg';

		// 文件
		// const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.zip`;
		// const formUrl = 'http://files.cnblogs.com/zhuqil/UIWebViewDemo.zip';

		// 视频
		// const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.mp4`;
		// http://gslb.miaopai.com/stream/SnY~bbkqbi2uLEBMXHxGqnNKqyiG9ub8.mp4?vend=miaopai&
		// https://gslb.miaopai.com/stream/BNaEYOL-tEwSrAiYBnPDR03dDlFavoWD.mp4?vend=miaopai&
		// const formUrl = 'https://gslb.miaopai.com/stream/9Q5ADAp2v5NHtQIeQT7t461VkNPxvC2T.mp4?vend=miaopai&';

		// 音频
		//const downloadDest = `${RNFS.MainBundlePath}/${((Math.random() * 1000) | 0)}.mp3`;
		//const formUrl = 'http://wvoice.spriteapp.cn/voice/2015/0818/55d2248309b09.mp3';

		const options = {
			fromUrl: url,
			toFile: downloadDest,
			background: false,
			begin: res => {
				console.log('begin', res);
				console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
			},
			progress: res => {
				let pro = res.bytesWritten / res.contentLength;
				console.log('pro', pro);
				// this.setState({
				// 	progressNum: pro
				// });
			}
		};

		return new Promise(function(resolve, reject) {
			const ret = RNFS.downloadFile(options);
			ret.promise
				.then(res => {
					//console.log('success', res);
					//console.log('file://' + downloadDest);
					return resolve('file://' + downloadDest);
				})
				.catch(err => {
					//console.log('err', err);
					return reject(false);
				});
		});
	}

	static  isexit(name){
		const p =
		Platform.OS == 'android'
			? `${RNFS.DocumentDirectoryPath}/`+name
			: `${RNFS.MainBundlePath}/`+name;
			const bp =
			Platform.OS == 'android'
				? `${RNFS.DocumentDirectoryPath}/`
				: `${RNFS.MainBundlePath}/`;
			return new Promise(function(resolve, reject) {
				RNFS.exists(p).then(res => {
						//console.log('success', res);
						//console.log('file://' + downloadDest);
						return resolve(p);
					})
					.catch(err => {
						//console.log('err', err);
						return reject(false);
					});
			});
	}
	

	/**
	 * 删除文件
	 * 
	 * @author NongHuaQiang
	 * @returns 
	 * @memberof FileDownloadUtil
	 */
	static deleteFile(path) {
		// create a path you want to delete
		//const path = RNFS.MainBundlePath + '/test.txt';
		return (
			RNFS.unlink(path)
				.then(() => {
					console.log('FILE DELETED');
				})
				// `unlink` will throw an error, if the item to unlink does not exist
				.catch(err => {
					console.log(err.message);
				})
		);
	}
}
