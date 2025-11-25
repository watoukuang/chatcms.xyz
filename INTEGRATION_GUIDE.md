# Setting 与 Schedule 集成指南

## 概述

本项目已实现 Setting.tsx 和 Schedule 组件之间的完整闭环集成，并使用 IndexedDB 进行数据持久化存储。

## 核心功能

### 1. 工作时段设置（Setting.tsx）

Setting 组件提供以下配置选项：

- **工作日选择**：选择一周中的工作日（周一至周日）
- **工作时段**：设置每日工作开始和结束时间
- **休息时段**：支持添加多个休息时间段（如午休）
- **总工时计算**：自动计算扣除休息后的实际工作时长

### 2. 日程表集成（Schedule）

Schedule 组件会自动应用 Setting 中的配置：

- **时间范围限制**：日程表只显示工作时段内的时间
- **工作日高亮**：工作日正常显示，非工作日显示灰色背景和 🏖️ 图标
- **休息时段标记**：休息时段显示琥珀色背景和 ☕ 图标
- **交互限制**：非工作日和休息时段不可添加任务

### 3. IndexedDB 数据存储

#### 存储架构

```
aitodo_db (数据库)
├── tasks (任务存储)
│   ├── id (主键，自增)
│   ├── taskTime (索引)
│   └── state (索引)
├── settings (设置存储)
│   └── key (主键)
└── work_hours (工作时间存储)
    └── id (主键)
```

#### 数据同步策略

- **双写机制**：同时写入 IndexedDB 和 localStorage
- **降级处理**：IndexedDB 失败时自动降级到 localStorage
- **自动迁移**：首次使用时自动从 localStorage 迁移数据到 IndexedDB

## 技术实现

### 1. 数据流

```
Setting.tsx
    ↓ (保存设置)
AppSettingsProvider (Context)
    ↓ (提供设置)
Schedule.tsx
    ↓ (应用设置)
Calendar.tsx (渲染日程表)
```

### 2. 关键文件

#### 存储层
- `src/shared/utils/indexedDB.ts` - IndexedDB 服务
- `src/shared/cached/indexedDBCached.ts` - 任务缓存（IndexedDB）
- `src/shared/cached/index.ts` - 统一缓存接口
- `src/shared/utils/storage.ts` - localStorage 服务

#### 业务层
- `src/provider/AppSettingsProvider.tsx` - 设置状态管理
- `src/layout/components/Setting.tsx` - 设置界面
- `src/views/schedule/index.tsx` - 日程表主组件
- `src/views/schedule/components/Calendar.tsx` - 日历组件
- `src/views/schedule/utils/timeUtils.ts` - 时间工具函数

### 3. 核心 API

#### IndexedDB 服务

```typescript
import indexedDB, { STORES } from '@/src/shared/utils/indexedDB';

// 保存数据
await indexedDB.set(STORES.TASKS, taskData);

// 获取数据
const task = await indexedDB.get(STORES.TASKS, taskId);

// 获取所有数据
const tasks = await indexedDB.getAll(STORES.TASKS);

// 按索引查询
const tasks = await indexedDB.getByIndex(STORES.TASKS, 'taskTime', '2024-01-01');

// 按范围查询
const range = IDBKeyRange.bound('2024-01-01', '2024-01-31');
const tasks = await indexedDB.getByRange(STORES.TASKS, 'taskTime', range);

// 删除数据
await indexedDB.delete(STORES.TASKS, taskId);

// 批量操作
await indexedDB.bulkPut(STORES.TASKS, tasksArray);
```

#### 任务缓存 API

```typescript
import {
    loadAllTasks,
    getTasksLocalAsync,
    addTaskLocal,
    updateTaskLocal,
    deleteTaskLocal,
    initMigration
} from '@/src/shared/cached';

// 初始化（自动迁移数据）
await initMigration();

// 加载所有任务（异步）
const tasks = await loadAllTasks();

// 按日期范围查询
const tasks = await getTasksLocalAsync({
    startDate: '2024-01-01',
    endDate: '2024-01-31'
});

// 添加任务（同步接口，异步保存到 IndexedDB）
const newTask = addTaskLocal({
    taskTime: '2024-01-15',
    startTime: '09:00',
    endTime: '10:00',
    task: '会议',
    state: 'pending'
});

// 更新任务
const updatedTask = updateTaskLocal(task);

// 删除任务
deleteTaskLocal(taskId);
```

#### 设置管理 API

```typescript
import { useAppSettings } from '@/src/provider/AppSettingsProvider';

function MyComponent() {
    const { workHoursSettings, updateWorkHoursSettings } = useAppSettings();
    
    // 读取设置
    console.log(workHoursSettings.workDays); // [1, 2, 3, 4, 5]
    console.log(workHoursSettings.startTime); // "09:00"
    console.log(workHoursSettings.endTime); // "18:00"
    
    // 更新设置
    updateWorkHoursSettings({
        ...workHoursSettings,
        startTime: '08:00',
        endTime: '17:00'
    });
}
```

## 使用示例

### 1. 配置工作时段

1. 点击顶部导航栏的设置图标（⚙️）
2. 选择工作日（如：周一至周五）
3. 设置工作时间（如：09:00 - 18:00）
4. 添加休息时段（如：12:00 - 13:00 午休）
5. 点击"保存配置"

### 2. 查看日程表

1. 导航到 Schedule 页面
2. 日程表会自动显示：
   - 只显示工作时段（09:00 - 18:00）
   - 工作日正常显示
   - 非工作日（周六、周日）显示灰色背景
   - 休息时段（12:00 - 13:00）显示琥珀色背景

### 3. 添加任务

1. 在工作日的工作时段点击空白单元格
2. 填写任务信息
3. 提交后任务会保存到 IndexedDB
4. 同时备份到 localStorage

## 数据持久化

### 存储优先级

1. **IndexedDB**（主存储）
   - 容量大（通常 50MB+）
   - 支持索引和复杂查询
   - 异步操作，性能好

2. **localStorage**（备份存储）
   - 容量小（5-10MB）
   - 同步操作
   - 兼容性好

### 数据安全

- **自动备份**：每次写入 IndexedDB 时同时备份到 localStorage
- **故障恢复**：IndexedDB 失败时自动使用 localStorage
- **数据迁移**：首次使用时自动从 localStorage 迁移到 IndexedDB

## 视觉指示器

### Calendar 单元格状态

| 状态 | 背景色 | 图标 | 说明 |
|------|--------|------|------|
| 工作时段 | 白色 | - | 可添加任务 |
| 休息时段 | 琥珀色 | ☕ | 不可添加任务 |
| 非工作日 | 灰色 | 🏖️ | 不可添加任务 |
| 历史周 | 白色（半透明） | - | 不可编辑 |

## 性能优化

1. **懒加载**：IndexedDB 数据按需加载
2. **批量操作**：支持批量添加/更新任务
3. **索引查询**：使用 IndexedDB 索引加速查询
4. **缓存策略**：localStorage 作为快速缓存层

## 浏览器兼容性

- **IndexedDB**：支持所有现代浏览器（Chrome 24+, Firefox 16+, Safari 10+, Edge 12+）
- **localStorage**：支持所有浏览器
- **降级策略**：不支持 IndexedDB 时自动使用 localStorage

## 故障排查

### 数据未同步

1. 检查浏览器控制台是否有错误
2. 确认 IndexedDB 是否被浏览器禁用
3. 尝试清除浏览器缓存后重新加载

### 设置未生效

1. 确认已点击"保存配置"按钮
2. 检查是否看到成功提示
3. 刷新页面查看是否生效

### 性能问题

1. 检查 IndexedDB 数据量（建议定期清理旧数据）
2. 使用开发者工具的 Performance 面板分析
3. 考虑增加数据分页加载

## 未来扩展

1. **云端同步**：支持多设备数据同步
2. **导入导出**：支持数据导入导出功能
3. **数据统计**：基于 IndexedDB 的高级数据分析
4. **离线支持**：完整的 PWA 离线功能
5. **数据加密**：敏感数据加密存储

## 开发指南

### 添加新的存储对象

1. 在 `indexedDB.ts` 中添加新的 STORE 常量
2. 在 `onupgradeneeded` 中创建对象存储
3. 创建对应的缓存服务文件
4. 导出统一的 API 接口

### 扩展工作时段功能

1. 在 `AppSettingsProvider.tsx` 中扩展 `WorkHoursSettings` 接口
2. 在 `Setting.tsx` 中添加 UI 控件
3. 在 `timeUtils.ts` 中添加相应的计算逻辑
4. 在 `Calendar.tsx` 中应用新的设置

## 总结

通过 Setting 和 Schedule 的闭环集成，以及 IndexedDB 的数据持久化，系统实现了：

✅ 统一的工作时段管理
✅ 自动化的日程表配置
✅ 可靠的数据存储
✅ 良好的用户体验
✅ 完善的降级策略

这为后续功能扩展奠定了坚实的基础。
