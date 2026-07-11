'use strict';

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');

const MAX_BULK_STAFF_ROWS = 200;

const HEADER_ALIASES = {
    firstname: 'firstName',
    givenname: 'firstName',
    middlename: 'middleName',
    othername: 'middleName',
    othernames: 'middleName',
    lastname: 'lastName',
    surname: 'lastName',
    email: 'email',
    emailaddress: 'email',
    phonenumber: 'phoneNumber',
    phone: 'phoneNumber',
    mobile: 'phoneNumber',
    mobilenumber: 'phoneNumber',
    staffid: 'staffId',
    staffnumber: 'staffId',
    employeeid: 'staffId',
    employeenumber: 'staffId',
    dateofbirth: 'dateOfBirth',
    birthdate: 'dateOfBirth',
    dob: 'dateOfBirth',
    maxdependents: 'maxDependents',
    maxnumberofdependents: 'maxDependents',
    maximumdependents: 'maxDependents',
    preexistingmedicalrecords: 'preexistingMedicalRecords',
    medicalrecords: 'preexistingMedicalRecords',
    preexistingconditions: 'preexistingMedicalRecords',
    gender: 'gender',
    sex: 'gender',
    policynumber: 'policyNumber',
    policy: 'policyNumber'
};

function normalizeHeader(value) {
    const normalized = String(value || '')
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    return HEADER_ALIASES[normalized] || null;
}

function normalizeText(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim();
}

function normalizeDate(value) {
    if (value === undefined || value === null || value === '') return null;

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        return validateDateParts(
            value.getFullYear(),
            value.getMonth() + 1,
            value.getDate()
        );
    }

    if (typeof value === 'number') {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (!parsed) return null;
        return `${String(parsed.y).padStart(4, '0')}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }

    const text = normalizeText(value);
    if (!text) return null;

    const isoMatch = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoMatch) {
        return validateDateParts(isoMatch[1], isoMatch[2], isoMatch[3]);
    }

    const dayFirstMatch = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dayFirstMatch) {
        return validateDateParts(dayFirstMatch[3], dayFirstMatch[2], dayFirstMatch[1]);
    }

    return null;
}

function validateDateParts(yearValue, monthValue, dayValue) {
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day
    ) {
        return null;
    }

    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizePolicyNumber(value) {
    const text = normalizeText(value);
    if (!text || ['xxx', 'auto', 'n/a', 'na', '-'].includes(text.toLowerCase())) {
        return null;
    }
    return text.toUpperCase();
}

function slug(value, separator = '') {
    return normalizeText(value)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
}

function buildGeneratedEmail(firstName, lastName, companyName, rowNumber) {
    const first = slug(firstName, '.') || 'staff';
    const last = slug(lastName, '.') || 'member';
    const domain = slug(companyName) || 'company';
    return `${first}.${last}.${rowNumber}@${domain}.enrollee`;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeRawRow(rawRow) {
    const normalized = {};

    Object.entries(rawRow || {}).forEach(([header, value]) => {
        const field = normalizeHeader(header);
        if (field) normalized[field] = value;
    });

    return normalized;
}

function prepareStaffRow(rawRow, { companyName, rowNumber }) {
    const row = normalizeRawRow(rawRow);
    const errors = [];
    const firstName = normalizeText(row.firstName);
    const middleName = normalizeText(row.middleName) || null;
    const lastName = normalizeText(row.lastName);
    const suppliedEmail = normalizeText(row.email).toLowerCase();
    const email = suppliedEmail || buildGeneratedEmail(firstName, lastName, companyName, rowNumber);
    const phoneNumber = normalizeText(row.phoneNumber) || null;
    const staffId = normalizeText(row.staffId) || null;
    const suppliedDateOfBirth = row.dateOfBirth !== undefined && normalizeText(row.dateOfBirth) !== '';
    const dateOfBirth = normalizeDate(row.dateOfBirth);
    const gender = (normalizeText(row.gender) || 'other').toLowerCase();
    const policyNumber = normalizePolicyNumber(row.policyNumber);
    const preexistingMedicalRecords = normalizeText(row.preexistingMedicalRecords) || null;
    const maxDependentsText = normalizeText(row.maxDependents);
    const maxDependents = maxDependentsText === '' ? null : Number(maxDependentsText);

    if (!firstName) errors.push('firstName is required');
    if (!lastName) errors.push('lastName is required');
    if (!isValidEmail(email)) errors.push('email is invalid');
    if (suppliedDateOfBirth && !dateOfBirth) {
        errors.push('dateOfBirth must be a valid Excel date, YYYY-MM-DD, or DD/MM/YYYY');
    }
    if (!['male', 'female', 'other'].includes(gender)) {
        errors.push('gender must be male, female, or other');
    }
    if (
        maxDependents !== null
        && (!Number.isInteger(maxDependents) || maxDependents < 0)
    ) {
        errors.push('maxDependents must be a non-negative whole number');
    }

    return {
        rowNumber,
        errors,
        data: {
            firstName,
            middleName,
            lastName,
            email,
            phoneNumber,
            staffId,
            dateOfBirth,
            maxDependents,
            preexistingMedicalRecords,
            gender,
            policyNumber
        }
    };
}

async function parseBulkStaffFile(file) {
    const extension = path.extname(file.originalname || file.path || '').toLowerCase();

    if (extension === '.csv') {
        return new Promise((resolve, reject) => {
            const rows = [];
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', (row) => rows.push(row))
                .on('end', () => resolve(rows))
                .on('error', reject);
        });
    }

    if (['.xlsx', '.xls'].includes(extension)) {
        const workbook = XLSX.readFile(file.path, { cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) return [];
        return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
    }

    throw new Error('Invalid file format. Only CSV, XLSX, and XLS files are supported');
}

module.exports = {
    MAX_BULK_STAFF_ROWS,
    buildGeneratedEmail,
    normalizeDate,
    normalizeHeader,
    normalizeRawRow,
    parseBulkStaffFile,
    prepareStaffRow
};
