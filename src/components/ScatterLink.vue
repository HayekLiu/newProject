<template>
  <div id="scatterLink" class="svg-container" />
</template>

<script>
import d3tip from 'd3-tip';
import * as lasso from 'd3-lasso';
let _lasso = lasso;
let circleColor = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'];
export default {
    name: 'ScatterLink',
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
        tabClickName:{
            type:String,
            default:()=>'',
        }
    },
    data(){
        return{
            id:'scatterLink',
            tsneArraysData:[],
            nameList:[],
            svg: null,
            selectedCluster:[],  //套索选择数据
            targetList: [], // Tsne块数组
            scaleArray: [], // 缓存每个块的Scale
            blockWidth: 0, 
            lineObjects: {}, // 每条线的点集合
            clickName:'',
        };
    },
    computed:{
        
    },
    watch:{
        tsneArrays(val){
            this.tsneArraysData =val;
            this.init();
        },
        rankAxisDataArrays(val){
            console.log('rankAxisDataArrays----------', val)
        },
        nameListData(val){
            this.nameList = val;
        },
        tabClickName(val){
            this.clickName = val;
            let obj = {};
            obj[val] = this.lineObjects[val];
            d3.selectAll('.'+val)
                .attr('stroke-width', '2px')   
            this.drawLines(obj);
        }
    },
    mounted() {
        
    },
    methods:{
        init() {
            d3.select('#svgscatterLink').remove();
            let self = this;
            let {clientWidth:width, clientHeight:height} = document.getElementById('scatterLink');

            let blockWidth = width * 0.22; // 每个区块的宽度，根据数据长度计算
            this.blockWidth = blockWidth;
            let padding = {
                left: 25,
                right: 25, // 为文字留空间
                top: 20, // 顶部留空间画legend和进度条
                bottom: 20
            };
            this.svg = d3.select("#" + this.id).append("svg")
                .attr("width", (blockWidth+40)*this.tsneArrays.length).attr("height", height)
                .attr("id", "svg" + this.id);
           
            
            let legendG = this.svg.selectAll("g").data(circleColor)
                .enter()
                .append("g");
            legendG.append("circle")
                .attr('r',6)
                // .attr('width', 10)
                // .attr('height', 10)
                .attr('cx', 10)
                .attr('cy', (d,i)=>14*i)
                .attr('transform',function(){
                    return 'translate(0,10)';
                })
                .attr('fill', function(d,i){
                    return circleColor[i];
                });

            legendG.append("text")
                .text((d,i)=>i+1)
                .attr('x',18)
                .attr('y',18)
                .style('font-size',12)
                .attr('transform',function(d,i){
                    return 'translate(0,'+(14*i-4)+')';
                });

            let scaleArray = []; // 缓存每个图的标尺
            let lineObjects = {}; // 存放每条线的路径点
            
            d3.scaleLinear()
                .range([0, 5])
                .domain([0, 100]);



            d3.interpolateHsl("white", "red");

            for(let k=0; k<this.tsneArrays.length; k++) {
                
                let radarData = {};

                self.rankAxisDataArrays[k].map((item)=>{
                    radarData[item['name']] = {};
                    radarData[item['name']]['name'] = item['name'];
                    //radarData[item['name']]['rank'] = self.rankData[i];
                    radarData[item['name']]['score'] = item['score'];
                    radarData[item['name']]['weightDim'] = item['weightDim'];
                });
                //console.log('radarData', radarData)
                this.svg.append('rect')
                    .attr("x", padding.left - 15 )
                    .attr("width", blockWidth)
                    .attr("y", padding.top/2)
                    .attr("height", height)
                    .attr('fill', 'transparent')
                    .attr('stroke', 'transparent')
                    .attr('stroke-width', '2px')
                    .attr('pointer-events', 'none')
                    .attr("transform", "translate(" + (blockWidth * k+10) + ",0 )");

                let transformLen = 0;
                if(k==0){
                    transformLen = blockWidth * k;
                }else{
                    transformLen = (blockWidth+40) * k;
                }

                let blockg = this.svg.append('g').attr("width", blockWidth).attr("height", height).attr('id', `tsne_g_${k}`)
                    .attr("transform", "translate(" + (transformLen+10) + ",0 )");

                blockg.append('text')
                    .text(()=>{
                        // if(k!=0){
                        //     return 'Scheme'+k;
                        // }else{
                        //     return 'Scheme';
                        // }
                        return self.rankAxisDataArrays[k][0].scheme;
                    })
                    .style('font-size','11px')
                    .style('font-weight','bolder')
                    .attr("transform", "translate("+padding.right+","+12+" )");

                this.svg.append("line")
                    .style("stroke", "grey") 
                    .style("stroke-width", "1px") 
                    //.style("stroke-dasharray", ("3, 3")) 
                    .attr("x1", (blockWidth+40) * (k+1))
                    .attr("y1", 20)
                    .attr("x2", (blockWidth+40) * (k+1))
                    .attr("y2", height-20)
                    .style("stroke-width", "0.2px")
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("transform", "translate(10,0)");

                let current = this.tsneArrays[k];
                this.targetList.push(blockg);
                
                let xArr = [], yArr = [];
                current.forEach((item, index)=>{
                    let [x, y] = item;
                    xArr.push(x);
                    yArr.push(y);
                    let name = this.nameListData[index];
                    if(!lineObjects.hasOwnProperty(name)){
                        lineObjects[name] = [];
                    }
                    lineObjects[name].push([x, y]);
                });
                let xScale = d3.scaleLinear().range([padding.left-5, blockWidth-padding.right]).domain([d3.min(xArr), d3.max(xArr)]);
                let yScale = d3.scaleLinear().range([height-padding.bottom, padding.top]).domain([d3.min(yArr), d3.max(yArr)]);

                scaleArray.push([xScale, yScale]);

                //银行数据点
                let g = blockg.selectAll('g').data(current).enter().append('g').attr('class','u').attr('title',(d,i)=>this.nameListData[i]);
            
                let bankName = d3tip()
                    .attr("class", "d3-tip")
                    .offset([-10, 0])
                    .html(function(d) {
                        return d;
                    });
                g.call(bankName);

                let arcScale = d3.scaleLinear()
                    .range([0, 8])
                    .domain([0, 100]);

                d3.interpolateHsl("white", "red");
                
                g.append('circle')
                    .attr('r', 5)
                    // .attr('fill', '#D0CECE')
                    .attr('cx', d=> xScale(d[0]))
                    .attr('cy', d=> yScale(d[1]))
                    .attr('stroke', 'black')
                    // .attr('stroke', (d,i)=>{
                    //     console.log('dd', d, this.nameListData[i])
                    //     return 'red'
                    // })

                    .attr('r', (d, i)=>{
                        return arcScale(Math.abs(radarData[this.nameListData[i]]['score']));
                    })
                    .attr('fill', (d)=>{
                        return circleColor[d[2]-1];
                        //return colorRed(radarData[this.nameListData[i]]['score']/100);circleColor
                    })
                    .attr('class',(d,i)=>this.nameListData[i]+' uItem')
                    .attr('title',(d,i)=>this.nameListData[i])
                    .on('mouseover', function(d, i){
                        bankName.show(self.nameListData[i],this);
                        d3.select(this)
                            // .attr('r', 7)
                            .attr('stroke-width', '2px')
                            .attr('cursor', 'pointer');
                    })
                    .on('mouseout', function(){
                        bankName.hide();
                        d3.select(this)
                            // .attr('r', 5)
                            .attr('stroke-width', '1px')
                            .attr('cursor', 'default');
                    });
                g.append('text')
                    .attr('x', d=> xScale(d[0]))
                    .attr('y', d=>yScale(d[1]))
                    .attr('dx', 10)
                    .attr('dy', 5)
                
                    .style('font-size', '9px')
                    .style('font-weight', 'light')
                    .style('fill', 'grey')
                    .text((d,i)=>this.nameListData[i]);
            }
            this.lassoDraw(this.svg);
            this.lineObjects = lineObjects;
            this.scaleArray = scaleArray;
        },
        lassoDraw(svg) {
            let _this = this;
            let gs = svg.selectAll('.uItem');
            let lasso = _lasso.lasso();
            let drawnPath,loopClosePath;
            lasso
                .closePathSelect(true)
                .closePathDistance(100)
                .items(gs)
                .targetArea(svg)
                .on("start", function() {
                    lasso.items()
                        //.attr('r', 5)
                        .classed("not_possible", true)
                        .classed("selected", false);
                })
                .on('draw', function() {
                    lasso.possibleItems()
                        .classed("not_possible", false)
                        .classed("possible", true);

                    // Style the not possible dot
                    lasso.notPossibleItems()
                        .classed("not_possible", true)
                        .classed("possible", false);
                    drawnPath = d3.select('.drawn').attr('d');
                    loopClosePath = d3.select('.loop_close').attr('d');
                    
                })
                .on('end', function() {
                    d3.selectAll('.diy-path').remove();
                    lasso.items()
                        .classed("not_possible", false)
                        .classed("possible", false);

                    // Style the selected dots
                    lasso.selectedItems()
                        .classed("selected", true)
                        .each(function () {
                            d3.select(this)
                                .select('circle')
                                .attr('stroke-width', '2px');
                        });
                    let selectedIDs = [];
                    lasso.selectedItems().each(function() {
                        selectedIDs.push(d3.select(this).attr('title'));
                    });
                    if(selectedIDs.length > 0 ){
                        selectedIDs.map(function(item) {
                            d3.selectAll('.u')
                                .select(`.${item}`)
                                .attr('stroke-width', '2px');
                        });
                        let obj = {};
                        for( let k of Object.keys(_this.lineObjects)){
                            if(selectedIDs.includes(k)) {
                                obj[k] = _this.lineObjects[k];
                            }
                        }
                       
                        _this.drawLines(obj);
                           
                    }else{
                        d3.selectAll('.u')
                            .select('circle')
                            .attr('stroke-width', '1px');
                    }
                   
                    if(drawnPath && loopClosePath){
                        if(selectedIDs.length>0){
                            _this.selectedCluster.push(
                                {
                                    drawnPath:drawnPath,  //套索划线
                                    loopClosePath:loopClosePath, //套索闭合线条
                                    selectedIDs:selectedIDs,  //选中的点
                                }
                            );
                        } 
                    }else{
                        _this.selectedCluster = [];
                    }

                    drawnPath = '';
                    loopClosePath ='';

                    _this.$emit('lassoData', selectedIDs);
                    
                    lasso.notSelectedItems()
                        .each(function () {
                            d3.select(this)
                                .select('circle')
                                .attr("r", 5)
                                .attr('stroke-width', '1px');
                        });
                    // _this.average(_this.selectedCluster,svg);
                    _this.lassoCrossed(svg);
                });
            
            svg.call(lasso);

        },

        drawLines(obj) {
            d3.selectAll('.diy-path').remove();
            let _this = this;
            let line = d3.line()   // scale 完之后再偏移
                .x((d, i) => {
                    return _this.scaleArray[i][0](d[0]) + (_this.blockWidth+40) * i;
                })
                .y((d, i) => {
                    return _this.scaleArray[i][1](d[1]);
                })
                .curve(d3.curveCardinal); 

            for(let [k,v] of Object.entries(obj)){
                this.svg.append('path')
                    .attr('d', line(v))
                    .attr('stroke', '#5DA5B3')
                    .attr('stroke-width','2px')
                    .attr('fill', 'none')
                    .attr('class', `diy-path ${k}`)
                    .attr("transform", "translate(10,0)")
                    .style("marker-end","url(#triangle)");
            }
        },
        //套索选中后散点图上画选区
        lassoCrossed(svg){
            svg.selectAll('.clusterDrawn').remove();
            svg.selectAll('.clusterClose').remove();
            svg.selectAll('.selectedCluster').remove();
            svg.selectAll('.selectedCluster')
                .data(this.selectedCluster)
                .enter()
                .append('g')
                .attr('class','selectedCluster');

            
            let g = svg.selectAll('.selectedCluster');

            g.append('path')
                .attr('class','clusterDrawn')
                .attr('d',function(d){
                    return d.drawnPath;
                });

            g.append('path')
                .attr('class','clusterClose')
                .attr('d',(d)=>{
                    return d.loopClosePath;
                });

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
    overflow-x: auto;
    text-align: left;
  }
  .lasso {
      path {
          stroke: #3399FF;
          stroke-width:2px;
      }
      .drawn {
          fill-opacity:.05 ;
      }
      .loop_close {
          fill:none;
          stroke-dasharray: 4,4;
      }
      .origin {
          fill:#3399FF;
          fill-opacity:.5;
      }
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
