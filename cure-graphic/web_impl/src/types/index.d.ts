type ExampleInfo = {
    name: string;
    /** 参考文档 */
    ref_doc: Array<{
        name: string;
        url?: string;
    }>;
    /** 路由导航路径，根据目录名称规范生成，此处不需要修改 */
    route: "__EXAMPLE_ROUTE__";
};
