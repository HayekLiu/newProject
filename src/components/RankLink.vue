<template>
  <div id="rankLink" class="svg-container" />
</template>

<script>
import d3tip from 'd3-tip';
import { constants } from 'zlib';
import { connect } from 'net';
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
        selectedIDs:{
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
        },
        selectedIDs(val){
            //console.log('selectedIDs', val)
            d3.selectAll('.bankName1')
                .style('fill', 'black')
            val.map(bank=>{
                //console.log('selectedIDs', val)
                d3.selectAll('.'+bank+'_bankName1')
                    .style('fill', 'red')
            })
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
                left: 105,
                right: 15, // 为文字留空间
                top: 50, // 顶部留空间画legend和进度条
                bottom: 30
            };

            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            let svg = d3.select("#" + this.id).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.left + margin.right+height)
                .attr("id", "svg" + this.id)
            
            let rankHeight = 2*height/7
            let rankWidth = 3*width/4
            
            let dashG = svg
                .append("g")
                .attr("transform", "translate(" + 0 + "," + margin.top + ")");

            let dashLineData = []
            for(let i=0; i<8; i++){
                dashLineData.push({'x1': 0, 'y1': (i+1/2)*rankHeight, 'x2':  width + margin.left + margin.right, 'y2': (i+1/2)*rankHeight })
            }

            dashG.attr("class", "line")
                .selectAll("line").data(dashLineData)
                .enter()
                .append("line")
                .style("stroke", "black")
                .style("stroke-width", "0.3px")
                .style("stroke-dasharray", ("3, 3"))
                .attr("x1", d=>(d.x1))
                .attr("y1", d=>(d.y1))
                .attr("x2", d=>(d.x2))
                .attr("y2", d=>(d.y2))

            let xScale = d3.scaleLinear()
                .range([0, rankWidth])
                .domain([1, self.rankAxisDataArrays[0].length]);
            
            console.log('self.rankAxisDataArrays[0].length', self.rankAxisDataArrays[0].length)

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
                    //console.log(d)
                    return "Bank Name: "+d.name+"<br>Rank: "+d.rank+"<br>Score: "+d.score.toFixed(2)
                    //+"<br>Bank Type: "+d.type;
                });
            let types = []

            let pathG = svg
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let selectBanks = []
            // console.log('self.rankAxisDataArrays', self.rankAxisDataArrays)

            if(self.rankAxisDataArrays.length>1){
                selectBanks = Object.keys(self.rankAxisDataArrays[1]['inputSample'])
            }
            console.log('selectBanks', selectBanks)

            let bankTypeColor ={
                'Large State-owned Commercial Bank': '#5B8FF9',
                'Joint-stock Commercial Bank': '#5AD8A6',
                'City Commercial Bank': '#5D7092',
                'Rural Commercial Bank': '#F6BD16'
            }

            //legend颜色
            let legend = svg.append("g").attr('transform','translate(20,0)');
            let bgColor = [
                {'Large State-owned Commercial Bank': '#5B8FF9'},
                {'Joint-stock Commercial Bank': '#5AD8A6'},
                {'City Commercial Bank': '#5D7092'},
                {'Rural Commercial Bank': '#F6BD16'},
            ];

            let legendG = legend.selectAll("g").data(bgColor)
                .enter()
                .append("g");
            legendG.append("rect")
                .attr('width', 10)
                .attr('height', 10)
                .attr('x', (d,i)=> i*20)
                .attr('y', 9)
                .attr('transform',function(d,i){
                    if(i == 1){
                        return 'translate('+210+',0)';
                    }else if(i == 2){
                        return 'translate('+376+',0)';
                    }else if(i == 3){
                        return 'translate('+506+',0)';
                    }

                })
                .attr('fill', function(d){
                    return d[d3.keys(d)[0]]
                });

            legendG.append("text")
                .text((d)=>d3.keys(d)[0])
                .attr('x',18)
                .attr('y',18)
                .style('font-size',12)
                .attr('transform',function(d,i){
                    if(i == 1){
                        return 'translate('+228+',0)';
                    }else if(i == 2){
                        return 'translate('+412+',0)';
                    }else if(i == 3){
                        return 'translate('+562+',0)';
                    }

                });
            let samlpleCicles = []
            self.rankAxisDataArrays.map((rankAxisData, index)=>{
                // console.log('144', rankAxisData)
                let rankG = svg
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + (margin.top+rankHeight*index) + ")");

                rankG.call(rankTips);

                let color = d3.schemeCategory10;
                let type = rankAxisData[0]['scheme'].replaceAll(' ', '').replaceAll(':', '')
                types.push('_rank_point_'+type)

                // console.log('type123', type)
                let samlpleCicle = {}
                let posSample = []
                let negSample = []
                // console.log(11, 'posSample', type, rankAxisData['inputSample'])
                if(type.includes('Type')){
                    for(let bankType in rankAxisData['inputSample']){
                        if(rankAxisData['inputSample'][bankType]){
                            // console.log(rankAxisData['inputSample'][bankType])
                            for(let bank in rankAxisData['inputSample'][bankType]['inputSample']){
                                //console.log(bankTypeColor)
                                //console.log(rankAxisData['inputSample'][bankType]['inputSample'][bank])
                                samlpleCicle[bank] = rankAxisData['inputSample'][bankType]['inputSample'][bank][1]
                                samlpleCicle[bank] = samlpleCicle[bank].concat(rankAxisData['inputSample'][bankType]['inputSample'][bank][0])
                                
                                posSample = posSample.concat(rankAxisData['inputSample'][bankType]['inputSample'][bank]['1'])
                                negSample = negSample.concat(rankAxisData['inputSample'][bankType]['inputSample'][bank]['0'])
                            }
                        }
                    }

                }
                else{
                    if(rankAxisData['inputSample']){
                        
                        for(let bank in rankAxisData['inputSample']){
                            samlpleCicle[bank] = rankAxisData['inputSample'][bank][1]
                            samlpleCicle[bank] = samlpleCicle[bank].concat(rankAxisData['inputSample'][bank][0])
                            posSample = posSample.concat(rankAxisData['inputSample'][bank]['1'])
                            negSample = negSample.concat(rankAxisData['inputSample'][bank]['0'])
                        }
                    }
                }
                samlpleCicles.push(samlpleCicle)
                console.log(11, 'posSample', posSample, negSample, samlpleCicle)
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

                let interval = xScale(2) - xScale(1)

                rankG.selectAll('.rank_rect_'+type)
                    .data(rankAxisData)
                    .enter()
                    .append("rect")
                    .attr('class',(d)=>d.name+'_rank_rect_'+type)
                    .attr("x", d=> xScale(d.rank)-interval/2)
                    .attr("y", -5)
                    .attr("width", interval)
                    .attr("height", 10)
                    .style('fill', d=>bankTypeColor[d.type])
                    .style('stroke', 'grey')
                    .style('stroke-width', '0.1px');



                rankG.selectAll('.rating_rect_'+type)
                    .data(rankAxisData['segmentation'])
                    .enter()
                    .append("rect")
                    .attr('class',(d,i)=>'rating_rect_'+type+'_'+(i+1))
                    .attr("x", d=> xScale(d+0.5)-1.5)
                    .attr("y", -10)
                    .attr("width", 3)
                    .attr("height", 20)
                    .style('fill', 'grey')
                    .style('stroke', 'black')
                    .style('stroke-width', '1 px');

                let segmentation = self.deepClone(rankAxisData['segmentation'])
                segmentation.unshift(1)
                segmentation.push(self.rankAxisDataArrays[0].length+1)
                let textLoc = []
                for(let i=0; i<5; i++){
                    textLoc.push((segmentation[i]+segmentation[i+1])/2)
                }
                // console.log('textLoc', textLoc, segmentation    )
                rankG.selectAll("comField")
                    .data(textLoc)
                    .enter()
                    .append("text")
                    .attr('class', 'comField')
                    .attr("x", d=> xScale(d))
                    .attr("y", -12)
                    .text(function(d,i){ 
                        return 'Rating '+ (i+1);
                    })
                    .attr("font-size", "11")
                    .attr("font-weight", "bolder")
                    .attr("text-anchor", "middle")
                    .style("alignment-baseline", "middle");

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

                rankAxisData.map(d=>{
                    d.click = false
                })
                let circleElement = rankG.selectAll('.rank_point_'+type)
                    .data(rankAxisData)
                    .enter().append('circle')
                    .attr('r', (d)=>{
                        return 3
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
                    .attr('stroke', 'grey')
                    // .attr('stroke', '#D0CECE')
                    .attr('stroke-width', '1px')
                    
                    .attr('class',(d)=>d.name+'_rank_point_'+type)
                    .attr('id',(d)=>d.name+'_rank_point')
                    //.attr('id',(d,i)=>this.nameListData[i]+'_tsne')
                    .on('click', function(d){
                        console.log(d)
                        if(!d.click){
                            self.highlighCirclePath('.'+d.name+'_linkPath', '#'+d.name+'_rank_point', true)
                        }
                        else{
                            self.highlighCirclePath('.'+d.name+'_linkPath', '#'+d.name+'_rank_point', false)
                        }
                        d.click = !d.click;
                    })
                    .on('mouseover', function(d){
                        //console.log(d)
                        rankTips.show(d, this);
                        self.highlighCirclePath('.'+d.name+'_linkPath', '#'+d.name+'_rank_point', true)
                    })
                    .on('mouseout', function(d){
                        rankTips.hide();
                        if(!d.click){
                            self.highlighCirclePath('.'+d.name+'_linkPath', '#'+d.name+'_rank_point', false)
                        }
                    })


                if(index==self.rankAxisDataArrays.length-1){
                    rankG.selectAll('.bankName1')
                        .data(rankAxisData)
                        .enter().append('text')
                         .attr('class', (d)=>(d.name+'_bankName1 bankName1'))
                        .text(d=>(d.name))
                        // .attr('x', d=> xScale(d.rank))
                        // .attr('y', d=> 0)
                        .attr('dy', 10)
                        .style('font-size', 8)
                        .style('fill', function(d){
                            return 'black'
                            return bankTypeColor[d.type]
                            // let type = rankAxisData[0]['scheme'].replaceAll(' ', '').replaceAll(':', '')
                        })
                        .attr("transform", function(d){
                            let x = xScale(d.rank)
                            let y = 0
                            return "translate("+x+","+y+") rotate("+(30)+")"
                        });
                }
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

                

                // rankG.append("g")
                //     .attr("class", "y axis")
                //     .call(yAxis);
            })

            let lineFunction = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                //.curve(d3.curveCatmullRom);
                //.curve(d3.curveMonotoneX); // apply smoothing to the line

             let lineFunctionRate = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .curve(d3.curveCatmullRom);

            // 画连线线条。
            //console.log('selectBanks', selectBanks)

            //let colorRed = d3.interpolateHsl("white", "red");
            let rankIntervalNeg = 1000
            let rankIntervalPos = -1000
            self.rankAxisDataArrays[0].map(item=>{
                let name = item.name
                let pathData = []

                types.map((type, i)=>{
                    // console.log('.'+name+type)
                    let x = parseFloat(d3.select('.'+name+type).attr('cx'))
                    let rank = parseFloat(d3.select('.'+name+type).attr('rank'))
                    // console.log('rank', rank)
                    let y = rankHeight*i
                    pathData.push({x: x, y: y, rank: rank})
                })

                for(let i=1; i<pathData.length; i++){
                    let interval = pathData[i].rank - pathData[i-1].rank
                    rankIntervalNeg = Math.min(rankIntervalNeg, interval)
                    rankIntervalPos = Math.max(rankIntervalPos, interval)
                }
            })
            // console.log(11, rankIntervalNeg, rankIntervalPos)

            for(let i=1; i<5; i++){
                let pathData = []
                types.map((type,j)=>{
                    type=type.replaceAll('_rank_point_', '')
                    // console.log('.rating_rect_'+type+'_'+i)
                    let x = parseFloat(d3.select('.rating_rect_'+type+'_'+i).attr('x'))
                    let y = rankHeight*j
                    pathData.push({x: x, y: y})
                })
                // console.log('pathData', pathData)
                pathG.append("path")
                    .attr("d", lineFunctionRate(pathData))
                //.attr('class', 'linkPath')
                    .attr('class', name+'_linkPath')
                    .attr("stroke", 'grey')
                    .attr("stroke-width", 1)
                    .attr("opacity", 1)
                    .attr("fill", "none")

            }
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
                    let rank = parseFloat(d3.select('.'+name+type).attr('rank'))
                    let y = rankHeight*i
                    pathData.push({x: x, y: y, rank: rank})
                })

                for(let i=1; i<pathData.length; i++){
                    let tempData = [pathData[i-1], pathData[i]]
                    let interval = tempData[1].rank - tempData[0].rank
                    // console.log('interval', interval, tempData)
                    pathG.append("path")
                        .attr("d", lineFunction(tempData))
                        //.attr('class', 'linkPath')
                        .attr('class', name+'_linkPath')
                        .attr("stroke", function(d){
                            // console.log('interval', interval, tempData)
                            // if(interval<0) return colorRed(interval/rankIntervalNeg)
                            // else if(interval>0) return colorBlue(interval/rankIntervalNeg)
                            // else return 'black'
                            if(interval<0) return 'blue'
                            else if(interval>0) return 'red'
                            else return 'black'
                        })
                        // .attr("stroke", nameToColor[name])
                        .attr("stroke-width", function(d){
                            return 1
                            return Math.abs(interval/5)
                        })
                        .attr("opacity", 0.1)
                        .attr("fill", "none")
                        .on('mouseover', function(d){
                            self.highlighCirclePath('.'+name+'_linkPath', '#'+name+'_rank_point', true)
                        })
                        .on('mouseout', function(d){
                            self.highlighCirclePath('.'+name+'_linkPath', '#'+name+'_rank_point', false)
                        })
                }
            })


            console.log('types', types, samlpleCicles)
            // draw sample link
  
            samlpleCicles.map((samlpleCicle, index)=>{
                let pathDataLink = []
                console.log('samlpleCicle', samlpleCicle)
                if(Object.keys(samlpleCicle).length !=0) {
                    let bank = Object.keys(samlpleCicle)[0]
                    let type=types[index].replaceAll('_rank_point_', '')
                    console.log('.'+bank+type)
                    let base_x = parseFloat(d3.select('.'+bank+'_rank_point_'+type).attr('cx'))
                    let base_y = rankHeight*index-5
                    pathDataLink = [{x: base_x, y: base_y}]

                    samlpleCicle[bank].map((name)=>{
                        
                        let x = parseFloat(d3.select('.'+name+'_rank_point_'+type).attr('cx'))
                        
                        pathDataLink.push({x: (base_x+x)/2, y: base_y-10})

                        pathDataLink.push({x: x, y: base_y})

                            // console.log('pathData', pathData)
                        // pathG.append("path")
                        //     .attr("d", lineFunctionRate(pathDataLink))
                        // //.attr('class', 'linkPath')
                        //     .attr('class', name+'_'+type+'_linkPathLink linkPathLink')
                        //     .attr("stroke", 'red')
                        //     .attr("stroke-width", 1)
                        //     .attr("opacity", 1)
                        //     .attr("fill", "none")
                        
                        pathDataLink = [{x: base_x, y: base_y}]
                    })

                    console.log('pathData123', samlpleCicles, bank, type, base_y, pathDataLink)
                    
                    
                }
            })


            // draw boxplot

            let boxplotWidth = width/4-40
            let boxplotHeight = rankHeight-20

            // self.rankAxisDataArrays.map((rankAxisData, index)=>
            let fieldList = []
            let sumstats = {}
            let weightList = []
            for(let index=1; index<self.rankAxisDataArrays.length; index++){
                let sumstat = []
                let rankAxisData = self.rankAxisDataArrays[index]
                let nameToData = {}
                fieldList = Object.keys(rankAxisData[0]['normalizationDim'])
                let data = []
                rankAxisData.map((item, index)=>{
                    nameToData[item.name] = item
                })
                console.log(nameToData)
                let negBanks = []
                let posBanks = []
                let type = rankAxisData[0]['scheme']
                console.log('rankAxisData321', rankAxisData)
                console.log(type)
                if(type.includes('Type')){
                    for(let banktype in rankAxisData['inputSample']){
                        negBanks = []
                        posBanks = []
                        sumstat = []
                        if(rankAxisData['inputSample'][banktype]){
                            for(let bank in rankAxisData['inputSample'][banktype]['inputSample']){
                                posBanks = posBanks.concat(rankAxisData['inputSample'][banktype]['inputSample'][bank]['1'])
                                negBanks = negBanks.concat(rankAxisData['inputSample'][banktype]['inputSample'][bank]['0'])
                                console.log(posBanks, negBanks)

                            }
                            weightList.push(Object.values(rankAxisData['inputSample'][banktype]['valueWeight']))

                            fieldList.map(field=>{
                                let data = []
                                posBanks.map(bank=>{
                                    data.push(nameToData[bank]['normalizationDim'][field])
                                })
                                var data_sorted = data.sort(d3.ascending)
                                var q1 = d3.quantile(data_sorted, .25)
                                var median = d3.quantile(data_sorted, .5)
                                var q3 = d3.quantile(data_sorted, .75)
                                var interQuantileRange = q3 - q1
                                var min = q1 - 1.5 * interQuantileRange
                                var max = q1 + 1.5 * interQuantileRange
                                sumstat.push({'key': field+1, 'value':{q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max}})
                            })

                            fieldList.map(field=>{
                                let data = []
                                negBanks.map(bank=>{
                                    data.push(nameToData[bank]['normalizationDim'][field])

                                })
                                var data_sorted = data.sort(d3.ascending)
                                var q1 = d3.quantile(data_sorted, .25)
                                var median = d3.quantile(data_sorted, .5)
                                var q3 = d3.quantile(data_sorted, .75)
                                var interQuantileRange = q3 - q1
                                var min = q1 - 1.5 * interQuantileRange
                                var max = q1 + 1.5 * interQuantileRange
                                sumstat.push({'key': field+0, 'value':{q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max}})
                            })
                            console.log('sumstat123', sumstat)
                            sumstats[banktype]=sumstat
                        }


                    }

                }
                else{
                    weightList.push(Object.values(rankAxisData['weight']))
                    //console.log(rankAxisData['inputSample'])
                    for(let bank in rankAxisData['inputSample']){
                        console.log(bank)
                        posBanks = posBanks.concat(rankAxisData['inputSample'][bank]['1'])
                        negBanks = negBanks.concat(rankAxisData['inputSample'][bank]['0'])
                    }
                    //console.log(posBanks, negBanks)

                    fieldList.map(field=>{
                        let data = []
                        posBanks.map(bank=>{
                            data.push(nameToData[bank]['normalizationDim'][field])

                        })
                        var data_sorted = data.sort(d3.ascending)
                        var q1 = d3.quantile(data_sorted, .25)
                        var median = d3.quantile(data_sorted, .5)
                        var q3 = d3.quantile(data_sorted, .75)
                        var interQuantileRange = q3 - q1
                        var min = q1 - 1.5 * interQuantileRange
                        var max = q1 + 1.5 * interQuantileRange
                        sumstat.push({'key': field+1, 'value':{q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max}})
                    })

                    fieldList.map(field=>{
                        let data = []
                        negBanks.map(bank=>{
                            data.push(nameToData[bank]['normalizationDim'][field])

                        })
                        var data_sorted = data.sort(d3.ascending)
                        var q1 = d3.quantile(data_sorted, .25)
                        var median = d3.quantile(data_sorted, .5)
                        var q3 = d3.quantile(data_sorted, .75)
                        var interQuantileRange = q3 - q1
                        var min = q1 - 1.5 * interQuantileRange
                        var max = q1 + 1.5 * interQuantileRange
                        sumstat.push({'key': field+0, 'value':{q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max}})
                    })
                    sumstats[type]=sumstat
                }
            }



            // console.log('weightList', weightList)
            // console.log('sumstats', sumstats)
            let index = 1
            for(let type in sumstats){
                //if(!weightList) break

                let weights = weightList[index-1]
                console.log('weights',weightList,sumstats,index, weights)
                let sumstat = sumstats[type]
                let boxplotG = svg
                    .append("g")
                    .attr("transform", "translate(" + (margin.left+rankWidth+50) + "," + (margin.top+rankHeight*index-rankHeight/3) + ")");
                // boxplotWidth
                // rankG.call(rankTips);
                let text = ''
                if(!type.includes("Sch")) text = type
                boxplotG.append("text")
                    // .attr("x", -5)
                    // .attr("y", (5+rankHeight/2)) // 100 is where the first dot appears. 25 is the distance between dots
                    .style("fill", 'black')
                    .text(text)
                    .attr("text-anchor", "start")
                    .attr("font-size", "8px")
                    .attr("dx", 0)
                    .attr("dy", -5)
                    .attr("font-weight", "bold")
                    .style("alignment-baseline", "middle");

                console.log(1273, type, sumstats, boxplotG)
                console.log('boxplotG', boxplotG)
                index+=1

                let npFieldList = []
                let areaData = []
                console.log(fieldList, weights)
                fieldList.map((field, i)=>{
                    npFieldList.push(field+0)
                    npFieldList.push(field+1)
                    areaData.push({'field': field+0, 'weight': weights[i]})
                    areaData.push({'field': field+1, 'weight': weights[i]})
                })

                var x = d3.scaleBand()
                    .range([ 0, boxplotWidth])
                    .domain(npFieldList)
                    .paddingInner(1)
                    .paddingOuter(.5)

                boxplotG.append("g")
                    .attr("transform", "translate(0," + 5*boxplotHeight/7 + ")")
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
                    .domain([-0.4, 1])
                    .range([boxplotHeight, 0])


                var area = d3.area()
                    .x(function(d) { return x(d.field); })
                    .y0(boxplotHeight/2)
                    .y1(function(d) { return y(d.weight); });

                // define the line
                var valueline = d3.line()
                    .x(function(d) { return x(d.field); })
                    .y(function(d) { return y(d.weight); });

                //         // add the area
                // boxplotG.append("path")
                //     .data([areaData])
                //     .attr("class", "area")
                //     .attr("d", area)
                //     .attr('fill', 'lightsteelblue');

                // add the valueline path.
                boxplotG.append("path")
                    .data([areaData])
                    .attr("class", "line")
                    .attr("d", valueline)
                    .attr('fill', 'none')
                    .attr('stroke', 'grey');


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
                    .attr("stroke", "grey")
                    .style("width", 40)

                // rectangle for the main box
                var boxWidth = 10

                let fieldColor = d3.scaleOrdinal()
                    .domain(["assetSize1", "capitalAdequacyRatio1", "nonPerformingLoansRatio1", "specialMentionedLoansRatio1", "provisionCoverage1", "liquidityRatio1", "assetProfitRatio1", "capitalProfitRatio1", "costToIncomeRatio1", "assetSize0", "capitalAdequacyRatio0", "nonPerformingLoansRatio0", "specialMentionedLoansRatio0", "provisionCoverage0", "liquidityRatio0", "assetProfitRatio0", "capitalProfitRatio0", "costToIncomeRatio0"])
                    .range(['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC', '#9270CA', '#FF9D4D', '#269A99', '#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC', '#9270CA', '#FF9D4D', '#269A99']);

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
                        if(d.key.includes('assetSize')){
                            console.log('112', fieldColor(d.key))
                        }
                        return fieldColor(d.key)
                        // return "#69b3a2"
                    })
                    .on('mouseover', d=>{
                        console.log(type, d)
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

            }

        },
        drawBoxPlot(){

        },
        highlighCirclePath(pathSelector, circleSelector, flag){
            if(flag){
                d3.selectAll(pathSelector)
                    .style('stroke-width', '2px')
                    .attr("opacity", 1)
                    .style('cursor', 'pointer');

                d3.selectAll(circleSelector)
                    .attr('stroke', 'black')
                    .attr('stroke-width', '2px')
                    .attr('cursor', 'pointer');
            }
            else{
                d3.selectAll(pathSelector)
                    .style('stroke-width', '1px')
                    .attr("opacity", 0.1)
                    .style('cursor', 'default');

                d3.selectAll(circleSelector)
                    .attr('stroke', 'grey')
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
