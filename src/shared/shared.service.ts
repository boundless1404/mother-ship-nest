import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';

@Injectable()
export class SharedService {
  constructor(private config: ConfigService) {
    //
  }

  async hashPassword(data: string | Buffer) {
    const saltRounds = this.config.get('HASH_SALT_ROUNDS') || 10;
    const hashedPassword = await hash(data, saltRounds);
    return hashedPassword;
  }
}
