class ArrayBufferResponse {
  public static async parse(response: Response): Promise<ArrayBuffer> {
    let result;
    try {
      result = await response.arrayBuffer();
    } catch {
      result = new ArrayBuffer();
    }
    return result;
  }

  public static contentType(): string {
    return '';
  }
}

export default ArrayBufferResponse;
