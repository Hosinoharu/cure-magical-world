<template>
    <el-container>
        <el-aside width="200px">
            <el-menu router>
                <el-sub-menu index="1">
                    <template #title>Render</template>
                    <el-menu-item v-for="render in renders"
                        :index="render.route" :key="render.name">
                        {{ render.name }}
                    </el-menu-item>
                </el-sub-menu>
            </el-menu>
        </el-aside>

        <el-main>
            <RouterView></RouterView>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import basic_raytracing from "./examples/render/basic_raytracing.vue";

// 后续新增例子在此处添加即可
const renders: ExampleInfo[] = [basic_raytracing] as any
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
