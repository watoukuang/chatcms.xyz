export type Network = 'usdt_trc20' | 'usdt_erc20' | 'usdt_bep20';

export interface USDTNetwork {
    id: Network;
    name: string;
    symbol: string;
    network: string;
    contractAddress?: string;
    decimals: number;
    minAmount: number;
    confirmations: number;
    fee: number;
}

export interface OrderDTO {
    plan_type: string,
    network: string
}

export interface Order {
    amount: number;
    network: string;
    qrCode: string;
    address: string;
}

export interface OrderDetail {
    id: string;
    planType: string;
    amount: number;
    currency: string; // USDT
    network: string;
    state: string; // created | paid | confirmed | expired | cancelled
    address: string;
    senderAddress?: string | null;
    tx?: string | null;
    created: string; // ISO date string
    updated: string; // ISO date string
}

export interface OrderVO {
    id: string;
    user_id: string;
    plan_type: string;
    amount: number;
    currency: string; // USDT
    network: string;
    state: string; // created | paid | confirmed | expired | cancelled
    address: string;
    sender_address?: string | null;
    tx?: string | null;
    created: string; // ISO date string
    updated: string; // ISO date string
}


