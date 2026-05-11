<!-- 一个控制球体的参数 UI -->

<template>
    <section class="control">
        <span :style="title_style">{{ title }}</span>
        <div>
            <el-text>X</el-text>
            <el-input-number v-model="local_x" :step=".1" />
        </div>
        <div>
            <el-text>Y</el-text>
            <el-input-number v-model="local_y" :step=".1" />
        </div>
        <div>
            <el-text>Z</el-text>
            <el-input-number v-model="local_z" :step=".1" />
        </div>
        <div>
            <el-text>Radius</el-text>
            <el-input-number v-model="local_radius" :step=".1" />
        </div>
        <div v-show="has_specular">
            <el-text>Specular</el-text>
            <el-input-number v-model="local_specular" :step="100" />
        </div>
        <div v-show="has_reflective">
            <el-text>reflective</el-text>
            <el-input-number v-model="local_reflective" :step=".1" />
        </div>
    </section>
</template>

<script setup lang="ts">
import type { CureSphere } from '@/base/shape';
import { ref, watch } from 'vue';

interface Props {
    title: string;
    title_style?: string;
    sphere: CureSphere;
    /** 参数变化后需要重新渲染 */
    render: () => void
}

const props = defineProps<Props>();
const has_specular = props.sphere.specular !== 0;
const has_reflective = props.sphere.reflective !== 0;
const local_x = ref(props.sphere.position.x);
const local_y = ref(props.sphere.position.y);
const local_z = ref(props.sphere.position.z);
const local_radius = ref(props.sphere.radius);
const local_specular = ref(props.sphere.specular);
const local_reflective = ref(props.sphere.reflective);

watch(local_x, (newVal) => {
    props.sphere.position.x = newVal;
    props.render();
});
watch(local_y, (newVal) => {
    props.sphere.position.y = newVal;
    props.render();
});
watch(local_z, (newVal) => {
    props.sphere.position.z = newVal;
    props.render();
});
watch(local_radius, (newVal) => {
    props.sphere.radius = newVal;
    props.render();
});
has_specular && watch(local_specular, (newVal) => {
    props.sphere.specular = newVal;
    props.render()
});
has_reflective && watch(local_reflective, (newVal) => {
    props.sphere.reflective = newVal;
    props.render()
});


</script>


<style scoped>
.el-input-number {
    width: 130px;
}

.control {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 10px;
    margin-left: 20px;
}

.control>div {
    display: flex;
    justify-content: flex-end;
}

.control>div .el-text {
    margin-right: 20px;
}
</style>