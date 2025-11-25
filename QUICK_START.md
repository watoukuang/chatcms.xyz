# 🚀 快速开始指南

> 如何在现有页面中使用新增的功能

## 📦 安装依赖

所有新功能已集成到现有项目中，无需额外安装依赖。

---

## 1️⃣ 使用权限控制

### 基础用法

```tsx
import Access from '@/src/components/Access';

function MyComponent() {
    return (
        <Access permission="login_required">
            <button>需要登录的功能</button>
        </Access>
    );
}
```

### 所有权限类型

```tsx
// 需要登录
<Access permission="login_required">...</Access>

// 发布到市场（需要登录）
<Access permission="publish_market">...</Access>

// 提交智能应用（需要登录）
<Access permission="submit_app">...</Access>

// 使用系统模型（需要付费）
<Access permission="use_system_model">...</Access>

// 高级功能（需要付费）
<Access permission="advanced_features">...</Access>

// AI生成（所有人可用）
<Access permission="ai_generate">...</Access>

// 本地数据（所有人可用）
<Access permission="local_data">...</Access>

// 浏览市场（所有人可用）
<Access permission="browse_market">...</Access>
```

### 自定义提示

```tsx
<Access 
    permission="publish_market"
    fallback={<div>请先登录才能发布任务</div>}
>
    <PublishButton />
</Access>
```

### 编程式检查

```tsx
import {useAccess} from '@/src/shared/hooks/useAccess';

function MyComponent() {
    const {checkPermission, isAuthenticated, isPaidPlan} = useAccess();
    
    const {hasPermission, reason} = checkPermission('publish_market');
    
    if (!hasPermission) {
        console.log('无权限：', reason);
    }
    
    return <div>...</div>;
}
```

---

## 2️⃣ 使用任务链功能

### 创建任务和子任务

```tsx
import {createTaskNode, addSubtask, buildTaskTree} from '@/src/shared/utils/taskChain';

function TaskManager() {
    // 创建父任务
    const parentTask = createTaskNode('准备团建活动', {
        description: '组织一次团队建设',
        priority: 'high',
        estimatedDuration: 480
    });
    
    // 添加子任务
    const subtasks = [
        addSubtask(parentTask, {
            title: '确定时间地点',
            estimatedDuration: 30
        }),
        addSubtask(parentTask, {
            title: '预订场地',
            estimatedDuration: 60
        }),
        addSubtask(parentTask, {
            title: '准备活动物资',
            estimatedDuration: 120
        })
    ];
    
    // 构建任务树用于展示
    const allTasks = [parentTask, ...subtasks];
    const tree = buildTaskTree(allTasks);
    
    return <TaskTreeView tree={tree} />;
}
```

### 删除任务前检查

```tsx
import {canDeleteTask, deleteTaskWithChildren} from '@/src/shared/utils/taskChain';

function handleDelete(task: TaskNode, allTasks: TaskNode[]) {
    const {canDelete, hasChildren, reason} = canDeleteTask(task);
    
    if (hasChildren) {
        const confirmed = confirm(
            `${reason}\n确定要删除吗？`
        );
        
        if (!confirmed) return;
    }
    
    // 获取要删除的所有任务ID（包括子任务）
    const deletedIds = deleteTaskWithChildren(task.id, allTasks);
    
    // 从数据中移除
    const newTasks = allTasks.filter(t => !deletedIds.includes(t.id));
    setTasks(newTasks);
}
```

### 检查任务依赖

```tsx
import {canStartTask} from '@/src/shared/utils/taskChain';

function TaskCard({task, allTasks}: {task: TaskNode, allTasks: TaskNode[]}) {
    const {canStart, reason, pendingDependencies} = canStartTask(task, allTasks);
    
    return (
        <div>
            <h3>{task.title}</h3>
            {!canStart && (
                <div className="warning">
                    ⚠️ {reason}
                    <ul>
                        {pendingDependencies?.map(id => (
                            <li key={id}>待完成: {allTasks.find(t => t.id === id)?.title}</li>
                        ))}
                    </ul>
                </div>
            )}
            <button disabled={!canStart}>开始任务</button>
        </div>
    );
}
```

---

## 3️⃣ 使用时间冲突检测

### 添加任务前检测冲突

```tsx
import {detectTaskConflict, generateConflictReport} from '@/src/shared/utils/timeConflict';

function ScheduleForm() {
    const [existingTasks, setExistingTasks] = useState<ScheduledTask[]>([]);
    
    const handleSubmit = (formData: {date: string, startTime: string, endTime: string}) => {
        // 检测冲突
        const result = detectTaskConflict(formData, existingTasks);
        
        if (result.hasConflict) {
            // 显示冲突提示
            alert(generateConflictReport(result.conflicts));
            return;
        }
        
        // 没有冲突，添加任务
        addTask(formData);
    };
    
    return <form onSubmit={handleSubmit}>...</form>;
}
```

### 自动寻找可用时间

```tsx
import {autoScheduleTask, findAvailableTimeSlots} from '@/src/shared/utils/timeConflict';

function SmartScheduler({task, existingTasks}: Props) {
    const suggestTime = () => {
        // 自动寻找未来7天内的可用时间
        const slot = autoScheduleTask(
            task,
            existingTasks,
            new Date(),
            7,
            '09:00',
            '18:00'
        );
        
        if (slot) {
            return (
                <div className="suggestion">
                    💡 建议时间：{slot.date} {slot.startTime}-{slot.endTime}
                    <button onClick={() => scheduleAt(slot)}>使用此时间</button>
                </div>
            );
        }
        
        return <div>未来7天内无可用时间</div>;
    };
    
    return suggestTime();
}
```

### 查看某天的可用时间段

```tsx
import {findAvailableTimeSlots} from '@/src/shared/utils/timeConflict';

function DayView({date, tasks}: {date: string, tasks: ScheduledTask[]}) {
    const availableSlots = findAvailableTimeSlots(
        date,
        60,  // 需要60分钟
        tasks,
        '09:00',
        '18:00'
    );
    
    return (
        <div>
            <h3>{date} 可用时间段</h3>
            {availableSlots.map((slot, index) => (
                <div key={index}>
                    {slot.startTime} - {slot.endTime}
                </div>
            ))}
        </div>
    );
}
```

---

## 4️⃣ 使用智能应用匹配

### 为任务匹配智能应用

```tsx
import {matchSmartApps, invokeSmartApp} from '@/src/shared/utils/smartAppMatcher';

function TaskDetail({task}: {task: TaskNode}) {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    
    useEffect(() => {
        // 匹配智能应用
        const results = matchSmartApps(task, undefined, 3);
        setMatches(results);
    }, [task]);
    
    const handleInvoke = async (app: SmartApp) => {
        const result = await invokeSmartApp(app, task);
        
        if (result.success) {
            toast.success(`${app.name} 已处理任务`);
        } else {
            toast.error(result.error);
        }
    };
    
    return (
        <div>
            <h3>{task.title}</h3>
            
            {matches.length > 0 && (
                <div className="smart-apps">
                    <h4>🤖 推荐的智能应用</h4>
                    {matches.map(match => (
                        <div key={match.app.id} className="app-card">
                            <div className="app-header">
                                <span>{match.app.icon}</span>
                                <span>{match.app.name}</span>
                                <span className="score">{match.score}%</span>
                            </div>
                            <p>{match.app.description}</p>
                            <p className="reason">匹配原因: {match.reason}</p>
                            <button onClick={() => handleInvoke(match.app)}>
                                使用此应用
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### 检查任务是否可被某应用处理

```tsx
import {canAppHandleTask} from '@/src/shared/utils/smartAppMatcher';

function AppSelector({task, app}: {task: TaskNode, app: SmartApp}) {
    const canHandle = canAppHandleTask(task, app, 30); // 最低30分
    
    return (
        <button disabled={!canHandle}>
            {canHandle ? '使用此应用' : '不适合此任务'}
        </button>
    );
}
```

### 批量匹配多个任务

```tsx
import {batchMatchTasks} from '@/src/shared/utils/smartAppMatcher';

function TaskList({tasks}: {tasks: TaskNode[]}) {
    const matchResults = batchMatchTasks(tasks);
    
    return (
        <div>
            {tasks.map(task => (
                <div key={task.id}>
                    <h4>{task.title}</h4>
                    {matchResults.has(task.id) && (
                        <div>
                            可用应用: {matchResults.get(task.id)?.length}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
```

---

## 5️⃣ 使用任务市场

### 发布任务到市场

```tsx
import {publishTaskToMarket, validatePublishTask} from '@/src/shared/service/taskMarket';
import Access from '@/src/components/Access';

function PublishButton({task}: {task: TaskNode}) {
    const {userDetail} = useAuth();
    
    const handlePublish = async () => {
        // 准备发布数据
        const publishData = {
            title: task.title,
            description: task.description || '',
            category: '开发',
            tags: task.tags || [],
            estimatedDuration: task.estimatedDuration,
            contactInfo: userDetail?.email
        };
        
        // 验证数据
        const {valid, errors} = validatePublishTask(publishData);
        if (!valid) {
            alert('验证失败：\n' + errors.join('\n'));
            return;
        }
        
        // 发布
        const result = await publishTaskToMarket(publishData);
        
        if (result.success) {
            toast.success('任务已发布到市场');
        } else {
            toast.error(result.message);
        }
    };
    
    return (
        <Access permission="publish_market">
            <button onClick={handlePublish}>
                发布到市场
            </button>
        </Access>
    );
}
```

### 浏览市场任务

```tsx
import {getMarketTasks, TASK_CATEGORIES} from '@/src/shared/service/taskMarket';

function MarketplacePage() {
    const [tasks, setTasks] = useState<MarketTask[]>([]);
    const [category, setCategory] = useState('');
    
    useEffect(() => {
        loadTasks();
    }, [category]);
    
    const loadTasks = async () => {
        const result = await getMarketTasks({
            category,
            sortBy: 'latest',
            page: 1,
            pageSize: 20
        });
        
        if (result.success && result.data) {
            setTasks(result.data.tasks);
        }
    };
    
    return (
        <div>
            <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">全部类别</option>
                {TASK_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            
            <div className="task-list">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}
```

---

## 6️⃣ 使用登录认证

### 打开登录弹窗

```tsx
import {useAuthModal} from '@/src/providers/AuthModalProvider';

function Header() {
    const {openLoginModal, openRegisterModal} = useAuthModal();
    const {isAuthenticated, userDetail, logout} = useAuth();
    
    return (
        <header>
            {isAuthenticated ? (
                <div>
                    <span>欢迎, {userDetail?.email}</span>
                    <button onClick={logout}>退出</button>
                </div>
            ) : (
                <div>
                    <button onClick={openLoginModal}>登录</button>
                    <button onClick={openRegisterModal}>注册</button>
                </div>
            )}
        </header>
    );
}
```

### 通过事件打开弹窗

```tsx
// 任何地方都可以触发
function SomeComponent() {
    const handleAction = () => {
        // 打开登录弹窗
        window.dispatchEvent(new CustomEvent('openLoginModal'));
    };
    
    return <button onClick={handleAction}>需要登录</button>;
}
```

### 检查认证状态

```tsx
import {useAuth} from '@/src/shared/hooks/useAuth';

function ProtectedPage() {
    const {isAuthenticated, isLoading, userDetail} = useAuth();
    
    if (isLoading) {
        return <div>加载中...</div>;
    }
    
    if (!isAuthenticated) {
        return <div>请先登录</div>;
    }
    
    return (
        <div>
            <h1>欢迎, {userDetail?.email}</h1>
            {/* 受保护的内容 */}
        </div>
    );
}
```

---

## 💡 实用示例

### 完整的任务详情页

```tsx
import {TaskNode} from '@/src/shared/types/task';
import {matchSmartApps} from '@/src/shared/utils/smartAppMatcher';
import {canStartTask} from '@/src/shared/utils/taskChain';
import {publishTaskToMarket} from '@/src/shared/service/taskMarket';
import Access from '@/src/components/Access';

function TaskDetailPage({task, allTasks}: {task: TaskNode, allTasks: TaskNode[]}) {
    const [smartApps, setSmartApps] = useState([]);
    const {userDetail} = useAuth();
    
    useEffect(() => {
        // 匹配智能应用
        const matches = matchSmartApps(task);
        setSmartApps(matches);
    }, [task]);
    
    // 检查是否可以开始
    const {canStart, reason} = canStartTask(task, allTasks);
    
    // 发布到市场
    const handlePublish = async () => {
        const result = await publishTaskToMarket({
            title: task.title,
            description: task.description || '',
            category: '其他',
            tags: task.tags || [],
            contactInfo: userDetail?.email
        });
        
        if (result.success) {
            toast.success('已发布到市场');
        }
    };
    
    return (
        <div className="task-detail">
            <h1>{task.title}</h1>
            <p>{task.description}</p>
            
            {/* 依赖检查 */}
            {!canStart && (
                <div className="warning">⚠️ {reason}</div>
            )}
            
            {/* 智能应用推荐 */}
            {smartApps.length > 0 && (
                <section>
                    <h2>🤖 推荐的智能应用</h2>
                    {smartApps.map(match => (
                        <AppCard key={match.app.id} match={match} task={task} />
                    ))}
                </section>
            )}
            
            {/* 操作按钮 */}
            <div className="actions">
                <button disabled={!canStart}>开始任务</button>
                
                <Access permission="publish_market">
                    <button onClick={handlePublish}>发布到市场</button>
                </Access>
            </div>
        </div>
    );
}
```

### 智能日程安排

```tsx
import {autoScheduleTask, detectTaskConflict} from '@/src/shared/utils/timeConflict';

function SmartScheduler({task, existingTasks}: Props) {
    const [suggestedSlot, setSuggestedSlot] = useState(null);
    
    const findBestTime = () => {
        const slot = autoScheduleTask(task, existingTasks);
        setSuggestedSlot(slot);
    };
    
    const scheduleTask = (slot) => {
        // 再次检查冲突
        const result = detectTaskConflict(slot, existingTasks);
        
        if (result.hasConflict) {
            alert('时间冲突，请选择其他时间');
            return;
        }
        
        // 添加到日程
        addToSchedule({
            ...task,
            scheduledDate: slot.date,
            scheduledStartTime: slot.startTime,
            scheduledEndTime: slot.endTime
        });
    };
    
    return (
        <div>
            <button onClick={findBestTime}>智能安排</button>
            
            {suggestedSlot && (
                <div className="suggestion">
                    💡 建议时间：
                    {suggestedSlot.date} {suggestedSlot.startTime}-{suggestedSlot.endTime}
                    <button onClick={() => scheduleTask(suggestedSlot)}>
                        确认安排
                    </button>
                </div>
            )}
        </div>
    );
}
```

---

## 🎯 常见场景

### 场景1：用户创建任务并拆分子任务

```tsx
import {createTaskNode, addSubtask} from '@/src/shared/utils/taskChain';

const parentTask = createTaskNode('开发新功能');
const subtask1 = addSubtask(parentTask, {title: '需求分析'});
const subtask2 = addSubtask(parentTask, {title: '编码实现'});
const subtask3 = addSubtask(parentTask, {title: '测试验证'});
```

### 场景2：添加任务到日程时检测冲突

```tsx
import {detectTaskConflict} from '@/src/shared/utils/timeConflict';

const newTask = {date: '2024-11-21', startTime: '14:00', endTime: '15:00'};
const result = detectTaskConflict(newTask, existingTasks);

if (result.hasConflict) {
    showConflictWarning(result.conflicts);
}
```

### 场景3：为任务推荐智能应用

```tsx
import {matchSmartApps} from '@/src/shared/utils/smartAppMatcher';

const matches = matchSmartApps(task);
showRecommendations(matches);
```

### 场景4：发布任务到市场（需要登录）

```tsx
<Access permission="publish_market">
    <button onClick={publishToMarket}>发布</button>
</Access>
```

---

## 📞 需要帮助？

查看完整文档：
- [实施总结](./IMPLEMENTATION_SUMMARY.md)
- [需求文档](./design/0101.md)
- [功能清单](./FEATURES_COMPLETED.md)

**版本**: v2.0.0  
**更新日期**: 2024-11-21
