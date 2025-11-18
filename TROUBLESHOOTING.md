# 数据刷新丢失问题排查指南

## 问题描述

保存任务后，刷新页面数据消失。

## 已修复的问题

### 1. 缺少数据加载的 useEffect

**问题**：`fetchTasksForCurrentUser` 函数定义了但从未被调用。

**修复**：在 `src/views/schedule/index.tsx` 中添加了：

```typescript
// 加载任务数据
useEffect(() => {
    fetchTasksForCurrentUser();
}, [fetchTasksForCurrentUser]);
```

### 2. 添加了调试日志

在关键位置添加了 console.log，帮助追踪数据流：

- 📅 加载任务数据
- ✅ 加载到的任务数量
- 💾 保存任务
- ✅ 任务已保存
- 📋 更新后的任务列表

## 排查步骤

### 步骤 1：检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 刷新页面，查看日志输出

**预期看到的日志：**
```
💡 调试工具已加载，使用方法:
📅 加载任务数据: {startDate: "2024-11-18", endDate: "2024-11-24"}
✅ 加载到的任务数量: X [...]
```

### 步骤 2：使用调试工具检查存储

在浏览器控制台执行：

```javascript
// 检查所有存储
await debugStorage.checkAll()

// 只检查 LocalStorage
debugStorage.checkLocalStorage()

// 只检查 IndexedDB
await debugStorage.checkIndexedDB()
```

**预期结果：**
- LocalStorage 和 IndexedDB 中都应该有相同数量的任务
- 如果数量不一致，说明同步有问题

### 步骤 3：测试保存功能

```javascript
// 测试保存一个任务
await debugStorage.testSave()

// 再次检查
await debugStorage.checkAll()
```

### 步骤 4：检查浏览器存储

#### 检查 LocalStorage

1. 开发者工具 → Application 标签
2. 左侧 Storage → Local Storage
3. 查找 `scrum_tasks` 键
4. 查看值是否为任务数组

#### 检查 IndexedDB

1. 开发者工具 → Application 标签
2. 左侧 Storage → IndexedDB
3. 展开 `aitodo_db` 数据库
4. 查看 `tasks` 对象存储
5. 检查是否有数据

## 常见问题及解决方案

### 问题 1：LocalStorage 有数据，但页面显示为空

**可能原因：**
- 数据加载逻辑未执行
- 日期范围过滤导致任务被过滤掉

**解决方案：**
1. 检查控制台是否有 "📅 加载任务数据" 日志
2. 检查任务的 `taskTime` 是否在当前周范围内
3. 尝试切换到不同的周查看

### 问题 2：保存后立即显示，刷新后消失

**可能原因：**
- 保存到内存成功，但未持久化到存储
- 浏览器禁用了 LocalStorage 或 IndexedDB

**解决方案：**
1. 检查控制台是否有保存成功的日志
2. 执行 `debugStorage.checkLocalStorage()` 确认数据已保存
3. 检查浏览器设置是否允许存储

### 问题 3：IndexedDB 保存失败

**可能原因：**
- 浏览器不支持 IndexedDB
- 隐私模式下 IndexedDB 被禁用
- 存储配额已满

**解决方案：**
1. 检查控制台是否有 IndexedDB 错误
2. 尝试在普通模式（非隐私模式）下使用
3. 清理浏览器存储：`debugStorage.clearAll()`

### 问题 4：数据不一致

**可能原因：**
- LocalStorage 和 IndexedDB 同步失败
- 多标签页同时操作导致冲突

**解决方案：**
1. 执行 `await debugStorage.checkAll()` 查看差异
2. 清空所有数据重新开始：`await debugStorage.clearAll()`
3. 只在一个标签页操作

## 调试命令速查

```javascript
// 快速检查
await debugStorage.checkAll()

// 查看 LocalStorage
debugStorage.checkLocalStorage()

// 查看 IndexedDB
await debugStorage.checkIndexedDB()

// 测试保存
await debugStorage.testSave()

// 导出备份
await debugStorage.exportData()

// 清空所有数据（谨慎使用）
await debugStorage.clearAll()
```

## 数据流程图

```
用户添加任务
    ↓
handleOk() 验证表单
    ↓
persistTaskLocal() 保存任务
    ↓
├─ addTaskLocal() / updateTaskLocal()
│   ├─ 保存到 LocalStorage (同步)
│   └─ 保存到 IndexedDB (异步)
    ↓
setTasks() 更新界面
    ↓
用户刷新页面
    ↓
useEffect 触发
    ↓
fetchTasksForCurrentUser()
    ↓
getTasksLocal() 从 LocalStorage 读取
    ↓
setTasks() 显示任务
```

## 预防措施

1. **定期备份数据**
   ```javascript
   await debugStorage.exportData()
   ```

2. **监控存储大小**
   ```javascript
   debugStorage.checkLocalStorage() // 查看 size 字段
   ```

3. **避免多标签页同时操作**
   - 同时打开多个标签页可能导致数据冲突

4. **使用现代浏览器**
   - Chrome 24+
   - Firefox 16+
   - Safari 10+
   - Edge 12+

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. 浏览器版本和操作系统
2. 控制台完整日志
3. `debugStorage.checkAll()` 的输出结果
4. 复现步骤

## 开发者注意事项

### 在开发环境中测试

1. 打开 Schedule 页面
2. 打开浏览器控制台
3. 添加一个任务
4. 观察控制台日志
5. 执行 `await debugStorage.checkAll()`
6. 刷新页面
7. 再次执行 `await debugStorage.checkAll()`
8. 对比数据是否一致

### 添加更多日志

如果需要更详细的调试信息，可以在以下位置添加日志：

- `src/shared/cached/index.ts` - 缓存操作
- `src/shared/utils/storage.ts` - LocalStorage 操作
- `src/shared/utils/indexedDB.ts` - IndexedDB 操作
- `src/views/schedule/index.tsx` - 组件生命周期

### 性能监控

使用 Performance API 监控数据加载性能：

```javascript
performance.mark('load-start');
const tasks = getTasksLocal({startDate, endDate});
performance.mark('load-end');
performance.measure('load-tasks', 'load-start', 'load-end');
console.log(performance.getEntriesByName('load-tasks'));
```
