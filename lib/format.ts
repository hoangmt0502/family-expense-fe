const nf = new Intl.NumberFormat('vi-VN');
export const vnd = (n: number) => `${nf.format(n)}đ`;
