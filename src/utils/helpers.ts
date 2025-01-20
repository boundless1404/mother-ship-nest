import { HttpException, HttpStatus } from '@nestjs/common';
import { DEFAULT_TOKEN_EXPIRY } from 'src/lib/projectConstants';

export function createObject<T>(propsValues?: Partial<T>): T {
  const objectTypeBluePrint = getConstructor(propsValues);
  return new objectTypeBluePrint();
}

export function getConstructor<T>(propsValues?: Partial<T>) {
  return class {
    constructor() {
      if (propsValues) {
        Object.assign(this, propsValues);
      }
    }
  } as new () => T;
}

export function trimObject(
  propsValues: Record<string, any>,
  propsToDelete: string[],
) {
  return propsToDelete.reduce((prev, curr) => {
    if (curr in prev) {
      delete prev[curr];
    }
    return prev;
  }, propsValues);
}

// export const encoder = new Hashids(process.env.APP_KEY, 6, '0123456789BCDGTN');
// export const encodeId = (id: string): string => {
//   return encoder.encode(id);
// };

// export const decodeId = (hash: string): string | false => {
//   try {
//     const data = encoder.decode(hash);
//     if (!data || isEmpty(data) || get(data, '0', 'undefined') === 'undefined')
//       return false;

//     return String(data[0]);
//   } catch {
//     return false;
//   }
// };

export const throwBadRequest = (message: string) => {
  throw new HttpException(message, HttpStatus.BAD_REQUEST);
};

export const throwForbidden = (message: string) => {
  throw new HttpException(message, HttpStatus.FORBIDDEN);
};

export function getTokenExpiry(tokenExpiry?: string | number) {
  let expiry = DEFAULT_TOKEN_EXPIRY;
  if (typeof tokenExpiry === 'number') {
    expiry = tokenExpiry;
  }
  if (typeof tokenExpiry === 'string') {
    // check token contains 'h' or 'd' to determine if it is in hours or days
    const isHour = tokenExpiry.includes('h');

    expiry =
      parseInt(tokenExpiry.slice(0, tokenExpiry.length - 2)) *
      (isHour ? 60 * 60 : 60 * 60 * 24);

    expiry = parseInt(tokenExpiry);
  }

  return expiry;
}
