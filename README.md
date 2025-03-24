# vue-useWorker

`vue-useWorker` 是一个基于 Vue 3 的工具，用于在 Web Worker 中运行耗时的任务，从而避免阻塞主线程。

## 安装

```bash
npm install vue-useWorker
```

## 使用方法

### 引入 `useWorker`

在组件中引入 `useWorker`，并传入需要在 Worker 中运行的函数。

```typescript
import { useWorker } from 'vue-worker';

function factorial(n: number): number {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

const [factorialWorker, { isRunning, terminateWorker }] = useWorker(factorial);
```

### 调用 Worker

通过返回的 `factorialWorker` 调用 Worker，并传入参数。

```typescript
const result = await factorialWorker(5); // 计算 5 的阶乘
console.log(result); // 输出 120
```

### 销毁 Worker

在组件卸载时，可以调用 `terminateWorker` 销毁 Worker。

```typescript
onUnmounted(() => {
    terminateWorker();
});
```

## 示例

以下是一个完整的使用示例：

### HTML 文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>vue-useWorker 示例</title>
    <style>
        [v-cloak] {
            display: none;
        }
        #app {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 200px;
            font-size: 16px;
        }
        button, input {
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <script type="importmap">
        {
            "imports": {
                "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
                "vue-worker": "../dist/useWorker.esm.js"
            }
        }
    </script>
    
    <div id="app">
        输入阶乘数：<input type="text" v-model="num" />
        <button @click="handleClick">计算阶乘</button>
        <h1 v-cloak>阶乘结果是：{{ result }}</h1>
    </div>
    <script type="module">
        import { createApp, ref } from 'vue';
        import { useWorker } from 'vue-worker';

        createApp({
            setup() {
                function factorial(n) {
                    if (n === 0 || n === 1) return 1;
                    return n * factorial(n - 1);
                }

                const [factorialWorker] = useWorker(factorial);
                const result = ref(0);
                const num = ref(0);

                const handleClick = async () => {
                    result.value = await factorialWorker(Number(num.value));
                };

                return {
                    result,
                    num,
                    handleClick
                };
            }
        }).mount('#app');
    </script>
</body>
</html>
```

### TypeScript 文件

```typescript
import { ref, onMounted, onUnmounted } from 'vue';

export function useWorker<T extends (...args: any[]) => any>(workerFunction: T) {
    const isRunning = ref(false);
    let worker: Worker | null = null;

    const createWorker = () => {
        const functionBody = workerFunction.toString();
        const blob = new Blob([`onmessage = async (e) => { postMessage(await (${functionBody})(...e.data)); };`], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    };

    const callWorker = (...args: Parameters<T>): Promise<ReturnType<T>> => {
        if (!worker) {
            worker = createWorker();
        }
        isRunning.value = true;

        return new Promise((resolve, reject) => {
            if (!worker) return;

            worker.onmessage = (e) => {
                isRunning.value = false;
                resolve(e.data);
            };

            worker.onerror = (err) => {
                isRunning.value = false;
                reject(err);
            };

            worker.postMessage(args);
        });
    };

    const terminateWorker = () => {
        if (worker) {
            worker.terminate();
            worker = null;
            isRunning.value = false;
        }
    };

    onMounted(() => {
        // Optionally initialize the worker on mount
    });

    onUnmounted(() => {
        terminateWorker();
    });

    return [callWorker, { isRunning, terminateWorker }] as const;
}
```

## 注意事项

1. 传入的函数必须是纯函数，不能依赖外部变量。
2. Worker 的生命周期需要手动管理，避免内存泄漏。
3. 如果需要传递复杂数据，请确保数据可以被结构化克隆。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进此项目。

## 许可证

MIT License  