// @ is an alias to /src
import TSNE from 'tsne-js';
// import { formatBigNum, deepClone, formatFloat } from 'common/utils';

import TableView from '@/components/TableView.vue';
import Radar from '@/components/Radar.vue';
import ScatterLink from '@/components/ScatterLink.vue';
import mockData from './../mock/mockData.json';
// import miserables from './../mock/matrix.json' //矩阵数据
window.svmjs = require("svm");
export default {
    name: 'Home',
    components: {
       
        TableView,
        Radar,
        ScatterLink
    },
    data(){
        return{
            msg:'Home page data',
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
            tableData:[],
            tsneValues:[],
            tsneArrays: [], // 二维数组，多个Tsne数据
            rankAxisDataArrays: [], //二维数组, 多个rankAxisData数据
            matrixData: [], //矩阵图的数据
            // matrixDataArr:{}, //矩阵图整理后画图用数据
            nameListData:[], //每个数据的名称
           
            fieldList: [], //数据所包含的指标
            fieldColor: {}, //每个属性的颜色
            fieldSymbol: {}, //每个属性
            // projectAxisData: [], //投影轴的数据
            rankAxisData: [], //排名轴的数据
            rankAxisDataTable: [], //表格堆叠图数据
            miserables:{},  //矩阵图整理后画图用数据
           
            martrixShow:false,
            testShow:false,
            valueWeight: {
                // true 代表越大越好，false代表越小越好
                //name: '银行名称',
                //deadline: '数据截止期',
                assetSize: 0.35, //'资产规模',
                capitalAdequacyRatio: 0.15, //'资本充足率',
                // netCapital: '资本净额',
                // tocdRatio: 0.1,//'一级资本充足率', //tier one capital adequacy ratio
                // ctocdRatio: 0.1,//'核心一级资本充足率', //Core tier one capital adequacy ratio
                //LoanWeight: //'贷款权重',
                nonPerformingLoansRatio: 0.1,//'不良率',
                concernRate: 0.05,//'关注率',
                //scrapAndConcern: false,// '不良+关注',
                //ExcessLoanRatio: false,// '逾贷比',
                provisionCoverage: 0.15,// '拨备覆盖率',
                // depositAbsorptionWeight: // '吸收存款权重',
                liquidityRatio: 0.1,// '流动性比例',
                assetProfitRatio: 0.05,// '资产利润率',
                capitalProfitRatio: 0.05,// '资本利润率',
                // costIncomeRatio: 0.01,// '成本收入比',
                // singleTenCustomer: 0.01,// '单一客户',
                // topTenCustomer: 0.01,// '前十大客户',
            },
            chooseColorArr:[],
        };
    },
    computed:{

    },
    mounted(){
        this.init();

        // console.log('svm', svmjs, new svmjs.SVM())
        //this.tableData = mockData;
        
        
    },
    watch:{
        valueWeight(val){
            console.log('tsne update', val);
        },
        
    },
    methods:{
        init(){
            let self = this;
            let copyItem = {};
            let nameList = [];
            let values = [];
            //console.log('mockData', mockData)
            mockData.forEach(item=>{
                for(let key in item){
                    if(Object.keys(self.valueWeight).indexOf(key)!=-1){
                        copyItem[key] = item[key];
                    }
                }
                nameList.push(item.name);
                values.push(Object.values(copyItem).map(value=>Number.parseFloat(value) || 0));
               
            });
            // console.log('values', values)
            this.fieldList = Object.keys(mockData[0]);
            this.fieldList.splice(this.fieldList.indexOf('name'), 1);

            this.fieldColor = d3.scaleOrdinal()
                .domain(this.fieldList)
                .range(['#6f61ec', '#76c4e7', '#96dfe2', '#b6e5b9', '#f5da66', '#e89e80', '#de7191', '#c562aa']);
            
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

            let weightData = self.getWeightData(values, this.fieldList);
            // console.log('weightData', weightData)
            let [rankAxisData, ranks] = this.getRank(weightData, values, nameList, this.fieldList);

            rankAxisData = this.getCluster(rankAxisData)
            this.rankAxisData = rankAxisData;
            console.log('rankAxisData123', rankAxisData)

            self.rankAxisDataArrays.unshift(rankAxisData)
            this.rankAxisDataTable = this.deepClone(rankAxisData);

          
            this.tableData = this.deepClone(mockData);
            ranks.map((rank, i)=>{
                this.tableData[i]['rank'] = rank;
            });
            //this.tsneValues = self.getTsneData(values)

            this.tsneValues = self.getTsneData(weightData);
            this.tsneArrays.push(this.tsneValues);
            // let a = self.getTsneData(weightData);
            // let b = self.getTsneData(weightData);
            // let c = self.getTsneData(weightData);
            // this.tsneArrays = [a,b,c];
            
            this.testShow = true;
            this.matrixData = self.getMatrixData(this.tsneValues, this.nameListData);
            console.log(this.matrixData);
            this.getmatrixDataJson(this.matrixData);
            //console.log('this.tsneValues', this.tsneValues)
            // let axisData = self.getPatternOne(self.tsneValues, ranks, nameList) 
            // let clusterIDs = ranks

            let[clusterIDs, axisData] = self.getPatternTwo(self.tsneValues, ranks, nameList);
            console.log('clusterIDs', clusterIDs);
            console.log('axisData two', axisData);
           

            //self.getSVMWeight(this.rankAxisData)
        },
        getSampleIDs(loc, len){
            if(loc>3 && loc<len-3) return [loc-3, loc-2, loc-1, loc+1, loc+2, loc+3];
            if(loc<=3){
                let locs = [];
                for(let i = 1; i<loc; i++) locs.push(i);
                for(let i = loc+1; i<loc+6-locs.length; i++) locs.push(i);
                return locs;
            }
            if(loc>len-3){
                let locs = [];
                for(let i = loc+1; i<len; i++) locs.push(i);
                for(let i = loc-(6-locs.length); i<loc; i++) locs.push(i);
                return locs;
            }
        },
        getSVMWeight(rankAxisData, dragData){
            let self = this;
            let ranktodata = {};
            let nametodata = {};
            let len = rankAxisData.length;
            let fieldList = [];
            rankAxisData.map(item=>{
                ranktodata[item['rank']] = item;
                nametodata[item['name']] = item;
                fieldList = Object.keys(item['weightDim']);
            });
            
            let data = [];
            let labels= [];
            dragData.map(item=>{
                let locs = self.getSampleIDs(item['newBankIndex'], len);
                let weightDim = nametodata[item['dragBank']]['weightDim'];
                console.log(locs);
                locs.map(loc=>{
                    //console.log(loc, ranktodata[loc])
                    let comweightDim = ranktodata[loc]['weightDim'];

                    let temp = [];
                    for(let field in weightDim){
                        // console.log(field)
                        temp.push(weightDim[field] - comweightDim[field]);
                    }
                    data.push(temp);
                    if(loc<item['newBankIndex']){
                        labels.push(-1);
                    }
                    else{
                        labels.push(1);
                    }
                });
            });
            //console.log(data, labels)

            var wb; // weights and offset structure
            // var ss= 50.0; // scaling factor for drawing
            var svm= new svmjs.SVM();
            // var trainstats;
            // var dirty= true;
            // var kernelid= 0;
            // var rbfKernelSigma = 0.5;
            var svmC = 1.0;

            svm.train(data, labels, { kernel: 'linear' , C: svmC});
            wb= svm.getWeights();
            let valueWeight = [];
            let fieldSymbol = {} 
            fieldList.map((field, i)=>{
                valueWeight[field] = Math.abs(wb['w'][i])
                //valueWeight[field] = wb['w'][i]
                if(wb['w'][i]>=0) fieldSymbol[field] = true
                else fieldSymbol[field] = false
            });
            this.fieldSymbol = fieldSymbol

            console.log('fieldSymbol', fieldSymbol)
            return valueWeight;
            //console.log(1111, valueWeight, svm.getWeights(), trainstats)
        },
        getCluster(rankAxisData){
            rankAxisData.map(item=>{
                let rank =  item['rank']
                if(rank<4){
                    item['cluster']=1
                }
                else if(rank<11){
                    item['cluster']=2
                }
                else if(rank<17){
                    item['cluster']=3
                }
                else if(rank<27){
                    item['cluster']=4
                }
                else if(rank<33){
                    item['cluster']=5
                }
                else if(rank<38){
                    item['cluster']=6
                }
                else{
                    item['cluster']=7
                }
            })
            return rankAxisData
        },
        getPatternTwo(tsneValues, ranks){
            let data = {1:[], 2:[], 3:[], 4:[], 5:[]};
            let clusterIDs = [];
            for(let i=0; i<ranks.length; i++){
                if(ranks[i]<4){
                    data[1].push(tsneValues[i]);
                    clusterIDs.push(1);
                }
                else if(ranks[i]<11){
                    data[2].push(tsneValues[i]);
                    clusterIDs.push(2);
                }
                else if(ranks[i]<27){
                    data[3].push(tsneValues[i]);
                    clusterIDs.push(3);
                }
                else if(ranks[i]<33){
                    data[4].push(tsneValues[i]);
                    clusterIDs.push(4);
                }
                else{
                    data[5].push(tsneValues[i]);
                    clusterIDs.push(5);
                }
            }

            let axisData = [];
            Object.keys(data).map((rank)=>{
                let x = 0;
                let y = 0;
                // console.log('rank123', rank)
                data[rank].map(item=>{
                    x+=item[0];
                    y+=item[1];
                });
                axisData.push([x/data[rank].length, y/data[rank].length]);
            });
            return [clusterIDs, axisData];
            // console.log('data', data)
            // data.sort(function(a,b){
            //     return a.rank - b.rank
            // })
            // console.log('data', data)

            // return data.map(function(row) {
            //     return row['item'];
            // })
        },
        getPatternOne(tsneValues, ranks, nameList){
            let data = [];
            for(let i=0; i<tsneValues.length; i++){
                data.push({'item': tsneValues[i], 'rank': ranks[i], 'name': nameList[i]});
            }
            data.sort(function(a,b){
                return a.rank - b.rank;
            });
            // console.log('data', data)

            return data.map(function(row) {
                return row['item'];
            });
        },
       
        pointDistance(A, B){
            return Math.sqrt(Math.pow(A[0]-B[0], 2)+Math.pow(A[1]-B[1], 2));
        },
        minDistance(E, A, B){
            //求点E到线段A和B的垂线距离
            let AB = [null, null];
            // vector AB
            AB[0] = B[0] - A[0];
            AB[1] = B[1] - A[1];
            
            // vector BP
            let BE = [null, null];
            BE[0] = E[0] - B[0];
            BE[1] = E[1] - B[1];

            // vector AP
            
            let AE = [null, null];
            AE[0] = E[0] - A[0];
            AE[1] = E[1] - A[1];

            // Variables to store dot product

            // Calculating the dot product
            let AB_BE = AB[0] * BE[0] + AB[1] * BE[1];
            let AB_AE = AB[0] * AE[0] + AB[1] * AE[1];

            // Minimum distance from
            // point E to the line segment
            let reqAns = 0; // 投影距离
            
            // Case 1 点在B点外。
            if (AB_BE > 0){
                //Finding the magnitude 
                let y = E[1] - B[1];
                let x = E[0] - B[0];
                reqAns = Math.sqrt(x * x + y * y);
	
            }
            else if(AB_AE < 0){
                let y = E[1] - A[1]; 
                let x = E[0] - A[0];
                reqAns = Math.sqrt(x * x + y * y);
            }
            else{
                // Finding the perpendicular distance 
                let x1 = AB[0];
                let y1 = AB[1];
                let x2 = AE[0];
                let y2 = AE[1];
                let mod = Math.sqrt(x1 * x1 + y1 * y1);
                reqAns = Math.abs(x1 * y2 - y1 * x2) / mod; 
            }

            let x1 = AB[0]; 
            let y1 = AB[1];
            let x2 = AE[0];
            let y2 = AE[1];
            let mod = Math.sqrt(x1 * x1 + y1 * y1);
            let reqAnsPerpendicular = Math.abs(x1 * y2 - y1 * x2) / mod; 

            // 距离左边的点的位置
            let offset = AB_AE/Math.abs(AB_AE)*Math.sqrt(AE[0] * AE[0] + AE[1] * AE[1] - reqAnsPerpendicular*reqAnsPerpendicular); 
            return [reqAns, reqAnsPerpendicular, offset];
        },
        //矩阵数据整理
        getmatrixDataJson(matrixData){
            let nodes=[],
                links=[],
                target=0,
                sourceStart =1;
            for(let i in matrixData){
                // console.log(Object.keys(matrixData[i]).length)
                nodes.push({"name": i, "group": 0}); 
                let source = sourceStart; 
                for(let j in matrixData[i]){
                    links.push({"source": source, "target": target, "value": matrixData[i][j]*100});
                    source++;
                }
                sourceStart++;
                target++;
            }
            nodes.push({"name": '', "group": 0});
            this.miserables = {'nodes':nodes,'links':links};
            this.martrixShow = true;
            // console.log(this.miserables)
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
        getRank(data, originData, nameList, fieldList){
            let scores = [];

            let maxScore = 0;
            // 求数据的得分
            for(let i=0; i<data.length; i++){
                var score = 0;
                let originDim = {};
                let weightDim = {};
                for(let j=0; j<data[i].length; j++){
                    score +=data[i][j];
                    weightDim[fieldList[j]] = data[i][j];
                    originDim[fieldList[j]] = originData[i][j];
                }
                maxScore = Math.max(maxScore, score);
                scores.push({originOrder: i, score: score, name: nameList[i], weightDim: weightDim, originDim: originDim});
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
            console.log('score', scores, data);

            scores.sort(function(a,b){
                return a.originOrder - b.originOrder;
            });

            console.log('score', scores, data);

            var ranks =  scores.map(item=>{
                return item['rank'];
            });

        
            return [rankAxisData, ranks];
        },
        getWeightData(rawdata, fieldList){
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
                        sum+=Math.pow(data[i][j], 2);
                    }
                    ans.push(Math.pow(sum, 0.5));
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
            let weights = Object.values(self.valueWeight);
            for(let i=0; i<data.length; i++){
                // var score = 0
                for(let j=0; j<data[i].length; j++){
                    data[i][j]*=weights[j];
                }
            }
            return data;
        },
        getMatrixData(tsneValues, nameList){
            let matrixData = {};
            let maxValue = 0;
            for(let i=0; i<nameList.length; i++){
                matrixData[nameList[i]] = {};
                for(let j=i+1; j<nameList.length; j++){
                    matrixData[nameList[i]][nameList[j]] = Math.sqrt(Math.pow(tsneValues[i][0]-tsneValues[j][0], 2)+Math.pow(tsneValues[i][1]-tsneValues[j][1], 2));
                    maxValue = Math.max(maxValue, matrixData[nameList[i]][nameList[j]]);
                }
            }

            console.log('maxValue', maxValue);
            for(let i=0; i<nameList.length; i++){
                for(let j=i+1; j<nameList.length; j++){
                    matrixData[nameList[i]][nameList[j]] = matrixData[nameList[i]][nameList[j]]*5/maxValue;
                    
                }
            }
            return matrixData;
            //console.log('matrixData', matrixData)
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
        dragBank(val){
            console.log('拖拽银行----',val);
            
            this.valueWeight = this.getSVMWeight(this.rankAxisData, val);
            this.init();
            //this.tsneArrays.push(this.tsneValues);
        },

        //选中的legend字段
        getChooseColor(val){
            this.chooseColorArr = val;
        }

    },
};