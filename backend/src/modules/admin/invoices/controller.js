'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createInvoice(req, res, next) {
    try {
        const { Invoice, InvoiceLineItem, Provider, Enrollee, RetailEnrollee } = req.models;
        const {
            providerId,
            enrolleeId,
            retailEnrolleeId,
            customerName,
            customerAddress,
            customerPhone,
            customerEmail,
            invoiceDate,
            dueDate,
            notes,
            description,
            lineItems
        } = req.body || {};

        if (!customerName) return res.fail('`customerName` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);
        if (!lineItems || lineItems.length === 0) return res.fail('At least one line item is required', 400);

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Verify enrollee/retail enrollee if provided
        if (enrolleeId) {
            const enrollee = await Enrollee.findByPk(enrolleeId);
            if (!enrollee) return res.fail('Enrollee not found', 404);
        }

        if (retailEnrolleeId) {
            const retailEnrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
            if (!retailEnrollee) return res.fail('Retail Enrollee not found', 404);
        }

        // Calculate totals from line items
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        lineItems.forEach(item => {
            subtotal += parseFloat(item.subtotal || 0);
            totalDiscount += parseFloat(item.discountAmount || 0);
            totalTax += parseFloat(item.taxAmount || 0);
        });

        const totalAmount = subtotal - totalDiscount + totalTax;

        // Create invoice
        const invoice = await Invoice.create({
            providerId,
            enrolleeId: enrolleeId || null,
            retailEnrolleeId: retailEnrolleeId || null,
            customerName,
            customerAddress: customerAddress || null,
            customerPhone: customerPhone || null,
            customerEmail: customerEmail || null,
            invoiceDate: invoiceDate || new Date(),
            dueDate: dueDate || null,
            subtotal,
            discountAmount: totalDiscount,
            taxAmount: totalTax,
            totalAmount,
            paidAmount: 0,
            balanceAmount: totalAmount,
            status: 'issued',
            paymentStatus: 'unpaid',
            notes: notes || null,
            description: description || null,
            issuedBy: (req.user && req.user.id) ? req.user.id : null,
            issuedByType: (req.user && req.user.type) ? req.user.type : 'System'
        });

        // Create line items
        const createdLineItems = [];
        for (let i = 0; i < lineItems.length; i++) {
            const item = lineItems[i];
            const lineTotal = (parseFloat(item.subtotal || 0) - parseFloat(item.discountAmount || 0)) + parseFloat(item.taxAmount || 0);

            const lineItem = await InvoiceLineItem.create({
                invoiceId: invoice.id,
                itemNumber: i + 1,
                serviceName: item.serviceName,
                description: item.description || null,
                quantity: item.quantity || 1,
                unitOfMeasure: item.unitOfMeasure || 'unit',
                unitCost: item.unitCost,
                subtotal: item.subtotal,
                discountAmount: item.discountAmount || 0,
                discountPercentage: item.discountPercentage || null,
                taxAmount: item.taxAmount || 0,
                taxPercentage: item.taxPercentage || null,
                lineTotal,
                serviceId: item.serviceId || null,
                productId: item.productId || null,
                productCode: item.productCode || null,
                notes: item.notes || null
            });
            createdLineItems.push(lineItem.toJSON());
        }

        await addAuditLog(req.models, {
            action: 'invoice.create',
            message: `Invoice created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { invoiceId: invoice.id, providerId, customerId: enrolleeId || retailEnrolleeId }
        });

        return res.success({
            invoice: invoice.toJSON(),
            lineItems: createdLineItems
        }, 'Invoice created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateInvoice(req, res, next) {
    try {
        const { Invoice } = req.models;
        const { id } = req.params;
        const {
            customerName,
            customerAddress,
            customerPhone,
            customerEmail,
            dueDate,
            notes,
            description,
            status
        } = req.body || {};

        const invoice = await Invoice.findByPk(id);
        if (!invoice) return res.fail('Invoice not found', 404);

        const updates = {};
        if (customerName !== undefined) updates.customerName = customerName;
        if (customerAddress !== undefined) updates.customerAddress = customerAddress;
        if (customerPhone !== undefined) updates.customerPhone = customerPhone;
        if (customerEmail !== undefined) updates.customerEmail = customerEmail;
        if (dueDate !== undefined) updates.dueDate = dueDate;
        if (notes !== undefined) updates.notes = notes;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;

        await invoice.update(updates);

        await addAuditLog(req.models, {
            action: 'invoice.update',
            message: `Invoice updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { invoiceId: invoice.id }
        });

        return res.success({ invoice }, 'Invoice updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteInvoice(req, res, next) {
    try {
        const { Invoice } = req.models;
        const { id } = req.params;

        const invoice = await Invoice.findByPk(id);
        if (!invoice) return res.fail('Invoice not found', 404);

        if (invoice.status !== 'draft') {
            return res.fail(`Only invoices with 'draft' status can be deleted. Current status: ${invoice.status}`, 403);
        }

        await invoice.destroy();

        await addAuditLog(req.models, {
            action: 'invoice.delete',
            message: `Invoice deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { invoiceId: id }
        });

        return res.success(null, 'Invoice deleted');
    } catch (err) {
        return next(err);
    }
}

async function listInvoices(req, res, next) {
    try {
        const { Invoice, Provider, Enrollee, RetailEnrollee, InvoiceLineItem } = req.models;
        const { limit = 10, page = 1, q, providerId, enrolleeId, retailEnrolleeId, status, paymentStatus } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (providerId) {
            where.providerId = providerId;
        }

        if (enrolleeId) {
            where.enrolleeId = enrolleeId;
        }

        if (retailEnrolleeId) {
            where.retailEnrolleeId = retailEnrolleeId;
        }

        if (status) {
            where.status = status;
        }

        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }

        if (q) {
            where[Op.or] = [
                { invoiceNumber: { [Op.iLike || Op.like]: `%${q}%` } },
                { customerName: { [Op.iLike || Op.like]: `%${q}%` } },
                { customerEmail: { [Op.iLike || Op.like]: `%${q}%` } },
                { customerPhone: { [Op.iLike || Op.like]: `%${q}%` } },
                { notes: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await Invoice.count({ where });

        const findOptions = {
            where,
            order: [['invoiceDate', 'DESC']],
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber'],
                    required: false
                },
                {
                    model: RetailEnrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: InvoiceLineItem,
                    attributes: ['id', 'itemNumber', 'serviceName', 'quantity', 'unitCost', 'lineTotal'],
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const invoices = await Invoice.findAll(findOptions);
        const data = invoices.map(inv => inv.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + invoices.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: isAll ? 'all' : limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (err) {
        return next(err);
    }
}

async function getInvoice(req, res, next) {
    try {
        const { Invoice, Provider, Enrollee, RetailEnrollee, InvoiceLineItem, Admin } = req.models;
        const { id } = req.params;

        const invoice = await Invoice.findByPk(id, {
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber', 'address', 'state', 'lga'],
                    required: false
                },
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber'],
                    required: false
                },
                {
                    model: RetailEnrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: InvoiceLineItem,
                    attributes: ['id', 'itemNumber', 'serviceName', 'description', 'quantity', 'unitOfMeasure', 'unitCost', 'subtotal', 'discountAmount', 'taxAmount', 'lineTotal'],
                    required: false
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'issuedByAdmin',
                    required: false
                }
            ]
        });

        if (!invoice) return res.fail('Invoice not found', 404);

        return res.success(invoice.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function addLineItem(req, res, next) {
    try {
        const { Invoice, InvoiceLineItem } = req.models;
        const { id } = req.params;
        const {
            serviceName,
            description,
            quantity,
            unitOfMeasure,
            unitCost,
            discountAmount,
            discountPercentage,
            taxAmount,
            taxPercentage,
            serviceId,
            productId,
            productCode,
            notes
        } = req.body || {};

        if (!serviceName) return res.fail('`serviceName` is required', 400);
        if (!unitCost) return res.fail('`unitCost` is required', 400);

        const invoice = await Invoice.findByPk(id);
        if (!invoice) return res.fail('Invoice not found', 404);

        const qty = quantity || 1;
        const subtotal = qty * parseFloat(unitCost);
        const discount = parseFloat(discountAmount || 0);
        const tax = parseFloat(taxAmount || 0);
        const lineTotal = (subtotal - discount) + tax;

        // Get the next item number
        const lastItem = await InvoiceLineItem.findOne({
            where: { invoiceId: id },
            order: [['itemNumber', 'DESC']]
        });
        const nextItemNumber = (lastItem ? lastItem.itemNumber : 0) + 1;

        const lineItem = await InvoiceLineItem.create({
            invoiceId: id,
            itemNumber: nextItemNumber,
            serviceName,
            description: description || null,
            quantity: qty,
            unitOfMeasure: unitOfMeasure || 'unit',
            unitCost,
            subtotal,
            discountAmount: discount,
            discountPercentage: discountPercentage || null,
            taxAmount: tax,
            taxPercentage: taxPercentage || null,
            lineTotal,
            serviceId: serviceId || null,
            productId: productId || null,
            productCode: productCode || null,
            notes: notes || null
        });

        // Recalculate invoice totals
        const allLineItems = await InvoiceLineItem.findAll({ where: { invoiceId: id } });
        let newSubtotal = 0;
        let newDiscount = 0;
        let newTax = 0;

        allLineItems.forEach(item => {
            newSubtotal += parseFloat(item.subtotal);
            newDiscount += parseFloat(item.discountAmount || 0);
            newTax += parseFloat(item.taxAmount || 0);
        });

        const newTotalAmount = newSubtotal - newDiscount + newTax;
        await invoice.update({
            subtotal: newSubtotal,
            discountAmount: newDiscount,
            taxAmount: newTax,
            totalAmount: newTotalAmount,
            balanceAmount: newTotalAmount - (invoice.paidAmount || 0)
        });

        await addAuditLog(req.models, {
            action: 'invoice.lineItem.add',
            message: `Line item added to invoice`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { invoiceId: id, lineItemId: lineItem.id }
        });

        return res.success({ lineItem: lineItem.toJSON() }, 'Line item added', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateLineItem(req, res, next) {
    try {
        const { InvoiceLineItem, Invoice } = req.models;
        const { id, lineItemId } = req.params;
        const {
            serviceName,
            description,
            quantity,
            unitOfMeasure,
            unitCost,
            discountAmount,
            discountPercentage,
            taxAmount,
            taxPercentage,
            notes
        } = req.body || {};

        const lineItem = await InvoiceLineItem.findByPk(lineItemId);
        if (!lineItem) return res.fail('Line item not found', 404);

        const updates = {};
        if (serviceName !== undefined) updates.serviceName = serviceName;
        if (description !== undefined) updates.description = description;
        if (quantity !== undefined) {
            updates.quantity = quantity;
            const subtotal = quantity * parseFloat(lineItem.unitCost);
            updates.subtotal = subtotal;
        }
        if (unitOfMeasure !== undefined) updates.unitOfMeasure = unitOfMeasure;
        if (unitCost !== undefined) {
            updates.unitCost = unitCost;
            const subtotal = parseFloat(lineItem.quantity) * unitCost;
            updates.subtotal = subtotal;
        }
        if (discountAmount !== undefined) updates.discountAmount = discountAmount;
        if (discountPercentage !== undefined) updates.discountPercentage = discountPercentage;
        if (taxAmount !== undefined) updates.taxAmount = taxAmount;
        if (taxPercentage !== undefined) updates.taxPercentage = taxPercentage;
        if (notes !== undefined) updates.notes = notes;

        // Recalculate lineTotal
        const subtotal = updates.subtotal !== undefined ? updates.subtotal : lineItem.subtotal;
        const discount = updates.discountAmount !== undefined ? updates.discountAmount : lineItem.discountAmount;
        const tax = updates.taxAmount !== undefined ? updates.taxAmount : lineItem.taxAmount;
        updates.lineTotal = (subtotal - discount) + tax;

        await lineItem.update(updates);

        // Recalculate invoice totals
        const invoice = await Invoice.findByPk(id);
        const allLineItems = await InvoiceLineItem.findAll({ where: { invoiceId: id } });
        let newSubtotal = 0;
        let newDiscount = 0;
        let newTax = 0;

        allLineItems.forEach(item => {
            newSubtotal += parseFloat(item.subtotal);
            newDiscount += parseFloat(item.discountAmount || 0);
            newTax += parseFloat(item.taxAmount || 0);
        });

        const newTotalAmount = newSubtotal - newDiscount + newTax;
        await invoice.update({
            subtotal: newSubtotal,
            discountAmount: newDiscount,
            taxAmount: newTax,
            totalAmount: newTotalAmount,
            balanceAmount: newTotalAmount - (invoice.paidAmount || 0)
        });

        await addAuditLog(req.models, {
            action: 'invoice.lineItem.update',
            message: `Line item updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { invoiceId: id, lineItemId }
        });

        return res.success({ lineItem: lineItem.toJSON() }, 'Line item updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteLineItem(req, res, next) {
    try {
        const { InvoiceLineItem, Invoice } = req.models;
        const { id, lineItemId } = req.params;

        const lineItem = await InvoiceLineItem.findByPk(lineItemId);
        if (!lineItem) return res.fail('Line item not found', 404);

        await lineItem.destroy();

        // Recalculate invoice totals
        const invoice = await Invoice.findByPk(id);
        const allLineItems = await InvoiceLineItem.findAll({ where: { invoiceId: id } });

        if (allLineItems.length === 0) {
            // If no line items left, reset totals
            await invoice.update({
                subtotal: 0,
                discountAmount: 0,
                taxAmount: 0,
                totalAmount: 0,
                balanceAmount: 0
            });
        } else {
            let newSubtotal = 0;
            let newDiscount = 0;
            let newTax = 0;

            allLineItems.forEach(item => {
                newSubtotal += parseFloat(item.subtotal);
                newDiscount += parseFloat(item.discountAmount || 0);
                newTax += parseFloat(item.taxAmount || 0);
            });

            const newTotalAmount = newSubtotal - newDiscount + newTax;
            await invoice.update({
                subtotal: newSubtotal,
                discountAmount: newDiscount,
                taxAmount: newTax,
                totalAmount: newTotalAmount,
                balanceAmount: newTotalAmount - (invoice.paidAmount || 0)
            });
        }

        await addAuditLog(req.models, {
            action: 'invoice.lineItem.delete',
            message: `Line item deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { invoiceId: id, lineItemId }
        });

        return res.success(null, 'Line item deleted');
    } catch (err) {
        return next(err);
    }
}

async function cancelInvoice(req, res, next) {
    try {
        const { Invoice } = req.models;
        const { id } = req.params;
        const { cancelledReason } = req.body || {};

        const invoice = await Invoice.findByPk(id);
        if (!invoice) return res.fail('Invoice not found', 404);

        await invoice.update({
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelledReason: cancelledReason || null
        });

        await addAuditLog(req.models, {
            action: 'invoice.cancel',
            message: `Invoice cancelled`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { invoiceId: id }
        });

        return res.success({ invoice }, 'Invoice cancelled');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    listInvoices,
    getInvoice,
    addLineItem,
    updateLineItem,
    deleteLineItem,
    cancelInvoice
};
