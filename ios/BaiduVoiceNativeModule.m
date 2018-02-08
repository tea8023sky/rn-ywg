//
//  BaiduVoiceNativeModule.m
//  				
//
//  Created by mini on 2017/12/11.
//  Copyright © 2017年 Facebook. All rights reserved.
//
#import "BaiduVoiceNativeModule.h"
#import <Foundation/Foundation.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import "BDSSpeechSynthesizerDelegate.h"
#import "BDSSpeechSynthesizer.h"
#import "BDSTTSEventManager.h"
@implementation BaiduVoiceModule

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();
static NSInteger Lastid=-1;
static NSInteger currentid=0;

RCT_EXPORT_METHOD(initIOS){
  //BDS_SYNTHESIZER_SPEAKER_MALE BDS_SYNTHESIZER_SPEAKER_FEMALE
  [[BDSSpeechSynthesizer sharedInstance] setSynthParam:@(BDS_SYNTHESIZER_SPEAKER_FEMALE) forKey:BDS_SYNTHESIZER_PARAM_SPEAKER];
}
//batchSpeak 批量播放
RCT_EXPORT_METHOD(batchSpeak:(NSString *)content )
{
  NSError *err = nil;
  NSInteger sentenceID;
  NSArray *array = [content componentsSeparatedByString:@"。"]; //从字符A中分隔成2个元素的数组
  NSInteger i;
  for( i = 0; i < array.count;i++ )
  {
    NSUInteger len = [array[i] length];
     if(len>0){
      sentenceID = [[BDSSpeechSynthesizer sharedInstance] speakSentence: array[i] withError:&err];
       if(sentenceID>0){
          Lastid=sentenceID;
       }
     }
    
  }
  
  
}

+(NSInteger) GetLastSpeakID :( NSInteger )cid {
  currentid=cid;
  return Lastid;
}
//pause 暂停
RCT_EXPORT_METHOD(pause)
{
   [[BDSSpeechSynthesizer sharedInstance] pause];
  //[self.bridge.eventDispatcher sendAppEventWithName:@"onSpeechFinish" body:@"事件发生0"];
}
//resume 继续
RCT_EXPORT_METHOD(resume)
{
  [[BDSSpeechSynthesizer sharedInstance] resume];
}

//stop 停止
RCT_EXPORT_METHOD(stop)
{
  [[BDSSpeechSynthesizer sharedInstance] cancel];
}
//release 释放
RCT_EXPORT_METHOD(releaseIOS)
{
  //[BDSSpeechSynthesizer releaseInstance];
  [[BDSSpeechSynthesizer sharedInstance] cancel];
}

RCT_EXPORT_METHOD(IsPlayFinishIOS:(RCTResponseSenderBlock)callback){
  if(Lastid==currentid&&Lastid>=0){
    NSString *callbackData = @"ok"; //准备回调回去的数据
    callback(@[[NSNull null],callbackData]);
  }else{
    NSString *callbackData = @"playing"; //准备回调回去的数据
    callback(@[[NSNull null],callbackData]);
  }
  
}


@end
