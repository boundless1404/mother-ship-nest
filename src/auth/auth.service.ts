import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import User from './entities/User.entity';
import { merge, pick } from 'lodash';
import { AdminUserSignUpDto } from './dtos/user.dto';
import { ProjectUserPassword } from './entities/ProjectUserPassword.entity';
import { SharedService } from 'src/shared/shared.service';

@Injectable()
export class AuthService {
  constructor(
    private dbSource: DataSource,
    private sharedService: SharedService,
    private jwtService: JwtService,
  ) {
    //
  }

  async createUser(userDto: AdminUserSignUpDto) {
    const password = userDto.password;
    const passwordHash = await this.sharedService.hashPassword(password);
    delete userDto.password;

    // *Create the user entity.
    let user = new User();
    user = merge(user, userDto);

    await this.dbSource.transaction(async (transactionManager) => {
      user = await transactionManager.save(user);

      // *Add password.
      const newProjectUserPassword = new ProjectUserPassword();
      newProjectUserPassword.password = passwordHash;
      newProjectUserPassword.userId = user.id;

      await transactionManager.save(newProjectUserPassword);
    });

    return pick<User>(user, [
      'id',
      'firstName',
      'lastName',
      'middleName',
      'email',
      'createdAt',
    ]);
  }

  signPayload(userData: Partial<User>) {
    const payloadToken = this.jwtService.sign(userData);
    return payloadToken;
  }

  async createAndSignUserPayload(userDto: AdminUserSignUpDto) {
    const userData = await this.createUser(userDto);
    const authToken = await this.signPayload(userData);
    return authToken;
  }
}
