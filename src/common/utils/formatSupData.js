import {getSupData} from "../../storage"
export default function (mode = 1) {
    let leafId = 0
    let isCloseCount = 0
    const supData = getSupData()
    if(!supData){
    // this.$message({
    //     type: 'warning',
    //     message: '无数据'
    // })
        return
    }
    let treeData = []
    supData.forEach((rowData, i) => {
        let rootNode = ''
        let branchNode = ''
        if(mode === '1'){
            rootNode = rowData['供应商']
            branchNode = rowData['数据服务']
        } else if(mode === '2'){
            rootNode = rowData['数据服务']
            branchNode = rowData['供应商']
        }
        let rootNodes = treeData.map(item => item.label)
        let rootIndex = rootNodes.indexOf(rootNode)
        let queryTimes = [], price = [], unitPrice = []
        for(let i=1;i<=12;i++) {
            queryTimes.push(rowData[`${i}月查询量`])
            price.push(rowData[`${i}月费用`])
            unitPrice.push((rowData[`${i}月费用`] / rowData[`${i}月查询量`]) || 0)
        }
        let qtSum = queryTimes.reduce((x, y) => x + y)
        let priceSum = price.reduce((x, y) => x + y)
        let unitPriceSum = unitPrice.reduce((x, y) => x + y)
        let isClose = false
        if(isCloseCount<6){
            isCloseCount++
        }else{
            isClose = true
        }
        if(rootIndex === -1){
            treeData.push({
                rootId: 'root' + i,
                label: rootNode,
                isClose: false,
                children: [ {
                    // leafId: 'leaf' + i,
                    id: leafId++,
                    label: branchNode,
                    isClose,
                    queryTimes,
                    price,
                    qtSum,
                    priceSum,
                    unitAvg: unitPriceSum / 12
                }],
            })
        } else {
            treeData[rootIndex].children.push({
                // leafId: 'leaf' + i,
                id: leafId++,
                label: branchNode,
                isClose,
                queryTimes,
                price,
                qtSum,
                priceSum,
                unitAvg: unitPriceSum / 12
            })
            // console.log(treeData[rootIndex].children)
        }
    })
    return treeData
}
