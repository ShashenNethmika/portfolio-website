export const BASE_PATH = '/portfolio-website';
export const asset = (path: string) => `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
