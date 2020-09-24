module.exports = {
    publicPath: './',
    outputDir: 'dist', // 打包的目录
    lintOnSave: true, // 在保存时校验格式
    productionSourceMap: false, // 生产环境是否生成 SourceMap
    assetsDir:"static",
    indexPath:"index.html",
    pluginOptions: {
        'style-resources-loader': {
            preProcessor: 'scss',
            patterns: []
        }
    },
    configureWebpack: {
        devServer: {
            // proxy: {
            //     '/apiw': {
            //         target: '', //目标接口域名
            //         // target: '', //目标接口域名  测试
            //         changeOrigin: true, //是否跨域
            //         ws:true,     //代理websockets
            //         pathRewrite: {
            //             '^/apiw': '' //规定请求地址以什么作为开头
            //         }
            //     }
            // },
        }
    }

}