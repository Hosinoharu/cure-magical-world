基于 `Web` 学习图形学。代码均有详细解释、参考的资料。

# 目录说明

`src/examples` 中包含所有实现，内部细分不同种类，以**独立的 Vue 组件**来实现。



## render

`basic_raytracing`：最简单的光线追踪，仅绘制出空间中的球体，甚至看不出来是个球体啦。

`basic_reflection`：简单的反射。存在点光、平行光、环境光，物体有漫反射、镜面反射。

`basic_triangle`：简单的光栅化绘制。在二维平面中绘制出直线、三角形，并填充颜色


# 如何新增示例

1.   先确定它属于哪个分类，如渲染等，然后确定其名称，比如名为 `heihei`。
2.   在 `src/examples/render` 目录下创建文件 `heihei.vue`，按照 `src/example_template.vue` 创建组件。
3.   如果该示例的内容太多，则应该创建名为 `heihei` 的目录，在其下的 `index.vue` 中编写核心内容。


# Reference

[book - Computer Graphics from Scratch](https://www.gabrielgambetta.com/computer-graphics-from-scratch/)

