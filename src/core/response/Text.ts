class TextResponse {
  public static async parse(response: Response): Promise<string> {
    let result;
    try {
      result = await response.text();
    } catch {
      result = '';
    }
    return result;
  }

  public static contentType(): string {
    //TODO: add text/javascript text/css
    return 'text/html';
  }
}

export default TextResponse;
