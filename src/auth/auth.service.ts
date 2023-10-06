import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { User } from './entities/User.entity';
import { AdminUserSignInDto, AdminUserSignUpDto } from './dtos/dto';
import { ProjectUserPassword } from '../project/entities/ProjectUserPassword.entity';
import { SharedService } from 'src/shared/shared.service';
import { throwBadRequest } from 'src/utils/helpers';
import { AuthPayload } from 'src/lib/types';

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
    (fields && 'length' in fields && fields.length > 0) ||
      (fields = ['password']);
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

  async createUser(
    userDto: AdminUserSignUpDto,
    { transactionManager }: { transactionManager?: EntityManager } = {},
  ): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    email: string;
    createdAt: Date;
  }> {
    /**
     * Creates a new user in the system.
     *
     * @param userDto - An object containing the user's details such as first name, last name, email, and password.
     * @param transactionManager - An optional parameter used for handling database transactions.
     * @returns An object containing the selected properties of the created user entity, including the user's ID, first name, last name, middle name, email, and creation date.
     */
    const dbManager = transactionManager || this.dbSource.manager;
    const password = userDto.password;
    const passwordHash = await this.sharedService.hashPassword(password);
    this.sanitizeUserData(userDto);

    // *Create the user entity.
    let user = this.transferUserEntity(userDto);

    await dbManager.transaction(async (transactionManager) => {
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

  signPayload(authPayload: AuthPayload, jwtExpiry?: string | number) {
    const payloadToken = this.jwtService.sign(authPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: jwtExpiry || '24h',
    });
    return payloadToken;
  }

  async createAndSignUserPayload(userDto: AdminUserSignUpDto) {
    let token = '';
    await this.dbSource.transaction(async (transactionManager) => {
      const userData = await this.createUser(userDto, { transactionManager });
      token = this.signPayload({ userData }, '30d');
    });
    return { token };
  }

  async signInUser(userDto: AdminUserSignInDto) {
    const { email, password } = userDto;
    const user = await this.dbSource.manager.findOne(User, {
      where: { email },
    });
    if (!user) {
      throw new Error('User not found');
    }

    // * Get project user password.
    const projectUserPassword = await this.dbSource.manager.findOne(
      ProjectUserPassword,
      {
        where: { userId: user.id },
      },
    );

    const passwordHash = projectUserPassword?.password || '';

    const passwordMatch = await this.sharedService.comparePassword(
      password,
      passwordHash,
    );

    if (!passwordMatch) {
      throwBadRequest('Password does not match');
    }

    const userData = this.pickUserProperties(user);
    const token = this.signPayload({ userData } as AuthPayload);
    return { token };
  }
}
