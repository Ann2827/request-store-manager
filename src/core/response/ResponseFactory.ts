import type { IResponseBase } from '@types';

import ArrayBufferResponse from './ArrayBuffer';
import BlobResponse from './Blob';
import BytesResponse from './Bytes';
import FormDataResponse from './FormData';
import JsonResponse from './Json';
import TextResponse from './Text';

export type TResponseFormat = 'json' | 'text' | 'formData' | 'bytes' | 'blob' | 'arrayBuffer';

const map = new Map<TResponseFormat, IResponseBase>([
  ['json', JsonResponse],
  ['text', TextResponse],
  ['formData', FormDataResponse],
  ['bytes', BytesResponse],
  ['blob', BlobResponse],
  ['arrayBuffer', ArrayBufferResponse],
]);

/**
 * Организовыват работу с разными форматами данных при запросах.
 */
class ResponseFactory {
  public static async parse(response: Response, format: TResponseFormat = 'json') {
    switch (format) {
      case 'text': {
        return TextResponse.parse(response);
      }
      case 'formData': {
        return FormDataResponse.parse(response);
      }
      case 'bytes': {
        return BytesResponse.parse(response);
      }
      case 'blob': {
        return BlobResponse.parse(response);
      }
      case 'arrayBuffer': {
        return ArrayBufferResponse.parse(response);
      }
      default: {
        return JsonResponse.parse(response);
      }
    }
  }

  public static stringify(data: any, format: TResponseFormat = 'json'): BodyInit {
    const ResponseClass = map.get(format) || JsonResponse;
    return ResponseClass.stringify(data);
  }

  public static requestContentType(format: TResponseFormat) {
    const ResponseClass = map.get(format) || JsonResponse;
    return ResponseClass.contentType;
  }

  public static getFormat(contentType?: string): TResponseFormat {
    switch (contentType) {
      case TextResponse.contentType: {
        return 'text';
      }
      case FormDataResponse.contentType: {
        return 'formData';
      }
      case BytesResponse.contentType: {
        return 'bytes';
      }
      case BlobResponse.contentType: {
        return 'blob';
      }
      case ArrayBufferResponse.contentType: {
        return 'arrayBuffer';
      }
      default: {
        return 'json';
      }
    }
  }
}

export default ResponseFactory;
