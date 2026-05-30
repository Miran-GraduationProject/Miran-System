// Integration Test — Req 6: التوزيع التلقائي
import request from 'supertest';
import app from '../../../src/app.js';
import jwt from 'jsonwebtoken';

const SECRET = 'Software_Engineers_for_the_Miran_project';

let token;
let closedPeriodID; // فترة CLOSED فيها رغبات

beforeAll(async () => {
    token = jwt.sign(
        { id: 1, role: 'UniversityCoordinator', firstName: 'Coordinator' },
        SECRET,
        { expiresIn: '1h' }
    );

    // نجيب أول فترة CLOSED من الـ API
    const res = await request(app)
        .get('/api/coordinator/training-period/all-periods')
        .set('Authorization', `Bearer ${token}`);

    const periods = res.body.periods || [];
    const closed = periods.find(p => p.status === 'CLOSED');
    if (closed) closedPeriodID = closed.periodID;
});

describe('Integration — Req 6: Allocation', () => {

    // ─── 1. توليد التوزيع ─────────────────────────────────────────────────────

    test('POST /generate-allocation — generates allocation for closed period → 200', async () => {
        if (!closedPeriodID) {
            console.warn('No CLOSED period found — skipping generate test');
            return;
        }

        const res = await request(app)
            .post(`/api/coordinator/training-period/${closedPeriodID}/generate-allocation`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect([200, 201]).toContain(res.statusCode);
    });

    // ─── 2. عرض التوزيع المولّد ──────────────────────────────────────────────

    test('GET /allocation-preview — returns preview with assigned/unassigned → 200', async () => {
        if (!closedPeriodID) {
            console.warn('No CLOSED period found — skipping preview test');
            return;
        }

        const res = await request(app)
            .get(`/api/coordinator/training-period/${closedPeriodID}/allocation-preview`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('preview');
        expect(Array.isArray(res.body.preview)).toBe(true);

        const statuses = res.body.preview.map(r => r.status);
        statuses.forEach(s => expect(['Assigned', 'Unassigned']).toContain(s));
    });

    // ─── 3. تعديل يدوي على طالب ──────────────────────────────────────────────

    test('PUT /adjust-allocation/:previewID — manual adjustment → 200', async () => {
        if (!closedPeriodID) return;

        // نجيب أول سجل من البريفيو
        const prevRes = await request(app)
            .get(`/api/coordinator/training-period/${closedPeriodID}/allocation-preview`)
            .set('Authorization', `Bearer ${token}`);

        const preview = prevRes.body.preview || [];
        const firstRow = preview.find(r => r.previewID);
        if (!firstRow) {
            console.warn('No preview rows found — skipping adjust test');
            return;
        }

        const res = await request(app)
            .put(`/api/coordinator/training-period/${closedPeriodID}/adjust-allocation/${firstRow.previewID}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                opportunityID: firstRow.opportunityID,
                status: firstRow.status
            });

        expect([200, 201]).toContain(res.statusCode);
    });

    // ─── 4. فترة غير موجودة → 404 ─────────────────────────────────────────

    test('GET /allocation-preview — invalid periodID → 404 or empty', async () => {
        const res = await request(app)
            .get('/api/coordinator/training-period/999999/allocation-preview')
            .set('Authorization', `Bearer ${token}`);

        expect([200, 404]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body.preview).toEqual([]);
        }
    });

    // ─── 5. بدون توكن → 403 ─────────────────────────────────────────────────

    test('GET /allocation-preview — no token → 403', async () => {
        const res = await request(app)
            .get(`/api/coordinator/training-period/1/allocation-preview`);

        expect(res.statusCode).toBe(403);
    });

    // ─── 6. جلب الفترات المعتمدة ─────────────────────────────────────────────

    test('GET /allocated-periods — returns confirmed periods → 200', async () => {
        const res = await request(app)
            .get('/api/coordinator/training-period/allocated-periods')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('periods');
    });

});
