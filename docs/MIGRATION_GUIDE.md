# 迁移到自适应日程系统指南

## 快速开始

### 1. 替换 Calendar 组件

**之前（使用固定小时刻度）：**

```tsx
import Calendar from '@/src/views/schedule/components/Calendar';

<Calendar
    tasks={tasks}
    currentDate={currentDate}
    isPastWeek={isPastWeek}
    onEditTask={handleEdit}
    onAddTask={handleAdd}
    workHoursSettings={workHours}
/>
```

**现在（使用自适应刻度）：**

```tsx
import AdaptiveCalendar from '@/src/views/schedule/components/AdaptiveCalendar';

<AdaptiveCalendar
    tasks={tasks}
    currentDate={currentDate}
    isPastWeek={isPastWeek}
    onEditTask={handleEdit}
    onAddTask={handleAdd}
    workHoursSettings={workHours}
/>
```

**变化**：
- 组件名从 `Calendar` 改为 `AdaptiveCalendar`
- Props 完全兼容，无需修改
- 自动支持分钟级时间和自适应刻度

### 2. 更新任务数据（如果需要）

如果你的任务数据中时间是整点（如 `09:00`），无需修改。

如果你想支持分钟级时间，只需修改时间字符串：

```typescript
// 之前
const task = {
    startTime: '09:00',
    endTime: '10:00',
};

// 现在（支持分钟）
const task = {
    startTime: '09:07',  // 任意分钟
    endTime: '09:35',
};
```

### 3. 添加排期标记（可选但推荐）

为了更好地跟踪任务是否已排期，建议添加标记字段：

```typescript
const task = {
    // ... 其他字段
    scheduledDate: '2025-01-15',  // 已排期的日期
    isScheduled: true,             // 快速判断标记
};
```

## 详细迁移步骤

### Step 1: 安装依赖（如果需要）

确保项目中已安装 `moment`：

```bash
npm install moment
# 或
yarn add moment
```

### Step 2: 更新 schedule/index.tsx

找到你的固定日程页面（通常是 `src/views/schedule/index.tsx`），做以下修改：

```tsx
// 1. 更新导入
- import Calendar from '@/src/views/schedule/components/Calendar';
+ import AdaptiveCalendar from '@/src/views/schedule/components/AdaptiveCalendar';

// 2. 替换组件
- <Calendar
+ <AdaptiveCalendar
    tasks={tasks}
    currentDate={currentDate}
    isPastWeek={isPastWeek}
    onEditTask={handleEditTask}
    onAddTask={handleAddTask}
    workHoursSettings={workHoursSettings}
/>
```

### Step 3: 更新首页任务添加逻辑（如果有）

如果你的首页有"添加到日程"功能，确保它保留分钟精度：

```tsx
const handleAddToSchedule = (task: SimpleTask) => {
    addTaskLocal({
        taskTime: task.taskTime || moment().format('YYYY-MM-DD'),
        startTime: task.startTime || '09:00',  // 保持原始时间
        endTime: task.endTime || '10:00',      // 不要强制改成整点
        task: task.task || '',
        remark: task.remark || '',
        state: task.state || 'pending',
        // 添加排期标记
        scheduledDate: task.taskTime,
        isScheduled: true,
    });
};
```

### Step 4: 测试

1. **测试整点任务**：
   - 创建几个整点任务（09:00-10:00, 11:00-12:00）
   - 检查日程视图是否使用"1小时"刻度
   - 确认任务显示正常

2. **测试分钟任务**：
   - 创建一个分钟任务（09:07-09:35）
   - 检查日程视图是否自动切换到"5分钟"或"15分钟"刻度
   - 确认任务位置精确

3. **测试混合场景**：
   - 同时有整点和分钟任务
   - 检查刻度是否选择最细的那个
   - 确认所有任务都能正确显示

## 兼容性说明

### 向后兼容

- ✅ 旧的整点时间数据（09:00, 10:00）完全兼容
- ✅ 没有 `scheduledDate` 字段的任务也能正常显示
- ✅ 原有的 `Calendar` 组件仍然可用（如果你不想迁移）

### 数据格式

**时间格式要求**：
- ✅ `HH:mm` 格式（如 `09:07`, `14:23`）
- ❌ 不支持秒（`HH:mm:ss`）
- ❌ 不支持 12 小时制（`09:07 AM`）

**日期格式要求**：
- ✅ `YYYY-MM-DD` 格式（如 `2025-01-15`）
- ❌ 不支持其他格式

## 常见迁移问题

### Q1: 迁移后任务显示不正确

**可能原因**：时间格式不符合要求

**解决方案**：
```typescript
// 检查时间格式
console.log(task.startTime); // 应该是 "09:07" 而不是 "9:7" 或 "09:07:00"

// 如果格式不对，转换一下
const normalizedTime = moment(task.startTime, ['HH:mm', 'H:mm', 'HH:mm:ss']).format('HH:mm');
```

### Q2: 刻度一直是"5分钟"，太密集了

**可能原因**：某个任务的时间包含了非整点分钟

**解决方案**：
```typescript
// 找出所有非整点任务
const nonHourTasks = tasks.filter(t => {
    const startMin = parseInt(t.startTime?.split(':')[1] || '0');
    const endMin = parseInt(t.endTime?.split(':')[1] || '0');
    return startMin !== 0 || endMin !== 0;
});
console.log('非整点任务：', nonHourTasks);

// 如果你想用小时刻度，把这些任务的时间改成整点
```

### Q3: 首页和固定日程的任务不同步

**可能原因**：使用了两套数据源

**解决方案**：
```typescript
// 确保使用同一个 tasks 数组
// ❌ 错误：分别维护
const [homeTasks, setHomeTasks] = useState([]);
const [scheduleTasks, setScheduleTasks] = useState([]);

// ✅ 正确：共享数据源
const [tasks, setTasks] = useState([]);
// 首页和固定日程都用这个 tasks
```

### Q4: 任务拖拽后位置不对

**可能原因**：`AdaptiveCalendar` 目前还不支持拖拽（计划中）

**临时方案**：
- 点击任务打开编辑弹窗
- 手动修改时间
- 保存后会自动更新位置

## 性能优化建议

### 1. 大量任务场景

如果一周有超过 100 个任务：

```tsx
// 使用 useMemo 缓存刻度计算
const timeScale = useMemo(
    () => getAdaptiveTimeScale(tasks),
    [tasks]
);
```

### 2. 频繁切换周

```tsx
// 使用 React.memo 避免不必要的重渲染
const MemoizedAdaptiveCalendar = React.memo(AdaptiveCalendar);

<MemoizedAdaptiveCalendar
    tasks={tasks}
    currentDate={currentDate}
    // ...
/>
```

## 回滚方案

如果迁移后遇到问题，可以快速回滚：

```tsx
// 1. 改回旧组件
- import AdaptiveCalendar from '@/src/views/schedule/components/AdaptiveCalendar';
+ import Calendar from '@/src/views/schedule/components/Calendar';

- <AdaptiveCalendar
+ <Calendar
    tasks={tasks}
    // ...
/>

// 2. 旧组件仍然可用，数据格式兼容
```

## 下一步

迁移完成后，你可以：

1. 阅读 [使用指南](./ADAPTIVE_SCHEDULE_GUIDE.md) 了解更多特性
2. 尝试创建分钟级任务，体验自适应刻度
3. 等待后续功能更新（拖拽、批量对齐等）

## 需要帮助？

如果遇到问题：

1. 检查控制台是否有错误信息
2. 确认时间格式是否正确（`HH:mm`）
3. 查看 [常见问题](./ADAPTIVE_SCHEDULE_GUIDE.md#常见问题)
4. 提交 Issue 或联系开发团队
