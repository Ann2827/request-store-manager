class BlobResponse {
  public static async parse(response: Response): Promise<Blob> {
    let result;
    try {
      result = await response.blob();
    } catch {
      result = new Blob();
    }
    return result;
  }

  public static contentType(): string {
    return '';
  }
}

export default BlobResponse;
