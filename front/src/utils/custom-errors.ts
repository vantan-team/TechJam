/**
 * fetch()に関連するエラー
 */
export class FetchError extends Error {
  /**
   * HTTPステータスコード
   */
  status: number;

  constructor(message: string, params: { status: number }) {
    super(message);
    this.name = "FetchError";
    this.status = params.status;
    
    // プロトタイプチェーンの修正（TypeScriptでのカスタムエラー対応）
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}