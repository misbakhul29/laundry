function formatCurrency(n: number) {
    const sign = n < 0 ? '-' : '';
    return `${sign}$${Math.abs(n).toFixed(2)}`;
}
export default formatCurrency;