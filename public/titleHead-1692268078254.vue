<!--
 * @Author:xuqiuming
 * @Date: 2021-09-13 18:42:28
 * @LastEditTime: 2023-07-19 17:07:28
 * @LastEditors: xqm 13697256625@163.com
-->
<template>
    <section class="head-title" @click="$emit('showConfig')">
        <p :style="{fontSize:fontSize}">{{ title }}</p>
        <p class="line"></p>
    </section>
</template>
  
<script>
export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        fontSize: {
            type: String,
            default: '26px'
        }
    }
  
}
</script>
  
  <style lang="scss" scoped>
  
  p {
      margin: 0;
  }
      .head-title {
          width: 100%;
          height: 53px;
          padding-left: 19px;
          padding-top:19px ;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          p {
  
              font-family: Source Han Sans CN;
              font-weight: bold;
              color: #FFFFFF;
          }
          .line {
              width: 274px;
              height: 3px;
              background: linear-gradient(90deg, #18C2FC 0%, rgba(4, 21, 72, 0.36) 100%);
  
          }
  
      }
  </style>