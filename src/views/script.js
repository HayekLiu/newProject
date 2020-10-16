// @ is an alias to /src
import TSNE from 'tsne-js';
// import { formatBigNum, deepClone, formatFloat } from 'common/utils';

import TableView from '@/components/TableView.vue';
// import Radar from '@/components/Radar.vue';
import ScatterLink from '@/components/ScatterLink.vue';
import RankLink from '@/components/RankLink.vue';
import mockData from './../mock/mockData.json';
import kmeans from 'ml-kmeans';
// import miserables from './../mock/matrix.json' //矩阵数据
import * as svmjs from "svm";
window.svmjs = svmjs;
export default {
    name: 'Home',
    components: {
        TableView,

        ScatterLink,
        RankLink
    },
    data(){
        return{
            msg:'Home page data',
            typeData: {'工商银行': {'rank': 1, 'cluster': 1},
                '建设银行': {'rank': 2, 'cluster': 1},
                '农业银行': {'rank': 3, 'cluster': 1},
                '中国银行': {'rank': 4, 'cluster': 1},
                '交通银行': {'rank': 5, 'cluster': 1},
                '邮储银行': {'rank': 6, 'cluster': 1},
                '招商银行': {'rank': 7, 'cluster': 1},
                '兴业银行': {'rank': 8, 'cluster': 1},
                '浦发银行': {'rank': 9, 'cluster': 1},
                '中信银行': {'rank': 10, 'cluster': 1},
                '平安银行': {'rank': 11, 'cluster': 1},
                '民生银行': {'rank': 12, 'cluster': 2},
                '华夏银行': {'rank': 13, 'cluster': 2},
                '广发银行': {'rank': 14, 'cluster': 2},
                '浙商银行': {'rank': 15, 'cluster': 2},
                '南京银行': {'rank': 16, 'cluster': 2},
                '宁波银行': {'rank': 17, 'cluster': 2},
                '徽商银行': {'rank': 18, 'cluster': 2},
                '重庆农商': {'rank': 19, 'cluster': 2},
                '杭州银行': {'rank': 20, 'cluster': 2},
                '北京农商': {'rank': 21, 'cluster': 2},
                '上海农商': {'rank': 22, 'cluster': 2},
                '长沙银行': {'rank': 23, 'cluster': 2},
                '广州银行': {'rank': 24, 'cluster': 2},
                '天津银行': {'rank': 25, 'cluster': 3},
                '成都银行': {'rank': 26, 'cluster': 3},
                '重庆银行': {'rank': 27, 'cluster': 3},
                '深圳农商': {'rank': 28, 'cluster': 3},
                '东莞银行': {'rank': 29, 'cluster': 3},
                '苏州银行': {'rank': 30, 'cluster': 3},
                '广东顺德农商': {'rank': 31, 'cluster': 3},
                '西安银行': {'rank': 32, 'cluster': 3},
                '晋商银行': {'rank': 33, 'cluster': 3},
                '郑州银行': {'rank': 34, 'cluster': 4},
                '江西银行': {'rank': 35, 'cluster': 4},
                '江苏江南农商': {'rank': 36, 'cluster': 4},
                '九江银行': {'rank': 37, 'cluster': 4},
                '青岛农商': {'rank': 38, 'cluster': 5},
                '齐鲁银行': {'rank': 39, 'cluster': 4},
                '长安银行': {'rank': 40, 'cluster': 4},
                '华兴银行': {'rank': 41, 'cluster': 4},
                '江苏紫金农商': {'rank': 42, 'cluster': 4},
                '台州银行': {'rank': 43, 'cluster': 4},
                '浙江泰隆商行': {'rank': 44, 'cluster': 4},
                '江苏常熟农商': {'rank': 45, 'cluster': 4},
                '浙江萧山农商': {'rank': 46, 'cluster': 4},
                '乌鲁木齐银行': {'rank': 47, 'cluster': 4},
                '赣州银行': {'rank': 48, 'cluster': 4},
                '甘肃银行': {'rank': 49, 'cluster': 5},
                '江苏张家港农商': {'rank': 50, 'cluster': 5},
                '金华银行': {'rank': 51, 'cluster': 5},
                '嘉兴银行': {'rank': 52, 'cluster': 5}},
            valueDirections: {
                assetSize: true, //'资产规模',
                capitalAdequacyRatio: true, //'资本充足率',
                tocdRatio: true,//'一级资本充足率', //tier one capital adequacy ratio
                ctocdRatio: true,//'核心一级资本充足率', //Core tier one capital adequacy ratio
                nonPerformingLoansRatio: false,//'不良率',
                concernRate: false,//'关注率',
                provisionCoverage: true,// '拨备覆盖率',
                liquidityRatio: true,// '流动性比例',
                assetProfitRatio: true,// '资产利润率',
                capitalProfitRatio: true,// '资本利润率',
                costIncomeRatio: false,// '成本收入比',
                singleTenCustomer: false,// '单一客户',
                topTenCustomer: false,// '前十大客户',
            },

            tableDataObj:{
                name: {label:'Name',value:''},
                type:{label:'Type',value:''},
                rank:{label:'Rank',value:''},
                cluster:{label:'Rating',value:''},
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
            indicator:[], //雷达图坐标轴
            radarSeriesData:[], //雷达图数据

            rankAxisDataTableArr:[],  //堆叠图数据
            tableData:[],
            tsneValues:[],
            tsneArrays: [], // 二维数组，多个Tsne数据
            rankAxisDataArrays: [], //二维数组, 多个rankAxisData数据
            matrixData: [], //矩阵图的数据
            // matrixDataArr:{}, //矩阵图整理后画图用数据
            nameListData:[], //每个数据的名称
            weightList: [],
            fieldList: [], //数据所包含的指标
            fieldColor: {}, //每个属性的颜色
            fieldSymbol: {}, //每个属性
            // projectAxisData: [], //投影轴的数据
            rankAxisData: [], //排名轴的数据
            rankAxisDataTable: [], //表格堆叠图数据
            miserables:{},  //矩阵图整理后画图用数据

            martrixShow:false,
            testShow:false,
            typeValueWeight :{},
            globalValueWeight: {},
            valueWeight: {
                // true 代表越大越好，false代表越小越好
                //name: '银行名称',
                //deadline: '数据截止期',
                assetSize: 1.5, //'资产规模',
                capitalAdequacyRatio: 0.15, //'资本充足率',
                // netCapital: '资本净额',
                // tocdRatio: 0.1,//'一级资本充足率', //tier one capital adequacy ratio
                // ctocdRatio: 0.1,//'核心一级资本充足率', //Core tier one capital adequacy ratio
                //LoanWeight: //'贷款权重',
                nonPerformingLoansRatio: 0.1,//'不良率',
                specialMentionedLoansRatio: 0.05,//'关注率',
                //scrapAndConcern: false,// '不良+关注',
                //ExcessLoanRatio: false,// '逾贷比',
                provisionCoverage: 0.15,// '拨备覆盖率',
                // depositAbsorptionWeight: // '吸收存款权重',
                liquidityRatio: 0.1,// '流动性比例',
                assetProfitRatio: 0.05,// '资产利润率',
                capitalProfitRatio: 0.05,// '资本利润率',
                costToIncomeRatio: 0.01,// '成本收入比',
                // singleTenCustomer: 0.01,// '单一客户',
                // topTenCustomer: 0.01,// '前十大客户',
            },
            chooseColorArr:[],
            selectedIDs:[], //套索选中的数据
            tabClickName:'',//表格点击的银行
        };
    },
    computed:{

    },
    mounted(){
        this.init(true);
        // this.radarDataFun(this.tableData);
        // console.log('svm', svmjs, new svmjs.SVM())
        //this.tableData = mockData;


    },
    watch:{
        valueWeight(){
            //console.log('tsne update', val);
        },

    },
    methods:{
        init(flag, inputSample){
            let self = this;
            let copyItem = {};
            let nameList = [];
            let typeList = []
            let values = [];
            let bankType = [];
            // console.log('mockData', mockData)
            //debugger
            mockData.forEach(item=>{
                for(let key in item){
                    if(Object.keys(self.valueWeight).indexOf(key)!=-1){
                        copyItem[key] = item[key];
                    }
                }
                bankType.push(item['type'])
                nameList.push(item.name);
                typeList.push(item.type)
                values.push(Object.values(copyItem).map(value=>Number.parseFloat(value) || 0));
            });

            //console.log('values', values)
            this.fieldList = Object.keys(self.valueWeight)
            //console.log('this.fieldList', this.fieldList)

            this.fieldColor = d3.scaleOrdinal()
                .domain(this.fieldList)
                .range(['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC', '#9270CA', '#FF9D4D', '#269A99', '#FF99C3']);
            // ['#6f61ec', '#76c4e7', '#96dfe2', '#b6e5b9', '#f5da66', '#e89e80', '#de7191', '#c562aa']

            let fieldSymbol = {}
            this.fieldList.map(field=>{
                fieldSymbol[field] = true
            })
            if(!this.fieldSymbol) this.fieldSymbol = fieldSymbol
            // ['#6f61ec', '#76c4e7', '#96dfe2', '#b6e5b9', '#f5da66', '#e89e80', '#de7191', '#b4a199']
            // ['#a73835', '#394754', '#779fa6', '#c01866', '#a166ae', '#819e83', '#b88530', '#b4a199']
            // ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999']
            // ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9']
            // ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2']
            // ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6']
            //d3.schemeCategory10
            this.nameListData = nameList;
            let weightData;
            if(flag){
                weightData = self.getWeightData(values, this.fieldList, typeList, true);
            }
            else{
                weightData = self.getWeightData(values, this.fieldList, typeList, false);
            }
            // console.log('weightData', weightData)

            let normalizationData = self.getNormalizationData(values, this.fieldList);
            let [rankAxisData, ranks] = this.getRank(weightData, normalizationData, values, nameList, this.fieldList, bankType);

            rankAxisData = this.getCluster(rankAxisData)
            rankAxisData['inputSample'] = inputSample
            if(flag) rankAxisData['weight'] =self.valueWeight
            else rankAxisData['weight'] =self.typeValueWeight
            this.rankAxisData = rankAxisData;
            // console.log('rankAxisData123', rankAxisData)


            // self.rankAxisDataArrays.push(rankAxisData)

            if(flag){
                self.rankAxisDataArrays.push(rankAxisData)
            }
            else{
                rankAxisData.map(item=>{
                    item['rank'] = self.typeData[item.name]['rank']
                    item['cluster'] = self.typeData[item.name]['cluster']
                })

                rankAxisData.sort(function(a,b){
                    return a.rank - b.rank;
                });

                let sumDict = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}

                rankAxisData.map(item=>{
                    sumDict[item['cluster']]+=1
                })
                for(let i=2; i<6; i++){
                    sumDict[i] +=sumDict[i-1]
                }
                delete sumDict[5]
                rankAxisData['segmentation'] = Object.values(sumDict)

                self.rankAxisDataArrays.push(rankAxisData)
            }

            self.rankAxisDataArrays[0].map(item=>{
                item['scheme'] = 'Default Scheme'
            })
            for(let i=1; i<self.rankAxisDataArrays.length; i++){
                //let a = parseInt(i/3)+1
                let a = 1
                let b = i%3
                let type =null
                if(b==1) type = 'Scheme ' + a+': Local Weight'
                if(b==2) type = 'Scheme ' + a+': Global Weight'
                if(b==0) type = 'Scheme ' + a+': Type Weight'
                self.rankAxisDataArrays[i].map(item=>{
                    item['scheme'] = type
                })
            }

            // self.rankAxisDataArrays.unshift(rankAxisData)
            this.rankAxisDataTable = this.deepClone(rankAxisData);
            this.tableData = this.deepClone(mockData);
            ranks.map((rank, i)=>{
                this.tableData[i]['rank'] = rank;
            });

            // this.tsneValues = self.getTsneData(weightData);
            let tsneValuesColor = self.getTsneData(weightData);
            tsneValuesColor.map((item,index)=>{
                item.push(rankAxisData[index].cluster)
            });
            this.tsneValues = tsneValuesColor;

            // this.tsneArrays.push(this.tsneValues);
            if(this.rankAxisDataTableArr < 1){
                this.tsneArrays.splice(1,0,this.tsneValues);
                this.rankAxisDataTableArr.splice(1,0,this.rankAxisDataTable);
            }else{
                this.tsneArrays.push(this.tsneValues);
                this.rankAxisDataTableArr.push(this.rankAxisDataTable);
            }

            for(let i=1; i<self.rankAxisDataTableArr.length; i++){
                let a = parseInt(i/3)+1
                let b = i%3
                let type =null
                if(b==1) type = 'Scheme ' + a+': Local Weight'
                if(b==2) type = 'Scheme ' + a+': Global Weight'
                if(b==0) type = 'Scheme ' + a+': Type Weight'
                self.rankAxisDataTableArr[i].map(item=>{
                    item['scheme'] = type
                })
            }

            // let a = self.getTsneData(weightData);
            // let b = self.getTsneData(weightData);
            // let c = self.getTsneData(weightData);
            // this.tsneArrays = [a,b,c];

            this.testShow = true;

        },
        getSampleIDs(loc, len){
            if(loc>3 && loc<len-3) return [loc-3, loc-2, loc-1, loc+1, loc+2, loc+3];
            if(loc<=3){
                let locs = [];
                for(let i = 1; i<loc; i++) locs.push(i);
                for(let i = loc+1; i<loc+3; i++) locs.push(i);
                return locs;
            }
            if(loc>len-3){
                let locs = [];
                for(let i = loc+1; i<len; i++) locs.push(i);
                for(let i = loc-3; i<loc; i++) locs.push(i);
                return locs;
            }
        },
        getRandom(n, min, max){
            var arr=[];
            for(let i=0;i<n;i++){
                arr[i]=parseInt(Math.random()*(max-min+1)+min);
                for(let j=0;j<i;j++){
                    if(arr[i]==arr[j]){
                        i=i-1;
                        break;
                    }
                }
            }
            return arr;
        },
        getLocSVMWeight(rankAxisData, dragData, newNameArr){
            let self = this;
            let ranktodata = {};
            let nametodata = {};
            let len = rankAxisData.length;
            let fieldList = [];
            rankAxisData.map(item=>{
                let newRank = newNameArr.indexOf(item['name'])+1
                ranktodata[newRank] = item;
                nametodata[item['name']] = item;
                fieldList = Object.keys(item['weightDim']);
            });
            // console.log('rankAxisData_getSVMWeight', rankAxisData)
            let data = [];
            let labels= [];
            let inputSample = {}

            console.log('getLocSVMWeight', newNameArr)

            dragData.map(item=>{
                let locs = self.getSampleIDs(item['newBankIndex'], len);
                let weightDim = nametodata[item['dragBank']]['weightDim'];

                inputSample[item['dragBank']] = {1: [], 0: []}
                console.log('getLocSVMWeight', locs);
                locs.map(loc=>{

                    let comweightDim = ranktodata[loc]['weightDim'];
                    let temp = [];
                    for(let field in weightDim){
                        // console.log(field)
                        temp.push(comweightDim[field]-weightDim[field]);
                    }
                    data.push(temp);
                    if(loc<item['newBankIndex']){
                        labels.push(1);
                        inputSample[item['dragBank']][1].push(ranktodata[loc]['name'])
                    }
                    else{
                        labels.push(-1);
                        inputSample[item['dragBank']][0].push(ranktodata[loc]['name'])
                    }
                });
            });
            console.log('getLocSVMWeight', inputSample)
            //console.log(data, labels)
            var wb; // weights and offset structure
            var svm= new svmjs.SVM();
            var svmC = 1.0;
            svm.train(data, labels, { kernel: 'linear' , C: svmC});
            wb= svm.getWeights();
            // wb['w'] = self.getPercentWeight(wb['w'])

            // console.log('wb123', wb)
            let valueWeight = [];
            let fieldSymbol = {};
            fieldList.map((field, i)=>{
                //valueWeight[field] = wb['w'][i]
                valueWeight[field] = Math.abs(wb['w'][i])
                if(wb['w'][i]>=0) fieldSymbol[field] = true
                else fieldSymbol[field] = false
            });
            this.fieldSymbol = fieldSymbol
            return [inputSample, valueWeight];
        },
        getGobalSVMWeight(rankAxisData, dragData, newNameArr){
            let self = this;
            let ranktodata = {};
            let nametodata = {};
            // let len = rankAxisData.length;
            let fieldList = [];
            rankAxisData.map(item=>{
                let newRank = newNameArr.indexOf(item['name'])+1
                ranktodata[newRank] = item;
                nametodata[item['name']] = item;
                fieldList = Object.keys(item['weightDim']);
            });

            console.log('rankAxisData_getSVMWeight', rankAxisData)

            console.log('getGobalSVMWeight', newNameArr)
            let data = [];
            let labels= [];
            let inputSample = {}
            dragData.map(item=>{
                let weightDim = nametodata[item['dragBank']]['weightDim'];
                let locs = self.getRandom(parseInt(item['newBankIndex']*0.5), 1, item['newBankIndex']-1)
                //locs = locs.concat(self.getRandom(parseInt((rankAxisData.length - item['newBankIndex'])*0.2), item['newBankIndex']+1, rankAxisData.length))
                // let locs = self.getRandom(3, 1, item['newBankIndex']-1)
                locs = locs.concat(self.getRandom(3, item['newBankIndex']+1, rankAxisData.length))
                //console.log('locs', locs)
                console.log('getGobalSVMWeight', locs)
                inputSample[item['dragBank']] = {1: [], 0: []}
                locs.map(loc=>{
                    let comweightDim = ranktodata[loc]['weightDim'];
                    let temp = [];
                    for(let field in weightDim){
                        temp.push(comweightDim[field]-weightDim[field]);
                    }
                    data.push(temp);
                    if(loc<item['newBankIndex']){
                        labels.push(1);
                        inputSample[item['dragBank']][1].push(ranktodata[loc]['name'])
                    }
                    else{
                        labels.push(-1);
                        inputSample[item['dragBank']][0].push(ranktodata[loc]['name'])
                    }
                });
            });
            console.log('getGobalSVMWeight', inputSample)
            var wb; // weights and offset structure
            var svm= new svmjs.SVM();
            var svmC = 1.0;
            svm.train(data, labels, { kernel: 'linear' , C: svmC});
            wb= svm.getWeights();
            // wb['w'] = self.getPercentWeight(wb['w'])
            let valueWeight = [];
            // let fieldSymbol = {}
            fieldList.map((field, i)=>{
                valueWeight[field] = wb['w'][i]
            });
            console.log('getGobalSVMWeight', inputSample, valueWeight)
            return [inputSample, valueWeight];
        },
        getTypeSVMWeight(rankAxisData, dragData, newNameArr){
            let self = this;
            let ranktodata = {};
            let nametodata = {};
            // let len = rankAxisData.length;
            let fieldList = [];
            let typeRankData = {
                'Large State-owned Commercial Bank': {'weightDims': [], 'ranks':[]},
                'Joint-stock Commercial Bank': {'weightDims': [], 'ranks':[]},
                'City Commercial Bank': {'weightDims': [], 'ranks':[]},
                'Rural Commercial Bank': {'weightDims': [], 'ranks':[]}
            }

            rankAxisData.map(item=>{
                let newRank = newNameArr.indexOf(item['name'])+1
                ranktodata[newRank] = item;
                nametodata[item['name']] = item;
                fieldList = Object.keys(item['weightDim']);
                typeRankData[item['type']]['weightDims'].push(item['weightDim'])
                typeRankData[item['type']]['ranks'].push(newRank)
            });

            console.log('getTypeSVMWeight', newNameArr, typeRankData, dragData)
            let typeValueWeight = {}
            for(let bankType in typeRankData){
                
                
                let inputSample = {}

                let labels = []
                let data = []
                dragData.map(item=>{
                    let negLabels= []
                    let negData = []

                    let posLabels= []
                    let posData = []

                    let posName = []
                    let negName = []
  
                    let weightDim = nametodata[item['dragBank']]['weightDim'];
                    typeRankData[bankType]['weightDims'].map((comweightDim, i)=>{
                        if(item['newBankIndex']!=typeRankData[bankType]['ranks'][i]){
                            let temp = [];
                            for(let field in weightDim){
                                temp.push(comweightDim[field]-weightDim[field]);
                            }
                            //data.push(temp)
                            if(typeRankData[bankType]['ranks'][i]<item['newBankIndex']){
                                posLabels.push(1);
                                posData.push(temp)
                                posName.push(ranktodata[typeRankData[bankType]['ranks'][i]]['name'])
                                //inputSample[item['dragBank']][1].push(ranktodata[typeRankData[bankType]['ranks'][i]]['name'])
                            }
                            else{
                                negLabels.push(-1);
                                negData.push(temp)
                                negName.push(ranktodata[typeRankData[bankType]['ranks'][i]]['name'])
                                //inputSample[item['dragBank']][0].push(ranktodata[typeRankData[bankType]['ranks'][i]]['name'])
                            }
                        }
                    })
                    
                    if(posLabels.length>3){
                        posLabels = posLabels.slice(0,3)
                        posData = posData.slice(0,3)
                        posName = posName.slice(0,3)
                    }
                    if(negLabels.length>3){
                        negLabels = negLabels.slice(0,3)
                        negData = negData.slice(0,3)
                        negName = negName.slice(0,3)
                    }
                    
                    if(posLabels.length!=0 && negLabels.length!=0){
                        
                        posLabels = posLabels.concat(negLabels)
                        labels = posLabels.concat(posLabels)

                        posData = posData.concat(negData)
                        data = data.concat(posData)

                        inputSample[item['dragBank']] = {1: [], 0: []}

                        inputSample[item['dragBank']][1] = inputSample[item['dragBank']][1].concat(posName)
                        inputSample[item['dragBank']][0] = inputSample[item['dragBank']][0].concat(negName)

                        console.log('qwer', bankType, 'posName', posName, 'negName', negName, inputSample[item['dragBank']])

                    }
                    
                });

                let sum = 0
                labels.map(label=>{
                    sum +=label
                })

                console.log('bankType', bankType, labels, data)
                if(Math.abs(sum)!=labels.length){
                    let svm= new svmjs.SVM();
                    svm.train(data, labels, { kernel: 'linear' , C: 1.0});
                    let wb= svm.getWeights(); // weights and offset structure
                    //wb['w'] = self.getPercentWeight(wb['w'])
                    console.log(wb)
                    let valueWeight = [];
                    fieldList.map((field, i)=>{
                        // valueWeight[field] = Math.abs(wb['w'][i])
                        valueWeight[field] = wb['w'][i]
                    });
                    typeValueWeight[bankType] = {}
                    typeValueWeight[bankType]['valueWeight'] = valueWeight
                    typeValueWeight[bankType]['inputSample'] = inputSample
                }
                else{
                    typeValueWeight[bankType] = null
                }
            }

            console.log('getTypeSVMWeight', newNameArr, typeRankData, dragData, typeValueWeight)
            console.log('typeRankData', typeRankData)
            console.log('typeValueWeight', typeValueWeight)
            return typeValueWeight
        },
        getPercentWeight(weights){
            let minValue = 1000
            weights.map(weight=>{
                minValue = Math.min(minValue, weight)
            })

            console.log('wb123', minValue)

            let sum = 0
            weights.map((weight, i)=>{
                weights[i]+=-2*minValue
                sum+=weights[i]
            })
            weights.map((weight, i)=>{
                weights[i]/=sum
            })
            return weights
        },
        getCluster(rankAxisData){
            //console.log('rankAxisData1234', rankAxisData)
            let data = rankAxisData.map(item=>{return [item.score]})

            let ans = kmeans(data, 5)['clusters'];
            // let temp = []

            let rankDict = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
            ans.map((d, i)=>{
                rankDict[d]=rankAxisData[i].score
            })
            let rankList =[]
            for(let cluster in rankDict){
                rankList.push({'orgin_cluster': cluster, 'sum': rankDict[cluster]})
            }

            rankList.sort(function(a,b){
                return b.sum - a.sum;
            });
            let clusterMap={}
            rankList.map((item, i)=>{
                clusterMap[item['orgin_cluster']] = i+1
            })
            ans.map((d,i)=>{
                rankAxisData[i]['cluster'] = clusterMap[ans[i]]
            })
            let sumDict = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            rankAxisData.map(item=>{
                sumDict[item['cluster']]+=1
            })
            for(let i=2; i<6; i++){
                sumDict[i] +=sumDict[i-1]
            }
            delete sumDict[5]
            rankAxisData['segmentation'] = Object.values(sumDict)
            // console.log('ans', ans, clusterMap, rankAxisData, sumDict);

            // rankAxisData.map(item=>{
            //     let rank =  item['rank']
            //     if(rank<14){
            //         item['cluster']=1
            //     }
            //     else if(rank<32){
            //         item['cluster']=2
            //     }
            //     else if(rank<48){
            //         item['cluster']=3
            //     }
            //     else if(rank<57){
            //         item['cluster']=4
            //     }
            //     else{
            //         item['cluster']=5
            //     }
            // })
            return rankAxisData
        },
        pointDistance(A, B){
            return Math.sqrt(Math.pow(A[0]-B[0], 2)+Math.pow(A[1]-B[1], 2));
        },
        // 数组降维
        getTsneData(dists){
            let  xLen = dists.length;
            let  yLen = dists[0].length;
            let  value  = [];
            for(let  j=0; j<yLen; j++){
                value.push({'min': 1000000000, 'max': 0});
                for(let  i=0;i<xLen; i++){
                    value[j].min  = Math.min(value[j].min, dists[i][j]);
                    value[j].max  = Math.max(value[j].max, dists[i][j]);
                }
            }
            let model = new TSNE({
                dim: 2,
                perplexity: 30.0,
                earlyExaggeration: 4.0,
                learningRate: 100.0,
                nIter: 2000,
                metric: 'euclidean'
            });
            model.init({
                data: dists,
                type: 'dense'
            });
            model.run();
            model.getOutput();
            let results = model.getOutputScaled();

            results.map(item=>{
                item[0] = (item[0]+1)*5;
                item[1] = (item[1]+1)*5;
            });
            //console.log('results', results)
            return results;
        },
        getRank(data, normalizationDatas, originData, nameList, fieldList, bankType){
            let scores = [];
            // console.log('data123', data)
            let maxScore = 0;
            // 求数据的得分
            for(let i=0; i<data.length; i++){
                var score = 0;
                let originDim = {};
                let weightDim = {};
                let normalizationDim = {};
                for(let j=0; j<data[i].length; j++){
                    score +=data[i][j];
                    weightDim[fieldList[j]] = data[i][j];
                    normalizationDim[fieldList[j]] = normalizationDatas[i][j];
                    originDim[fieldList[j]] = originData[i][j];
                }
                maxScore = Math.max(maxScore, score);
                scores.push({originOrder: i, 'type': bankType[i], score: score, name: nameList[i], weightDim: weightDim, normalizationDim: normalizationDim, originDim: originDim});
            }
            // 将数据的得分归一化到0-100
            scores.map(item=>{
                item['score'] = (100*item['score']/maxScore);
                let sum = 0;
                Object.keys(item['weightDim']).map(field=>{
                    sum+=item['weightDim'][field];
                });
                Object.keys(item['weightDim']).map(field=>{
                    item['weightDim'][field] = item['score']*item['weightDim'][field]/sum;
                });
            });

            scores.sort(function(a,b){
                return b.score - a.score;
            });

            scores.map((item, i)=>{
                item['rank'] = i+1;
            });

            // 计算不同排名之间的距离
            let maxLoc= 0;
            let loc = 0;
            scores[0]['loc'] = loc;
            for(let i=0; i<scores.length-1; i++){
                loc+=scores[i]['score'] - scores[i+1]['score'];
                scores[i+1]['loc'] =loc;
                //console.log('loc', loc)
                maxLoc= Math.max(maxLoc, loc);
            }

            scores.map((item)=>{
                item['loc'] /= maxLoc;
            });
            let rankAxisData = this.deepClone(scores);
            //console.log('score', scores, data);

            scores.sort(function(a,b){
                return a.originOrder - b.originOrder;
            });

            // console.log('getRank', scores)
            //console.log('score', scores, data);

            var ranks =  scores.map(item=>{
                return item['rank'];
            });
            return [rankAxisData, ranks];
        },
        getNormalizationData(rawdata, fieldList){
            let self = this;
            //极小型指标 -> 极大型指标
            function minTOmax(items){
                var maxValue = d3.max(items);
                for(var i in items){
                    items[i] = maxValue - items[i];
                }
                return items;
            }
            function transpose(arr){
                return arr[0].map(function(col, i) {
                    return arr.map(function(row) {
                        return row[i];
                    });
                });
            }
            function normalization(data){
                var ans = [];
                // for(var i in data){
                //     var sum = 0;
                //     for(var j in data[i]){
                //         sum+=Math.pow(data[i][j], 2);
                //     }
                //     ans.push(Math.pow(sum, 0.5));
                // }
                for(var i in data){
                    var sum = 0;
                    for(var j in data[i]){
                        sum=Math.max(sum, data[i][j])
                        //sum+=Math.pow(data[i][j], 2);
                    }
                    ans.push(sum);
                }
                for(let i in data){
                    for(let j in data[i]){
                        if(ans[i]!=0)
                            data[i][j]/=ans[i];
                    }
                }
                return data;
            }
            rawdata = transpose(rawdata);

            var data = [];
            for(var i in rawdata){
                if(self.valueDirections[fieldList[i]]){
                    data.push(rawdata[i]);
                }
                else{
                    data.push(minTOmax(rawdata[i]));
                }
            }

            data = normalization(data);
            data = transpose(data);
            return data;
        },
        getWeightData(rawdata, fieldList, typeList, flag){
            let self = this;
            //极小型指标 -> 极大型指标
            function minTOmax(items){
                var maxValue = d3.max(items);
                for(var i in items){
                    items[i] = maxValue - items[i];
                }
                return items;
            }
            function transpose(arr){
                return arr[0].map(function(col, i) {
                    return arr.map(function(row) {
                        return row[i];
                    });
                });
            }
            function normalization(data){
                var ans = [];
                for(var i in data){
                    var sum = 0;
                    for(var j in data[i]){
                        sum=Math.max(sum, data[i][j])
                        //sum+=Math.pow(data[i][j], 2);
                    }
                    ans.push(sum);
                }
                for(let i in data){
                    for(let j in data[i]){
                        if(ans[i]!=0)
                            data[i][j]/=ans[i];
                    }
                }
                return data;
            }
            rawdata = transpose(rawdata);

            var data = [];
            for(var i in rawdata){
                if(self.valueDirections[fieldList[i]]){
                    data.push(rawdata[i]);
                }
                else{
                    data.push(minTOmax(rawdata[i]));
                }
            }

            data = normalization(data);
            data = transpose(data);

            //console.log('datadata', data)
            let weights
            for(let i=0; i<data.length; i++){
                // var score = 0
                if(flag) weights = Object.values(self.valueWeight);
                else {
                    //console.log('123', self.typeValueWeight, self.typeValueWeight[typeList[i]], self.globalValueWeight)
                    if(self.typeValueWeight[typeList[i]]) weights = Object.values(self.typeValueWeight[typeList[i]]['valueWeight']);
                    else weights = Object.values(self.globalValueWeight)
                    // weights = Object.values(self.typeValueWeight[typeList[i]]['valueWeight']);
                }
                for(let j=0; j<data[i].length; j++){
                    data[i][j]*=weights[j];
                }
            }
            return data;
        },
        //左上散点图三套索选中的银行数据
        selectedIDsArr(obj){
            console.log('选中的银行数据',obj);
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
        //拖拽银行传过来的银行拖拽序号
        dragBank(valArr){
            let val = valArr.newDragBankArr;
            let newNameArr = valArr.newNameArr;
            console.log('拖拽银行----',valArr);
            let inputSample1 
            [inputSample1, this.valueWeight] = this.getLocSVMWeight(this.rankAxisData, val, newNameArr);
            this.init(true, inputSample1);
            
            let inputSample2
            [inputSample2, this.valueWeight] = this.getGobalSVMWeight(this.rankAxisData, val, newNameArr);
            this.globalValueWeight = this.valueWeight
            this.init(true, inputSample2);
            console.log('valueWeight', this.valueWeight)

            this.typeValueWeight = this.getTypeSVMWeight(this.rankAxisData, val, newNameArr);
            console.log('typeValueWeight',  this.typeValueWeight)
            this.init(false, this.typeValueWeight);
            console.log('valueWeight', this.typeValueWeight)
            console.log('rankAxisDataArrays', this.rankAxisDataArrays)
        },

        //选中的legend字段
        getChooseColor(val){
            this.chooseColorArr = val;
        },

        //删除堆叠图对应的删除投影图
        deleteIndex(index){
            this.tsneArrays.splice(index,1);
            this.rankAxisDataArrays.splice(index,1);
            this.rankAxisDataTableArr.splice(index,1);
        },

        //套索选中的点
        lassoData(val){
            this.selectedIDs = val;
        },

        //表格点击选中银行
        clickName(val){
            this.tabClickName = val;
        }



        // //雷达图
        // radarDataFun(tableData){
        //     let self = this;
        //     //console.log(this.$refs.tree.getCheckedNodes().map(item=>item.label));
        //     //雷达图信息
        //     let indicatorArr = [];
        //     for(let i in self.valueWeight){
        //         let maxData = d3.max(tableData, item => {
        //             return item[i];
        //         });
        //         indicatorArr.push({name:self.tableDataObj[i].label,max:maxData})
        //     }
        //     console.log(' self.indicator==========>', self.indicator)
        //     self.indicator = indicatorArr;
        // },


        // //表格选中的银行
        // radarBankName(name){
        //     let self = this;
        //     let bankType;
        //     let bankData;
        //     self.tableData.map(item=>{
        //         if(item.name == name){
        //             bankData = item;
        //             bankType = item.type;
        //         }
        //     });

        //     let bankTypeArr = self.tableData.filter(item=>{
        //         if(bankType == item.type){
        //             return item;
        //         }
        //     });
        //     self.radarDataFun(bankTypeArr)
        //     // this.valueWeight
        //     let values = [];
        //     let seriesData  = [];
        //     for(let i in self.valueWeight){  //权重字段
        //         values.push(bankData[i])
        //     }
        //     seriesData.push({
        //         name:bankData.name,
        //         value:values,
        //         // lineStyle: { // 单项线条样式。
        //         //     color:_this.colorList[bankData],
        //         // }
        //     });

        //     let clusterNumData = bankTypeArr.map((item)=>{
        //         // this.valueWeight
        //         let values = [];
        //         for(let i in self.valueWeight){  //权重字段
        //             values.push(item[i])
        //         }
        //         return values
        //     })

        //     let clusterAverageVue = [];
        //     for(let j = 0;j < clusterNumData[0].length; j++){
        //         let avegeNum = 0;
        //         for(let m = 0;m < clusterNumData.length; m++){
        //             avegeNum += clusterNumData[m][j]
        //         }
        //         clusterAverageVue.push(Math.floor(avegeNum/clusterNumData.length*100)/100);
        //     }

        //     let clusterAverage = {
        //         name:'均值',
        //         value:clusterAverageVue,
        //         // lineStyle: { // 单项线条样式。
        //         //     color:this.clusterArrColor[i],
        //         // },
        //     };

        //     seriesData.push(clusterAverage)

        //     // this.selectedTableData,this.valueWeight


        //     self.radarSeriesData = seriesData;

        //     // console.log(seriesData)
        // }

    },
};