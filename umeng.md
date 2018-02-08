JS 统计方法
JavaScript方法介绍

umeng.onEvent(eventId) 自定义事件
umeng.onCCEvent(evenArray, evenValue, eventLabel) 结构化自定义事件
umeng.onEventWithLabel(eventId, eventLabel) 自定义事件
umeng.onEventWithParameters(eventId, eventData) 自定义事件
umeng.onEventWithCounter(eventId, eventData, eventNum) 自定义事件
umeng.onPageBegin(pageName) 页面开始的时候调用此方法
umeng.onPageEnd(pageName) 页面结束的时候调用此方法
umeng.profileSignInWithPUID(puid) 统计帐号登录接口
umeng.profileSignInWithPUIDWithProvider(puid, provider) 统计帐号登录接口
umeng.profileSignOff() 帐号统计退出接口
umeng.setUserLevelId(level) 当玩家建立角色或者升级时,需调用此接口
umeng.startLevel(level) 在游戏开启新的关卡的时候调用
umeng.finishLevel(level) 关卡结束时候调用
umeng.failLevel(level) 关卡失败时候调用
umeng.exchange(orderId, currencyAmount, currencyType, virtualAmount, channel) 真实消费统计
umeng.pay(cash, source, coin) 真实消费统计
umeng.payWithItem(cash, source, item, amount, price) 真实消费统计
umeng.buy(item, amount, price) 虚拟消费统计
umeng.use(item, amount, price) 物品消耗统计
umeng.bonusWithItem(item, amount, price, source) 额外奖励
umeng.(coin, source) 额外奖励