import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

interface InvestmentResponse {
  id: number;
  owner: string;
  amount: string;
  createdAt: string;
  withdrawalDate: string | null;
}

interface PaginatedInvestmentResponse {
  data: InvestmentResponse[];
  total: number;
  page: number;
  lastPage: number;
}

interface WithdrawalResponse extends InvestmentResponse {
  finalAmount: string;
  tax: string;
  profit: string;
  months: number;
}

describe('Investment API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const prisma = app.get(PrismaService);

    await prisma.investment.deleteMany();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /investments', () => {
    it('should create an investment', async () => {
      const response = await request(app.getHttpServer())
        .post('/investments')
        .send({
          owner: 'Rafael',
          amount: 1000,
          createdAt: '2026-01-01',
        })
        .expect(HttpStatus.CREATED);

      const body = response.body as PaginatedInvestmentResponse;

      expect(body).toEqual(
        expect.objectContaining({
          owner: 'Rafael',
          amount: expect.anything(),
          createdAt: expect.any(String),
        }),
      );
    });
  });

  describe('GET /investments', () => {
    it('should return paginated investments', async () => {
      await request(app.getHttpServer())
        .post('/investments')
        .send({
          owner: 'Rafael',
          amount: 1000,
          createdAt: '2026-01-01',
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/investments')
        .send({
          owner: 'Maria',
          amount: 2000,
          createdAt: '2026-01-01',
        })
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/investments')
        .query({
          page: 1,
          limit: 10,
        })
        .expect(HttpStatus.OK);

      const body = response.body as PaginatedInvestmentResponse;

      expect(body).toEqual(
        expect.objectContaining({
          data: expect.any(Array),
          total: expect.any(Number),
          page: 1,
          lastPage: expect.any(Number),
        }),
      );

      expect(body.data).toHaveLength(2);
      expect(body.total).toBe(2);
      expect(body.lastPage).toBe(1);

      expect(body.data[0]).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          owner: expect.any(String),
          amount: expect.any(String),
          createdAt: expect.any(String),
          withdrawalDate: null,
        }),
      );
    });

    it('should return empty data when there are no investments', async () => {
      const response = await request(app.getHttpServer())
        .get('/investments')
        .query({
          page: 1,
          limit: 10,
        })
        .expect(HttpStatus.OK);

      const body = response.body as PaginatedInvestmentResponse;

      expect(body).toEqual({
        data: [],
        total: 0,
        page: 1,
        lastPage: 0,
      });
    });

    it('should paginate investments correctly', async () => {
      for (let i = 1; i <= 3; i++) {
        await request(app.getHttpServer())
          .post('/investments')
          .send({
            owner: `Owner ${i}`,
            amount: 1000,
            createdAt: '2026-01-01',
          })
          .expect(HttpStatus.CREATED);
      }

      const response = await request(app.getHttpServer())
        .get('/investments')
        .query({
          page: 1,
          limit: 2,
        })
        .expect(HttpStatus.OK);

      const body = response.body as PaginatedInvestmentResponse;

      expect(body.data).toHaveLength(2);
      expect(body.total).toBe(3);
      expect(body.page).toBe(1);
      expect(body.lastPage).toBe(2);
    });

    it('should return the second page', async () => {
      for (let i = 1; i <= 3; i++) {
        await request(app.getHttpServer())
          .post('/investments')
          .send({
            owner: `Owner ${i}`,
            amount: 1000,
            createdAt: '2026-01-01',
          })
          .expect(HttpStatus.CREATED);
      }

      const response = await request(app.getHttpServer())
        .get('/investments')
        .query({
          page: 2,
          limit: 2,
        })
        .expect(HttpStatus.OK);

      const body = response.body as PaginatedInvestmentResponse;

      expect(body.data).toHaveLength(1);
      expect(body.total).toBe(3);
      expect(body.page).toBe(2);
      expect(body.lastPage).toBe(2);
    });
  });

  describe('GET /investments/:id', () => {
    it('should return an investment by id', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/investments')
        .send({
          owner: 'Rafael',
          amount: 1000,
          createdAt: '2026-01-01',
        })
        .expect(HttpStatus.CREATED);

      const bodyResponse = createdResponse.body as InvestmentResponse;
      const investmentId = bodyResponse.id;

      const response = await request(app.getHttpServer())
        .get(`/investments/${investmentId}`)
        .expect(HttpStatus.OK);

      const body = response.body as InvestmentResponse;

      expect(body).toEqual(
        expect.objectContaining({
          id: investmentId,
          owner: 'Rafael',
          amount: '1000',
          createdAt: expect.any(String),
          withdrawalDate: null,
        }),
      );
    });

    it('should return 404 when investment does not exist', async () => {
      await request(app.getHttpServer())
        .get('/investments/999999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('POST /investments/:id/withdraw', () => {
    it('should withdraw an investment', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/investments')
        .send({
          owner: 'Rafael',
          amount: 1000,
          createdAt: '2026-01-01',
        })
        .expect(HttpStatus.CREATED);

      const bodyResponse = createdResponse.body as InvestmentResponse;
      const investmentId = bodyResponse.id;

      const response = await request(app.getHttpServer())
        .post(`/investments/${investmentId}/withdraw`)
        .send({
          withdrawalDate: '2026-06-01',
        })
        .expect(HttpStatus.OK);

      const body = response.body as WithdrawalResponse;

      expect(body).toEqual(
        expect.objectContaining({
          withdrawalDate: expect.any(String),
          months: expect.any(Number),
          balance: expect.any(String),
          gain: expect.any(String),
          taxRate: expect.any(String),
          tax: expect.any(String),
          finalAmount: expect.any(String),
        }),
      );

      expect(body.months).toBe(5);
    });

    it('should return 404 when withdrawing a non-existent investment', async () => {
      await request(app.getHttpServer())
        .post('/investments/999999/withdraw')
        .send({
          withdrawalDate: '2026-06-01',
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not allow withdrawing the same investment twice', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/investments')
        .send({
          owner: 'Rafael',
          amount: 1000,
          createdAt: '2026-01-01',
        })
        .expect(HttpStatus.CREATED);

      const bodyResponse = createdResponse.body as InvestmentResponse;
      const investmentId = bodyResponse.id;

      await request(app.getHttpServer())
        .post(`/investments/${investmentId}/withdraw`)
        .send({
          withdrawalDate: '2026-06-01',
        })
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .post(`/investments/${investmentId}/withdraw`)
        .send({
          withdrawalDate: '2026-06-01',
        })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
