class BytesResponse {
  public static async parse(response: Response): Promise<Uint8Array> {
    let result;
    try {
      result = await response.bytes();
    } catch {
      result = new Uint8Array();
    }
    return result;
  }

  public static contentType(): string {
    return '';
  }
}

export default BytesResponse;
