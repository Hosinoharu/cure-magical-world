<template>
  <el-container>
    <el-aside width="200px">
      <el-menu router>
        <el-sub-menu index="1">
          <template #title>Title</template>
          <el-menu-item></el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-main>
      <RouterView></RouterView>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">

</script>

<style scoped>
.el-main {
  border: 1px solid var(--cure-border-color);
}

.el-menu {
  --el-menu-active-color: var(--cure-idol);
  --el-menu-hover-bg-color: var(--cure-hover-bg-color);
}
</style>
