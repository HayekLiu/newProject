<template>
  <div id="rankLink" class="svg-container" />
</template>

<script>
import d3tip from 'd3-tip';
import * as lasso from 'd3-lasso';
let _lasso = lasso;
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
        }
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
            //d3.select('#svgrankLink').remove();
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
            
            svg = svg
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            let xScale = d3.scaleLinear()
                .range([0, width])
                .domain(d3.extent(self.rankAxisDataArrays[0].map(item=>{return item['rank']})));
            let yScale = d3.scaleLinear()
                .range([height, 0])
                .domain(d3.extent(self.rankAxisDataArrays[0].map(item=>{return item['score']})));

            let arcScale = d3.scaleLinear()
                    .range([0, 5])
                    .domain([0, 100]);
            let colorRed = d3.interpolateHsl("white", "red");
            
            let circles = svg.selectAll('.rank_point')
                .data(self.rankAxisDataArrays[0])
                .enter().append('circle')
                .attr('r', (d, i)=>{
                    return arcScale(d.score);
                })
                .attr('fill', (d,i)=>{
                        return colorRed(d.score/100);
                })
                .attr('cx', d=> xScale(d.rank))
                .attr('cy', d=> yScale(d.score))
                .attr('stroke', 'black')
                // .attr('stroke', '#D0CECE')
                .attr('stroke-width', '1px')
                // .attr('class',(d,i)=>this.nameListData[i]+' uItem')
                // .attr('id',(d,i)=>this.nameListData[i]+'_tsne')


            // let xScale = d3.scaleLinear()
            //     .range([0, width])
            //     .domain([d3.min(xArr)-1, d3.max(xArr)+1]);
            // let yScale = d3.scaleLinear()
            //     .range([height, 0])
            //     .domain([d3.min(yArr)-1, d3.max(yArr)+1]);

            //x坐标轴
            let xAxis = d3.axisBottom()
            .scale(xScale);

            //y坐标轴
            let yAxis = d3.axisLeft()
            .scale(yScale);

            let gX = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            let gY = svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);



           
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
