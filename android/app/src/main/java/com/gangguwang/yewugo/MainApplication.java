package com.gangguwang.yewugo;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import cn.jpush.reactnativejpush.JPushPackage;
import com.rnfs.RNFSPackage;
import io.realm.react.RealmReactPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.gangguwang.yewugo.module.SharePackage;
import com.umeng.socialize.Config;
import com.umeng.socialize.PlatformConfig;
import com.umeng.socialize.UMShareAPI;


import com.reactlibrary.RNSyanImagePickerPackage; //相册

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new ReactNativeAudioPackage(),
                    new JPushPackage(true,true),
                    new RNFSPackage(),
                    new RealmReactPackage(),
                    new RNSyanImagePickerPackage(), //相册
                    new SharePackage(),//分享
                    new RNSoundPackage(),
                    new VectorIconsPackage(),
                    new RNDeviceInfo(),
                    new UmengReactPackage(),
                    new BaiduVoiceReactPackage(),
                    new RNFetchBlobPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        Config.shareType = "react native";  
        UMShareAPI.get(this);  
    }

    {   
        PlatformConfig.setWeixin("wx6b5dc94d50a97446", "4fd4f5c5c53f3b219eceb91c1e55f62a");
        PlatformConfig.setQQZone("1105779343", "aFOEK6alYxNfROp3");
    }

}
