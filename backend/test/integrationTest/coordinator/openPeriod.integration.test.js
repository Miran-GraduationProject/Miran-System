// Integration Test — Req 4: فتح فترة تدريبية
import request from 'supertest';
import app from '../../../src/app.js';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../src/config/dbConnect.js';

let token;
let coordinatorID;
let createdPeriodID;

beforeAll(async () => {
    // تسجيل دخول حقيقي للمنسق
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'U222333444@uqu.edu.sa', password: 'Fahad123' });

    token = res.body.token;

    // نجيب الـ userID من الـ token
    const decoded = jwt.decode(token);
    coordinatorID = decoded.id; // 222333444
});

describe('Integration — Req 4: Training Period Management', () => {

    // ─── 1. فتح فترة جديدة ──────────────────────────────────────────────────────

    test('POST /open — create training period with hospitals → 201', async () => {
        const res = await request(app)
            .post('/api/coordinator/training-period/open')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Integration Test Period',
                level: '7',
                startDate: '2027-09-01',
                endDate: '2027-12-01',
                registrationOpen: '2027-07-01',
                registrationClose: '2027-08-01',
                activatedBy: coordinatorID,
                hospitals: [
                    { hospitalID: 2, maleCapacity: 5, femaleCapacity: 5 }
                ]
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('periodID');
        expect(res.body.status).toBe('OPEN');
        createdPeriodID = res.body.periodID;
    });

    // ─── 2. فتح فترة ببيانات ناقصة ──────────────────────────────────────────────

    test('POST /open — missing fields → 400', async () => {
        const res = await request(app)
            .post('/api/coordinator/training-period/open')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Incomplete' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('All fields are required');
    });

    // ─── 3. تواريخ خاطئة ────────────────────────────────────────────────────────

    test('POST /open — endDate before startDate → 400', async () => {
        const res = await request(app)
            .post('/api/coordinator/training-period/open')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Bad Dates',
                level: '5',
                startDate: '2027-12-01',
                endDate: '2027-09-01',
                registrationOpen: '2027-07-01',
                registrationClose: '2027-08-01',
                activatedBy: coordinatorID,
                hospitals: [{ hospitalID: 2, maleCapacity: 5, femaleCapacity: 5 }]
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('End date must be after start date');
    });

    // ─── 4. جلب كل الفترات ──────────────────────────────────────────────────────

    test('GET /all-periods — returns list with created period', async () => {
        const res = await request(app)
            .get('/api/coordinator/training-period/all-periods')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('periods');
        expect(Array.isArray(res.body.periods)).toBe(true);

        const found = res.body.periods.find(p => p.periodID === createdPeriodID);
        expect(found).toBeDefined();
        expect(found.status).toBe('OPEN');
    });

    // ─── 5. إضافة مستشفى للفترة ─────────────────────────────────────────────────

    test('POST /:periodID/hospitals — add hospital → 201', async () => {
        const res = await request(app)
            .post(`/api/coordinator/training-period/${createdPeriodID}/hospitals`)
            .set('Authorization', `Bearer ${token}`)
            .send({ hospitalID: 5, maleCapacity: 3, femaleCapacity: 3 });

        expect(res.statusCode).toBe(201);
    });

    // ─── 6. حذف مستشفى من الفترة ────────────────────────────────────────────────

    test('DELETE /:periodID/hospitals/:hospitalID — remove hospital → 200', async () => {
        const res = await request(app)
            .delete(`/api/coordinator/training-period/${createdPeriodID}/hospitals/5`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    // ─── 7. تعديل سعة مستشفى والتحقق من قاعدة البيانات ──────────────────────────

    test('PUT /:periodID — edit hospital capacity and verify change → 200', async () => {
        // نعدّل سعة المستشفى الأولى (hospitalID: 2) التي أنشأناها في الاختبار الأول
        const editRes = await request(app)
            .put(`/api/coordinator/training-period/${createdPeriodID}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Integration Test Period',
                level: '7',
                startDate: '2027-09-01',
                endDate: '2027-12-01',
                registrationOpen: '2027-07-01',
                registrationClose: '2027-08-01',
                hospitals: [{ hospitalID: 2, maleCapacity: 12, femaleCapacity: 9 }]
            });

        expect(editRes.statusCode).toBe(200);

        // نتحقق أن القيم تغيرت فعلاً في قاعدة البيانات عبر registration-stats
        const statsRes = await request(app)
            .get(`/api/coordinator/training-period/registration-stats?periodID=${createdPeriodID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(statsRes.statusCode).toBe(200);
        const updatedHospital = statsRes.body.hospitals.find(h => h.hospitalID === 2);
        expect(updatedHospital).toBeDefined();
        expect(Number(updatedHospital.maleCapacity)).toBe(12);
        expect(Number(updatedHospital.femaleCapacity)).toBe(9);
    });

    // ─── 8. حذف الفترة (تنظيف) ──────────────────────────────────────────────────

    test('DELETE /:periodID — delete test period → 200', async () => {
        const res = await request(app)
            .delete(`/api/coordinator/training-period/${createdPeriodID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    // ─── 9. بدون توكن → 403 ─────────────────────────────────────────────────────

    test('GET /all-periods — no token → 403', async () => {
        const res = await request(app)
            .get('/api/coordinator/training-period/all-periods');

        expect(res.statusCode).toBe(403);
    });

});

afterAll(async () => {
    await dbConnect.promise().end();
});
