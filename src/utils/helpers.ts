import { HttpException, HttpStatus } from '@nestjs/common';

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
