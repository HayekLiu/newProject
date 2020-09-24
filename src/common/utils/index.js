/**
 * @description 常用工具集合
 */
const flattenArrayToObject = function(list = [], keyField = `id`, valueField = `name`) {
    return list.reduce((acc, val) => {
        if (acc[keyField]) {
            const temp = {};
            temp[acc[keyField]] = acc[valueField];
            temp[val[keyField]] = val[valueField];
            return temp;
        }
        acc[val[keyField]] = val[valueField];
        return acc;
    }, {});
};

const countText = function(text) {
    return (text || ``).replace(/[^\x00-\xff]/gi, `aa`).length;
};
const cutText = function(text, n, suffix) {
    const r = /[^\x00-\xff]/g;
    if (text.replace(r, `aa`).length <= n) {
        return text;
    }
    const m = Math.floor(n / 2);
    for (let i = m; i < text.length; i++) {
        if (text.substr(0, i).replace(r, `aa`).length >= n) {
            return text.substr(0, i) + (suffix ? `...` : ``);
        }
    }
    return text;
};

const thousandNumber = function(x = ``) {
    return !x ? x : `${x}`.replace(/\B(?=(\d{3})+(?!\d))/g, `,`);
};

const paddingText = function(text = ``, count = 5, token = `0`, direction = `left`) {
    if (!text && text !== 0) {
        return text;
    }
    const repeatedTokens = `${token}`.repeat(count);
    const fullText = direction === `left` ? `${repeatedTokens}${text}` : `${text}${repeatedTokens}`;
    return fullText.substr(direction === `left` ? -1 * count : 0);
};
const detectEnv = () => {
    const ua = navigator.userAgent;
    let platform = '';
    if (ua.indexOf('Android') > -1) {
        platform = 'android';
    }
    if (ua.indexOf('iPhone') > -1) {
        platform = 'ios';
    }
    const isWeChat = /MicroMessenger/i.test(ua);
    const isMobileQQ = /\/[\w. ]+QQ\//i.test(ua);
    const isQZone = /Qzone/i.test(ua);
    const isQQBrowser = !isWeChat && !isMobileQQ && /\/[\w. ]+MQQBrowser\//i.test(ua);
    return {
        isWeChat,
        isMobileQQ,
        isQZone,
        isQQBrowser,
        platform
    };
};
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};
const getCostText = (cost = 0) => {
    let costText;
    if (cost < 5) {
        costText = 5;
    } else if (cost < 10) {
        costText = 10;
    } else if (cost < 20) {
        costText = 20;
    } else if (cost < 30) {
        costText = 30;
    } else if (cost < 50) {
        costText = 50;
    } else if (cost < 100) {
        costText = 100;
    } else if (cost < 200) {
        costText = 200;
    } else {
        costText = '200+';
    }
    return costText;
};
const groupList = (list = [], size = 0) => {
    let page = 0;
    const resList = [];
    if (!list.length || size < 1) {
        return list;
    }
    while (page > -1) {
        const tempList = list.slice(size * page, size * (page + 1));
        if (tempList.length < size) {
            page = -1;
        } else {
            page += 1;
        }
        if (tempList.length) {
            resList.push(tempList);
        }
    }
    return resList;
};
const deepClone = (source) => {
    if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'deepClone');
    }
    const targetObj = source.constructor === Array ? [] : {};
    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
            targetObj[keys] = deepClone(source[keys]);
        } else {
            targetObj[keys] = source[keys];
        }
    });
    return targetObj;
};
const random = (min, max) => {
    if (min > max) {
        min = [max, max = min][0];
    }
    const range = max - min;
    return (min + Math.round(Math.random() * range));
};
const getByteLength = function(val) {
    let len = 0;
    val = val.toString()
    for (let i = 0; i < val.length; i++) {
        let a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null){
            len += 2;
        }
        else{
            len += 1;
        }
    }
    return len;
}
const formatBigNum = function (num = 0) {
    if(Number.parseFloat(num) / 100000000 >= 1){
        return formatFloat(Number.parseFloat(num) / 100000000) + '亿'
    }if(Number.parseFloat(num) / 10000 >= 1){
        return formatFloat(Number.parseFloat(num) / 10000) + '万'
    }else{
        return num
    }
    // num = num.toString()
    // let result = ''
    // let floatResult = ''
    // let dotIndex = num.indexOf('.')
    // // 浮点数
    // if(dotIndex !== -1){
    //     floatResult = num.substr(dotIndex)
    //     num = num.substr(0,dotIndex)
    // }
    // while (num.length > 3) {
    //     result = ',' + num.slice(-3) + result
    //     num = num.slice(0, num.length - 3)
    // }
    // if (num) {
    //     result = num + result
    // }
    // if(floatResult){
    //     result += floatResult
    // }
    // return result
}
const bigNumFormatNum = function(str){
    if(!str) {
        return 0
    }
    return Number.parseFloat(str.split(',').join())
}
const arrSum = function (arr) {
    return arr.reduce((x, y) => x + y)
}
const formatFloat = function (num, x=2) {
    if (!num){
        num = 0
    }else if (typeof num !== 'number'){
        num = Number.parseFloat(num)
    }
    return Number.parseFloat(Number.parseFloat(num).toFixed(x))
}

// 字母表，制作单元格
// let charArr = []
// for(let i=0;i<26;i++){
//     charArr.push(String.fromCharCode(65+i)) //A-Z
// }
// 获取列数对应单元格
const getSheetCol = function ( n ){
    let ordA = 'A'.charCodeAt(0);
    let ordZ = 'Z'.charCodeAt(0);
    let len = ordZ - ordA + 1;
    let s = "";
    while( n >= 0 ) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s;

}
const tableDataToSheet = function (data, header) {
    if(!data || !Array.isArray(data) || !header || !Array.isArray(header)){
        return
    }
    let rowIndex = 1
    let sheet = {}
    header.forEach((hItem, colIndex)=>{
        sheet[getSheetCol(colIndex)+1] = { t: 's', v: hItem.label } // 表头
    })
    data.forEach(tItem=>{
        rowIndex++
        header.forEach((hItem, colIndex)=>{
            let prop = hItem.prop
            let value = tItem[prop]
            let type = typeof value === 'number' ? 'n' : 'v'
            sheet[getSheetCol(colIndex)+rowIndex] = { t: type, v: value }
        })
    })
    sheet['!ref'] = `A1:${getSheetCol(header.length) + rowIndex}` //设定范围
    return sheet
}

const renderQueue = (function(func) {
    var _queue = [],                  // data to be rendered
        _rate = 1000,                 // number of calls per frame
        _invalidate = function() {},  // invalidate last render queue
        _clear = function() {};       // clearing function

    var rq = function(data) {
        if (data) rq.data(data);
        _invalidate();
        _clear();
        rq.render();
    };

    rq.render = function() {
        var valid = true;
        _invalidate = rq.invalidate = function() {
            valid = false;
        };

        function doFrame() {
            if (!valid) return true;
            var chunk = _queue.splice(0,_rate);
            chunk.map(func);
            timer_frame(doFrame);
        }

        doFrame();
    };

    rq.data = function(data) {
        _invalidate();
        _queue = data.slice(0);   // creates a copy of the data
        return rq;
    };

    rq.add = function(data) {
        _queue = _queue.concat(data);
    };

    rq.rate = function(value) {
        if (!arguments.length) return _rate;
        _rate = value;
        return rq;
    };

    rq.remaining = function() {
        return _queue.length;
    };

    // clear the canvas
    rq.clear = function(func) {
        if (!arguments.length) {
            _clear();
            return rq;
        }
        _clear = func;
        return rq;
    };

    rq.invalidate = _invalidate;

    var timer_frame = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function(callback) { setTimeout(callback, 17); };

    return rq;
});

export {
    flattenArrayToObject,
    countText,
    cutText,
    thousandNumber,
    paddingText,
    detectEnv,
    getCookie,
    getCostText,
    groupList,
    deepClone,
    getByteLength,
    random,
    formatBigNum,
    bigNumFormatNum,
    arrSum,
    formatFloat,
    tableDataToSheet,
    renderQueue
};

