'use strict';

function resolveMemberIdCardUrl(member) {
    if (!member) return null;
    return member.idCardUrl || member.pictureUrl || null;
}

module.exports = {
    resolveMemberIdCardUrl
};
