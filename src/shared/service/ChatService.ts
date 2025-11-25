import {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";

// 构建主任务拆解的提示词
export const buildTasksPrompt = (content: string): string =>
    `你是专业的时间规划助手。用户只会简单描述「他现在想做什么」，你需要：
1) 规划从任务开始到完成的完整流程（主线路）；
2) 为每一个步骤**自行估算一个合理的工时（预计需要多少分钟）**，工时可以是粗略估计，但要符合常识；
3) 用户不会给出每一步的时长，一切由你根据任务类型和经验自动判断。

只输出 JSON 数组，不要任何解释、说明或 markdown 文本。

用户任务描述：${content}

输出数组元素格式：
{
  "id": 数字,
  "task": "步骤标题",
  "duration": 数字（预估工时的数值）,
  "unit": "minute" | "hour" | "day"（工时单位：小于60用minute，60分钟到24小时用hour，超过24小时用day）,
  "remark": "详细说明（可选，例如该步骤的目标/产出或所属阶段）"
}

规划要求：
1) 先根据任务内容，大致判断这是简单 / 中等 / 复杂（长期）任务；
2) 为整个任务规划一条从开始到完成的主线路，覆盖主要阶段（例如：准备 → 规划 → 执行 → 检查/优化 → 收尾/交付）；
3) 所有步骤必须按逻辑顺序排列；
4) 每一步的工时由你根据该步骤的实际工作量自行估算，不要被固定区间限制：
   - 快速操作（如查资料、发邮件）可以是几分钟到半小时；
   - 需要专注的工作（如写代码、设计方案）可以是1-3小时；
   - 大块深度工作（如完整开发一个模块）可以是半天到一天；
   - 跨多天的阶段性工作（如持续学习、迭代优化）可以是几天；
5) 步骤数量根据任务复杂度灵活调整：
   - 快速任务（10分钟到1小时能完成）：拆成 2–5 步即可；
   - 半天到一天的任务：拆成 5–10 步；
   - 多天到一周的任务：拆成 8–15 步；
   - 长期项目（数周到数月）：拆成 12–25 步，覆盖关键里程碑；
6) 在任何情况下都必须至少生成 1 条任务；对于复杂或长期任务，不要只给 1–2 步，一定要覆盖从启动到阶段性完成的完整流程；
7) 不要输出除上述字段外的其他字段（例如 prev、next、state、taskTime、startTime、endTime），这些字段由前端自动计算或填充。

示例：
[{"id":1,"task":"调研竞品网站","duration":30,"unit":"minute","remark":"分析3-5个同类网站的设计和功能"},{"id":2,"task":"设计网站结构","duration":2,"unit":"hour","remark":"规划页面层级、导航和主要模块"},{"id":3,"task":"开发首页","duration":1,"unit":"day","remark":"完成首页的HTML/CSS/JS开发和响应式适配"}]`;

// 构建二次拆解（子任务）提示词
export const buildSplitPrompt = (task: UiTask): string => {
    let estimateInfo = '工时未指定';
    if (task.duration && task.unit) {
        const unitText = task.unit === 'minute' ? '分钟' : task.unit === 'hour' ? '小时' : '天';
        estimateInfo = `预估工时：${task.duration}${unitText}`;
    } else if (task.estimateMinutes) {
        // 兼容旧数据
        estimateInfo = `预估工时：${task.estimateMinutes}分钟`;
    }
    return `你是任务拆解助手。请把选中的父 TODO 进一步细化为更小、可执行的子步骤。
只输出 JSON 数组，不要任何解释、说明或 markdown 文本。

父 TODO：
- 任务名称：${task.task ?? '未命名任务'}
- ${estimateInfo}
- 说明：${task.remark || '无'}

输出数组元素格式：
{
  "id": 数字,
  "task": "子步骤标题",
  "duration": 数字（预估工时的数值）,
  "unit": "minute" | "hour" | "day"（工时单位）,
  "remark": "详细说明（结合父任务上下文，可选）"
}

约束：
1) 所有子步骤必须按逻辑顺序排列；
2) 每个子步骤的工时由你根据实际工作量自行估算，不要被固定区间限制；
3) 所有子步骤的总工时应该大致等于父任务的工时（如果父任务有指定工时）；
4) 在任何情况下都必须至少生成 1 条子步骤；
5) 直接输出 JSON 数组，不要任何其他文字；
6) 不要输出除上述字段外的其他字段（例如 prev、next、state、taskTime、startTime、endTime），这些字段由前端自动计算或填充。

示例：
[{"id":101,"task":"选择前端框架","duration":20,"unit":"minute","remark":"对比React/Vue/Svelte的优劣"},{"id":102,"task":"搭建开发环境","duration":40,"unit":"minute","remark":"安装依赖、配置工具链"}]`;
};

// 解析模型返回的 JSON 文本为 UiTask[]
export const parseTasksJson = (text: string): UiTask[] => {
    let jsonText = text;
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
        jsonText = match[0];
    }

    try {
        const arr = JSON.parse(jsonText);
        if (!Array.isArray(arr)) return [];

        const mapped: UiTask[] = arr.map((item: any, i: number) => ({
            id: item.id ?? i + 1,
            task: item.title || item.task || 'Untitled',
            // 新字段：duration + unit
            duration: item.duration || undefined,
            unit: item.unit || undefined,
            // 兼容旧数据的 estimateMinutes
            estimateMinutes: item.estimateMinutes || item.estimate_minutes || undefined,
            remark: item.remark || '',
            state: item.state || 'pending',
            // 兼容旧数据的时间字段
            taskTime: item.taskTime,
            startTime: item.startTime,
            endTime: item.endTime,
            // 保留层级结构字段（但 level 和 parentId 不应该从 AI 返回，只在前端设置）
            level: item.level !== undefined ? item.level : undefined,
            parentId: item.parentId !== undefined ? item.parentId : undefined,
            children: item.children,
            collapsed: item.collapsed
        }));

        // 根据顺序填充 prev/next（使用相邻任务的 id）
        for (let i = 0; i < mapped.length; i++) {
            const prev = i > 0 ? mapped[i - 1]?.id : undefined;
            const next = i < mapped.length - 1 ? mapped[i + 1]?.id : undefined;
            mapped[i].prev = prev as number | undefined;
            mapped[i].next = next as number | undefined;
        }

        return mapped;
    } catch (err) {
        console.error('Parse error:', err);
        return [];
    }
};

// 统一计算一维任务列表的 prev/next 链接（可被外部复用）
export const applyPrevNext = (arr: UiTask[]): UiTask[] => arr.map((t, i) => ({
    ...t,
    prev: i > 0 ? arr[i - 1]?.id : undefined,
    next: i < arr.length - 1 ? arr[i + 1]?.id : undefined,
}));

// 调用后端接口，请求任务拆解
export const requestTasks = async (
    userText: string,
    signal?: AbortSignal
): Promise<UiTask[]> => {
    const prompt = buildTasksPrompt(userText);

    const apiUrl = "/service/v1/chat";
    const body = {
        model: "deepseek-chat",
        messages: [{role: "user", content: prompt}],
        temperature: 0.7,
        max_tokens: 2048, // 增加到 2048，确保能返回完整的任务列表（10-30个任务）
    };

    const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
        signal,
    });

    if (!resp.ok) {
        throw new Error(`API request failed with status ${resp.status}`);
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || '';
    return parseTasksJson(text);
};
