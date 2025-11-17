# Schedule 模块重构说明

## 📋 重构目标
按照**单一职责原则**重构 schedule 模块，将代码拆分为独立的、职责明确的模块。

## 🏗️ 新的目录结构

```
src/views/schedule/
├── components/          # UI 组件
│   ├── Calendar.tsx    # 日历表格组件（纯展示）
│   ├── Mform.tsx       # 任务表单组件
│   ├── TCard.tsx       # 任务卡片组件
│   ├── Modal.tsx       # 模态框组件
│   └── WorkHoursConfig.tsx  # 工作时段配置组件
├── utils/              # 工具函数
│   └── timeUtils.ts    # 时间相关工具函数
├── services/           # 数据服务
│   └── taskService.ts  # 任务数据处理服务
├── constants/          # 常量定义
│   └── index.ts        # 状态选项、时间选项等
├── index.tsx           # 页面入口（包含所有业务逻辑）
└── README.md           # 本文档
```

## 📦 模块职责划分

### 1. **utils/timeUtils.ts** - 时间工具函数
**职责**: 处理所有时间相关的计算和生成

- `generateFullDayHours()` - 生成24小时时间数组
- `generateTimeTableSlots()` - 生成时间段数组
- `generateWeekHeaders()` - 生成周日期头部
- `calculateSkipMap()` - 计算表格跨行映射

### 2. **services/taskService.ts** - 任务数据服务
**职责**: 处理任务的 CRUD 操作和本地存储

- `loadAllTasks()` - 从本地缓存读取所有任务
- `saveAllTasks()` - 保存任务到本地缓存
- `getTasksLocal()` - 按条件查询任务
- `addTaskLocal()` - 新增任务
- `updateTaskLocal()` - 更新任务

### 3. **constants/index.ts** - 常量定义
**职责**: 定义应用级常量

- `stateOptions` - 任务状态选项
- `timeOptions` - 时间选项

### 4. **components/Calendar.tsx** - 日历组件
**职责**: 纯展示组件，显示周视图日历表格

**Props**:
- `tasks` - 任务列表
- `currentDate` - 当前日期
- `isPastWeek` - 是否为历史周
- `onEditTask` - 编辑任务回调
- `onAddTask` - 添加任务回调

**特点**: 
- 无状态管理
- 无数据获取
- 只负责渲染

### 5. **index.tsx** - 页面入口组件
**职责**: 容器组件，管理所有业务逻辑和状态

**功能**:
- 管理任务列表状态
- 处理用户交互
- 调用数据服务
- 协调所有子组件
- 周切换逻辑
- 表单验证和提交

## ✅ 重构成果

### 修复的问题
1. ✅ 移除了未定义的变量和函数（`fullDayHours`, `loadAllTasks`, `STORAGE_KEY` 等）
2. ✅ 消除了代码重复（时间生成逻辑、skipMap 计算等）
3. ✅ 明确了组件职责边界
4. ✅ 提高了代码可测试性
5. ✅ 增强了代码可维护性
6. ✅ 简化了组件结构（将容器逻辑移至 index.tsx）

### 单一职责体现
- **工具函数**: 只负责计算，无副作用
- **数据服务**: 只负责数据存取，不涉及UI
- **常量模块**: 只定义常量，不包含逻辑
- **Calendar组件**: 只负责展示，不管理状态
- **index.tsx**: 作为页面入口，统一管理业务逻辑和状态

## 🔄 使用示例

### 使用工具函数
```typescript
import {generateWeekHeaders, generateTimeTableSlots} from '../utils/timeUtils';

const headers = generateWeekHeaders(moment());
const slots = generateTimeTableSlots();
```

### 使用数据服务
```typescript
import {getTasksLocal, addTaskLocal} from '../services/taskService';

const tasks = getTasksLocal({userId: 1, startDate: '2024-01-01'});
const newTask = addTaskLocal({task: '新任务', taskTime: '2024-01-01'});
```

### 使用 Calendar 组件
```typescript
<Calendar
    tasks={tasks}
    currentDate={currentDate}
    isPastWeek={isPastWeek}
    onEditTask={handleEdit}
    onAddTask={handleAdd}
/>
```

## 🎯 最佳实践

1. **保持组件纯净**: Calendar 组件不应包含业务逻辑
2. **集中数据管理**: 所有数据操作通过 taskService
3. **复用工具函数**: 避免重复的时间计算逻辑
4. **类型安全**: 所有函数都有明确的类型定义
5. **可测试性**: 每个模块都可以独立测试

## 📝 后续优化建议

1. 考虑使用 React Context 或状态管理库（如 Zustand）管理全局任务状态
2. 将 taskService 改为使用 API 而非本地存储
3. 添加单元测试覆盖工具函数和服务
4. 考虑使用 React Query 管理服务端状态
5. 添加错误边界和加载状态处理
