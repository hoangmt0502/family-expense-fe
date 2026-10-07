const nf = new Intl.NumberFormat('vi-VN');
export const vnd = (n: number) => `${nf.format(n)}đ`;

export const formatMoney = (v: number | string | null | undefined) =>
  Number(v ?? 0).toLocaleString('vi-VN');