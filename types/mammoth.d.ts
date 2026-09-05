declare module "mammoth" {
  export interface ConvertResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  export interface ConvertOptions {
    arrayBuffer: ArrayBuffer;
  }

  const mammoth: {
    convertToHtml(options: ConvertOptions): Promise<ConvertResult>;
    extractRawText(options: ConvertOptions): Promise<ConvertResult>;
  };

  export default mammoth;
}
