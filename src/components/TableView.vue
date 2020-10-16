<template>
  <div
    id="tableView"
    class="tableView"
  >
    <div class="btn-box" id="areaDiv">
        <span class="saveBtn" @click='saveProject'>Save Weight Scheme</span>
        <!-- 滑动条 -->
        <!-- <div style="margin: 0 10px;">
            <c-progress class="c-progress"
            :percent="7"
            :show-slider="true" 
            :width="60"
            :slider-width="16" 
            :show-per-text="true" 
            @percentChange="onPercentChange" 
            />
        </div> -->
        <!-- <div id='clusterSVGBox' style="margin-right: 16px;"></div> -->
        <div class="legendColor">
            <span v-for='(item,index) in legendArr' :key = 'index' class="item" @click = 'chooseColor(item.name,index)' :title="item.name">
                <span class="itemColor" :style="{'backgroundColor':item.flag ? item.color:'#bfbfbf'}"></span>
                {{item.name}}
            </span>
        </div>
    </div>

    <!-- <div style="height: 30px;">122</div> -->
    <div
      id="costNumber"
      class="costNumberView"
    />
  </div>
</template>

<script>
import $ from 'jquery';
// import { constants } from 'zlib';
import cProgress from './cProgress';
export default {
    name: 'TableView',
    props: {
        tableData:{
            type:Array,
            default:()=>[],
        },
        rankAxisDataTable:{
            type:Array,
            default:()=>[],
        },
        rankAxisDataTableArr:{
            type:Array,
            default:()=>[],
        },
        fieldColor: {
            // type:Array,
            // default:()=>[],
        },
        valueWeightData:{
            // type:Array,
            // default:()=>[],
        },
        fieldSymbol:{
            // type:Array,
            // default:()=>[],
        },
        rankAxisData:{
            type:Array,
            default:()=>[],
        },
    },
    components:{cProgress},
    data(){
        return{
            clusterSVG: null,
            isPageShow: false,
            sortAscending: true,
            currentPage: 1,
            pageSize: 10,
            total: 20,

            tableDataDefault:[],
            selectDadioArr:[],
            selectAllFlag:false,  //是否全选
            chooseArr:[],  //表格中选中的
            selectedTableData: [],

            // "name": "工商银行",
            // "type": "大型商业银行",
            // "assetSize": 276995,
            // "capitalAdequacyRatio": 0.1539,
            // "nonPerformingLoansRatio": 0.0152,

            // "specialMentionedLoansRatio": 0.0292,

            // "provisionCoverage": 1.7576,
            // "liquidityRatio": 0.438,
            // "assetProfitRatio": 0.0111,
            // "capitalProfitRatio": 0.1379,
            // "costToIncomeRatio": 0.2391


            tableDataObj:{
                name: {label:'Name',value:''},
                rank:{label:'Rank',value:''},
                cluster:{label:'Rating',value:''},
                type:{label:'type',value:''},
                assetSize:{label:'assetSize',value:''},
                capitalAdequacyRatio:{label:'capitalAdequacyRatio',value:''},
                nonPerformingLoansRatio:{label:'nonPerformingLoansRatio',value:''},
                specialMentionedLoansRatio:{label:'specialMentionedLoansRatio',value:''},
                // concernRate:{label:'concernRate',value:''},            
                provisionCoverage:{label:'provisionCoverage',value:''},
              
                liquidityRatio:{label:'liquidityRatio',value:''},
                assetProfitRatio:{label:'assetProfitRatio',value:''},
                capitalProfitRatio:{label:'capitalProfitRatio',value:''},
                costToIncomeRatio:{label:'costToIncomeRatio',value:''},
              
            },
            valueWeight: {
                assetSize:{label:'assetSize',value:''},
                capitalAdequacyRatio:{label:'capitalAdequacyRatio',value:''},
                nonPerformingLoansRatio:{label:'nonPerformingLoansRatio',value:''},
                specialMentionedLoansRatio:{label:'specialMentionedLoansRatio',value:''},
                // concernRate:{label:'concernRate',value:''},            
                provisionCoverage:{label:'provisionCoverage',value:''},
              
                liquidityRatio:{label:'liquidityRatio',value:''},
                assetProfitRatio:{label:'assetProfitRatio',value:''},
                capitalProfitRatio:{label:'capitalProfitRatio',value:''},
                costToIncomeRatio:{label:'costToIncomeRatio',value:''},
            },

            svgBoxIndex:1,  //第n堆叠图
            stackedFigureData:[], //堆积图数据
            dragBankArr:[],//  拖拽过的银行
            stackedDataFlag:true, //是否增加堆叠图数据
            legendArr:[
                {name:'assetSize',color:'',flag:true},
                //{name:'type',color:'',flag:true},
                {name:'capitalAdequacyRatio',color:'',flag:true},
                {name:'nonPerformingLoansRatio',color:'',flag:true},

                {name:'specialMentionedLoansRatio',color:'',flag:true},

                {name:'provisionCoverage',color:'',flag:true},
                {name:'liquidityRatio',color:'',flag:true},
                {name:'assetProfitRatio',color:'',flag:true},
                {name:'capitalProfitRatio',color:'',flag:true},
                {name:'costToIncomeRatio',color:'',flag:true}
            ],
            chooseColorArr:[
                'assetSize',
                'capitalAdequacyRatio',
                'nonPerformingLoansRatio',
                'specialMentionedLoansRatio',
                'provisionCoverage',
                'liquidityRatio',
                'assetProfitRatio',
                'capitalProfitRatio',
                'costToIncomeRatio'
            ],
            clusterNum : 5, //聚类个数
            firstWid:0,
            firstHeiFlag:true,
        };
    },
    computed:{
    },
    watch:{
        tableData(val){
            // this.nameList = val;
            let valArr = [];
            for(let i = 0;i<val.length;i++){
                val.map(item=>{
                    if(item.rank == (i+1)){
                        valArr.push(item);
                    }
                });
            }
            d3.select('#svgDiv').remove();
            if(this.tableDataDefault.length == 0){
                this.tableDataDefault = this.deepClone(valArr)
            }
            this.draw(this.tableDataDefault);
  
        },
        rankAxisDataTable(val){
            //console.log('rankAxisData', val)
            //this.ranks = val;

            let fieldList = Object.keys(val[0]['weightDim']);
            this.drawClass(fieldList);
            
        },
        chooseColorArr(val){

            this.drawClass(val);
            console.log('tableview', val);
        },
        fieldColor(){

        },
        fieldSymbol(){

        }
    },
    mounted() {
        this.initClass();
    },
    methods:{
        
        //表格数据绘制
        draw(data) {
            data.map(item=>{
                this.rankAxisData.map(v=>{
                    if(item.name == v.name){
                        item['cluster'] = v.cluster;
                    }
                });
            });

            this.stackedDataFlag = true;
            //data 数据
            let columns =[];
            let dataFeatures = [];
            for (let key in this.tableDataObj) {
                let arr = {
                    name: key,
                    label: this.tableDataObj[key].label,
                    value: this.tableDataObj[key].value
                };
                dataFeatures.push(key);
                columns.push(arr);
            }

            let _this = this;
            d3.select('.costNumberView')
                .select('.table')
                .remove();
            let table = d3.select('.costNumberView')
                .append('div')
                .attr('id','table')
                .attr('class', 'table');
            let svgDiv = d3.select('.costNumberView')
                .append('div')
                .attr('id', 'svgDiv');

            svgDiv.append('div')
                .attr('id', 'svgBox')
                // .style('height','100%')
                .style('width','100%')
                .style('position', 'relative')
                .style('top','-40px')
                .style('overflow-y','auto')
                

                // <div style='height:100%;overflow-y:auto;' id='svgData"+this.svgBoxIndex+"'></div>
                .attr('class', 'svgDiv');
            let thead = d3.select('.costNumberView').append('div')
                .attr('class', 'tr th');
            let tbody = table.append('div')
                .attr('class', 'tbody')
                .attr('id', 'tbody')
                .style('counter-reset', function () {
                    if (_this.isPageShow) {
                        let d = (_this.currentPage - 1) * _this.pageSize;
                        return `sectioncounter ${d}`;
                    } else {
                        return `sectioncounter 0`;
                    }
                });

            thead.selectAll('div')
                .data(columns)
                .enter()
                .append('div')
                .attr('class', function (column) {

                    if (column.name == 'name'|| column.name == 'type') {
                        return 'td firstRow firstRowOne';
                    }
                    // else if (column.name == 'index') {
                    //     return 'td firstRow firstRowTwo';
                    // }
                    else{
                        return 'td otherRow';
                    }
                })
                .attr('style', 'justify-content:center;');

            thead.selectAll('.firstRowOne')
                .append('div')
                .attr('class', 'beforeRow orderRow');
            thead.select('.firstRowTwo')
                .append('div')
                .attr('class', 'beforeRow cityRow');
            thead.select('.firstRowThree')
                .append('div')
                .attr('class', 'beforeRow cityRow');

            thead.selectAll('.beforeRow')
                .append('div')
                .attr('class', ()=>{
                    return 'firstText';
                })
                .style('text-align',function(d){
                    if(d.name == 'name'||d.name == 'type'){
                        return 'center';
                    }
                })
                .style('width',function(d){
                    if(d.name == 'name'){
                        return '66px';
                    }else if(d.name == 'type'){
                        return '80px';
                    }
                })
                .text(function (column) {
                    return column.label;
                });

            let topRow = thead.selectAll('.otherRow')
                .append('div')
                .attr('class', 'topRow');
            topRow.append('span')
                .attr('class', 'topCommon topFirst')
                .attr('title', function(column) {
                    return column.label;
                })
                .text(function(column) {
                    return column.label;
                });
            topRow.append('span')
                .attr('class', 'topCommon topSecond');

            let rows = tbody.selectAll('div')
                .data(data)
                .enter()
                .append('div')
                .attr('draggable','true')
                .on('click',function(d){
                    d3.selectAll('.LinkPath')
                        .attr("stroke-width", 1)
                        .attr("opacity", 0.5);
                    d3.select("#"+d.name+'LinkPath')
                        .attr("stroke-width", 18)
                        .attr("opacity", 0.8);
                    $('.costNumberView').find('.tbody').find('.tr').css('border-color','#D0CECE');
                    $('.costNumberView').find('.tbody').find('.tr').css('background-color','#fff');
                    $(this).css('border-color','#5DA5B3');
                    $(this).css('background-color','#5DA5B3');

                    // _this.$emit('radarBankName',d.name)
                })
                .attr('id',function(d){
                    return 'tr_'+d.name;
                })
                .attr('class', 'tr');

               
            let cells = rows.selectAll('div')
                .data(function (row, index) {
                    return dataFeatures.map(function (columnName) {
                        return {
                            col: columnName,
                            value: row[columnName],
                            index: index
                        };
                    });
                })
                .enter()
                .append('div')
                .attr('class', function () {
                    return 'td otherCol';
                })
                .attr('style', 'justify-content:center;align-items: center;');
            let svg = cells.append('svg')
                .attr('height', 18)
                .attr('width', 100)
                .attr('viewBox', `0 0 100 18`)
                .attr('preserveAspectRatio', 'none');
            
            //表格内容
            svg.append('foreignObject')
                .attr('width', 100)
                .attr('height', 18)
                .append('xhtml:div')
                .style('text-align', function(d){ 
                    if(d.col != 'name' && d.col != 'type'){
                        return 'right';
                    }else{
                        return 'center';
                    }
                })
                .style('width', '100px')
                .style('height', '18px')
                .style('font-size', '12px')
                .style('line-height', '18px')
                .style('padding-right', function(d){
                    if(d.col != 'name' && d.col != 'type'){
                        return '28px';
                    }
                })
                .attr('class',function (d) {
                    if(d.col == 'cluster'){
                        return 'clusterColor';
                    }else if(d.col == 'name'){
                        return 'bankName';
                    }else if(d.col == 'rank'){
                        return 'rank_text';
                    }
                })
                .text(function (d) {
                   
                    if(d.col == 'assetSize'){
                        return d.value.toLocaleString();
                    }else if(d.col == 'capitalAdequacyRatio'|| d.col == 'ctocdRatio'|| d.col == 'scrapAndConcern'
                    || d.col == 'tocdRatio'|| d.col == 'nonPerformingLoansRatio'|| d.col == 'concernRate'|| d.col == 'provisionCoverage'
                    || d.col == 'liquidityRatio'|| d.col == 'assetProfitRatio'|| d.col == 'ExcessLoanRatio'
                    || d.col == 'capitalProfitRatio'|| d.col == 'costIncomeRatio' || d.col == 'singleTenCustomer'
                    || d.col == 'topTenCustomer'|| d.col == 'LoanWeight' || d.col == 'depositAbsorptionWeight'){
                        
                        return (d.value*100).toFixed(2)+'%';
                    }else if(d.col == 'cluster'){
                        return d.value;
                    }else{
                        return d.value;
                    }
                   
                })
                .attr('transform', function () {
                    return `translate(2, 14)`;
                })
                .attr('title', function (d) {
                    if(d.col == 'assetSize'){
                        return d.value.toLocaleString();
                    }else if(d.col == 'capitalAdequacyRatio'|| d.col == 'ctocdRatio'|| d.col == 'scrapAndConcern'
                    || d.col == 'tocdRatio'|| d.col == 'nonPerformingLoansRatio'|| d.col == 'concernRate'|| d.col == 'provisionCoverage'
                    || d.col == 'liquidityRatio'|| d.col == 'assetProfitRatio'|| d.col == 'ExcessLoanRatio'
                    || d.col == 'capitalProfitRatio'|| d.col == 'costIncomeRatio' || d.col == 'singleTenCustomer'
                    || d.col == 'topTenCustomer'|| d.col == 'LoanWeight' || d.col == 'depositAbsorptionWeight'){

                        return (d.value*100).toFixed(2)+'%';
                    }else if(d.col == 'cluster'){
                        return d.value;
                    }else{
                        return d.value;
                    }
                })
            // 排序
            d3.select('.costNumberView')
                .selectAll('.topSecond')
                .on('click', function () {
                    let colName = d3.select(this)['_groups'][0][0]['__data__'].name;
                    if (_this.isPageShow) {
                        _this.sortParam = colName;
                        _this.handleSort(colName);
                        _this.sortAscending = !_this.sortAscending;
                    } else {
                        if (_this.sortAscending) {
                            rows.sort(function (a, b) {
                                return d3.ascending(b[colName], a[colName]);
                            });
                            _this.sortAscending = !_this.sortAscending;
                        } else {
                            rows.sort(function (a, b) {
                                return d3.ascending(a[colName], b[colName]);
                            });
                            _this.sortAscending = !_this.sortAscending;
                        }
                    }
                });

            _this.tableColor();
            _this.drag();
            _this.stacked();

        },
        //表格颜色设置
        tableColor(){
            let num = $('.costNumberView').find('.tbody').find('.tr');
            for(let i = 0; i < num.length; i++){
                $('.costNumberView').find('.tbody').find('.tr').eq(i).css('border','2px solid #D0CECE');
            }
            
        },


        //堆叠图数据处理
        stackedData(){
            let self = this;

            // console.log('1111111',this.rankAxisDataTable)
            let fieldList = Object.keys(this.rankAxisDataTable[0]['weightDim']);
            // //记录表格推叠图数据
            // let bankName = document.getElementsByClassName('bankName');
            // //获取表格排序
            // let nameArr=[];
            // for(let i = 0;i<bankName.length;i++){
            //     nameArr.push(bankName[i].innerText);
            // }

            //console.log('rankAxisDataTableArr=========>',this.rankAxisDataTableArr);

            if(self.stackedDataFlag){
                self.stackedFigureData = [];
            }

            self.rankAxisDataTableArr.map((dItem)=>{

                let nameArr = dItem.map((item)=>{
                    return item.name;
                });

                let dataTable = [];
                let weightDims = [];
                nameArr.map(item=>{
                    dItem.map(i=>{
                        if(item == i.name){
                            dataTable.push(i);
                        }
                    });
                });
                dataTable.map(item=>{
                // item['weightDim']['loc'] = item['loc']
                    weightDims.push(item['weightDim']);
                });
                dataTable['columns'] = fieldList;
                // let stackedData = d3.stack()
                //     .keys(dataTable.columns)(weightDims)
                //     .map(d => (d.forEach(v => v.key = d.key), d));


                var stack = d3.stack() 
                    .keys(dataTable.columns)
                    .value((d, key) => d.weightDim[key])
                    .order(d3.stackOrderNone)
                    .offset(d3.stackOffsetDiverging);
  
                var stackedData = stack(dataTable);
                
                stackedData.map((item,link)=>{

                    item.map((i,k)=>{
                        i['name'] = nameArr[k];
                        i['svgBoxIndex'] = self.svgBoxIndex;
                        i['link'] = link;
                        i['key'] = dataTable.columns[link]
                    });
                });
                self.svgBoxIndex++;
                // splice(2, 0, "three")
                let weighData = [];
                let vWeight = self.valueWeightData;

                for(let k in vWeight){
                    weighData.push({name:k,value:vWeight[k], type: self.fieldSymbol[k]});
                }

                if(self.stackedDataFlag){
                    self.stackedFigureData.push({stackedData:stackedData,dataTable:dataTable,weighData:weighData})
                    // self.stackedFigureData.splice(1,0,{stackedData:stackedData,dataTable:dataTable,weighData:weighData});
                }

            })
        },

        //表格拖拽
        drag(){
            var node = document.querySelector(".tbody");
            var draging = null;
            let self = this;
            //使用事件委托，将div的事件委托给#tbody
            node.ondragstart = function(event) {
                //firefox设置了setData后元素才能拖动！！！！
                event.dataTransfer.setData("te", event.target.innerText); //不能使用text，firefox会打开新tab
                //event.dataTransfer.setData("self", event.target);
                draging = event.target;
            };
            node.ondragover = function(event) {
                //console.log("onDrop over");
                event.preventDefault();
                var target = event.target;
                //因为dragover会发生在ul上，所以要判断是不是li
                // console.log('target.nodeName--------',target.nodeName)
                // console.log(target.className)
                if (target.className === "tr") {
                    if (target !== draging) {
                        var targetRect = target.getBoundingClientRect();
                        var dragingRect = draging.getBoundingClientRect();
                        if (target) {
                            if (target.animated) {
                                return;
                            }
                        }
                        if (_index(draging) < _index(target)) {
                            target.parentNode.insertBefore(draging, target.nextSibling);
                        } else {
                            target.parentNode.insertBefore(draging, target);
                        }
                        _animate(dragingRect, draging);
                        _animate(targetRect, target);
                    }
                }
            };
            //获取元素在父元素中的index
            function _index(el) {
                var index = 0;
  
                if (!el || !el.parentNode) {
                    return -1;
                }
  
                while (el && (el = el.previousElementSibling)) {
                    //console.log(el);
                    index++;
                }
  
                return index;
            }
  
            function _animate(prevRect, target) {
                var ms = 300;
  
                if (ms) {
                    var currentRect = target.getBoundingClientRect();
  
                    if (prevRect.nodeType === 1) {
                        prevRect = prevRect.getBoundingClientRect();
                    }
  
                    _css(target, 'transition', 'none');
                    _css(target, 'transform', 'translate3d(' +
                  (prevRect.left - currentRect.left) + 'px,' +
                  (prevRect.top - currentRect.top) + 'px,0)'
                    );
  
                    target.offsetWidth; // 触发重绘
                    //放在timeout里面也可以
                    // setTimeout(function() {
                    //     _css(target, 'transition', 'all ' + ms + 'ms');
                    //     _css(target, 'transform', 'translate3d(0,0,0)');
                    // }, 0);
                    _css(target, 'transition', 'all ' + ms + 'ms');
                    _css(target, 'transform', 'translate3d(0,0,0)');
  
                    clearTimeout(target.animated);
                    target.animated = setTimeout(function() {
                        _css(target, 'transition', '');
                        _css(target, 'transform', '');
                        target.animated = false;
                    }, ms);
                }
            }
            //给元素添加style
            function _css(el, prop, val) {
                var style = el && el.style;
  
                if (style) {
                    if (val === void 0) {
                        if (document.defaultView && document.defaultView.getComputedStyle) {
                            val = document.defaultView.getComputedStyle(el, '');
                        } else if (el.currentStyle) {
                            val = el.currentStyle;
                        }
  
                        return prop === void 0 ? val : val[prop];
                    } else {
                        if (!(prop in style)) {
                            prop = '-webkit-' + prop;
                        }
  
                        style[prop] = val + (typeof val === 'string' ? '' : 'px');
                    }
                }
            }
            node.ondragend = function(event) {
                //拖拽的银行
                let dragBank = event.target.id.substring(3);

                //初始化时表格银行排序
                let nameArr = self.stackedFigureData[0].dataTable.map(item=>item.name);

                //拖拽换位置后银行顺序
                let bankName = document.getElementsByClassName('bankName');
                let newNameArr=[];
                for(let i = 0;i<bankName.length;i++){
                    newNameArr.push(bankName[i].innerText);
                }

                let bankIndex = nameArr.indexOf(dragBank);
                let newBankIndex = newNameArr.indexOf(dragBank);

                //新的位置比老的大就是排序下降了
                if(newBankIndex>bankIndex){
                    $('#tr_'+dragBank).find('.bankName').css('color','red');
                }else if(newBankIndex<bankIndex){
                    $('#tr_'+dragBank).find('.bankName').css('color','green');
                    // console.log(dragBank,'上升');
                }else{
                    $('#tr_'+dragBank).find('.bankName').css('color','');
                    // console.log(dragBank,'原来的位置');
                }

                if(self.dragBankArr.indexOf(dragBank) == -1){
                    self.dragBankArr.push(dragBank);
                }
               
                for(let i = 0;i<bankName.length;i++){
                    $('.costNumberView').find('.tbody').find('.rank_text').eq(i).text(i+1);
                }

                self.stackedDataFlag = false;
                self.stacked();

            };
        },
        saveProject(){
            let newNameArr=[];
            let newDragBankArr = [];
            let bankName = document.getElementsByClassName('bankName');

            for(let i = 0;i<bankName.length;i++){
                newNameArr.push(bankName[i].innerText);
            }
            for(let i = 0;i<newNameArr.length;i++){
                this.dragBankArr.map(item=>{
                    if(item == newNameArr[i]){
                        newDragBankArr.push({dragBank:item,newBankIndex:(i+1)});
                    }
                });
               
            }
            let setDragBank = {newDragBankArr:newDragBankArr,newNameArr:newNameArr};
            if(!this.stackedDataFlag ){
                this.$emit('dragBank',setDragBank);
            }
            this.stackedDataFlag = true;
            //保存后拖拽数组清空
            this.dragBankArr = [];
            // this.stacked();
        },
        stacked(){
            let self = this;
            let {clientWidth: clientWidth} = document.getElementById('table');
            let margin = {top: 20, right: 10, bottom: 0, left: 80};

            let width = (clientWidth- margin.left - margin.right)*0.26;
            self.stackedData();
            // if(!self.stackedDataFlag){
            //     self.stackedFigureData.splice(1,1);
            // }
            // let bankName = document.getElementsByClassName('bankName');
            // let lenIndex = self.stackedFigureData.length-1;
            // let stackedData = self.stackedFigureData[lenIndex].stackedData;
            //
            // let dataTable = self.stackedFigureData[lenIndex].dataTable;

            //第一个堆叠图银行排序
            let nameArr = self.stackedFigureData[0].dataTable.map(item=>item.name);

            //堆叠图个数
            let num = self.stackedFigureData.length;
            //堆积图间距
            let stackedWid = 50;
            //表格每条格子高xx*73
            let height = 18*72 - margin.top - margin.bottom+30;
            Object.keys(this.rankAxisDataTable[0]['weightDim']);
            let color = self.fieldColor;

            d3.select('#svgMain').remove();
            const svg = d3.create("svg")
                .attr('id','svgMain')
                .attr('width',width*num+stackedWid*(num)+stackedWid)
                .attr('height',height+40)
                .style('width',width*num+stackedWid*(num)+stackedWid+'px')
                .style('height',(height+40)+'px')
                .attr("viewBox", [0, 0, width*num+stackedWid*(num)+stackedWid, height+40]);

            let gLin = svg.append("g")
                .attr("transform", "translate(" + 0 + "," + 40 + ")")
                .attr('class', 'gLin');

            self.stackedFigureData.map((item,index)=>{
                // let  stackedDataLen =  self.stackedFigureData.length;
                let x = d3.scaleLinear()
                    .domain([0, d3.max(item.stackedData, d => d3.max(d, d => d[1]))])
                    .range([margin.left, width - margin.right]);

                let y = d3.scaleBand()
                    .domain(item.dataTable.map(d => d.name))
                    .range([margin.top, height - margin.bottom])
                    .padding(0.08);

                // let xAxis = g => g
                //         .attr("transform", `translate(0,${margin.top})`)
                //         .call(d3.axisTop(x).ticks(width / 100, "s"))
                //         .call(g => g.selectAll(".domain").remove());

                let yAxis = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(d3.axisLeft(y).tickSizeOuter(0))
                    .call(d3.axisLeft(y).tickFormat((d,index) =>  d + " " +(index+1)));
                    // .call(g => g.selectAll(".domain").remove());

                let g = svg.append("g")
                    .attr('class','g_'+index)
                    .attr("transform",function(){
                        if(index == 0){
                            return  "translate(" + stackedWid + "," + 40 + ")";
                        }else{
                            return  "translate(" + ((width+stackedWid)*index+stackedWid) + "," + 40 + ")";
                        }

                    })
                    .on('mouseover',function(){
                        //悬浮显示虚线框和删除按钮
                        if(index>0){
                            d3.selectAll('.isClose').style('display','none');
                            d3.selectAll('.pathLink').style('display','none');
                        
                            d3.select('.pathLine_'+index).style('display','block');
                            d3.select('.isClose'+index).style('display','block');
                        }
                        
                    });

                // // 权重柱状图
                // let weightG = svg.append("g")
                //     .attr('class','g_weight'+index)
                //     .attr("width", 117)
                //     .attr("height", 16)
                //     .attr("transform",function(){
                //         if(index == 0){
                //             return  "translate(" + (stackedWid+76) + "," + 44 + ")";
                //         }else{
                //             return  "translate(" + ((width+stackedWid)*index+stackedWid+76) + "," + 44 + ")";
                //         }
                //     });

                // let weighData = item.weighData;

                // console.log('weighData11111111111111111111', weighData);
                // let weightX = d3.scaleLinear()
                //     .domain([0, weighData.length])
                //     .range([0, 117]);

                // let weightYPosition = d3.scaleLinear()
                //     .domain(d3.extent(weighData, d => Math.abs(d.value)))
                //     .range([8, 0]);

                // let weightYNegative = d3.scaleLinear()
                //     .domain(d3.extent(weighData, d => Math.abs(d.value)))
                //     .range([0, 8]);

                // weightG.append("line")
                //     .style("stroke", "grey") 
                //     .style("stroke-width", "1px") 
                //     //.style("stroke-dasharray", ("3, 3")) 
                //     .attr("x1", 0)
                //     .attr("y1", 8)
                //     .attr("x2", 117)
                //     .attr("y2", 8);

                // console.log('weighData', weighData);
                // weightG.selectAll("rect")
                //     .data(weighData)
                //     .enter()
                //     .append("rect")
                //     .attr("fill", d => color(d.name))
                //     .attr("stroke", 'grey')
                //     .attr("x", (d, i) => (weightX(i)+i*1))
                //     .attr('y', function(d){
                //         if(d.value>0) return weightYPosition(d.value);
                //         else return 0;
                        
                //     })
                //     .attr('height', function(d){
                //         if(d.value>0) return 8-weightYPosition(d.value);
                //         else return weightYNegative(d.value);
                //     })
                //     .attr("transform",function(){
                //         return  "translate(1,0 )";
                //     })
                //     .attr('width', 10);


                //画虚线框
                let pathLineData = [];
                pathLineData.push(
                    {x:width+stackedWid*1.5,y:0},
                    {x:(width+stackedWid)*2+stackedWid/2,y:0},
                    {x:(width+stackedWid)*2+stackedWid/2,y:height},
                    {x:width+stackedWid*1.5,y:height},
                    {x:width+stackedWid*1.5,y:0}
                );
                let pathLine = svg.append("g");
                //.attr('class','pathLine_'+index);
                d3.selectAll('.pathLink').remove();
                if(index!=0){
                    if(index == 1){
                        
                        let lineFunction = d3.line()
                            .x(function(d) {
                                return d.x;
                            })
                            .y(function(d) { return d.y; });
                        // .curve(d3.curveMonotoneX)
                        pathLine.append("path")
                            .attr("d", lineFunction(pathLineData))
                            .attr('class', 'pathLink pathLine_'+index)
                            .attr("stroke", 'red')
                            .attr("stroke-width", 1)
                            .attr("transform", "translate(" + 0 + ", 40)")
                            .attr("opacity", 0.8)
                            .style("stroke-dasharray", ("3, 3"))
                            .attr("fill", "none");
                    }else{
                        // d3.selectAll('.pathLink').remove();
                        let lineFunction = d3.line()
                            .x(function(d) {
                                return d.x;
                            })
                            .y(function(d) { return d.y; });
                        // .curve(d3.curveMonotoneX)
                        pathLine.append("path")
                            .attr("d", lineFunction(pathLineData))
                            .attr('class', 'pathLink pathLine_'+index)
                            .attr("stroke", 'red')
                            .attr("stroke-width", 1)
                            // .attr("transform", "translate(" + 0 + ", 40)")
                            .attr("opacity", 0.8)
                            .style("stroke-dasharray", ("3, 3"))
                            .attr("fill", "none")
                            .attr("transform",function(){
                                return  "translate(" + ((width+stackedWid)*(index-1)) + "," + 40 + ")";
                            })
                            .style('display','none');
                    }
                }


                //方案排序
                g.append('text')
                    .attr('dy',12)
                    .attr('dx',60)
                    .style('font-size', '11px')
                    .style('font-weight', 'light')
                    .style('font-weight','bolder')
                    .style('cursor', 'pointer')
                    .text(function(){

                        return item.dataTable[0].scheme;
                        // if(index>0){
                        //     return 'Scheme'+(index);
                        // }else{
                        //     return 'Scheme';
                        // }

                    })
                    .on('click',function(){
                        console.log('方案Scheme'+item.dataTable[0].scheme);
                    });

                let isClose = require('./../assets/images/isClose.svg');
                g.append('image')
                    .attr('height', 14)
                    .attr('width', 14)
                    .attr('x',()=>width+10)
                    .attr('xlink:href',function(){
                        if(index!= 0){
                            return isClose;
                        }
                    })
                    .style('cursor','pointer')
                    .on('click',function(){     //删除堆叠图
                        if(index!=0){
                            self.stackedDataFlag = false;
                            self.$emit('deleteIndex',index);
                            self.stackedFigureData.splice(index,1);
                            self.stacked();
                        }

                    })
                    .attr('class','isClose'+index+' isClose')
                    .style('display','none');


                let pd = g.selectAll("g")
                    .data(function(){
                        return item.stackedData;
                    })
                    .enter().append('g')
                    .attr("fill", d => color(d.key));

                pd.selectAll("rect")
                    .data(function(d){
                        return d;
                    })
                    .enter()
                    .append('rect')
                    .attr("x", function(d){
                        if(x(d[0])>0){
                            return x(d[0]);
                        }else{
                            //console.log('x(d[0])---小于0',x(d[0]))
                        }
                        
                    })
                    .attr("y", function(d){
                        return y(d.name);
                    })
                    .attr("width", function(d){
                        return Math.abs(x(d[1]) - x(d[0]));
                    })
                    .attr("height", y.bandwidth())
                    .attr('class',function(d){
                        if(d.link == item.stackedData.length-1){
                            return d.name+'linxy';
                        }
                    })
                    .style('cursor','pointer')
                    .on('click',function(d){
                        d3.selectAll('.LinkPath')
                            .attr("stroke-width", 1)
                            .attr("opacity", 0.5);
                        d3.select("#"+d.name+'LinkPath')
                            .attr("stroke-width", 18)
                            .attr("opacity", 0.8);
                        $('.costNumberView').find('.tbody').find('.tr').css('border-color','#D0CECE');
                        $('.costNumberView').find('.tbody').find('.tr').css('background-color','#fff');
                        $('#tr_'+d.name).css('border-color','#5DA5B3');
                        $('#tr_'+d.name).css('background-color','#5DA5B3');
                        self.$emit('radarBankName',d.name);
                    })
                    .append("title")   //堆叠图上的title悬浮
                    .text(function(d){

                        return `${d.name} ${self.valueWeight[d.key]['label']}${(d.data[d.key])}`;
                    });
                g.append("g")
                    .call(yAxis);
            });

            if(num == 1){
                // $('#svgDiv').css({'width':'calc(100% - 800px)','position': 'absolute','left': '800px'});
                $('#svgDiv').css({'width':'calc(100% - 872px)'});
                $('#svgBox').css({'width': '100%','text-align': 'left'}).append(svg.node());
            }else{
                // $('#svgDiv').css({'width':width*(num-1)+stackedWid*(num-1)+'px','height':clientHeight+'px'})
                // $('#svgBox').css({'width':width*(num-1)+stackedWid*(num-1)+'px','height':clientHeight+'px'}).append(svg.node())
                $('#svgDiv').css({'width':'calc(100% - 872px)'});
                $('#svgBox').css({'width':'100%','text-align': 'left'}).append(svg.node());
            }

            // $('#svgBox').append("<div style='width:100px;height:"+height+"px;display:inline-block;'></div>")

            let allPathData = [];
            //最长的堆叠图x
            if(self.firstHeiFlag){
                let mPxNode = d3.select('.工商银行linxy')['_groups']['0']['0'];
                let wid = mPxNode.width.animVal.value;
                self.firstWid = mPxNode.x.animVal.value+mPxNode.width.animVal.value+wid;
                self.firstHeiFlag=false;
            }
            
            let bankName = document.getElementsByClassName('bankName');
            //获取表格最新排序
            let newNameArr=[];
            for(let i = 0;i<bankName.length;i++){
                newNameArr.push(bankName[i].innerText);
            }


            if(num>1){
                nameArr.map((item)=>{
                    let bankNodeData = d3.selectAll('.'+item+'linxy');
                    let pathData = [];
                    bankNodeData['_groups'].map((v)=>{
                        // let vkIndex = 0;
                        m:for(let vk in v){
                            // vkIndex ++;
                            if(vk < v.length){
                                let pY = v[vk].y.animVal.value;
                                let wid = v[vk].width.animVal.value;
                                let pX = v[vk].x.animVal.value+wid;
                                if(vk == 0){

                                    let pY0 = newNameArr.indexOf(item);
                                    pathData.push({'x':0,y:pY0*17.8+20});
                                    pathData.push({'x':10,y:pY0*17.8+20});
                                    pathData.push({'x':stackedWid,y:pY});
                                    pathData.push({'x':(self.firstWid+stackedWid),y:pY});
                                }else if(vk == (v.length-1)){

                                    pathData.push({'x':(width+stackedWid)*vk+stackedWid,y:pY});
                                    pathData.push({'x':pX+(width+stackedWid)*vk,y:pY});
                                }else{
                                    pathData.push({'x':(width+stackedWid)*vk+stackedWid,y:pY});

                                    pathData.push({'x':self.firstWid+(width+stackedWid)*vk+stackedWid,y:pY});
                                }
                            }else{
                                break m;
                            }
                        }
                        allPathData.push(pathData);
                    });
                });

                // console.log(allPathData)
                // // //最长的堆叠图x
                // let maxPx = d3.max(allPathData.map(item=>{
                //     return d3.max(item.map(i=>i.x))
                // }))

                // allPathData.map(item=>{
                //     item.map((v,k)=>{
                //         if(k == 0){
                //             v.x = maxPx+8;
                //         }

                //     })
                // })


                d3.selectAll('.LinkPath').remove();
                allPathData.map((item,index)=>{
                    let lineFunction = d3.line()
                        .x(function(d) {
                            return d.x;
                        })
                        .y(function(d) { return d.y; });
                        // .curve(d3.curveMonotoneX)
                    gLin.append("path")
                        .attr("d", lineFunction(item))
                        .attr('class', 'LinkPath')
                        .attr('id', nameArr[index]+'LinkPath')
                        .attr("stroke", '#5DA5B3')
                        .attr("stroke-width", 1)
                        .attr("transform", "translate(" + 0 + "," + 10 + ")")
                        .attr("opacity", 0.5)
                        .attr("fill", "none");
                });
            }else{
                nameArr.map((item)=>{
                    let bankNodeData = d3.selectAll('.'+item+'linxy');
                    let pathData = [];
                    bankNodeData['_groups'].map((v)=>{
                        // let vkIndex = 0;
                        m:for(let vk in v){
                            // vkIndex ++;
                            if(vk < v.length){
                                let pY = v[vk].y.animVal.value;
                                let wid = v[vk].width.animVal.value;
                                let pX = v[vk].x.animVal.value+wid;
                                let pY0 = newNameArr.indexOf(item);
                                pathData.push({'x':0,y:pY0*17.8+20});
                                pathData.push({'x':10,y:pY0*17.8+20});
                                pathData.push({'x':stackedWid,y:pY});
                                pathData.push({'x':pX,y:pY});

                            }else{
                                break m;
                            }
                        }
                        allPathData.push(pathData) ;
                    });
                });
                d3.selectAll('.LinkPath').remove();
                allPathData.map((item,index)=>{
                    let lineFunction = d3.line()
                        .x(function(d) {
                            return d.x;
                        })
                        .y(function(d) { return d.y; });
                        // .curve(d3.curveMonotoneX)
                    gLin.append("path")
                        .attr("d", lineFunction(item))
                        .attr('class', 'LinkPath')
                        .attr('id', nameArr[index]+'LinkPath')
                        .attr("stroke", '#5DA5B3')
                        .attr("stroke-width", 1)
                        .attr("transform", "translate(" + 0 + "," + 10 + ")")
                        .attr("opacity", 0.5)
                        .attr("fill", "none");
                });
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
        initClass(){
            let {clientWidth: width, clientHeight: height} = document.getElementById('areaDiv');
            width = 640;
            let margin = {
                left: 5,
                right: 5, // 为文字留空间
                top: 10, // 顶部留空间画legend和进度条
                bottom: 10
            };
            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

            let clusterSVG = d3.select("#clusterSVGBox").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.left + margin.right);
            this.clusterSVG = clusterSVG;
        },
        drawClass(fieldList){
            let self = this;
            let myData = this.rankAxisDataTable;
            d3.select('#clusterSVG').remove();
            //console.log('drawClass', myData, self.fieldColor);
            self.legendArr.map(item =>{
                item.color = self.fieldColor(item.name);
            });
            let {clientWidth: width, clientHeight: height} = document.getElementById('areaDiv');
            width = 630;
            let margin = {
                left: 5,
                right: 5, // 为文字留空间
                top: 10, // 顶部留空间画legend和进度条
                bottom: 28
            };
            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;
            
            //console.log('enter drawClass');

            let svg =  this.clusterSVG.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("id", 'clusterSVG');
            //debugger

            let xScale = d3.scaleLinear()
                .range([0, width]);

            let yScale = d3.scaleLinear()
                .range([height, 0]);


            let yValue = 0;
            let weightDims = [];
            myData.map(item=>{
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

            xScale.domain([1, d3.max(weightDims, d=>d.rank)]);
            // console.log('xScale.domain', xScale.domain());
            yScale.domain([0, yValue]);

            let stackedData = d3.stack()
                .keys(fieldList)(weightDims);

            let area = d3.area()
                .x(function(d) { return xScale(d.data.rank); })
                .y0(function(d) { return yScale(d[0]); })
                .y1(function(d) { return yScale(d[1]); });

            svg.selectAll("line_cluster")
                .data(stackedData)
                .enter()
                .append("path")
                .attr("class", function(d) { return "line_cluster " + d.key; })
                .style("fill", function(d) {
                    return self.fieldColor(d.key);
                })
                .attr("d", area);

            svg.append("g")
                .attr("class", "x axis");

            svg.select(".x.axis")
                .call(d3.axisBottom(xScale))
                .attr("transform",
                    "translate(0, " + height + ")");
            

            // console.log('weightDims', weightDims);
            svg.selectAll(".clusterRect")
                .data(weightDims)
                .enter().append("rect")
                .attr("class", "clusterRect")
                .attr("x", d=>xScale(d.rank))
                .attr("y", d => (yScale(d.value)))
                .attr("width", () => 2.5)
                .attr("height", d => (height - yScale(d.value)))
                .style("fill", "white")
                .style("stroke", "grey")
                .style("opacity", 0.6)
                .style("stroke-width", "0.5px");
                
            let clusterNums = [4, 11, 17, 27, 33, 38];

            svg.selectAll(".clusterTypeRect")
                .data(clusterNums)
                .enter().append("rect")
                .attr("class", "clusterTypeRect")
                // .merge(raxisg)
                // .attr("id", d=>(d.name+"_rankRect"))
                .attr("x", d=>xScale(d))
                .attr("y", 0)
                .attr("width", () => 2.5)
                .attr("height", height)
                .style("fill", "grey")
                .style("stroke", "black")
                .style("opacity", 0.6)
                .style("stroke-width", "0.5px");
            
            svg.selectAll(".clusterTypeTextXXX")
                .data(clusterNums)
                .enter().append("text")
                .attr("class", "clusterTypeTextXXX")
                .attr("x", d=>xScale(d))
                .attr("y", height+8) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", 'black')
                .text(function(d){
                    return d;
                })
                .attr("text-anchor", "middle")
                .style("alignment-baseline", "middle");

            
            clusterNums.push(myData.length);

            svg.selectAll(".clusterTypeText")
                .data(clusterNums)
                .enter().append("text")
                .attr("class", "clusterTypeText")
                .attr("x", function(d, i){
                    if(i==0){
                        return xScale(d)/2;
                    }
                    else{
                        return xScale((clusterNums[i]+clusterNums[i-1])/2);
                    }
                })
                .attr("y", 0) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", 'black')
                .text(function(d, i){
                    return "Rating " +(i+1);
                })
                .attr("text-anchor", "middle")
                .style("alignment-baseline", "middle");

            // //x坐标轴
            // let xAxis = d3.axisBottom()
            //     .scale(xScale);

            // //y坐标轴
            // let yAxis = d3.axisLeft()
            //     .scale(yScale);

            // svg.append("g")
            //     .attr("class", "x axis")
            //     .attr("transform", "translate(0," + height + ")")
            //     .call(xAxis);

            // svg.append("g")
            //     .attr("class", "y axis")
            //     .call(yAxis);

        },
        chooseColor(name,index){
            
            let indexNum = this.chooseColorArr.indexOf(name);
            this.legendArr[index].flag = !this.legendArr[index].flag;
            if(indexNum == -1){
                this.chooseColorArr.push(name);
            }else{
                this.chooseColorArr.splice(indexNum,1);
            }
            this.$emit('getChooseColor',this.chooseColorArr);
        },
        //滑动条数字
        onPercentChange(val){
            this.clusterNum = val;
            console.log(this.clusterNum,'滑动条选中数字----，默认为5');
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
 .tableView {
    position: relative;
    width: 100%;
    height: 100%;
    /* overflow: auto; */
    /* display: flex; */
    flex-direction: column;
    align-items: center;

    .btn-box{
        width: 100%;display: flex;justify-content: flex-start;align-items: center;height: 30px;line-height: 30px;padding-left:10px;background-color:#fff;
        .saveBtn{
            background-color: #409EFF;color: #fff;height: 24px;line-height: 24px;padding:0 10px;border-radius: 4px;cursor: pointer;font-size: 12px;font-weight: bold;flex: 0 0 auto;
        }
        .legendColor{
            width: 100%;display: flex;justify-content: flex-start;flex-wrap: wrap;padding: 0 10px;
            .item{
                height: 18px;margin-left: 8px;line-height:22px;font-size:12px;text-align:left;cursor: pointer;
                .itemColor{
                    display:inline-block;width:10px;height:10px;margin-right:2px;vertical-align: middle;
                }
            }
        }
    }
    /* padding-right: 2%; */
    .costNumberView {
        width: 100%;
        /* height: 100%; */
        // height: -moz-calc(100% - 30px);
        // height: -webkit-calc(100% - 30px);
        // height: calc(100% - 30px);
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        
        .th {   
                position: absolute;
                top: 30px;
                background-color:#fff;
                display: flex;
                align-items: center;
                font-weight: 500;
                // color: #fff;
                color: #333;
                height: 22px;
                font-size: 12px;
                align-items: center;
                .td {
                    white-space: normal;
                    width: 20%;
                    /* // height: 0.6rem; */
                    text-align: right;
                    .firstText {
                        /* font-weight: 550; */
                        display: inline-block;
                        width: 60px;
                        /* width: 100%; */
                        height: 22px;
                        line-height: 22px;
                        font-weight: 500;
                        white-space: nowrap;
                        overflow-x: hidden;
                        text-overflow: ellipsis;
                    }
                    .topRow {
                        width: 100%;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        .topCommon {
                            display: inline-block;
                            width: 22px;
                            height: 22px;
                        }
                        .topFirst {
                            display: inline-block;
                            width: 44px;
                            height: 22px;
                            line-height: 22px;
                            font-weight: 500;
                            white-space: nowrap;
                            overflow-x: hidden;
                            text-overflow: ellipsis;
                        }
                        .topSecond {
                            background: url('./../assets/images/sort.svg') no-repeat;
                            background-size: 70% 100%;
                        }
                        .topSecond:hover {
                            cursor: pointer;
                        }
                    }
                    .bottomRow {
                        height: 28px;
                        line-height: 28px;
                    }
                    .indexRow {
                        // color: #fff;
                        color: #333;
                    }
                }
                .firstRowOne {
                    width: 24%;
                    /* height: 50px; */
                    /* // line-height: 60px; */
                }
                .firstRowTwo {
                    width: 18%;
                    /* height: 50px;
                    // line-height: 60px; */
                }
                .firstRowThree{width: 10%;}
                .beforeRow {
                    height: 22px;
                    line-height: 22px;
                }
                .afterRow {
                    height: 28px;
                    line-height: 28px;
                }
                .cityAllRow{
                    /*background-color: #4c9afa;*/
                    font-weight: bold;
                    color: #000;
                }
                .cityAllRow:hover {
                    cursor: pointer;
                    /*background-color: #4c9afa;*/
                    /*color: white;*/
                }
                // .beforeRow:hover {
                //     cursor: pointer;
                // }
                .otherRow {
                    width: 24%;
                }
            }
        .table {
            margin-top: 22px;
            display: flex;
            flex-flow: column nowrap;
            flex: 0 0 auto;
            font-size: 12px;
            line-height: .5;
            height: 100%; 
            width: 872px;
            padding: 0 0;
            font-family: Gill Sans;
            /*font-weight: 10%;*/
            .bgActive {
                background-color: #C6E1FF;
            }
            
            // .tbody {
            //     counter-reset:sectioncounter 10;
            // }
            .tbody{
                /* height: calc(100% - 30px);
                overflow-y: auto; */
                }
            .tbody .tr {
                width: 100%;
                display: flex;
                flex-flow: row nowrap;
                /* height: 0.3rem; */
                align-items: center;
                // color: #fff;
                color: #333;
                margin-bottom: 2.16px;
                .td {
                    display: flex;
                    flex-flow: row nowrap;
                    word-break: break-word;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    /* height: 0.2rem; */
                    white-space: nowrap;
                    // width: $baseWidth;
                    width: 20%;
                    justify-content: center;
                    svg {
                        width: 100%;
                        height: 100%;
                    }
                }
                .indexColFirst{
                    width: 18%;
                }
                .indexColFirst::before {
                    content:counter(sectioncounter);
                    counter-increment:sectioncounter;
                }
                .indexColSecond {
                    width: 18%;
                }
                .otherCol {
                    width: 24%;
                    margin-right: 2px;
                }
                .selectItem{width: 14%;}
                .indexCol {
                    /* line-height: 0.2rem; */
                    // color: #fff;
                    color: #333;
                    height: 18px;
                    line-height: 18px;
                    svg {
                        display: none;
                    }
                }
                .indexColSecond:hover {
                    cursor: pointer;
                    background-color: #C6E1FF;
                }
                .otherCol {
                    // width: 80%;
                    // width: 550px;
                    overflow: auto;
                    svg {
                        width: 100%;
                    }
                }
            }
        }
        .allChecked, .checkbox-css{cursor: pointer;}
    }
    .el-pagination {
        // color: #fff;
        color: #333;
        text-align: center;
        /* // height: 0.3rem; */
        height: 10%;
        margin-top: 0.5%;
        .el-pager li {
            background: transparent;
        }
        .btn-next, .btn-prev {
            background-color: transparent;
            // color: #fff;
            color: #333;
        }
        .btn-quicknext, .btn-quickprev {
            // color: #fff;
            color: #333;
        }
        button:disabled {
            color: #999;
        }
        .el-pagination__jump {
            // color: #fff;
            color: #333;
        }
        .el-input__inner {
            background-color: transparent;
            // color: #fff;
            color: #333;
        }
    }
}
</style>
