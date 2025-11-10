export type PlanType = 'free' | 'monthly' | 'yearly' | 'lifetime';

export type  Plan = {
    name: string,
    price: number,
    period: string
}