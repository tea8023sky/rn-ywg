/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "UMMobClick/MobClick.h"
#import<UMSocialCore/UMSocialCore.h>

#import <RCTJPushModule.h>
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif

#import "BDSSpeechSynthesizerDelegate.h"
#import "BDS_EttsModelManagerInterface.h"
#import "BDSTTSEventManager.h"
#import <AVFoundation/AVFoundation.h>
#import "BDSSpeechSynthesizer.h"
#import "BaiduVoiceNativeModule.h"

//百度语音配置
NSString* Baidu_APP_ID = @"10513694";
NSString* Baidu_API_KEY = @"sM7TXMjpXKtRqHq08i3pSMGa";
NSString* Baidu_SECRET_KEY = @"MXiEhC7ZEzkB7UVCBsXc4qdFyqHicsEG";
//百度语音配置结束

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  //友盟统计
  UMConfigInstance.appKey = @"59db49997666132610000b22";
  UMConfigInstance.channelId = @"GG_Tech";//"App Store";
  //UMConfigInstance.eSType = E_UM_GAME; //仅适用于游戏场景，应用统计不用设置
  [MobClick startWithConfigure:UMConfigInstance];//配置以上参数后调用此方法初始化SDK！
  //友盟统计结束
  
  
//  //测试代码
//  Class cls = NSClassFromString(@"UMANUtil");
//  SEL deviceIDSelector = @selector(openUDIDString);
//  NSString *deviceID = nil;
//  if(cls && [cls respondsToSelector:deviceIDSelector]){
//    deviceID = [cls performSelector:deviceIDSelector];
//  }
//  NSData* jsonData = [NSJSONSerialization dataWithJSONObject:@{@"oid" : deviceID}
//                                                     options:NSJSONWritingPrettyPrinted
//                                                       error:nil];
//  NSLog(@"%@", [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding]);
//  //测试代码结束
  
  NSURL *jsCodeLocation;
//调试
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
//  打包
   //jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"ios" withExtension:@"jsbundle"];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"yewugo"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  

  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  /* 打开调试日志 */
  [[UMSocialManager defaultManager] openLog:YES];
  
  /* 设置友盟appkey */
  [[UMSocialManager defaultManager] setUmSocialAppkey:@"57fcabece0f55a1fd5000594"];
  
  /*
   * 关闭强制验证https，可允许http图片分享，但需要在info.plist设置安全域名
   */
  [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
  
  /*
   设置微信的appKey和appSecret
   [微信平台从U-Share 4/5升级说明]http://dev.umeng.com/social/ios/%E8%BF%9B%E9%98%B6%E6%96%87%E6%A1%A3#1_1
   */
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession appKey:@"wx6b5dc94d50a97446" appSecret:@"4fd4f5c5c53f3b219eceb91c1e55f62a" redirectURL:nil];
  
  /* 设置分享到QQ互联的appID
   * U-Share SDK为了兼容大部分平台命名，统一用appKey和appSecret进行参数设置，而QQ平台仅需将appID作为U-Share的appKey参数传进即可。
   100424468.no permission of union id
   [QQ/QZone平台集成说明]http://dev.umeng.com/social/ios/%E8%BF%9B%E9%98%B6%E6%96%87%E6%A1%A3#1_3
   */
  
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_QQ appKey:@"1105777837"/*设置QQ平台的appID*/  appSecret:@"lLIlNkIPZDTCZXjT" redirectURL:@"http://mobile.umeng.com/social"];
  
//  /*
//   设置新浪的appKey和appSecret
//   [新浪微博集成说明]http://dev.umeng.com/social/ios/%E8%BF%9B%E9%98%B6%E6%96%87%E6%A1%A3#1_2
//   */
//  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina appKey:@"2733400964"  appSecret:@"fac50980a44e3e3afd4bc968ea572887" redirectURL:@"http://www.baidu.com"];
  
  //极光配置
// if ([[UIDevice currentDevice].systemVersion floatValue] >= 10.0) {
//#ifdef NSFoundationVersionNumber_iOS_9_x_Max
//   JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
//   entity.types = UNAuthorizationOptionAlert|UNAuthorizationOptionBadge|UNAuthorizationOptionSound;
//   [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
//
//#endif
// } else if ([[UIDevice currentDevice].systemVersion floatValue] >= 8.0) {
//   [JPUSHService registerForRemoteNotificationTypes:(UIUserNotificationTypeBadge |
//                                                     UIUserNotificationTypeSound |
//                                                     UIUserNotificationTypeAlert)
//                                         categories:nil];
// } else {
//   [JPUSHService registerForRemoteNotificationTypes:(UIRemoteNotificationTypeBadge |
//                                                     UIRemoteNotificationTypeSound |
//                                                     UIRemoteNotificationTypeAlert)
//                                         categories:nil];
// }
  JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
  entity.types = JPAuthorizationOptionAlert|JPAuthorizationOptionBadge|JPAuthorizationOptionSound;
  if ([[UIDevice currentDevice].systemVersion floatValue] >= 8.0) {
    // 可以添加自定义categories
    // NSSet<UNNotificationCategory *> *categories for iOS10 or later
    // NSSet<UIUserNotificationCategory *> *categories for iOS8 and iOS9
  }
  [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
 
  //调试
   [JPUSHService setupWithOption:launchOptions appKey:@"35c9b192d6cf2ef222c9a12e"
                         channel:nil apsForProduction:nil];
  // 打包
  //[JPUSHService setupWithOption:launchOptions appKey:@"35c9b192d6cf2ef222c9a12e"
    //                    channel:nil apsForProduction:true];
  //结束极光配置

  //百度语音初始化
  [BDSSpeechSynthesizer setLogLevel:BDS_PUBLIC_LOG_VERBOSE];
  [[BDSSpeechSynthesizer sharedInstance] setSynthesizerDelegate:self];
  [self configureOnlineTTS];
  //[self configureOfflineTTS];
  //百度语音初始化结束
  return YES;
}

//极光兼容性
- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [JPUSHService registerDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  // 取得 APNs 标准信息内容
  
  [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
}
//iOS 7 Remote Notification
- (void)application:(UIApplication *)application didReceiveRemoteNotification:  (NSDictionary *)userInfo fetchCompletionHandler:(void (^)   (UIBackgroundFetchResult))completionHandler {
  
  [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
}

// iOS 10 Support
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
  // Required
  NSDictionary * userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
  }
  completionHandler(UNNotificationPresentationOptionAlert); // 需要执行这个方法，选择是否提醒用户，有Badge、Sound、Alert三种类型可以选择设置
}

// iOS 10 Support
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler {
  // Required
  NSDictionary * userInfo = response.notification.request.content.userInfo;
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJPFOpenNotification object:userInfo];
  }
  completionHandler();  // 系统要求执行这个方法
  //结束极光兼容性
  
  
}

//百度语音在线配置
-(void)configureOnlineTTS{
  
  [[BDSSpeechSynthesizer sharedInstance] setApiKey:Baidu_API_KEY withSecretKey:Baidu_SECRET_KEY];
  [[BDSSpeechSynthesizer sharedInstance] setSynthParam:@(NO) forKey:BDS_SYNTHESIZER_PARAM_ENABLE_AVSESSION_MGMT];
  [[AVAudioSession sharedInstance]setCategory:AVAudioSessionCategoryPlayback error:nil];
  [[BDSSpeechSynthesizer sharedInstance] setSynthParam:@(BDS_SYNTHESIZER_SPEAKER_FEMALE) forKey:BDS_SYNTHESIZER_PARAM_SPEAKER];
  
}
//百度语音离线配置
-(void)configureOfflineTTS{
  
  NSError *err = nil;
  NSString* offlineEngineSpeechData = [[NSBundle mainBundle] pathForResource:@"Chinese_And_English_Speech_Male" ofType:@"dat"];
  NSString* offlineChineseAndEnglishTextData = [[NSBundle mainBundle] pathForResource:@"Chinese_And_English_Text" ofType:@"dat"];
  
  err = [[BDSSpeechSynthesizer sharedInstance] loadOfflineEngine:offlineChineseAndEnglishTextData speechDataPath:offlineEngineSpeechData licenseFilePath:nil withAppCode:Baidu_APP_ID];
  if(err){
    
    return;
  }
}

//百度语音播放结束事件
- (void)synthesizerSpeechEndSentence:(NSInteger)SpeakSentence{
  NSInteger id=[BaiduVoiceModule GetLastSpeakID : SpeakSentence] ;
  if(SpeakSentence==id){
     NSLog(@"TTS ok 最后一条播放结束=============");
     //BaiduVoiceEventManager *baiduVoiceEventManager = [[BaiduVoiceEventManager alloc]init];
     //[baiduVoiceEventManager send : @"onSpeechFinish" ];
     //[BaiduVoiceEventManager SendEventWithName : @"onSpeechFinish" body :@"fsff"];
  }
 
}

@end
