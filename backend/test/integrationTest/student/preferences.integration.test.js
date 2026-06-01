// Integration Test — Req 5: رغبات الطالب
import request from 'supertest';
import app from '../../../src/app.js';
import dbConnect from '../../../src/config/dbConnect.js';

let studentToken;

beforeAll(async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'S444500123@uqu.edu.sa', password: 'Layan123' });
    studentToken = res.body.token;
});

describe('Integration — Req 5: Student Preferences', () => {

    // ─── 1. جلب المستشفيات المتاحة ─────────────────────────────────────────────

    test('GET /hospitals — returns available hospitals for open period → 200 or 404', async () => {
        const res = await request(app)
            .get('/api/student/hospitals')
            .set('Authorization', `Bearer ${studentToken}`);

        expect([200, 404]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body).toHaveProperty('hospitals');
            expect(Array.isArray(res.body.hospitals)).toBe(true);
        }
    });

    // ─── 2. إرسال رغبات صحيحة ─────────────────────────────────────────────────

    test('POST /preferences — valid preferences → 201', async () => {
        // نجيب المستشفيات أولاً
        const hospRes = await request(app)
            .get('/api/student/hospitals')
            .set('Authorization', `Bearer ${studentToken}`);

        if (hospRes.statusCode !== 200 || !hospRes.body.hospitals?.length) {
            console.warn('No open period for this student — skipping submit test');
            return;
        }

        const hospitals = hospRes.body.hospitals;
        const preferences = hospitals.map((h, i) => ({
            opportunityID: h.opportunityID,
            preferenceRank: i + 1
        }));

        const res = await request(app)
            .post('/api/student/preferences')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ preferences });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Preferences saved successfully');
    });

    // ─── 3. جلب الرغبات المحفوظة ──────────────────────────────────────────────

    test('GET /preferences — returns saved preferences → 200 or 404', async () => {
        const res = await request(app)
            .get('/api/student/preferences')
            .set('Authorization', `Bearer ${studentToken}`);

        // 200 إذا في فترة مفتوحة أو مغلقة للطالب، 404 إذا ما في فترة أصلاً
        expect([200, 404]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body).toHaveProperty('preferences');
            expect(Array.isArray(res.body.preferences)).toBe(true);
        }
    });

    // ─── 4. رغبات فارغة → 400 ─────────────────────────────────────────────────

    test('POST /preferences — empty list → 400', async () => {
        const res = await request(app)
            .post('/api/student/preferences')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ preferences: [] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Preferences list is required');
    });

    // ─── 5. رتب مكررة → 400 ──────────────────────────────────────────────────

    test('POST /preferences — duplicate ranks → 400', async () => {
        // نجيب المستشفيات المتاحة أولاً علشان نستخدم opportunityIDs صحيحة
        const hospRes = await request(app)
            .get('/api/student/hospitals')
            .set('Authorization', `Bearer ${studentToken}`);

        if (hospRes.statusCode !== 200 || !hospRes.body.hospitals?.length || hospRes.body.hospitals.length < 2) {
            console.warn('No open period or not enough hospitals — skipping duplicate ranks test');
            return;
        }

        const hospitals = hospRes.body.hospitals;

        const res = await request(app)
            .post('/api/student/preferences')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                preferences: [
                    { opportunityID: hospitals[0].opportunityID, preferenceRank: 1 },
                    { opportunityID: hospitals[1].opportunityID, preferenceRank: 1 } // رتبة مكررة
                ]
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Preference ranks must be unique');
    });

    // ─── 6. بدون توكن → 403 ──────────────────────────────────────────────────

    test('GET /hospitals — no token → 403', async () => {
        const res = await request(app)
            .get('/api/student/hospitals');

        expect(res.statusCode).toBe(403);
    });

});

afterAll(async () => {
    await dbConnect.promise().end();
});
