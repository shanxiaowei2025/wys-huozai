module.exports = {
  vueCompilerOptions: {
    target: 3,
    strictTemplates: false,
    skipTemplateCodegen: true,
    templateOptions: {
      // 禁用模板类型检查
      compilerOptions: {
        isCustomElement: () => false,
      },
    },
  },
  // 完全禁用诊断
  diagnostics: {
    template: false,
    script: false,
    style: false,
  },
}

