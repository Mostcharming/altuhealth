'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const XLSX = require('xlsx');
const { buildCompanyStaffWorkbook } = require('../src/modules/admin/staffs/staffExport');

test('company staff export includes each enrollee dependant in a linked worksheet', () => {
    const dependent = {
        id: 'dependent-1',
        policyNumber: 'ALT-DEP-001',
        firstName: 'Tomi',
        middleName: null,
        lastName: 'Okafor',
        dateOfBirth: '2015-06-07T00:00:00.000Z',
        gender: 'female',
        relationshipToEnrollee: 'child',
        phoneNumber: '08010000002',
        email: 'tomi@example.com',
        occupation: null,
        maritalStatus: 'single',
        preexistingMedicalRecords: null,
        enrollmentDate: '2026-01-02T00:00:00.000Z',
        expirationDate: '2026-12-31T00:00:00.000Z',
        isVerified: true,
        isActive: true,
        createdAt: '2026-01-02T00:00:00.000Z'
    };

    const staffRecord = {
        toJSON() {
            return {
                id: 'staff-1',
                firstName: 'Ada',
                middleName: 'Nneka',
                lastName: 'Okafor',
                email: 'ada@example.com',
                phoneNumber: '08010000001',
                staffId: 'STAFF-001',
                dateOfBirth: '1990-05-12T00:00:00.000Z',
                maxDependents: 3,
                preexistingMedicalRecords: null,
                enrollmentStatus: 'enrolled',
                isNotified: true,
                notifiedAt: '2026-01-01T00:00:00.000Z',
                isActive: true,
                createdAt: '2026-01-01T00:00:00.000Z',
                enrollee: {
                    id: 'enrollee-1',
                    policyNumber: 'ALT-PRI-001',
                    gender: 'female',
                    isActive: true,
                    dependents: [dependent]
                },
                Company: { id: 'company-1', name: 'Example Limited' },
                CompanySubsidiary: { id: 'subsidiary-1', name: 'Lagos' },
                Subscription: { id: 'subscription-1', code: 'CORP-2026', status: 'active' }
            };
        }
    };

    const { buffer, dependantCount } = buildCompanyStaffWorkbook(
        [staffRecord],
        { id: 'company-1', name: 'Example Limited' }
    );
    assert.ok(Buffer.isBuffer(buffer));
    assert.equal(dependantCount, 1);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    assert.deepEqual(workbook.SheetNames, ['Staff List', 'Dependants']);

    const staffRows = XLSX.utils.sheet_to_json(workbook.Sheets['Staff List']);
    assert.equal(staffRows[0]['Policy Number'], 'ALT-PRI-001');
    assert.equal(staffRows[0]['Dependant Count'], 1);

    const dependantRows = XLSX.utils.sheet_to_json(workbook.Sheets.Dependants);
    assert.equal(dependantRows.length, 1);
    assert.equal(dependantRows[0]['Parent Policy Number'], 'ALT-PRI-001');
    assert.equal(dependantRows[0]['Parent Name'], 'Ada Nneka Okafor');
    assert.equal(dependantRows[0]['Staff ID'], 'STAFF-001');
    assert.equal(dependantRows[0]['Policy Number'], 'ALT-DEP-001');
    assert.equal(dependantRows[0].Relationship, 'child');

});
