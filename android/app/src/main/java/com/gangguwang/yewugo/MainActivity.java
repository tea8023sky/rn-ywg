package com.gangguwang.yewugo;

import com.facebook.react.ReactActivity;
import com.umeng.analytics.MobclickAgent;
import android.content.pm.PackageManager;
import android.*;
import android.content.Intent;
import android.os.Bundle;
import com.umeng.socialize.UMShareAPI;
import cn.jpush.android.api.JPushInterface;
import com.gangguwang.yewugo.module.ShareModule;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;



import java.util.ArrayList;
import java.util.List;

public class MainActivity extends ReactActivity {
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "yewugo";
    }

    public void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);
        JPushInterface.onResume(this);
    }

    public void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
        JPushInterface.onPause(this);
    }

    @Override  
    protected void onCreate(Bundle savedInstanceState) {  
        super.onCreate(savedInstanceState);  
        ShareModule.initActivity(this);  
        JPushInterface.init(this);
        initPermission();//权限申请
    }  

    @Override  
    public void onActivityResult(int requestCode, int resultCode, Intent data) {  
        super.onActivityResult(requestCode, resultCode, data);  
        UMShareAPI.get(this).onActivityResult(requestCode, resultCode, data);  
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        // 此处为android 6.0以上动态授权的回调，用户自行实现。
    }

    private void initPermission() {
        String permissions[] = {
                // android.Manifest.permission.INTERNET,
                // android.Manifest.permission.ACCESS_NETWORK_STATE,
                // android.Manifest.permission.MODIFY_AUDIO_SETTINGS,
                //读写存储
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
                // android.Manifest.permission.WRITE_SETTINGS,
                // android.Manifest.permission.READ_PHONE_STATE,
                // android.Manifest.permission.ACCESS_WIFI_STATE,
                // android.Manifest.permission.CHANGE_WIFI_STATE,
                // android.Manifest.permission.RECORD_AUDIO,
                //相机
                android.Manifest.permission.CAMERA,
                //定位
                android.Manifest.permission. ACCESS_FINE_LOCATION,
                android.Manifest.permission.ACCESS_COARSE_LOCATION
               
        };

        ArrayList<String> toApplyList = new ArrayList<String>();

        for (String perm : permissions) {
            if (PackageManager.PERMISSION_GRANTED != ContextCompat.checkSelfPermission(this, perm)) {
                toApplyList.add(perm);
                //进入到这里代表没有权限.
            }
        }
        String tmpList[] = new String[toApplyList.size()];
        if (!toApplyList.isEmpty()) {
            ActivityCompat.requestPermissions(this, toApplyList.toArray(tmpList), 123);
        }

    }
}
