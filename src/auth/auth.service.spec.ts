// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import { AdminUserSignUpDto } from './dtos/dto';

// describe('AuthService', () => {
//   let service: AuthService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [AuthService],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   // Create user with valid data and return user data
//   it('should create a new user with valid data and return the user data', async () => {
//     // Arrange
//     // const service = new AuthService(dbSource, sharedService, jwtService);
//     const userDto = new AdminUserSignUpDto();
//     userDto.firstName = 'John';
//     userDto.lastName = 'Doe';
//     userDto.email = 'johndoe@example.com';
//     userDto.password = 'password123';

//     const expectedUserData = {
//       id: expect.any(String),
//       firstName: 'John',
//       lastName: 'Doe',
//       middleName: null,
//       email: 'johndoe@example.com',
//       createdAt: expect.any(Date),
//     };

//     // Act
//     const userData = await service.createUser(userDto);

//     // Assert
//     expect(userData).toEqual(expectedUserData);
//   });
// });
