<template>
  <div id="rankLink" class="svg-container" />
</template>

<script>
import d3tip from 'd3-tip';
// import * as lasso from 'd3-lasso';
// import { connect } from 'tls';
// import { constants } from 'zlib';
// let _lasso = lasso;
export default {
    name: 'RankLink',
    props: {
        tsneArrays:{
            type:Array,
            default:()=>[],
        },
        rankAxisDataArrays:{
            type:Array,
            default:()=>[],
        },
        nameListData:{
            type:Array,
            default:()=>[],
        },
        fieldColor: {

        },
    },
    data(){
        return{
            id:'rankLink',
            tsneArraysData:[],
            nameList:[],
            svg: null,
            selectedCluster:[],  //套索选择数据
            targetList: [], // Tsne块数组
            scaleArray: [], // 缓存每个块的Scale
            blockWidth: 0, 
            lineObjects: {}, // 每条线的点集合
        };
    },
    computed:{
        
    },
    watch:{
        tsneArrays(val){
            this.tsneArraysData =val;
            
        },
        rankAxisDataArrays(val){
            this.init();
            
            console.log('rankAxisDataArrays', val)
        },
        nameListData(val){
            this.nameList = val;
        }
    },
    mounted() {
        
    },
    methods:{
        init() {
            d3.select('#svgrankLink').remove();
            let self = this;
            let {clientWidth:width, clientHeight:height} = document.getElementById('rankLink');

            let margin = {
                left: 30,
                right: 10, // 为文字留空间
                top: 25, // 顶部留空间画legend和进度条
                bottom: 30
            };
            // let xArr = [], yArr = [];
            // this.tsneValues.forEach(item=>{
            //     let [x, y] = item;
            //     xArr.push(x);
            //     yArr.push(y);
            // });

            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            let svg = d3.select("#" + this.id).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.left + margin.right)
                .attr("id", "svg" + this.id)
            
            let rankHeight = height/2

            // let dashLineData =[
            //     {'x1': 0, 'y1': legendHeight+projectHeight+10, 'x2':  clientWidth, 'y2': legendHeight+projectHeight+10}
            // ]

            // svg.attr("class", "line")
            //     .selectAll("line").data(dashLineData)
            //     .enter()
            //     .append("line")
            //     .style("stroke", "black")
            //     .style("stroke-width", "0.2px")
            //     .style("stroke-dasharray", ("3, 3"))
            //     .attr("x1", d=>(d.x1))
            //     .attr("y1", d=>(d.y1))
            //     .attr("x2", d=>(d.x2))
            //     .attr("y2", d=>(d.y2))
            let axisHeight = height/7
            let rankG = svg
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + (margin.top+axisHeight) + ")");
            
            let xScale = d3.scaleLinear()
                .range([0, width])
                .domain([1, self.rankAxisDataArrays[0].length]);
            let yScale = d3.scaleLinear()
                .range([rankHeight, 0])
                .domain([0, 100]);

            let arcScale = d3.scaleLinear()
                .range([0, 5])
                .domain([0, 100]);
            // let colorRed = d3.interpolateHsl("white", "red");

            let rankTips = d3tip()
                .attr("class", "d3-tip")
                .offset([-10, 0])
                .html(function(d) {
                    return "Bank Name: "+d.name+"<br>Scheme: "+d.scheme;
                });

            rankG.call(rankTips);

            let color = d3.schemeCategory10;
            self.rankAxisDataArrays.map((item, index)=>{
                let type = item[0]['scheme'].replaceAll(' ', '').replaceAll(':', '')
                console.log('type123', type)
                rankG.selectAll('.rank_point_'+type)
                    .data(item)
                    .enter().append('circle')
                    .attr('r', (d)=>{
                        return arcScale(d.score);
                    })
                    .attr('fill', ()=>{
                        return color[index]
                        // return colorRed(d.score/100);
                    })
                    .attr('cx', d=> xScale(d.rank))
                    .attr('cy', d=> 0)
                    .attr('stroke', 'black')
                    // .attr('stroke', '#D0CECE')
                    .attr('stroke-width', '1px')
                    .attr('class',(d)=>d.name+'_rank_point_'+type)
                    //.attr('id',(d,i)=>this.nameListData[i]+'_tsne')
                    .on('mouseover', function(d){
                        console.log(d)
                        rankTips.show(d, this);
                        //  d3.select(this)
                        //     .attr('r', 7)
                        //     .attr('stroke-width', '2px')
                        //     .attr('cursor', 'pointer');
                    })
                    .on('mouseout', function(){
                        rankTips.hide();
                        // d3.select(this)
                        //     .attr('r', 5)
                        //     .attr('stroke-width', '1px')
                        //     .attr('cursor', 'default');
                    });
            })


            let weightDims = [];
            let yValue = 0;
            // console.log('fieldColor', self.fieldColor.domain())
            let fieldList = self.fieldColor.domain()
            self.rankAxisDataArrays[0].map(item=>{
                let temp = self.deepClone(item['weightDim']);
                let value = 0;

                fieldList.map(field=>{
                    value+=item['weightDim'][field];
                });
                yValue = Math.max(yValue, value);
                temp['loc'] = item['loc'];
                temp['rank'] = item['rank'];
                temp['value'] = value;
                weightDims.push(temp);
            });

            let yStackScale = d3.scaleLinear()
                .range([rankHeight, 0]);
            yStackScale.domain([0, yValue]);

            console.log('weightDims123', weightDims)
            // let layers = d3.stack().keys(fieldList)(weightDims);

            // 堆叠柱状图
            // let barWidth = width / self.rankAxisDataArrays[0].length - 1
            // rankG.append("g").selectAll("g")
            //     .data(layers)
            // .enter().append("g")
            //     .style("fill", function(d) { return self.fieldColor(d.key); })
            //     .selectAll("rect")
            // .data(function(d) {  return d; })
            //     .enter().append("rect")
            //     .attr("x", function(d, i) { return xScale(d.data.rank); })
            //     .attr("y", function(d) { return yStackScale(d[1]); })
            //     .attr("height", function(d) { return yStackScale(d[0]) - yStackScale(d[1]); })
            //     .attr("width", barWidth);

            //x坐标轴
            let xAxis = d3.axisBottom()
                .scale(xScale);

            //y坐标轴
            let yAxis = d3.axisLeft()
                .scale(yScale);

            rankG.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + 0 + ")")
                .call(xAxis);

            // rankG.append("g")
            //     .attr("class", "y axis")
            //     .call(yAxis);
           
        },
        deepClone(source){
            let self = this;
            if (!source && typeof source !== 'object') {
                throw new Error('error arguments', 'deepClone');
            }
            const targetObj = source.constructor === Array ? [] : {};
            Object.keys(source).forEach(keys => {
                if (source[keys] && typeof source[keys] === 'object') {
                    targetObj[keys] = self.deepClone(source[keys]);
                } else {
                    targetObj[keys] = source[keys];
                }
            });
            return targetObj;
        },
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" type="text/scss">
 @import './../assets/css/d3-tip.css';
  .svg-container{
    width: 100%;
    height: 100%;
    position: relative;
  }


  //选中的套索画线样式
  .selectedCluster {
        path {
            stroke: #3399FF;
            stroke-width:2px;
        }
        .clusterDrawn {
            fill-opacity:.05 ;
        }
        .clusterClose {
            fill:none;
            // stroke-dasharray: 4,4;
        }
        .clusterOrigin {
            fill:#3399FF;
            fill-opacity:.5;
        }
  }
</style>
