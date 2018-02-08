import config from '../config';
/**
 * 图片相关操作方法
 *
 * @author jyk
 * @export
 * @class Image
 */
export default class Image {
	/**
	 * 默认头像
	 * *require过的图片,直接赋给图片的source*
	 * @static
	 * @memberof Image
	 */
	static DefaultAvatar = {
		man: require('../img/avatar/defalut_man.png'),
		woman: require('../img/avatar/defalut_woman.png'),
		group: require('../img/avatar/defalut_group.png')
	};

	/**
	 * 出错图
	 * *require过的图片,直接赋给图片的source*
	 * @static
	 * @memberof Image
	 */
	static ErrorImg = {
		default: require('../img/error.png')
	};

	/**
	 * 新闻资源文件
	 *
	 * @static
	 * @memberof Image
	 */
	static newsimages = {
		collection: require('../img/news/collection.png'),
		collectioned: require('../img/news/collection_check.png'),
		share: require('../img/news/share.png'),
		xinkong: require('../img/news/xinktj.png'),
		xinshi: require('../img/news/xintj.png'),
		search: require('../img/news/search.png'),
		del: require('../img/news/del.png'),
		weixin: require('../img/news/weixin.png'),
		pengyouq: require('../img/news/pengyouq.png'),
		qq: require('../img/news/qq.png'),
		qqzone: require('../img/news/kongjian.png'),
		loading: require('../img/news/loading.png'),
		play: require('../img/news/play.png'),
		pause: require('../img/news/pause.png'),
		newsvicoelist: require('../img/news/newsvicoelist.png'),
		newsvicoe_playing: require('../img/news/newsvicoe_playing.png'),
		gszb: require('../img/news/gszb.png')
	};

	/**
	 * 语音播报资源文件
	 *
	 * @static
	 * @memberof Image
	 */
	static audio = {
		dian: require('../img/audio/vicoe_dian.png'),
		next: require('../img/audio/vicoe_next.png'),
		next_no: require('../img/audio/vicoe_next_no.png'),
		pause: require('../img/audio/vicoe_pause.png'),
		play: require('../img/audio/vicoe_play.png'),
		pre: require('../img/audio/vicoe_pre.png'),
		pre_no: require('../img/audio/vicoe_pre_no.png'),
		bgimage: require('../img/audio/vicoebg.png')
	};

	/**
	 * 工具资源文件
	 *
	 * @static
	 * @memberof Image
	 */
	static tool = {
		next: require('../img/tool/next.png'),
		cup: require('../img/tool/cup.png'),
		cdown: require('../img/tool/cdown.png'),
		close: require('../img/tool/close.png'),
		pertain: require('../img/tool/pertain.png'),
		pertaingray: require('../img/tool/pertain_gray.png'),
		tell_y: require('../img/tool/tell_y.png'),
		locateicon: require('../img/tool/location_gray.png'),
		toolnull: require('../img/tool/toolnull.png'),
		select_check: require('../img/tool/select_check.png')
	};

	/**
	 * “我的”首页资源文件
	 *
	 * @static
	 * @memberof Image
	 */
	static my = {
		circle: require('../img/my/my_circle.png'),
		collection: require('../img/my/my_collection.png'),
		contract: require('../img/my/my_contract.png'),
		dynamin: require('../img/my/my_dynamic.png'),
		offercode: require('../img/my/my_offercode.png')
	};

	/**
	 * "我的"动态图片文件
	 *
	 * @static
	 * @memberof Image
	 */
	static userdynamic = {
		clock: require('../img/my/clock.png'),
		znahui: require('../img/my/znahui.png'), //灰色赞
		zanlan: require('../img/my/zanlan.png'), //蓝色赞
		xink: require('../img/my/xink.png'), //红空心赞
		xins: require('../img/my/xins.png'), //红实心赞
		xingray: require('../img/my/xingray.png') //浅灰色赞
	};
	/**
	 * 圈子所需资源文件
	 *
	 * @static
	 * @memberof Image
	 */
	static chat = {
		addimg: require('../img/chat/addimg.png'), //+图片
		keybord: require('../img/chat/keyboard.png'), //聊天对话页面键盘图标
		camera: require('../img/chat/camera.png'), //聊天对话页面相机图标
		emoji: require('../img/chat/emoji.png'), //聊天对话页面表情图标
		voice: require('../img/chat/voice.png'), //聊天对话页面录音图标
		songLeft: require('../img/chat/songleft.png'), //收到的语音消息图标
		songLeft_01: require('../img/chat/songleft_01.png'), //收到的语音消息播放图标
		songLeft_02: require('../img/chat/songleft_02.png'), //收到的语音消息播放图标
		songRight: require('../img/chat/songright.png'), //发送的语音消息图标
		songRight_01: require('../img/chat/songright_01.png'), //发送的语音消息播放图标
		songRight_02: require('../img/chat/songright_02.png') //发送的语音消息播放图标
	};

	/**
	 * 版本相关图片资源
	 * 
	 * @static
	 * @memberof Image
	 */
	static version = {
		upgradeTop: require('../img/version/upgrade_bgtop.png'), //升级提示框顶部图片
		upgradeBottom: require('../img/version/upgrade_bgbottom.png'), //升级提示框底部图片
		close: require('../img/version/close.png'), //关闭按钮图标
		guideFirst_ios: require('../img/version/guide_first_ios.png'), //ios引导图1
		guideSecond_ios: require('../img/version/guide_second_ios.png'), //ios引导图2
		guideFirst_ad: require('../img/version/guide_first_ad.png'), //android引导图1
		guideSecond_ad: require('../img/version/guide_second_ad.png'), //android引导图2
		start_ios: require('../img/version/start_ios.png'), //广告位占位图(ios)
		start_ad: require('../img/version/start_ad.png') //广告位占位图(Android)
	};

	/**
	 * 获取拼接的图片地址中的的小图完整地址
	 * *source对象,直接进行使用*
	 * @author jyk
	 * @static
	 * @param {string} urlStr
	 * @returns
	 * @memberof Image
	 */
	static GetSmallImageSource(urlStr) {
		try {
			if (urlStr && urlStr.length > 0) {
				let urls = urlStr.split(',');
				return _getHttpUrl(urls[0]);
			}
		} catch (error) {}
		return Image.ErrorImg.default;
	}

	/**
	 * 获取拼接的图片地址中的的大图完整地址
	 * *source对象,直接进行使用*
	 * @author wuzhitao
	 * @static
	 * @param {string} urlStr
	 * @returns
	 * @memberof Image
	 */
	static GetBigImageSource(urlStr) {
		try {
			if (urlStr && urlStr.length > 0) {
				let urls = urlStr.split(',');
				return _getHttpUrl(urls[1]);
			}
		} catch (error) {}
		return Image.ErrorImg.default;
	}

	/**
	 * 图片选择，多图配置文件
	 * @author wanglei
	 * @static
	 * @param {number} maxImgCount 最大图片个数
	 * @returns
	 */
	static ImagePickerMultiOptions(maxImgCount) {
		maxImgCount = maxImgCount || 1;
		return {
			imageCount: maxImgCount, // 最大选择图片数目，默认6
			isCamera: true, // 是否允许用户在内部拍照，默认true
			isCrop: false, // 是否允许裁剪，默认false
			isGif: false // 是否允许选择GIF，默认false，暂无回调GIF数据
		};
	}
	/**
	 * 图片选择，单图配置文件
	 * @author wanglei
	 * @static
	 * @param {bool} isCrop 是否允许裁剪
	 * @param {bool} isCircle 是否显示圆形裁剪区域
	 * @returns
	 */
	static ImagePickerSingleOptions(isCrop, isCircle) {
		isCrop = isCrop || false;
		return {
			imageCount: 1, // 最大选择图片数目
			isCamera: true, // 是否允许用户在内部拍照，默认true
			isCrop: isCrop, // 是否允许裁剪，默认false
			CropW: ~~(300 * 0.6), // 裁剪宽度，默认屏幕宽度60%
			CropH: ~~(300 * 0.6), // 裁剪高度，默认屏幕宽度60%
			isGif: false, // 是否允许选择GIF，默认false，暂无回调GIF数据
			showCropCircle: isCircle, // 是否显示圆形裁剪区域，默认false
			showCropFrame: false, // 是否显示裁剪区域，默认true
			showCropGrid: false // 是否隐藏裁剪区域网格，默认false
		};
	}
}

/**
 * 检测并拼接url的基础地址
 *
 * @param {string} url
 * @returns
 */
_getHttpUrl = function(url) {
	if (url && url.indexOf('http') == -1) {
		if (!config.Release) {
			url = config.StaticFileBaseUrlTest + url;
		} else {
			url = config.StaticFileBaseUrl + url;
		}
	}
	return { uri: url };
};
