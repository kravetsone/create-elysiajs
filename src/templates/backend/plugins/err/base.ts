export function getErrorBase() {
  return `// src/errors/base.ts
export class CustomError extends Error {
  status: number;
  originalError?: unknown;

  constructor(message: string, status: number = 500, originalError?: unknown) {
    super(message);
    this.status = status;
    this.originalError = originalError;

    // 修复 TypeScript 原型链问题
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
`;
}