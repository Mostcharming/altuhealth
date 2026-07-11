'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const XLSX = require('xlsx');
const {
    normalizeDate,
    normalizeHeader,
    parseBulkStaffFile,
    prepareStaffRow
} = require('../src/modules/admin/staffs/bulkUpload');

test('normalizes common headers and Excel dates', () => {
    assert.equal(normalizeHeader('\uFEFFFirst Name'), 'firstName');
    assert.equal(normalizeHeader('PHONE_NUMBER'), 'phoneNumber');
    assert.equal(normalizeDate(33005), '1990-05-12');
    assert.equal(normalizeDate('12/05/1990'), '1990-05-12');
});

test('normalizes numeric spreadsheet values without trim errors', () => {
    const prepared = prepareStaffRow({
        '\uFEFFFirst Name': ' Ada ',
        'Last Name': ' Okafor ',
        Phone: 8012345678,
        DOB: 33005,
        Sex: 'Female',
        policy_number: 'xxx',
        maximum_dependents: 3
    }, {
        companyName: 'Altu Health & Partners',
        rowNumber: 2
    });

    assert.deepEqual(prepared.errors, []);
    assert.equal(prepared.data.phoneNumber, '8012345678');
    assert.equal(prepared.data.dateOfBirth, '1990-05-12');
    assert.equal(prepared.data.policyNumber, null);
    assert.equal(prepared.data.email, 'ada.okafor.2@altuhealthpartners.enrollee');
});

test('returns row-level validation errors instead of throwing', () => {
    const prepared = prepareStaffRow({
        firstName: 'Ada',
        lastName: '',
        email: 'not-an-email',
        dateOfBirth: '31/02/1990',
        gender: 'unknown',
        maxDependents: '-1'
    }, {
        companyName: 'Altu',
        rowNumber: 7
    });

    assert.equal(prepared.rowNumber, 7);
    assert.deepEqual(prepared.errors, [
        'lastName is required',
        'email is invalid',
        'dateOfBirth must be a valid Excel date, YYYY-MM-DD, or DD/MM/YYYY',
        'gender must be male, female, or other',
        'maxDependents must be a non-negative whole number'
    ]);
});

test('parses UTF-8 BOM CSV files and Excel workbooks consistently', async (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'altu-staff-upload-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

    const csvPath = path.join(directory, 'staff.csv');
    fs.writeFileSync(csvPath, '\uFEFFfirstName,lastName,phoneNumber\nAda,Okafor,08012345678\n');
    const csvRows = await parseBulkStaffFile({ path: csvPath, originalname: 'staff.csv' });
    const preparedCsv = prepareStaffRow(csvRows[0], { companyName: 'Altu', rowNumber: 2 });
    assert.equal(preparedCsv.data.firstName, 'Ada');
    assert.equal(preparedCsv.data.phoneNumber, '08012345678');

    const xlsxPath = path.join(directory, 'staff.xlsx');
    const worksheet = XLSX.utils.aoa_to_sheet([
        ['First Name', 'Last Name', 'Phone Number', 'Date of Birth'],
        ['Ada', 'Okafor', 8012345678, new Date('1990-05-12')]
    ], { cellDates: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    XLSX.writeFile(workbook, xlsxPath);

    const xlsxRows = await parseBulkStaffFile({ path: xlsxPath, originalname: 'staff.xlsx' });
    const preparedXlsx = prepareStaffRow(xlsxRows[0], { companyName: 'Altu', rowNumber: 2 });
    assert.equal(preparedXlsx.data.phoneNumber, '8012345678');
    assert.equal(preparedXlsx.data.dateOfBirth, '1990-05-12');
});
