# 自适应日程系统实现总结

## 改动概览

本次更新实现了"自适应粒度 + 单一数据源"的最优方案，让首页任务规划和固定日程完美协作。

## 文件改动清单

### 1. 数据结构更新

#### `/src/views/home/components/TaskFlow.tsx`
- ✅ 更新 `SimpleTask` 类型定义
- ✅ 添加 `scheduledDate` 和 `isScheduled` 字段
- ✅ 明确注释时间字段支持分钟精度（`HH:mm` 格式）

**改动内容**：
```typescript
export type SimpleTask = {
    // ... 其他字段
    // 时间字段统一使用 HH:mm 格式，支持分钟精度（如 09:07, 14:23）
    startTime?: string; // HH:mm 开始时间（分钟精度）
    endTime?: string;   // HH:mm 结束时间（分钟精度）
    
    // 排期标记：标记任务是否已被安排到固定日程
    scheduledDate?: string; // 已排期的日期 YYYY-MM-DD
    isScheduled?: boolean;  // 是否已排期（快速判断标记）
};
```

### 2. 新增核心工具模块

#### `/src/views/schedule/utils/adaptiveTimeScale.ts` ⭐ 新文件
自适应时间刻度的核心算法实现。

**主要功能**：
- `detectMinGranularity()` - 检测任务列表中的最小时间粒度
- `getAdaptiveTimeScale()` - 根据任务自动选择最合适的时间刻度
- `generateAdaptiveTimeSlots()` - 生成自适应时间槽数组
- `suggestAlignedTime()` - 计算建议对齐时间（智能吸附）
- `calculateTaskPosition()` - 计算任务在时间轴上的精确位置
- `getSubGridPositions()` - 生成辅助刻度线位置

**刻度策略**：
| 检测到的最小粒度 | 选择的刻度 | 间隔 |
|----------------|----------|------|
| 60分钟（整点） | 1小时 | 60分钟 |
| 30分钟 | 30分钟 | 30分钟 |
| 15分钟 | 15分钟 | 15分钟 |
| 5分钟或更细 | 5分钟 | 5分钟 |

### 3. 新增自适应日历组件

#### `/src/views/schedule/components/AdaptiveCalendar.tsx` ⭐ 新文件
基于自适应刻度的周视图日历组件。

**核心特性**：
1. **自动刻度调整**
   - 根据当前任务自动计算最合适的时间刻度
   - 显示当前刻度信息（"当前时间刻度：15分钟"）

2. **辅助刻度线**
   - 在主刻度之间显示虚线辅助线
   - 帮助用户更精确地对齐任务

3. **智能建议提示**
   - 鼠标悬停时高亮显示"建议"标记
   - 引导用户选择合适的时间点

4. **精确任务定位**
   - 任务块使用绝对定位，精确到分钟
   - 支持任意分钟时间（如 09:07-09:35）

5. **周视图支持**
   - 每天一列，独立计算刻度
   - 支持工作日/休息时间/非工作日标记

**组件接口**：
```typescript
interface AdaptiveCalendarProps {
    tasks?: Task[];
    currentDate?: moment.Moment;
    isPastWeek?: boolean;
    onEditTask?: (task: Task) => void;
    onAddTask?: (taskTime: string, startTime: string, endTime: string) => void;
    workHoursSettings?: WorkHoursSettings;
}
```

### 4. 文档

#### `/docs/ADAPTIVE_SCHEDULE_GUIDE.md` ⭐ 新文件
完整的使用指南，包括：
- 核心特性说明
- 数据结构定义
- 使用流程
- 组件API
- 最佳实践
- 常见问题

#### `/docs/MIGRATION_GUIDE.md` ⭐ 新文件
迁移指南，包括：
- 快速开始步骤
- 详细迁移步骤
- 兼容性说明
- 常见问题解决
- 回滚方案

#### `/docs/IMPLEMENTATION_SUMMARY.md` ⭐ 本文件
实现总结和技术细节。

## 技术实现细节

### 1. 自适应刻度算法

```typescript
// 伪代码
function detectMinGranularity(tasks) {
    let minGranularity = 60; // 默认小时
    
    for (task of tasks) {
        // 检查 startTime 的分钟部分
        startMinutes = timeToMinutes(task.startTime);
        startMod = startMinutes % 60;
        
        if (startMod % 30 === 0) minGranularity = min(minGranularity, 30);
        else if (startMod % 15 === 0) minGranularity = min(minGranularity, 15);
        else if (startMod % 5 === 0) minGranularity = min(minGranularity, 5);
        else minGranularity = 1;
        
        // 同样检查 endTime
    }
    
    return minGranularity;
}
```

**优势**：
- O(n) 时间复杂度，n 为任务数量
- 只需扫描一次即可确定刻度
- 支持任意分钟粒度

### 2. 任务精确定位算法

```typescript
function calculateTaskPosition(startTime, endTime, slotHeight, slotInterval, baseTime) {
    // 将时间转换为分钟数
    baseMinutes = timeToMinutes(baseTime);
    startMinutes = timeToMinutes(startTime);
    endMinutes = timeToMinutes(endTime);
    
    // 计算偏移和时长
    offsetMinutes = startMinutes - baseMinutes;
    durationMinutes = endMinutes - startMinutes;
    
    // 转换为像素
    top = (offsetMinutes / slotInterval) * slotHeight;
    height = (durationMinutes / slotInterval) * slotHeight;
    
    return { top, height };
}
```

**示例**：
- 基准时间：09:00
- 任务时间：09:07-09:35
- 槽高度：60px
- 槽间隔：15分钟

计算：
- offsetMinutes = 427 - 540 = 7
- durationMinutes = 575 - 567 = 28
- top = (7 / 15) * 60 = 28px
- height = (28 / 15) * 60 = 112px

### 3. 数据同步机制

**单一数据源原则**：
```typescript
// ❌ 错误：双数据源
const [homeTasks, setHomeTasks] = useState([]);
const [scheduleTasks, setScheduleTasks] = useState([]);

// ✅ 正确：单一数据源
const [tasks, setTasks] = useState<SimpleTask[]>([]);

// 首页和固定日程共享同一个 tasks
// 任何修改都会自动同步
```

**排期标记**：
```typescript
// 添加到日程时
task.scheduledDate = '2025-01-15';
task.isScheduled = true;

// 首页可以根据 isScheduled 显示不同样式
const cardStyle = task.isScheduled 
    ? 'border-green-500' 
    : 'border-gray-300';
```

## 性能优化

### 1. useMemo 缓存

```typescript
// 刻度计算只在任务变化时重新计算
const timeScale = useMemo(
    () => getAdaptiveTimeScale(tasks),
    [tasks]
);

// 时间槽生成只在刻度变化时重新计算
const timeSlots = useMemo(
    () => generateAdaptiveTimeRanges(startHour, endHour, timeScale.interval),
    [startHour, endHour, timeScale.interval]
);
```

### 2. 任务渲染优化

```typescript
// 只渲染当前日期的任务
const dayTasks = tasks.filter(t => t.taskTime === date);

// 使用绝对定位避免重排
<div className="absolute" style={{ top, height }}>
    <TaskCard task={task} />
</div>
```

### 3. 事件处理优化

```typescript
// 使用节流避免频繁计算
const handleCellHover = useMemo(
    () => throttle((date, time) => {
        setDragHint({ date, time });
    }, 100),
    []
);
```

## 兼容性保证

### 1. 向后兼容

- ✅ 旧的整点时间数据完全兼容
- ✅ 没有 `scheduledDate` 的任务也能正常显示
- ✅ 原有 `Calendar` 组件仍然可用

### 2. 数据格式校验

```typescript
// 时间格式检查
const isValidTime = (time: string) => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

// 日期格式检查
const isValidDate = (date: string) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
};
```

## 测试建议

### 1. 单元测试

```typescript
describe('adaptiveTimeScale', () => {
    test('detectMinGranularity - 整点任务', () => {
        const tasks = [
            { startTime: '09:00', endTime: '10:00' },
            { startTime: '11:00', endTime: '12:00' },
        ];
        expect(detectMinGranularity(tasks)).toBe(60);
    });
    
    test('detectMinGranularity - 15分钟任务', () => {
        const tasks = [
            { startTime: '09:15', endTime: '09:45' },
        ];
        expect(detectMinGranularity(tasks)).toBe(15);
    });
    
    test('calculateTaskPosition', () => {
        const pos = calculateTaskPosition('09:07', '09:35', 60, 15, '09:00');
        expect(pos.top).toBeCloseTo(28);
        expect(pos.height).toBeCloseTo(112);
    });
});
```

### 2. 集成测试

- 测试整点任务显示
- 测试分钟任务显示
- 测试混合场景
- 测试刻度自动切换
- 测试任务拖拽（计划中）

### 3. 用户体验测试

- 创建不同粒度的任务，观察刻度变化
- 检查辅助线是否正确显示
- 验证鼠标悬停提示
- 测试周视图切换

## 后续优化计划

### Phase 1: 交互增强（优先级：高）

1. **拖拽支持**
   - 从首页拖拽任务到固定日程
   - 在固定日程内拖拽调整时间
   - 显示实时预览和建议对齐线

2. **快捷对齐**
   - 双击任务边缘弹出对齐菜单
   - 批量整理工具
   - 键盘快捷键支持

### Phase 2: 功能扩展（优先级：中）

1. **冲突检测增强**
   - 实时显示时间冲突
   - 自动建议可用时间段
   - 智能排期算法

2. **视图切换**
   - 日视图/周视图/月视图
   - 每种视图独立的刻度策略
   - 视图间平滑切换

### Phase 3: 性能优化（优先级：中）

1. **虚拟滚动**
   - 大量任务场景优化
   - 只渲染可见区域

2. **增量更新**
   - 只更新变化的任务
   - 减少不必要的重渲染

### Phase 4: 高级功能（优先级：低）

1. **AI 辅助排期**
   - 根据任务优先级自动排期
   - 考虑工作习惯和效率曲线

2. **多人协作**
   - 共享日程
   - 冲突协调

## 总结

本次实现的核心价值：

✅ **数据一致性**：单一时间源，首页和固定日程完全同步  
✅ **交互直观**：所见即所得，不强制吸附，保留用户意图  
✅ **视图自适应**：根据任务粒度自动调整刻度，该粗则粗、该细则细  
✅ **扩展性强**：模块化设计，容易添加新功能  
✅ **性能优良**：使用 useMemo 缓存，避免不必要的计算  
✅ **向后兼容**：不影响现有功能，平滑迁移  

**用户体验提升**：
- 首页可以按分钟精确规划任务
- 固定日程自动适配显示粒度
- 无需手动调整刻度或对齐时间
- 数据永远一致，不会出现"改了这边忘了那边"

**开发体验提升**：
- 清晰的模块划分
- 完善的文档和注释
- 易于测试和维护
- 容易扩展新功能

这套系统为后续的功能迭代打下了坚实的基础。
