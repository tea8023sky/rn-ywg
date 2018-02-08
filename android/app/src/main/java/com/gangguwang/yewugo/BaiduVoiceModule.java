package com.gangguwang.yewugo;

import android.content.Context;
import android.Manifest;
import android.media.AudioManager;
import android.support.annotation.Nullable;
import android.util.Log;
import android.util.Pair;
import android.widget.Toast;

import com.baidu.tts.client.SpeechError;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;

import com.baidu.tts.auth.AuthInfo;
import com.baidu.tts.client.SpeechSynthesizeBag;
import com.baidu.tts.client.SpeechSynthesizer;
import com.baidu.tts.client.SpeechSynthesizerListener;
import com.baidu.tts.client.TtsMode;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.File;
import java.util.ArrayList;


public class BaiduVoiceModule extends ReactContextBaseJavaModule implements SpeechSynthesizerListener  {
    public static final String NAME = "BaiduVoiceModule";
    private Context mContext;
    private static final String TAG = "MiniActivity";
    private String appId = "10491650";

    private String appKey = "0ksPhsUFO0bE8vTDl7McXhsC";

    private String secretKey = "SexztkcfcUSLcPvTdunDgFhFSP4p5kv6";

    // TtsMode.MIX; 离在线融合，在线优先； TtsMode.ONLINE 纯在线； 没有纯离线
    private TtsMode ttsMode = TtsMode.ONLINE;

    // ===============初始化参数设置完毕，更多合成参数请至getParams()方法中设置 =================

    private SpeechSynthesizer mSpeechSynthesizer;

    private  String Lastid="";//最后一个播放文件id
    private List<SpeechSynthesizeBag> bags=null;
    private boolean PlaymoreTimes=false;//是否播放多次
    public BaiduVoiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        init();
    }

    @Override
    public String getName() {
        return NAME;
    }

    //百度语音初始化
    @ReactMethod
    public  void  init(){
        //SpeechSynthesizerListener listener = new mySpeakListener((ReactContext)mContext); // 日志更新在UI中，可以换成MessageListener，在logcat中查看日志
        mSpeechSynthesizer = SpeechSynthesizer.getInstance();
        mSpeechSynthesizer.setContext(mContext);
        mSpeechSynthesizer.setSpeechSynthesizerListener(this);

        int result =  mSpeechSynthesizer.setAppId(appId);
        //Toast.makeText(mContext, "appId"+result, Toast.LENGTH_SHORT).show();
        result = mSpeechSynthesizer.setApiKey(appKey, secretKey);
        //Toast.makeText(mContext, "secretKey"+result, Toast.LENGTH_SHORT).show();

        // 以下setParam 参数选填。不填写则默认值生效
        mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_SPEAKER, "0"); // 设置在线发声音人： 0 普通女声（默认） 1 普通男声 2 特别男声 3 情感男声<度逍遥> 4 情感儿童声<度丫丫>
        mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_VOLUME, "9"); // 设置合成的音量，0-9 ，默认 5
        mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_SPEED, "5");// 设置合成的语速，0-9 ，默认 5
        mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_PITCH, "5");// 设置合成的语调，0-9 ，默认 5

        mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_MIX_MODE, SpeechSynthesizer.MIX_MODE_DEFAULT);
        // 该参数设置为TtsMode.MIX生效。即纯在线模式不生效。
        // MIX_MODE_DEFAULT 默认 ，wifi状态下使用在线，非wifi离线。在线状态下，请求超时6s自动转离线
        // MIX_MODE_HIGH_SPEED_SYNTHESIZE_WIFI wifi状态下使用在线，非wifi离线。在线状态下， 请求超时1.2s自动转离线
        // MIX_MODE_HIGH_SPEED_NETWORK ， 3G 4G wifi状态下使用在线，其它状态离线。在线状态下，请求超时1.2s自动转离线
        // MIX_MODE_HIGH_SPEED_SYNTHESIZE, 2G 3G 4G wifi状态下使用在线，其它状态离线。在线状态下，请求超时1.2s自动转离线

        mSpeechSynthesizer.setAudioStreamType(AudioManager.MODE_IN_CALL);
        result = mSpeechSynthesizer.initTts(ttsMode);
        //Toast.makeText(mContext, "初始化"+result, Toast.LENGTH_SHORT).show();
    }

    @ReactMethod
    public int batchSpeak(String content) {
        //Toast.makeText(mContext, content, Toast.LENGTH_SHORT).show();
        List<Pair<String, String>> texts = new ArrayList<Pair<String, String>>();
        String[] list=content.split("。");
        int index=0;
        for(int i=0;i<list.length;i++){
            if(list[i].length()>400){
                if(list[i].indexOf("；")>0){
                    String[] list2=content.split("；");
                    for(int j=0;j<list2.length;j++){
                        texts.add(new Pair<String, String>(list2[j], (index++)+""));
                    }
                }else if(list[i].indexOf(";")>0){
                    String[] list2=content.split(";");
                    for(int j=0;j<list2.length;j++){
                        texts.add(new Pair<String, String>(list2[j],(index++)+""));
                    }
                }
                else if(list[i].indexOf("，")>0){
                    String[] list2=content.split("，");
                    for(int j=0;j<list2.length;j++){
                        texts.add(new Pair<String, String>(list2[j],(index++)+""));
                    }
                }
                else if(list[i].indexOf(",")>0){
                    String[] list2=content.split(",");
                    for(int j=0;j<list2.length;j++){
                        texts.add(new Pair<String, String>(list2[j],(index++)+""));
                    }
                }else{

                }
            }else{
                texts.add(new Pair<String, String>(list[i], (index++)+""));
            }
        }
        Lastid=(index-1)+"";
        bags = new ArrayList<SpeechSynthesizeBag>();
        for (Pair<String, String> pair : texts) {
            SpeechSynthesizeBag speechSynthesizeBag = new SpeechSynthesizeBag();
            speechSynthesizeBag.setText(pair.first);
            if (pair.second != null) {
                speechSynthesizeBag.setUtteranceId(pair.second);
            }
            bags.add(speechSynthesizeBag);

        }
        int res=-1;
        int count=bags.size()/5;//一次读5句
        if(count==0){
            res=mSpeechSynthesizer.batchSpeak(bags);//全部读完
        }else if(count>0){
            res=mSpeechSynthesizer.batchSpeak(bags.subList(0,1));
            PlaymoreTimes=true;
            // for(int i=0;i<count;i++){
            //     if(i==count-1){//最后一段
            //         res=mSpeechSynthesizer.batchSpeak(bags.subList(i*5,bags.size()-1));
            //     }else{
            //         res=mSpeechSynthesizer.batchSpeak(bags.subList(i*5,((i+1)*5)-1));
            //     }
            // }
        }
        //int res = mSpeechSynthesizer.speak(content);
        //Toast.makeText(mContext,mSpeechSynthesizer+ "speakres0"+res, Toast.LENGTH_SHORT).show();
        return res;
    }
    @ReactMethod
    public void stop() {
        int result = mSpeechSynthesizer.stop();
    }

    @ReactMethod
    public void pause() {
        int result = mSpeechSynthesizer.pause();
    }
    @ReactMethod
    public void resume() {
        int result = mSpeechSynthesizer.resume();
    }
    @ReactMethod
    public void release() {
        if (mSpeechSynthesizer != null){
            mSpeechSynthesizer.stop();
            mSpeechSynthesizer.release();
            mSpeechSynthesizer = null;
        }
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
            sendEvent((ReactContext)mContext, "onSpeechFinish", params);
        }else{
            if(PlaymoreTimes){
                int i=Integer.parseInt(utteranceId);
                int res=mSpeechSynthesizer.batchSpeak(bags.subList(i+1,i+2));
            }
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
        sendEvent((ReactContext)mContext, "onSpeechError", params);
    }

    /*发送事件*/
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

}
