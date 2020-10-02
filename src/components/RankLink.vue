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
                left: 120,
                right: 10, // 为文字留空间
                top: 25, // 顶部留空间画legend和进度条
                bottom: 30
            };

            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            let svg = d3.select("#" + this.id).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.left + margin.right)
                .attr("id", "svg" + this.id)
            
            let rankHeight = height/3
            let rankWidth = 2*width/3
            

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

            let xScale = d3.scaleLinear()
                    .range([0, rankWidth])
                    .domain([1, self.rankAxisDataArrays[0].length]);

            let yScale = d3.scaleLinear()
                .range([rankHeight, 0])
                .domain([0, 100]);

            let arcScale = d3.scaleLinear()
                .range([0, 5])
                .domain([0, 100]);
            let colorRed = d3.interpolateHsl("white", "red");
            let colorBlue = d3.interpolateHsl("white", "#2ca25f");

            let rankTips = d3tip()
                .attr("class", "d3-tip")
                .offset([-10, 0])
                .html(function(d) {
                    return "Bank Name: "+d.name+"<br>Rank: "+d.rank+"<br>"+d.scheme;
                });
            let types = []

            let pathG = svg
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let selectBanks = []
            if(self.rankAxisDataArrays.length>1){
                selectBanks = Object.keys(self.rankAxisDataArrays[1]['inputSample'])
            }

            self.rankAxisDataArrays.map((rankAxisData, index)=>{
                let rankG = svg
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + (margin.top+rankHeight*index) + ")");
                
                rankG.call(rankTips);

                let color = d3.schemeCategory10;
                let type = rankAxisData[0]['scheme'].replaceAll(' ', '').replaceAll(':', '')
                types.push('_rank_point_'+type)
                
                console.log('type123', type)
                
                let posSample = []
                let negSample = []
                if(rankAxisData['inputSample']){
                    for(let bank in rankAxisData['inputSample']){
                        posSample = posSample.concat(rankAxisData['inputSample'][bank]['1'])
                        negSample = negSample.concat(rankAxisData['inputSample'][bank]['0'])
                    }
                    
                }
                console.log('posSample', posSample)
                
                
                rankG.append("text")
                    // .attr("x", -5)
                    // .attr("y", (5+rankHeight/2)) // 100 is where the first dot appears. 25 is the distance between dots
                    .style("fill", 'black')
                    .text(rankAxisData[0]['scheme'])
                    .attr("text-anchor", "end")
                    .attr("font-size", "8px")
                    .attr("dx", -10)
                    .attr("font-weight", "bold")
                    .style("alignment-baseline", "middle");
                rankG.selectAll('.rank_point_'+type)
                    .data(rankAxisData)
                    .enter().append('circle')
                    .attr('r', (d)=>{
                        return arcScale(d.score);
                    })
                    .attr('fill', (d)=>{
                        // return color[index]
                        if(selectBanks.indexOf(d.name)!=-1) return 'black'
                        else if(posSample.indexOf(d.name)!=-1) return 'green'
                        else if(negSample.indexOf(d.name)!=-1) return 'red'
                        else return '#f1f2f2'
                    
                        // return colorRed(d.score/100);
                    })
                    .attr('cx', d=> xScale(d.rank))
                    .attr('cy', d=> 0)
                    .attr('rank', d=>d.rank)
                    .attr('stroke', 'black')
                    // .attr('stroke', '#D0CECE')
                    .attr('stroke-width', '1px')
                    .attr('class',(d)=>d.name+'_rank_point_'+type)
                    .attr('id',(d)=>d.name+'_rank_point')
                    //.attr('id',(d,i)=>this.nameListData[i]+'_tsne')
                    .on('mouseover', function(d){
                        console.log(d)
                        rankTips.show(d, this);
                        self.highlighCirclePath('#'+d.name+'_linkPath', '#'+d.name+'_rank_point', true)
                    })
                    .on('mouseout', function(d){
                        rankTips.hide();
                        self.highlighCirclePath('#'+d.name+'_linkPath', '#'+d.name+'_rank_point', false)
                    });
                

                // let weightDims = [];
                // let yValue = 0;
                // // console.log('fieldColor', self.fieldColor.domain())
                // let fieldList = self.fieldColor.domain()
                // self.rankAxisDataArrays[0].map(item=>{
                //     let temp = self.deepClone(item['weightDim']);
                //     let value = 0;

                //     fieldList.map(field=>{
                //         value+=item['weightDim'][field];
                //     });
                //     yValue = Math.max(yValue, value);
                //     temp['loc'] = item['loc'];
                //     temp['rank'] = item['rank'];
                //     temp['value'] = value;
                //     weightDims.push(temp);
                // });

                // let yStackScale = d3.scaleLinear()
                //     .range([rankHeight, 0]);
                // yStackScale.domain([0, yValue]);

                // console.log('weightDims123', weightDims)

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
            })
            
            let lineFunction = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                //.curve(d3.curveCatmullRom);
                //.curve(d3.curveMonotoneX); // apply smoothing to the line

            // 画连线线条。
            console.log('selectBanks', selectBanks)

            //let colorRed = d3.interpolateHsl("white", "red");
            self.rankAxisDataArrays[0].map(item=>{
                let name = item.name
                let pathData = []
                types.map((type, i)=>{
                    // console.log('.'+name+type)
                    let x = parseFloat(d3.select('.'+name+type).attr('cx'))
                    let rank = parseFloat(d3.select('.'+name+type).attr('rank'))
                    console.log('rank', rank)
                    let y = rankHeight*i
                    pathData.push({x: x, y: y, rank: rank})
                })

                for(let i=1; i<pathData.length; i++){

                }
            })
            self.rankAxisDataArrays[0].map(item=>{
                let name = item.name
                // _rank_point_DefaultScheme
                // 北京农商_rank_point_Scheme1LocalWeight
                // 北京农商_rank_point_Scheme1GlobalWeight
                // 工商银行_rank_point_Scheme1TypeWeight
                let pathData = []
                types.map((type, i)=>{
                    // console.log('.'+name+type)
                    let x = parseFloat(d3.select('.'+name+type).attr('cx'))
                    let y = rankHeight*i
                    pathData.push({x: x, y: y})
                })

                // console.log('pathData', pathData)
                pathG.append("path")
                    // .transition()
                    // .duration(1500)
                    .attr("d", lineFunction(pathData))
                    .attr('class', 'linkPath')
                    .attr('id', name+'_linkPath')
                    .attr("stroke", 'black')
                    // .attr("stroke", nameToColor[name])
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.2)
                    .attr("fill", "none")
                    .on('mouseover', function(d){
                        self.highlighCirclePath('#'+name+'_linkPath', '#'+name+'_rank_point', true)
                    })
                    .on('mouseout', function(d){
                        self.highlighCirclePath('#'+name+'_linkPath', '#'+name+'_rank_point', false)
                        
                    })
            })
            
            // draw boxplot

            let boxplotWidth = width/3-80
            let boxplotHeight = rankHeight-20

            self.rankAxisDataArrays.map((rankAxisData, index)=>{
                console.log('321', rankAxisData, index)
                let boxplotG = svg
                    .append("g")
                    .attr("transform", "translate(" + (margin.left+rankWidth+80) + "," + (margin.top+rankHeight*index-rankHeight/3) + ")");
                // boxplotWidth
                // rankG.call(rankTips);
                let sumstat = []
                let fieldList = Object.keys(rankAxisData[0]['normalizationDim'])
                fieldList.map(field=>{
                    let data = []
                    rankAxisData.map(item=>{ 
                        data.push(item['normalizationDim'][field])
                    })
                    //console.log(data)
                    var data_sorted = data.sort(d3.ascending)
                    var q1 = d3.quantile(data_sorted, .25)
                    var median = d3.quantile(data_sorted, .5)
                    var q3 = d3.quantile(data_sorted, .75)
                    var interQuantileRange = q3 - q1
                    var min = q1 - 1.5 * interQuantileRange
                    var max = q1 + 1.5 * interQuantileRange
                    sumstat.push({'key': field, 'value':{q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max}})
                })
                
               
                console.log('fieldList', sumstat)
                console.log('fieldList', fieldList)

                var x = d3.scaleBand()
                    .range([ 0, boxplotWidth])
                    .domain(fieldList)
                    .paddingInner(1)
                    .paddingOuter(.5)
                boxplotG.append("g")
                    .attr("transform", "translate(0," + boxplotHeight + ")")
                    .call(d3.axisBottom(x).tickSize(0).tickValues([]))
                    // .selectAll("text")	
                    // .style("text-anchor", "end")
                    // .attr("dx", "-.8em")
                    // .attr("dy", ".15em")
                    // .attr("transform", function(d) {
                    //     return "rotate(-10)" 
                    //     });


                // Show the Y scale
                var y = d3.scaleLinear()
                    .domain([0, 1])
                    .range([boxplotHeight, 0])

                boxplotG.append("g").call(d3.axisLeft(y).ticks(5))

                // Show the main vertical line
                boxplotG
                    .selectAll("vertLines")
                    .data(sumstat)
                    .enter()
                    .append("line")
                    .attr("x1", function(d){return(x(d.key))})
                    .attr("x2", function(d){return(x(d.key))})
                    .attr("y1", function(d){return(y(d.value.min))})
                    .attr("y2", function(d){return(y(d.value.max))})
                    .attr("stroke", "black")
                    .style("width", 40)

                // rectangle for the main box
                var boxWidth = 10 
                boxplotG.selectAll("boxes")
                    .data(sumstat)
                    .enter()
                    .append("rect")
                        .attr("x", function(d){return(x(d.key)-boxWidth/2)})
                        .attr("y", function(d){return(y(d.value.q3))})
                        .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
                        .attr("width", boxWidth )
                        .attr("stroke", "black")
                        .style("fill",d=>{
                            //console.log(d)
                            return self.fieldColor(d.key)
                            // return "#69b3a2"
                        })

                // Show the median
                boxplotG.selectAll("medianLines")
                    .data(sumstat)
                    .enter()
                    .append("line")
                    .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
                    .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
                    .attr("y1", function(d){return(y(d.value.median))})
                    .attr("y2", function(d){return(y(d.value.median))})
                    //.attr("stroke", "red")
                    .style("width", 80)

                boxplotG.selectAll("medianLines")
                    .data(sumstat)
                    .enter()
                    .append("line")
                    .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
                    .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
                    .attr("y1", function(d){return(y(d.value.min))})
                    .attr("y2", function(d){return(y(d.value.min))})
                    .attr("stroke", "black")
                    .style("width", 80)

                boxplotG.selectAll("medianLines")
                    .data(sumstat)
                    .enter()
                    .append("line")
                    .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
                    .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
                    .attr("y1", function(d){return(y(d.value.max))})
                    .attr("y2", function(d){return(y(d.value.max))})
                    .attr("stroke", "black")
                    .style("width", 80)

            })
           
        },
        drawBoxPlot(){

        },
        highlighCirclePath(pathSelector, circleSelector, flag){
            if(flag){
                d3.select(pathSelector)
                    .style('stroke-width', '2px')
                    .attr("opacity", 1)
                    .style('cursor', 'pointer');

                d3.select(circleSelector)
                    .attr('stroke-width', '2px')
                    .attr('cursor', 'pointer');
            }
            else{
                d3.select(pathSelector)
                    .style('stroke-width', '1px')
                    .attr("opacity", 0.2)
                    .style('cursor', 'default');

                d3.select(circleSelector)
                        .attr('stroke-width', '1px')
                        .attr('cursor', 'default');
            }
            
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
