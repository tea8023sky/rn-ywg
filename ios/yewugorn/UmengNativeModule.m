//
//  UMNative.m
//  UMNative
//
//
//  Copyright (c) 2016年 tendcloud. All rights reserved.
//

#import <UMMobClick/MobClick.h>
#import <UMMobClick/MobClickGameAnalytics.h>
#import "UmengNativeModule.h"
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>

@implementation UmengNativeModule

RCT_EXPORT_MODULE();

//统计
RCT_EXPORT_METHOD(onCCEvent:(NSArray *)eventArray value:(int)value eventLabel:(NSString *)eventLabel)
{
  
  if (eventLabel == nil && [eventLabel isKindOfClass:[NSNull class]]) {
    eventLabel = nil;
  }
  [MobClick event:eventArray value:value label:eventLabel];
}

RCT_EXPORT_METHOD(onEvent:(NSString *)eventId)
{
  [MobClick event:eventId];
}

RCT_EXPORT_METHOD(onEventWithLabel:(NSString *)eventId eventLabel:(NSString *)eventLabel)
{
  if ([eventLabel isKindOfClass:[NSNull class]]) {
    eventLabel = nil;
  }
  [MobClick event:eventId label:eventLabel];

}

RCT_EXPORT_METHOD(onEventWithParameters:(NSString *)eventId parameters:(NSDictionary *)parameters)
{

  if (parameters == nil && [parameters isKindOfClass:[NSNull class]]) {
    parameters = nil;
  }
  [MobClick event:eventId attributes:parameters];
}

RCT_EXPORT_METHOD(onEventWithCounter:(NSString *)eventId parameters:(NSDictionary *)parameters eventNum:(int)eventNum)
{
  if (parameters == nil && [parameters isKindOfClass:[NSNull class]]) {
    parameters = nil;
  }
  
  [MobClick event:eventId attributes:parameters counter:eventNum];
}

RCT_EXPORT_METHOD(onPageBegin:(NSString *)pageName)
{
  [MobClick beginLogPageView:pageName];
}

RCT_EXPORT_METHOD(onPageEnd:(NSString *)pageName)
{
  [MobClick endLogPageView:pageName];
}
//游戏统计

RCT_EXPORT_METHOD(profileSignInWithPUID:(NSString *)puid)
{
  [MobClickGameAnalytics profileSignInWithPUID:puid];
}

RCT_EXPORT_METHOD(profileSignInWithPUIDWithProvider:(NSString *)provider puid:(NSString *)puid)
{
  if (provider == nil && [provider isKindOfClass:[NSNull class]]) {
    provider = nil;
  }
  
  [MobClickGameAnalytics profileSignInWithPUID:puid provider:provider];
}

RCT_EXPORT_METHOD(profileSignOff)
{
  [MobClickGameAnalytics profileSignOff];
}

RCT_EXPORT_METHOD(setUserLevelId:(int)level)
{
  [MobClickGameAnalytics setUserLevelId:level];
}

RCT_EXPORT_METHOD(startLevel:(NSString *)level)
{
  [MobClickGameAnalytics startLevel:level];
}

RCT_EXPORT_METHOD(finishLevel:(NSString *)level)
{
  [MobClickGameAnalytics finishLevel:level];
}

RCT_EXPORT_METHOD(failLevel:(NSString *)level)
{
  [MobClickGameAnalytics failLevel:level];
}

RCT_EXPORT_METHOD(exchange:(double)currencyAmount currencyType:(NSString *)currencyType virtualAmount:(double)virtualAmount channel:(int)channel orderId:(NSString *)orderId)
{
  if (currencyType == nil && [currencyType isKindOfClass:[NSNull class]]) {
    currencyType = nil;
  }
  [MobClickGameAnalytics exchange:orderId currencyAmount:currencyAmount currencyType:currencyType virtualCurrencyAmount:virtualAmount paychannel:channel];
}

RCT_EXPORT_METHOD(pay:(double)cash coin:(int)coin source:(double)source)
{
  [MobClickGameAnalytics pay:cash source:source coin:coin];
}

RCT_EXPORT_METHOD(payWithItem:(double)cash item:(NSString *)item amount:(int)amount price:(double)price source:(int)source)
{
  if (item == nil && [item isKindOfClass:[NSNull class]]) {
    item = nil;
  }
  [MobClickGameAnalytics pay:cash source:source item:item amount:amount price:price];
}

RCT_EXPORT_METHOD(buy:(NSString *)item amount:(int)amount price:(double)price)
{
  [MobClickGameAnalytics buy:item amount:amount price:price];
}

RCT_EXPORT_METHOD(use:(NSString *)item amount:(int)amount price:(double)price)
{
  [MobClickGameAnalytics use:item amount:amount price:price];
}

RCT_EXPORT_METHOD(bonus:(double)coin source:(int)source)
{
  [MobClickGameAnalytics bonus:coin source:source];
}

RCT_EXPORT_METHOD(bonusWithItem:(NSString *)item amount:(int)amount price:(double)price source:(int)source)
{
  [MobClickGameAnalytics bonus:item amount:amount price:price source:source];
}

@end
