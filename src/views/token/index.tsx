"use client"

import React, {useMemo, useRef, useState, useCallback} from 'react'
import * as CryptoJS from 'crypto-js'
import type {MiniBlock, Tx, ComputerBoard, StepStatus} from '../../../types/block'
import BlockChainFull from '../../../components/coinbase/BlockChainFull'
import TokenCfg, {type TokenCfgRef} from '../../../components/token/TokenCfg'
import Computer from '../../../components/coinbase/Computer'

export default function TokenPage(): React.ReactElement {
    const [difficulty, setDifficulty] = useState<number>(4)
    const [txs, setTxs] = useState<Tx[]>([])
    const cfgRef = useRef<TokenCfgRef>(null)
    const [loading, setLoading] = useState(false)
    const [miningProgress, setMiningProgress] = useState<{ [key: number]: { nonce: number, progress: number } }>({})
    const [paused, setPaused] = useState<boolean>(false)
    const pausedRef = useRef(false)
    const stopRef = useRef(false)

    const [board, setBoard] = useState<ComputerBoard[]>([
        {
            title: '代币矿工',
            steps: [
                {title: '初始化', status: 'wait'},
                {title: '打包交易', status: 'wait'},
                {title: '挖矿计算', status: 'wait'},
                {title: '广播区块', status: 'wait'}
            ]
        }
    ])

    const [blocks, setBlocks] = useState<MiniBlock[]>([{
        height: 1,
        nonce: 49691,
        data: '第一笔交易记录数据',
        previous: '0'.repeat(64),
        timestamp: Date.now(),
        hash: '0000b61c8bb61a6faa7c46e4872623b6e5ebcfa4bcb5dc279f56aa96a365e5a',
        award: '0',
        miner: 'Genesis',
        txs: []
    }])

    const pattern = useMemo(() => '0'.repeat(Math.max(0, Math.min(7, difficulty))), [difficulty])
    const nextHeight = blocks.length + 1
    const lastBlock = blocks[blocks.length - 1]

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const resetSteps = () => {
        setBoard(prev => prev.map(b => ({
            title: b.title,
            steps: b.steps.map(s => ({title: s.title, status: 'wait' as StepStatus}))
        })))
        setMiningProgress({})
    }

    const setStep = (idx: number, pos: number, status: StepStatus) => {
        setBoard(prev => {
            const next = [...prev]
            next[idx] = {
                ...next[idx],
                steps: next[idx].steps.map((step, i) =>
                    i === pos ? {...step, status} : step
                )
            }
            return next
        })
    }

    const runMine = useCallback(async () => {
        if (txs.length === 0) {
            alert('请先添加交易记录！')
            return
        }

        setLoading(true)
        setPaused(false)
        pausedRef.current = false
        stopRef.current = false
        resetSteps()

        try {
            // 步骤 1: 初始化
            setStep(0, 0, 'process')
            await sleep(500)
            setStep(0, 0, 'finish')

            // 步骤 2: 打包交易
            await sleep(300)
            setStep(0, 1, 'process')
            await sleep(1000)
            setStep(0, 1, 'finish')

            // 步骤 3: 挖矿计算
            await sleep(500)
            setStep(0, 2, 'process')

            const ts = Date.now()
            let nonce = 0
            let foundHash = ''
            const checkInterval = 200 // 每200个nonce更新一次进度

            while (nonce < 500000) {
                // 检查暂停和停止
                if (pausedRef.current) {
                    await sleep(100)
                    continue
                }

                if (stopRef.current) {
                    setStep(0, 2, 'error')
                    return
                }

                // 进度更新
                if (nonce % checkInterval === 0) {
                    setMiningProgress({
                        0: {
                            nonce,
                            progress: Math.floor((nonce / 500000) * 100)
                        }
                    })
                    await sleep(50)
                }

                const input = `${nextHeight}${nonce}${lastBlock.hash}${ts}${JSON.stringify(txs)}`
                const h = CryptoJS.SHA256(input).toString()
                if (h.startsWith(pattern)) {
                    foundHash = h
                    // 完成时设置100%
                    setMiningProgress({
                        0: {nonce, progress: 100}
                    })
                    break
                }
                nonce++
            }

            setStep(0, 2, 'finish')

            // 步骤 4: 广播区块
            await sleep(200)
            setStep(0, 3, 'process')

            const newBlock: MiniBlock = {
                height: nextHeight,
                nonce,
                data: JSON.stringify(txs),
                previous: lastBlock.hash,
                timestamp: ts,
                hash: foundHash,
                award: '0',
                miner: 'token Miner',
                txs: txs.length ? txs : undefined,
            }

            setBlocks(prev => [...prev, newBlock])
            await sleep(800)
            setStep(0, 3, 'finish')
        } catch (e) {
            console.error('挖矿过程中出现错误:', e)
            setStep(0, 2, 'error')
        } finally {
            setLoading(false)
        }
    }, [txs, nextHeight, lastBlock, pattern])

    const reset = () => {
        setBlocks([{
            height: 1,
            nonce: 49691,
            data: '第一笔交易记录数据',
            previous: '0'.repeat(64),
            timestamp: Date.now(),
            hash: '0000b61c8bb61a6faa7c46e4872623b6e5ebcfa4bcb5dc279f56aa96a365e5a',
            award: '0',
            miner: 'Genesis',
            txs: []
        }])
        setTxs([])
        setMiningProgress({})
        cfgRef.current?.reset()
        resetSteps()
    }

    return (
        <div className="px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* 控制面板 */}
                <div
                    className="mb-6 p-4 rounded-lg border bg-white border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">代币转账演示</h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">难度</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={7}
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(Number(e.target.value))}
                                    className="accent-yellow-500"
                                />
                                <span
                                    className="w-6 text-right text-sm text-gray-700 dark:text-gray-300">{difficulty}</span>
                            </div>
                            <button
                                onClick={reset}
                                className="px-3 py-1.5 rounded text-sm border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50 dark:bg-black/20 dark:border-white/20 dark:text-white"
                            >重置链
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span>当前链长度: {blocks.length} | 下一区块高度: {nextHeight}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={runMine}
                                disabled={loading || txs.length === 0}
                                className="px-4 py-2 rounded text-sm border bg-white text-green-700 border-green-300 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-transparent dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500/10"
                            >{loading ? '⛏️ 打包中...' : '⛏️ 生成新区块'}</button>
                            <button
                                onClick={() => {
                                    pausedRef.current = true;
                                    setPaused(true);
                                }}
                                disabled={!loading || paused}
                                className="px-3 py-1.5 rounded text-sm border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50 dark:bg-black/20 dark:border-white/20 dark:text-white"
                            >暂停
                            </button>
                            <button
                                onClick={() => {
                                    pausedRef.current = false
                                    setPaused(false)
                                }}
                                disabled={!paused}
                                className="px-3 py-1.5 rounded text-sm border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50 dark:bg-black/20 dark:border-white/20 dark:text-white"
                            >继续
                            </button>
                            <button
                                onClick={() => {
                                    stopRef.current = true;
                                    setPaused(false);
                                }}
                                disabled={!loading}
                                className="px-3 py-1.5 rounded text-sm border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50 dark:bg-black/20 dark:border-white/20 dark:text-white"
                            >停止
                            </button>
                        </div>
                    </div>
                </div>

                {/* 主要内容区域 */}
                <div className="space-y-6 mb-6">
                    {/* 上排：配置区域 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <TokenCfg
                                ref={cfgRef}
                                onTxsChange={(list) => setTxs(list)}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <Computer items={board} miningProgress={miningProgress}/>
                        </div>
                    </div>

                    {/* 下排：区块链展示 */}
                    <div
                        className="rounded-lg border bg-white border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-red-500 dark:text-red-400">区块链</h3>
                        </div>

                        <div className="p-4">
                            <div className="border border-yellow-400 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className="text-sm font-medium text-green-600 dark:text-green-400">代币演示链</span>
                                </div>
                                <BlockChainFull blocks={blocks}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
