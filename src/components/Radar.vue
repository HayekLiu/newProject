<template>
    <div id="radarBox" class="radar-box">
        
    </div>
 </template>
 
<script>
import echarts from 'echarts';
export default {
    name: 'radar',
    props: {
        indicator:{
            type:Array,
            default:()=>[]
        },
        radarSeriesData:{
            type:Array,
            default:()=>[]
        }
    },
    watch:{
        radarSeriesData(newVal){
            console.log(newVal)
            var myChart = echarts.init(document.getElementById('radarBox'));
            this.option.series[0].data = newVal;
            // 绘制图表
            myChart.setOption(this.option);
        },
        indicator(newVal){
            var myChart = echarts.init(document.getElementById('radarBox'));
            // this.option.series.data = newVal;
            this.option.radar.indicator = newVal;
            // 绘制图表
            myChart.setOption(this.option);
        }

    },
    data(){
        return {
            option : {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger:'item',
                    position:'right',
                    fontSize:12,
                  
                },
                legend: {
                    // data: ['预算分配（Allocated Budget）', '实际开销（Actual Spending）']
                    show:false,  
                    itemHeight:10,
                    itemWidth:14,
                    textStyle:{
                        fontSize:10,
                    }
                },
                radar: {
                    // shape: 'circle',
                    name: {  //
                        textStyle: {
                            color: 'rgb(51, 51, 51)',
                            // backgroundColor: '#999',
                            borderRadius: 3,
                            fontSize:10,
                            // padding: [3, 5]
                        }
                    },
                    nameGap: 4,
                    indicator: [
                        //{ name: '贷款权重', max: 50000},
                        //{ name: '不良率', max: 21000},
                        //{ name: '关注率', max: 35000},
                        //{ name: '拨备覆盖率', max: 35000},
                        //{ name: '流动性比例', max: 35000},
                        //{ name: '资产利润率', max: 35000},
                        //{ name: '成本收入比', max: 42000},
                        //{ name: '单一客户', max: 35000},
                        //{ name: '前十大客户', max: 35000},
                    ],
                    radius:'60%',
                },
                series: [{
                    name: '',
                    type: 'radar',
                    // areaStyle: {normal: {}},
                    data: [
                        //{
                        //    value: [ 50000, 19000,35000,35000,35000,35000,35000,35000,35000]
                        //},
                        //{
                        //    value: [ 42000, 21000,5000, 14000, 28000, 31000, 42000, 21000,30000]
                        //}
                    ]
                }]
            }
        }
    },
    computed:{
      
    },
    mounted() {
        var myChart = echarts.init(document.getElementById('radarBox'));
        // this.option.series[0].data = newVal;
        // 绘制图表
        myChart.setOption(this.option);
      
    },
    methods: {
          
    
    }
   
};
</script>
 
 <style lang="scss" scoped>
    .radar-box{
        height: 24vw;width: 24vw;border: 1px solid #ccc;
    }
   .svg-container{
     width: 100%;
     height: 100%;
     position: relative;
     .slider-view{
       width: 50%;
       padding: 0 10px;
       position: absolute;
       right: 0;
       top: 0;
       z-index: 10
     }
   }
 </style>
 