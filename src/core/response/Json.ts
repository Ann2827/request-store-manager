class JsonResponse {
  public static async parse(response: Response): Promise<number | boolean | object> {
    let result: number | boolean | object;
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
