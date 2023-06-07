import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/User.entity';
import { AdminUserSignUpDto } from './dtos/dto';
import { ProjectUserPassword } from '../project/entities/ProjectUserPassword.entity';
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

  // #region Private Methods
  private removeProperties(
    data: Record<string, unknown>,
    propertyFields: string[],
  ) {
    for (const propertyField of propertyFields) {
      propertyField in data && delete data[propertyField];
    }
    return data;
  }

  private sanitizeUserData(
    userData: User | AdminUserSignUpDto,
    fields?: string[],
  ) {
    ('length' in fields && fields.length > 0) || (fields = ['password']);
    this.removeProperties(
      userData as unknown as Record<string, unknown>,
      fields,
    );
  }

  private transferUserEntity(userDto: AdminUserSignUpDto): User {
    const user = new User();
    Object.assign(user, userDto);
    return user;
  }

  private createProjectUserPassword(
    userId: string,
    passwordHash: string,
  ): ProjectUserPassword {
    const newProjectUserPassword = new ProjectUserPassword();
    newProjectUserPassword.password = passwordHash;
    newProjectUserPassword.userId = userId;
    return newProjectUserPassword;
  }

  private pickUserProperties(
    user: User,
  ): Pick<
    User,
    'id' | 'firstName' | 'lastName' | 'middleName' | 'email' | 'createdAt'
  > {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
  // #endregion

  async createUser(userDto: AdminUserSignUpDto) {
    const password = userDto.password;
    const passwordHash = await this.sharedService.hashPassword(password);
    this.sanitizeUserData(userDto);

    // *Create the user entity.
    let user = this.transferUserEntity(userDto);

    await this.dbSource.transaction(async (transactionManager) => {
      user = await transactionManager.save(user);

      // *Add password.
      const newProjectUserPassword = this.createProjectUserPassword(
        user.id,
        passwordHash,
      );

      await transactionManager.save(newProjectUserPassword);
    });

    return this.pickUserProperties(user);
  }

  signPayload(userData: Partial<User>) {
    const payloadToken = this.jwtService.sign(userData);
    return payloadToken;
  }

  async createAndSignUserPayload(userDto: AdminUserSignUpDto) {
    const userData = await this.createUser(userDto);
    const authToken = this.signPayload(userData);
    return authToken;
  }
}
