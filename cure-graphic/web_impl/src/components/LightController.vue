<!-- 控制灯光的 UI -->

<template>
    <section class="control">
        <p class="text-xs">{{ title }}</p>
        <div v-show="has_potion">
            <el-text>X</el-text>
            <el-input-number v-model="local_x" :step=".1" />
        </div>
        <div v-show="has_potion">
            <el-text>Y</el-text>
            <el-input-number v-model="local_y" :step=".1" />
        </div>
        <div v-show="has_potion">
            <el-text>Z</el-text>
            <el-input-number v-model="local_z" :step=".1" />
        </div>
        <div>
            <el-text>Intensity</el-text>
            <el-input-number v-model="local_intensity" :step=".1" />
        </div>
    </section>
</template>

<script setup lang="ts">
import type { CureLight } from '@/base/light';
import { ref, watch } from 'vue';

interface Props {
    title: string;
    light: CureLight;
    /** 参数变化后需要重新渲染 */
    render: () => void
}

const props = defineProps<Props>();
const has_potion = props.light.type !== 'ambient';
const local_x = ref(has_potion ? props.light.Position.x : 0);
const local_y = ref(has_potion ? props.light.Position.y : 0);
const local_z = ref(has_potion ? props.light.Position.z : 0);
const local_intensity = ref(props.light.intensity);

has_potion && watch(local_x, (newVal) => {
    props.light.Position.x = newVal;
    props.render();
});
has_potion && watch(local_y, (newVal) => {
    props.light.Position.y = newVal;
    props.render();
});
has_potion && watch(local_z, (newVal) => {
    props.light.Position.z = newVal;
    props.render();
});
watch(local_intensity, (newVal) => {
    props.light.intensity = newVal;
    props.render();
})


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