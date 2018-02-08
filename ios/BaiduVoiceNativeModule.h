//
//  BaiduVoiceNativeModule.h
//  yewugorn
//
//  Created by mini on 2017/12/11.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
@interface BaiduVoiceModule : NSObject  <RCTBridgeModule>
+(NSInteger) GetLastSpeakID :(NSInteger) currentid ;
@end


