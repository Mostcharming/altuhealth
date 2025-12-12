const express = require('express');
const router = express.Router();
const AuthorizationCode = require('./controller');

// CRUD for authorization codes
router.post('/', AuthorizationCode.createAuthorizationCode);
router.get('/', AuthorizationCode.listAuthorizationCodes);
router.get('/authorization-type-options', AuthorizationCode.getAuthorizationTypeOptions);
router.get('/status-options', AuthorizationCode.getAuthorizationStatusOptions);
router.get('/:id', AuthorizationCode.getAuthorizationCode);
router.put('/:id', AuthorizationCode.updateAuthorizationCode);
router.delete('/:id', AuthorizationCode.deleteAuthorizationCode);

// Approval operations
router.post('/:id/approve', AuthorizationCode.approveAuthorizationCode);
router.post('/:id/reject', AuthorizationCode.rejectAuthorizationCode);

module.exports = router;
