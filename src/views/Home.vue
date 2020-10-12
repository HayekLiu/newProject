
<template>
  <div class="home">
    <header
      class="flex flex-center space-between header"
    >
      <div class="nav">
        <span class="text-primary">A Visual Analytics Approach to Tackling the Problem of Bank Rating using Hierarchical Weighting Adjustment</span>
      </div>
    </header>
    <div style="height:30px;"></div>
    <!-- 左侧 -->
     <!-- <div style="width:24%;height:calc(68% - 30px);position: absolute;border-right: 1px solid #ccc;">
     <div style="height:calc(100% - 24vw);">

      </div>
      <Radar :indicator='indicator' :radarSeriesData = 'radarSeriesData'/>
    </div> -->
    <div style="width:100%;height:calc(68% - 30px);">
        <div class="main">
          <div class="right-box">
            <!-- 数据选择 -->
            <div style="height: 45%;border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;">
              <ScatterLink
                :name-list-data="nameListData"
                :tsne-arrays="tsneArrays"
                :rank-axis-data-arrays ="rankAxisDataArrays"
                :field-color = "fieldColor"
              />
            </div>
            <!-- 数据选择 -->
            <div style="height: 60%; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;padding-right: 4px;padding-left: 4px;">
              <RankLink
                :name-list-data="nameListData"
                :tsne-arrays="tsneArrays"
                :rank-axis-data-arrays ="rankAxisDataArrays"
                :field-color = "fieldColor"
                :weight-list = "weightList"
              />
            </div>
          </div>
        </div>
        </div>
        <div class="table-view">
          <TableView
            :table-data="tableData"
            :rank-axis-data-table="rankAxisDataTable"
            :field-color = "fieldColor"
            :field-symbol = "fieldSymbol"
            :valueWeightData='valueWeight'
            :rank-axis-data="rankAxisData"
            :rankAxisDataTableArr = 'rankAxisDataTableArr'
            @dragBank = 'dragBank'
            @getChooseColor = 'getChooseColor'
            @deleteIndex = 'deleteIndex'
           
          />
      </div>
  </div>
</template>

<script src="./script.js"></script>
<style lang="scss">
    /* body{overflow: auto !important;} */
    .home{
        width: 100%; height: 100%;
        .header{
          width: 100%;border-bottom: 1px solid #ccc;position:fixed;top:0;background-color:#000;z-index:99;
        }
    }
    .nav{
        height: 30px;font-size: 13px;line-height: 30px;text-align: left;padding-left:20px;
        .text-primary {
            color: #fff;
          }
        // img{
        //       display: inline-block;height: 38px;margin-left: 30px;margin-right: 30px;vertical-align: middle;
        // }
    }

.main{
    display: flex;height: 100%;
              // height: -moz-calc(100% - 30px);
              // height: -webkit-calc(100% - 30px);
              // height: calc(100% - 30px);;
    .left-box{
        width: 40%;
        /* padding-left: 2%; */
        .introduce{
            height: 6%;border-right: 1px solid #ccc;border-bottom: 1px solid #ccc;text-align: left;border-left: 1px solid #ccc;padding-left: 8px;
            .data-select{
                height:30px;line-height:30px;
            }
          }
          .martrixView-box{
              /* height: -moz-calc(46% -30px);
              height: -webkit-calc(46% -30px);
              height: calc(46% - 30px); */
              height: 46%;
              border-right: 1px solid #ccc;
              border-bottom: 1px solid #ccc;
          }
          .first-dom{
              width: 100%;height: 94%;position: relative;border-right: 1px solid #ccc;border-bottom: 1px solid #ccc;
              border-left: 1px solid #ccc;
              .image-contant{
                  position: absolute;right: 10px;top:6px;z-index: 11;display: flex;justify-content: flex-end;
                  
                  span{
                    width: 24px;height: 24px;border: 1px solid #f0f0f0;margin-left: 4px;cursor: pointer;
                    img{
                      width:24px;
                    }
                    .clusterImg{ width: 17px;vertical-align: middle;}
                    .circleImg{ width: 20px;vertical-align: middle;}
                  }
              }
          }
    }
    .right-box{
        width: 100%;
        /* padding-right: 2%; */
        
    }
    
  }

  .table-view{
            width:100%;height: 32%;margin:0 auto;
        }
</style>