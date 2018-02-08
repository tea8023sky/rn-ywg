import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import Swiper from 'react-native-swiper';
import Toast from 'react-native-root-toast';
import net from '../../../logic/net';
import config from '../../../config';
import cache from '../../../logic/cache';
import skin from '../../../style';
import { Loading } from '../../loading';
let Dimensions = require('Dimensions');
let { width, height } = Dimensions.get('window');

/**
 *
 *报价单-选择模板页面
 * @author zhangchao
 * @export
 * @class CreateOfferImg
 * @extends {Component}
 */
export default class CreateOfferImg extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: '选择模板',
      headerTitleStyle: {
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 16,
        color: '#FFF'
      },
      headerRight: (
        <TouchableWithoutFeedback
          onPress={() => navigation.state.params.saveOfferTemplate()}
        >
          <View>
            <Text style={{ color: '#FFF', paddingRight: 10 }}>生成</Text>
          </View>
        </TouchableWithoutFeedback>
      ),
      headerStyle: {
        backgroundColor: skin.tujibg, //导航条背景色
        height: 60 //导航条高度,40导航条高度+20沉侵高度
      }
    };
  };
  //构造方法
  constructor(props) {
    super(props);
    this.nav = this.props.navigation; //获取导航对象
    this.params = this.nav.state.params; //获取参数
    this.state = {
      index: 0, //图片下标
      Images: [
        {
          index: 0,
          title: '航天',
          smallImgUrl: require('../../../img/tool/tpsmall1.png'),
          bigImgUrl: require('../../../img/tool/tpbig1.png')
        },
        {
          index: 1,
          title: '健康',
          smallImgUrl: require('../../../img/tool/tpsmall2.png'),
          bigImgUrl: require('../../../img/tool/tpbig2.png')
        },
        {
          index: 2,
          title: '中国风',
          smallImgUrl: require('../../../img/tool/tpsmall3.png'),
          bigImgUrl: require('../../../img/tool/tpbig3.png')
        },
        {
          index: 3,
          title: '夜晚',
          smallImgUrl: require('../../../img/tool/tpsmall4.png'),
          bigImgUrl: require('../../../img/tool/tpbig4.png')
        },
        {
          index: 4,
          title: '圣诞',
          smallImgUrl: require('../../../img/tool/tpsmall5.png'),
          bigImgUrl: require('../../../img/tool/tpbig5.png')
        }
      ]
    };
    this.props.navigation.setParams({
      saveOfferTemplate: this._saveOfferTemplate
    });
  }
  //组件初始化完毕
  componentDidMount() {}

  //生成报价单
  _saveOfferTemplate = async () => {
    let datas = {};
    let rows = [];
    //读取缓存中报价单信息
    let queryOfferInfo = await cache.LoadFromFile(config.ToolOfferInfoKey);
    //报价单明细
    let list = queryOfferInfo.list;

    datas.uid = queryOfferInfo.userid; //用户id {int}
    datas.company = queryOfferInfo.companyshort; //公司名 {string}
    datas.mobile = queryOfferInfo.mobile; //手机号 {string}
    datas.remark = queryOfferInfo.remark; //备注 {string}
    datas.img = (this.state.index + 1).toString(); //报价单模板 {string}（'1','2','3','4','5',）
    for (let item of list) {
      rows.push({
        stid: item.stid, //钢厂ID {int}
        tid: item.tid, //品名ID {int}
        sid: item.sid, //库存ID {int}
        price: item.price.toString(), //单价 {string}
        standard: item.standard, //规格 {string}
        steelv: item.stname, //钢厂 {string}
        trade: item.tname, //品名 {string}
        storehouse: item.sname //仓库 {string}
      });
    }
    datas.datas = rows;
    this.refs.loading.Isvisible(true);
    let result = await _saveOfferDatas(datas);
    if (result != null && result.length > 0) {
      this.nav.navigate('offerPreviewImg', { imgUrl: result });
    } else {
      Toast.show('生成图片失败，请重新生成！', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM
      });
    }
    this.refs.loading.Isvisible(false);
  };

  //显示大图
  _onShowImgage = index => {
    //当前显示的图标下标
    let currentIndex = this.state.index;
    if (currentIndex !== index) {
      let resultSlide = undefined;
      if (currentIndex < index) {
        resultSlide = index - currentIndex;
        //按给定索引滚动（相对于当前索引）
        this.refs.swiper.scrollBy(resultSlide, true);
      } else if (currentIndex > index) {
        resultSlide = index - currentIndex;
        //按给定索引滚动（相对于当前索引）
        this.refs.swiper.scrollBy(resultSlide, true);
      }
      this.setState({ index: index });
    }
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <View style={{ flex: 7, paddingHorizontal: 20, paddingTop: 40 }}>
          <Swiper
            newflag={true} //添加新的标志newflag为false表示非标价单轮播；newflag为true表示标价单轮播（解决ios报价单下标为1显示最后一张图片）
            ref="swiper"
            paginationStyle={{ bottom: 10 }}
            autoplay={false}
            showsPagination={false}
            onIndexChanged={index => this._onShowImgage(index)}
          >
            {this.state.Images.map((item, index) => {
              return (
                <Image
                  key={index}
                  style={{ width: width - 40, height: 300 }}
                  resizeMode={Image.resizeMode.contain}
                  source={item.bigImgUrl}
                />
              );
            })}
          </Swiper>
        </View>
        <View style={{ flex: 3, flexDirection: 'row' }}>
          {this.state.Images.map((item, index) => {
            return (
              <TouchableWithoutFeedback
                key={'_key' + index}
                onPress={() => this._onShowImgage(item.index)}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      textAlign: 'center',
                      paddingTop: 5,
                      color: this.state.index == item.index ? '#4BC1D2' : '#fff'
                    }}
                  >
                    {item.title}
                  </Text>
                  <Image
                    style={{ height: 60, width: (width - 60) / 5 }}
                    resizeMode={Image.resizeMode.contain}
                    source={item.smallImgUrl}
                  />
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
        <Loading text="正在生成图片..." ref="loading" />
      </View>
    );
  }
}

/**
 * 生成报价单图片
 * @param {Object} params 报价单数据
 */
let _saveOfferDatas = async function(params) {
  let result = await net.ApiPost('offer', 'LoadOfferImgNew', {
    text: JSON.stringify(params)
  });
  if (result != null && result.status == 1) {
    return result.data;
  }
  return null;
};
