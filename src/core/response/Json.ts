class JsonResponse {
  public static async parse(response: Response): Promise<any> {
    let result;
    try {
      result = await response.json();
    } catch {
      result = {};
    }
    return result;
  }

  public static contentType(): string {
    return 'application/json';
  }
}

export default JsonResponse;
