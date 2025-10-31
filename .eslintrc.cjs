module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'plugin:vue/vue3-essential',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'no-undef': 'off', // 禁用 no-undef 规则，因为 auto-import 会自动导入
  },
  globals: {
    // 声明 auto-import 的全局变量
    ref: 'readonly',
    computed: 'readonly',
    watch: 'readonly',
    onMounted: 'readonly',
    onUnmounted: 'readonly',
    defineProps: 'readonly',
    defineEmits: 'readonly',
    withDefaults: 'readonly',
  }
}

