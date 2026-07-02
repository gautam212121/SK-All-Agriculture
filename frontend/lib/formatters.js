export function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function formatAmount(value, fallback = 0) {
    return toNumber(value, fallback).toFixed(2);
}
