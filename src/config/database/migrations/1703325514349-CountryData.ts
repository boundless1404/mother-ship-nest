import { MigrationInterface, QueryRunner } from 'typeorm';
import CountryData from '../../../lib/CountryData.json';
import { Country } from '../../../project/entities/Country.entity';
import { Currency } from '../../../project/entities/Currency.entity';
import { PhoneCode } from '../../../project/entities/PhoneCode.entity';
import { Logger } from '@nestjs/common';

export class CountryData1703325514349 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //
    const dbManager = queryRunner.manager;
    //
    function getCountries() {
      return new Promise((resolve, reject) => {
        try {
          const countries = Object.entries(
            CountryData.country_formats.name_to_alpha3,
          );

          resolve(countries);
        } catch (error) {
          reject(error);
        }
      });
    }

    function getCountriesDetails(nameCode: string) {
      return new Promise(
        (
          resolve: (value: {
            currency: {
              currencyCode: string[];
              currencyName: string[];
              currencySymbol: string[];
            };
            phone: {
              countryCode: string;
              mobile_begin_with: string[];
              phone_number_lengths: string[];
            };
          }) => void,
          reject,
        ) => {
          try {
            const country = CountryData.country[nameCode];
            resolve(country);
          } catch (error) {
            reject(error);
          }
        },
      );
    }

    const countries = (await getCountries()) as [string, string][];

    for await (const [countryName, countryAlpha3] of countries) {
      //
      Logger.log(`Processing country: ${countryName}`);
      let country = new Country();
      country.fullname = countryName;
      country.name = countryAlpha3;

      country = await dbManager.save(country);

      const countryDetail = await getCountriesDetails(country.name);

      const currencies: Currency[] = countryDetail.currency.currencyCode.map(
        (currencyCode, index) => {
          const currency = new Currency();
          currency.name = currencyCode;
          currency.symbol = countryDetail.currency.currencySymbol[index];
          currency.fullname = countryDetail.currency.currencyName[index];
          currency.countryId = country.id;

          return currency;
        },
      );

      await dbManager.save(currencies);

      if (countryDetail.phone.countryCode) {
        const phoneCode = new PhoneCode();
        phoneCode.name = countryDetail.phone.countryCode;
        phoneCode.countryId = country.id;

        await dbManager.save(phoneCode);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
    queryRunner.query('select 1 + 1;');
  }
}
