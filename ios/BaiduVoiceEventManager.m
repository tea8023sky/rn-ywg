//
//  BaiduVoiceEventManager.m
//  				
//
//  Created by mini on 2017/12/12.
//  Copyright © 2017年 Facebook. All rights reserved.
//
#import "BaiduVoiceEventManager.h"
#import <Foundation/Foundation.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>

#if __has_include(<React/RCTBridge.h>)
#import <React/RCTEventDispatcher.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#elif __has_include("RCTBridge.h")
#import "RCTEventDispatcher.h"
#import "RCTRootView.h"
#import "RCTBridge.h"
#elif __has_include("React/RCTBridge.h")
#import "React/RCTEventDispatcher.h"
#import "React/RCTRootView.h"
#import "React/RCTBridge.h"
#endif

@implementation BaiduVoiceEventManager

@synthesize bridge = _bridge;
RCT_EXPORT_MODULE();
// 等 RN组件 监听事件通知后 在发送事件通知
-(void)SendEventWithName:(NSString *)name body : (NSObject *) data
{
  RCTLogInfo(@"SendEventWithName->:%@",name);
  //[self.bridge.eventDispatcher sendEventWithName:kEventEmitterManagerEvent body:name];
  //NSDictionary *event = [NSDictionary dictionaryWithDictionary: notificationDic];
  [self.bridge.eventDispatcher sendAppEventWithName:name body:@"send0"];
  
}
RCT_EXPORT_METHOD(send :(NSString *) name) {
  [self.bridge.eventDispatcher sendAppEventWithName:name body:@"send"];
}

@end
