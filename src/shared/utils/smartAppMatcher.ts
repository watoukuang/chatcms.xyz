/**
 * 智能应用匹配工具
 * 根据任务内容匹配合适的智能应用
 */

import {TaskNode} from '../types/task';

/**
 * 智能应用接口
 */
export interface SmartApp {
    id: string;
    name: string;
    description: string;
    category: string;
    keywords: string[];          // 关键词
    capabilities: string[];       // 能力标签
    apiEndpoint?: string;         // API端点
    icon?: string;
    enabled: boolean;
    usageCount?: number;
    rating?: number;
}

/**
 * 匹配结果
 */
export interface MatchResult {
    app: SmartApp;
    score: number;               // 匹配分数 0-100
    matchedKeywords: string[];   // 匹配到的关键词
    reason: string;              // 匹配原因
}

/**
 * 关键词权重配置
 */
const KEYWORD_WEIGHTS = {
    title: 3,        // 标题中的关键词权重最高
    description: 2,  // 描述中的关键词次之
    tags: 1.5,       // 标签中的关键词
};

/**
 * 预定义的智能应用模板
 */
export const BUILTIN_SMART_APPS: SmartApp[] = [
    {
        id: 'email_assistant',
        name: '邮件助手',
        description: '自动处理邮件相关任务，包括发送、回复、整理等',
        category: '办公',
        keywords: ['邮件', 'email', '发送', '回复', '联系', '通知'],
        capabilities: ['send_email', 'reply_email', 'organize_inbox'],
        enabled: true,
        icon: '📧',
        rating: 4.5,
    },
    {
        id: 'content_generator',
        name: '内容生成器',
        description: '生成文章、报告、文档等文本内容',
        category: '写作',
        keywords: ['写', '文章', '报告', '文档', '内容', '生成', '撰写'],
        capabilities: ['generate_text', 'summarize', 'rewrite'],
        enabled: true,
        icon: '✍️',
        rating: 4.7,
    },
    {
        id: 'meeting_scheduler',
        name: '会议安排助手',
        description: '自动安排会议时间，发送邀请，管理议程',
        category: '办公',
        keywords: ['会议', '安排', '预约', '日程', '议程', 'meeting'],
        capabilities: ['schedule_meeting', 'send_invite', 'manage_agenda'],
        enabled: true,
        icon: '📅',
        rating: 4.3,
    },
    {
        id: 'data_analyzer',
        name: '数据分析器',
        description: '分析数据，生成图表和报告',
        category: '数据',
        keywords: ['数据', '分析', '统计', '图表', '报表', 'excel'],
        capabilities: ['analyze_data', 'generate_chart', 'create_report'],
        enabled: true,
        icon: '📊',
        rating: 4.6,
    },
    {
        id: 'code_reviewer',
        name: '代码审查助手',
        description: '自动审查代码，提供改进建议',
        category: '开发',
        keywords: ['代码', '审查', 'review', '检查', '优化', '编程'],
        capabilities: ['review_code', 'suggest_improvements', 'find_bugs'],
        enabled: true,
        icon: '💻',
        rating: 4.8,
    },
    {
        id: 'translation_helper',
        name: '翻译助手',
        description: '多语言翻译和本地化',
        category: '语言',
        keywords: ['翻译', 'translate', '英语', '中文', '语言', '本地化'],
        capabilities: ['translate', 'localize', 'proofread'],
        enabled: true,
        icon: '🌐',
        rating: 4.4,
    },
    {
        id: 'social_media_manager',
        name: '社交媒体管理',
        description: '管理社交媒体账号，发布内容，分析数据',
        category: '营销',
        keywords: ['社交', '媒体', '发布', '推广', '营销', 'social'],
        capabilities: ['post_content', 'schedule_posts', 'analyze_engagement'],
        enabled: true,
        icon: '📱',
        rating: 4.2,
    },
    {
        id: 'research_assistant',
        name: '研究助手',
        description: '搜集资料，整理信息，生成研究报告',
        category: '研究',
        keywords: ['研究', '调研', '资料', '信息', '搜集', '整理'],
        capabilities: ['search_info', 'organize_data', 'generate_summary'],
        enabled: true,
        icon: '🔍',
        rating: 4.5,
    },
];

/**
 * 提取文本中的关键词
 */
function extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // 简单的关键词提取：分词并过滤
    const words = text
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1);
    
    return [...new Set(words)];
}

/**
 * 计算两个关键词列表的相似度
 */
function calculateKeywordSimilarity(
    keywords1: string[],
    keywords2: string[]
): {score: number; matched: string[]} {
    const set1 = new Set(keywords1.map(k => k.toLowerCase()));
    const set2 = new Set(keywords2.map(k => k.toLowerCase()));
    
    const matched: string[] = [];
    let matchCount = 0;
    
    set1.forEach(keyword => {
        if (set2.has(keyword)) {
            matched.push(keyword);
            matchCount++;
        }
    });
    
    // 使用 Jaccard 相似度
    const union = new Set([...set1, ...set2]);
    const score = union.size > 0 ? (matchCount / union.size) * 100 : 0;
    
    return {score, matched};
}

/**
 * 匹配单个智能应用
 */
function matchSingleApp(
    task: TaskNode,
    app: SmartApp
): MatchResult | null {
    if (!app.enabled) {
        return null;
    }
    
    let totalScore = 0;
    const matchedKeywords: string[] = [];
    const reasons: string[] = [];
    
    // 从任务中提取关键词
    const titleKeywords = extractKeywords(task.title);
    const descKeywords = task.description ? extractKeywords(task.description) : [];
    const tagKeywords = task.tags || [];
    
    // 匹配标题
    const titleMatch = calculateKeywordSimilarity(titleKeywords, app.keywords);
    if (titleMatch.score > 0) {
        totalScore += titleMatch.score * KEYWORD_WEIGHTS.title;
        matchedKeywords.push(...titleMatch.matched);
        reasons.push(`标题匹配 (${titleMatch.matched.join(', ')})`);
    }
    
    // 匹配描述
    if (descKeywords.length > 0) {
        const descMatch = calculateKeywordSimilarity(descKeywords, app.keywords);
        if (descMatch.score > 0) {
            totalScore += descMatch.score * KEYWORD_WEIGHTS.description;
            matchedKeywords.push(...descMatch.matched);
            reasons.push(`描述匹配 (${descMatch.matched.join(', ')})`);
        }
    }
    
    // 匹配标签
    if (tagKeywords.length > 0) {
        const tagMatch = calculateKeywordSimilarity(tagKeywords, app.keywords);
        if (tagMatch.score > 0) {
            totalScore += tagMatch.score * KEYWORD_WEIGHTS.tags;
            matchedKeywords.push(...tagMatch.matched);
            reasons.push(`标签匹配 (${tagMatch.matched.join(', ')})`);
        }
    }
    
    // 归一化分数到 0-100
    const normalizedScore = Math.min(100, totalScore);
    
    // 只返回分数大于阈值的匹配
    if (normalizedScore < 10) {
        return null;
    }
    
    return {
        app,
        score: Math.round(normalizedScore),
        matchedKeywords: [...new Set(matchedKeywords)],
        reason: reasons.join('; '),
    };
}

/**
 * 匹配任务到智能应用
 * @param task 任务
 * @param apps 可用的智能应用列表（可选，默认使用内置应用）
 * @param maxResults 最大返回结果数
 */
export function matchSmartApps(
    task: TaskNode,
    apps: SmartApp[] = BUILTIN_SMART_APPS,
    maxResults: number = 5
): MatchResult[] {
    const results: MatchResult[] = [];
    
    apps.forEach(app => {
        const match = matchSingleApp(task, app);
        if (match) {
            results.push(match);
        }
    });
    
    // 按分数降序排序
    results.sort((a, b) => b.score - a.score);
    
    // 返回前N个结果
    return results.slice(0, maxResults);
}

/**
 * 检查任务是否可以被某个智能应用处理
 */
export function canAppHandleTask(
    task: TaskNode,
    app: SmartApp,
    minScore: number = 30
): boolean {
    const match = matchSingleApp(task, app);
    return match !== null && match.score >= minScore;
}

/**
 * 批量匹配任务
 */
export function batchMatchTasks(
    tasks: TaskNode[],
    apps: SmartApp[] = BUILTIN_SMART_APPS
): Map<string, MatchResult[]> {
    const results = new Map<string, MatchResult[]>();
    
    tasks.forEach(task => {
        const matches = matchSmartApps(task, apps);
        if (matches.length > 0) {
            results.set(task.id, matches);
        }
    });
    
    return results;
}

/**
 * 获取推荐的智能应用（基于使用频率和评分）
 */
export function getRecommendedApps(
    apps: SmartApp[] = BUILTIN_SMART_APPS,
    limit: number = 3
): SmartApp[] {
    return apps
        .filter(app => app.enabled)
        .sort((a, b) => {
            // 综合评分和使用次数
            const scoreA = (a.rating || 0) * 0.7 + (a.usageCount || 0) * 0.3;
            const scoreB = (b.rating || 0) * 0.7 + (b.usageCount || 0) * 0.3;
            return scoreB - scoreA;
        })
        .slice(0, limit);
}

/**
 * 按类别分组智能应用
 */
export function groupAppsByCategory(
    apps: SmartApp[] = BUILTIN_SMART_APPS
): Map<string, SmartApp[]> {
    const groups = new Map<string, SmartApp[]>();
    
    apps.forEach(app => {
        if (!app.enabled) return;
        
        const category = app.category || '其他';
        if (!groups.has(category)) {
            groups.set(category, []);
        }
        groups.get(category)!.push(app);
    });
    
    return groups;
}

/**
 * 搜索智能应用
 */
export function searchApps(
    query: string,
    apps: SmartApp[] = BUILTIN_SMART_APPS
): SmartApp[] {
    if (!query) return apps.filter(app => app.enabled);
    
    const queryLower = query.toLowerCase();
    
    return apps.filter(app => {
        if (!app.enabled) return false;
        
        return (
            app.name.toLowerCase().includes(queryLower) ||
            app.description.toLowerCase().includes(queryLower) ||
            app.keywords.some(k => k.toLowerCase().includes(queryLower)) ||
            app.category.toLowerCase().includes(queryLower)
        );
    });
}

/**
 * 调用智能应用处理任务（模拟）
 */
export async function invokeSmartApp(
    app: SmartApp,
    task: TaskNode,
    params?: Record<string, any>
): Promise<{
    success: boolean;
    result?: any;
    error?: string;
}> {
    // 这里是模拟实现，实际应该调用真实的API
    try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟成功响应
        return {
            success: true,
            result: {
                appId: app.id,
                appName: app.name,
                taskId: task.id,
                taskTitle: task.title,
                message: `${app.name} 已成功处理任务: ${task.title}`,
                timestamp: new Date().toISOString(),
                ...params,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || '调用智能应用失败',
        };
    }
}

/**
 * 生成匹配报告
 */
export function generateMatchReport(matches: MatchResult[]): string {
    if (matches.length === 0) {
        return '未找到匹配的智能应用';
    }
    
    const lines = ['找到以下匹配的智能应用：\n'];
    
    matches.forEach((match, index) => {
        lines.push(
            `${index + 1}. ${match.app.name} (${match.app.icon || ''})`
        );
        lines.push(`   匹配度: ${match.score}%`);
        lines.push(`   原因: ${match.reason}`);
        lines.push(`   描述: ${match.app.description}\n`);
    });
    
    return lines.join('\n');
}
