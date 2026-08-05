'use strict';

const XLSX = require('xlsx');

const DEPENDANT_HEADERS = [
    'S/N',
    'Parent Policy Number',
    'Parent Name',
    'Staff ID',
    'Policy Number',
    'First Name',
    'Middle Name',
    'Last Name',
    'Relationship',
    'Email',
    'Phone Number',
    'Gender',
    'Date of Birth',
    'Occupation',
    'Marital Status',
    'Company',
    'Subsidiary',
    'Subscription',
    'Pre-existing Medical Records',
    'Enrollment Date',
    'Expiration Date',
    'Status',
    'Verified',
    'Created At'
];

function formatDate(value) {
    return value ? new Date(value).toISOString().split('T')[0] : '';
}

function normalizeStaff(staff) {
    return typeof staff?.toJSON === 'function' ? staff.toJSON() : staff;
}

function buildCompanyStaffWorkbook(staffs, company) {
    const staffItems = staffs.map(normalizeStaff);
    const staffRows = staffItems.map((item, index) => {
        const dependents = Array.isArray(item.enrollee?.dependents)
            ? item.enrollee.dependents
            : [];

        return {
            'S/N': index + 1,
            'Policy Number': item.enrollee?.policyNumber || '',
            'First Name': item.firstName || '',
            'Middle Name': item.middleName || '',
            'Last Name': item.lastName || '',
            Email: item.email || '',
            'Phone Number': item.phoneNumber || '',
            'Staff ID': item.staffId || '',
            Company: item.Company?.name || company.name || '',
            Subsidiary: item.CompanySubsidiary?.name || '',
            Subscription: item.Subscription?.code || '',
            'Subscription Status': item.Subscription?.status || '',
            'Subscription Start Date': formatDate(item.Subscription?.startDate),
            'Subscription End Date': formatDate(item.Subscription?.endDate),
            'Date of Birth': formatDate(item.dateOfBirth),
            Gender: item.enrollee?.gender || '',
            'Max Dependents': item.maxDependents ?? '',
            'Dependant Count': dependents.length,
            'Pre-existing Medical Records': item.preexistingMedicalRecords || '',
            'Enrollment Status': item.enrollmentStatus || '',
            Notified: item.isNotified ? 'Yes' : 'No',
            'Notified At': formatDate(item.notifiedAt),
            Status: item.isActive ? 'Active' : 'Inactive',
            'Enrollee Status': item.enrollee ? (item.enrollee.isActive ? 'Active' : 'Inactive') : '',
            'Created At': formatDate(item.createdAt)
        };
    });

    let dependantNumber = 0;
    const dependantRows = staffItems.flatMap((item) => {
        const enrollee = item.enrollee;
        const dependents = Array.isArray(enrollee?.dependents)
            ? enrollee.dependents
            : [];

        return dependents.map((dependent) => {
            dependantNumber += 1;

            return {
                'S/N': dependantNumber,
                'Parent Policy Number': enrollee.policyNumber || '',
                'Parent Name': [item.firstName, item.middleName, item.lastName].filter(Boolean).join(' '),
                'Staff ID': item.staffId || '',
                'Policy Number': dependent.policyNumber || '',
                'First Name': dependent.firstName || '',
                'Middle Name': dependent.middleName || '',
                'Last Name': dependent.lastName || '',
                Relationship: dependent.relationshipToEnrollee || '',
                Email: dependent.email || '',
                'Phone Number': dependent.phoneNumber || '',
                Gender: dependent.gender || '',
                'Date of Birth': formatDate(dependent.dateOfBirth),
                Occupation: dependent.occupation || '',
                'Marital Status': dependent.maritalStatus || '',
                Company: item.Company?.name || company.name || '',
                Subsidiary: item.CompanySubsidiary?.name || '',
                Subscription: item.Subscription?.code || '',
                'Pre-existing Medical Records': dependent.preexistingMedicalRecords || '',
                'Enrollment Date': formatDate(dependent.enrollmentDate),
                'Expiration Date': formatDate(dependent.expirationDate),
                Status: dependent.isActive ? 'Active' : 'Inactive',
                Verified: dependent.isVerified ? 'Yes' : 'No',
                'Created At': formatDate(dependent.createdAt)
            };
        });
    });

    const staffWorksheet = XLSX.utils.json_to_sheet(staffRows);
    const dependantWorksheet = XLSX.utils.json_to_sheet(dependantRows, {
        header: DEPENDANT_HEADERS
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, staffWorksheet, 'Staff List');
    XLSX.utils.book_append_sheet(workbook, dependantWorksheet, 'Dependants');

    return {
        buffer: XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'buffer'
        }),
        dependantCount: dependantRows.length
    };
}

module.exports = {
    buildCompanyStaffWorkbook
};
