/**
 * 全局配置文件
 *
 * @author jyk
 * @export
 * @class Config
 */
export default class Config {
	/**
	 * //true 发表版 false测试版
	 *
	 * @static
	 * @memberof Config
	 */
	static Release = false;

	/**
	 * 接口协议
	 *
	 * @static
	 * @memberof Config
	 */
	static HttpScheme = 'http://';

	/**
	 * 接口基础地址(测试)
	 *
	 * @static
	 * @memberof Config
	 */
	static ApiBaseUrlTest = Config.HttpScheme + 'newywgoapi-test.gangguwang.com/v1';

	/**
	 * 接口基础地址（生产）
	 *
	 * @static
	 * @memberof Config
	 */
	static ApiBaseUrl = Config.HttpScheme + 'new2ywgoapi.gangguwang.com/v1';

	/**
	 * 位置获取失败后使用的默认维度
	 *
	 * @static
	 * @memberof Config
	 */
	static DefaultLatitude = 34.265806;

	/**
	 * 位置获取失败后使用的默认经度
	 *
	 * @static
	 * @memberof Config
	 */
	static DefaultLongitude = 108.953389;

	/**
	 * 用户信息保存的key
	 *
	 * @static
	 * @memberof Config
	 */
	static UserInfoSaveKey = 'USERSAVEKEYV1';

	/**
	 * 用户圈子保存的key
	 *
	 * @static
	 * @memberof Config
	 */
	static UserCirclesInfoSaveKey = 'USERCIRCLESSAVEKEYV1';

	/**
	 * 文件服务器基础地址(生产)
	 *
	 * @static
	 * @memberof Config
	 */
	static StaticFileBaseUrl = Config.HttpScheme + 'static.gangguwang.com/';
	/**
	 * 文件服务器基础地址(测试)
	 *
	 * @static
	 * @memberof Config
	 */
	static StaticFileBaseUrlTest = Config.HttpScheme + 'static.test.gangguwang.com/';
	/**
	 * 注册时获取短信验证码倒计时时间(秒)
	 *
	 * @static
	 * @memberof Config
	 */
	static CountDownTime = 60;

	/**
	 * 注册成功返回用户信息保存的key
	 *
	 * @static
	 * @memberof Config
	 */
	static NewUserInfoSaveKey = 'NEWUSERSAVEKEYV1';

	/**
	 * 用户消息声音提醒状态保存的key
	 *
	 * @static
	 * @memberof Config
	 */
	static UserVoiceState = 'ISVOICESTATEV1';

	/**
	 * 用户消息震动提醒状态保存的key
	 *
	 * @static
	 * @memberof Config
	 */
	static UserShockState = 'ISSHOCKSTATEV1';

	/**
	 * 语言播报列表缓存key
	 *
	 * @static
	 * @memberof Config
	 */

	static AudioListKey = 'AudioListKey';

	/**
	 * 新闻搜索历史记录缓存key
	 *
	 * @static
	 * @memberof Config
	 */
	static SearchHistory = 'SEARCHHISTORYV3';

	/**
	 * 新闻详情缓存key
	 *
	 * @static
	 * @memberof Config
	 */
	static NewsDetailCache = 'NEWDETAILINFOV3';

	/**
	 * 新闻所有分类缓存
	 *
	 * @static
	 * @memberof Config
	 */
	static NewsAllClassCachekey = 'NewsAllClassCachekey';

	/**
	 * 新闻自己的分类缓存
	 *
	 * @static
	 * @memberof Config
	 */
	static NewsSelfClassCachekey = 'NewsSelfClassCachekey';

	/**
	 * 字号大小缓存key
	 *
	 * @static
	 * @memberof Config
	 */
	static FontSizeCache = 'FontSizeCache';

	/**
	 * 建材计算器最后选择钢厂品名规格缓存key
	 *
	 * @static
	 * @memberof Config
	 */
	static ToolJCLastLzDatakey = 'ToolJCLastLzData';

	/**
	 * 建材计算器总计缓存
	 * @statickey
	 * @memberof Config
	 */
	static ToolCalculationKey = 'DATACALCULATION_V2';

	/**
	 * 板材型材管材计算器总计缓存key
	 *
	 * @static
	 * @memberof Config
	 */
	static ToolCalculationOtherKey = 'DATACALCULATION_V2_OTHER';

	/**
	 * 圈子-动态中的内容缓存
	 * 
	 * @static
	 * @memberof Config
	 */
	static DynamicCache = 'DynamicCache';

	/**
	 * 发表动态时候的(内容、图片、链接)缓存
	 *
	 * @static
	 * @memberof Config
	 */
	static PublishDynamicKey = 'PublishDynamicKey';

	/**
	 * 我的-动态中内容缓存
	 * 
	 * @static
	 * @memberof Config
	 */
	static UserDynamicCache = 'UserDynamicCache';

	/**
	 * 常见问题页面链接(测试)
	 *
	 * @static
	 * @memberof Config
	 */
	static HelpProblemUrlTest = 'http://yw-test.gangguwang.com/problem';

	/**
	 * 常见问题页面链接(生产)
	 *
	 * @static
	 * @memberof Config
	 */
	static HelpProblemUrl = 'http://yw.gangguwang.com/problem';

	/**
	 *  聊天连接心跳间隔(秒)
	 *
	 * @static
	 * @memberof Config
	 */
	static ChatKeepAliveInterval = 30;

	/**
	 * 聊天服务地址(测试)
	 *
	 * @static
	 * @memberof Config
	 */
	static ChatServerTest = 'newchatapi-test.gangguwang.com:34568';

	/**
	 *  聊天服务地址(生产)
	 *
	 * @static
	 * @memberof Config
	 */
	static ChatServer = 'newchatapi.gangguwang.com:34568';

	/**
	 * 撤销消息处理时默认Content值
	 *
	 * @static
	 * @memberof Config
	 */
	static RevokeMsgContent = 'RevokeMsgContent';
	/*
     * 材质书接口地址
     * 
     * @author NongHuaQiang
     * @static
     * @returns 
     * @memberof Config
     */
	static getMaterialUrl() {
		if (!Config.Release) {
			return Config.HttpScheme + 'textureapi-test.gangguwang.com/';
		} else {
			return Config.HttpScheme + 'textureapi.gangguwang.com/';
		}
	}

	/**
	 * web站地址
	 *
	 * @author NongHuaQiang
	 * @static
	 * @returns
	 * @memberof Config
	 */
	static getWebUrl() {
		if (!Config.Release) {
			return 'http://yw-test.gangguwang.com/';
		} else {
			return 'http://yw.gangguwang.com/'; //线上地址
		}
	}

	/**
	 * 钢企名录定位缓存
	 * @static
	 * @memberof Config
	 */
	static ToolLocationInfoKey = 'ToolLocationInfoKey';

	/**
	 * 报价单缓存
	 * @static
	 * @memberof Config
	 */
	static ToolOfferInfoKey = 'ToolOfferInfoKey';

	/**
	 * device.js GetCurrentPosition 的定位缓存
	 *
	 * @static
	 * @memberof Config
	 */
	static Positionkey = 'Positionkey';

	/**
	 * 百度合成语音地址
	 *
	 * @memberof Config
	 */
	static BaidTTSApiUrl = 'http://tsn.baidu.com/text2audio';

	/**
	 * 撤销消息时间
	 *
	 * @memberof Config
	 */
	static RevokeIntervalTime = 60;

	/**
	 * 广告缓存key
	 * 
	 * @static
	 * @memberof Config
	 */
	static ADFileName = 'YWGO_CACHE_ADFILENAME';

	/**
	 * 首次安装缓存key
	 * 
	 * @static
	 * @memberof Config
	 */
	static YWGoFirst = 'YWGO_FIRST';
	/**
	 * 文章点赞缓存
	 *
	 * @static
	 * @memberof Config
	 */
	static InfoLikeCache = 'InfoLikeCacheKey';
}
