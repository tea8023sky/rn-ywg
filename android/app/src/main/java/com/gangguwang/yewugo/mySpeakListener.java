package com.gangguwang.yewugo;

import android.content.Context;
import android.support.annotation.Nullable;
import android.util.Log;

import com.baidu.tts.client.SpeechError;
import com.baidu.tts.client.SpeechSynthesizerListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import  com.facebook.react.bridge.Arguments;
import  com.facebook.react.modules.core.DeviceEventManagerModule;
/**
 * Created by GGTech on 2017/12/7.
 */

public class mySpeakListener implements SpeechSynthesizerListener {
    private static final String TAG = "MiniActivity";
    private ReactContext mContext;
    public static String Lastid="";//最后一个播放文件id
    public mySpeakListener(ReactContext content){
        mContext=content;
    }
    /**
     * 播放开始，每句播放开始都会回调
     *
     * @param utteranceId
     */
    @Override
    public void onSynthesizeStart(String utteranceId) {


    }

    /**
     * 语音流 16K采样率 16bits编码 单声道 。
     *
     * @param utteranceId
     * @param bytes       二进制语音 ，注意可能有空data的情况，可以忽略
     * @param progress    如合成“百度语音问题”这6个字， progress肯定是从0开始，到6结束。 但progress无法和合成到第几个字对应。
     */
    @Override
    public void onSynthesizeDataArrived(String utteranceId, byte[] bytes, int progress) {
        //  Log.i(TAG, "合成进度回调, progress：" + progress + ";序列号:" + utteranceId );
    }

    /**
     * 合成正常结束，每句合成正常结束都会回调，如果过程中出错，则回调onError，不再回调此接口
     *
     * @param utteranceId
     */
    @Override
    public void onSynthesizeFinish(String utteranceId) {
        Log.i(TAG, "合成结束回调");
    }

    @Override
    public void onSpeechStart(String utteranceId) {
        Log.i(TAG, "播放开始");
    }

    /**
     * 播放进度回调接口，分多次回调
     *
     * @param utteranceId
     * @param progress    如合成“百度语音问题”这6个字， progress肯定是从0开始，到6结束。 但progress无法保证和合成到第几个字对应。
     */
    @Override
    public void onSpeechProgressChanged(String utteranceId, int progress) {
        //  Log.i(TAG, "播放进度回调, progress：" + progress + ";序列号:" + utteranceId );
    }

    /**
     * 播放正常结束，每句播放正常结束都会回调，如果过程中出错，则回调onError,不再回调此接口
     *
     * @param utteranceId
     */
    @Override
    public void onSpeechFinish(String utteranceId) {
        Log.i(TAG, "播放结束回调");
        if(Lastid.equals(utteranceId)){
            WritableMap params = Arguments.createMap();
            params.putString("result", "ok");
            sendEvent(mContext, "onSpeechFinish", params);
        }
       
    }

    /**
     * 当合成或者播放过程中出错时回调此接口
     *
     * @param utteranceId
     * @param speechError 包含错误码和错误信息
     */
    @Override
    public void onError(String utteranceId, SpeechError speechError) {
        Log.i(TAG, "播放错误");
        WritableMap params = Arguments.createMap();
        params.putString("result",speechError.description);
        sendEvent(mContext, "onSpeechError", params);
    }
    /*发送事件*/
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

}
