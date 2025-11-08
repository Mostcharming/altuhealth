
async function notify(user, templateName, shortCodes = null, sendVia = null, createLog = true) {


    const notifyInstance = new Notify(sendVia);
    notifyInstance.templateName = templateName;
    notifyInstance.shortCodes = shortCodes;
    notifyInstance.user = user;
    notifyInstance.createLog = createLog;
    notifyInstance.userColumn = user.id;

    await notifyInstance.send();
}

module.exports = notify;