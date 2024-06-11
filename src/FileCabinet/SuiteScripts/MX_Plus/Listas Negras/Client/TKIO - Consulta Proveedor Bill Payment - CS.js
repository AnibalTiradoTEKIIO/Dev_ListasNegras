/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/log', 'N/search', 'N/ui/message'],
/**
 * @param{currentRecord} currentRecord
 * @param{log} log
 * @param{search} search
 * @param{message} message
 */
function(currentRecord, log, search, message) {
    const currentRd = currentRecord.get();
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        // AL iniciar la pagina Bill Payment, busca si el proveedor seleccionado no esta en la lista negra 69b
        // try {
        //     var currentRecord = scriptContext.currentRecord;
        //     var objMsg = new Object();
        //     var vendorId = currentRecord.getValue({ fieldId: 'entity' });
        //     log.debug({ title: 'vendorId', details: vendorId });
        //     if (vendorId === '') {
        //         return
        //     }
        //     var statusVendor = getVendorStatus(vendorId);
        //     log.debug({ title: 'statusVendor', details: statusVendor });

        //     if (statusVendor === '') {
        //         return true;
        //     } else if (statusVendor === 'Sentencia Favorable') {
        //         objMsg.status = statusVendor
        //         objMsg.message = 'El proveedor se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + statusVendor + '</b>';
        //         createMessage(objMsg);
        //         return true;
        //     } else if (statusVendor === 'Desvirtuado') {
        //         objMsg.status = statusVendor
        //         objMsg.message = 'El proveedor se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + statusVendor + '</b>';
        //         createMessage(objMsg);
        //         return true;
        //     } else if (statusVendor === 'Definitivo') {
        //         objMsg.status = statusVendor
        //         objMsg.message = 'El proveedor se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + statusVendor + '</b>, esta trasacción <b>no</b> se podra guardar';
        //         createMessage(objMsg);
        //         return false;
        //     } else if (statusVendor === 'Presunto') {
        //         objMsg.status = statusVendor
        //         objMsg.message = 'El proveedor se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + statusVendor + '</b>';
        //         createMessage(objMsg);
        //         return true;
        //     } else {
        //         createMessage(objMsg);
        //         return false;
        //     }
        // } catch (error) {
        //     log.error({ title: 'Error pageInit', details: error });
        // }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try {
            var currentRecord = scriptContext.currentRecord;
            var fieldId = scriptContext.fieldId;
            var objMsg = new Object();
            if (fieldId === 'entity') {
                var vendorId = currentRecord.getValue({ fieldId: 'entity' });
                log.debug({ title: 'vendorId', details: vendorId });
                if (vendorId === '') {
                    return
                }
                var statusVendor = getVendorStatus(vendorId);
                log.debug({ title: 'statusVendor', details: statusVendor });

                if (statusVendor === '') {
                    return true;
                } else if (statusVendor === 'Sentencia Favorable') {
                    objMsg.status = statusVendor
                    objMsg.message = 'El proveedor se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + statusVendor + '</b>';
                    createMessage(objMsg);
                    return true;
                } else if (statusVendor === 'Desvirtuado') {
                    objMsg.status = statusVendor
                    objMsg.message = 'El proveedor se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + statusVendor + '</b>';
                    createMessage(objMsg);
                    return true;
                } else if (statusVendor === 'Definitivo') {
                    objMsg.status = statusVendor
                    objMsg.message = 'El proveedor se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + statusVendor + '</b>, esta trasacción <b>no</b> se podra guardar';
                    createMessage(objMsg);
                    return false;
                } else if (statusVendor === 'Presunto') {
                    objMsg.status = statusVendor
                    objMsg.message = 'El proveedor se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + statusVendor + '</b>';
                    createMessage(objMsg);
                    return true;
                } else {
                    createMessage(objMsg);
                    return false;
                }
            }
        } catch (error) {
            log.error({ title: 'Error fieldChanged', details: error });
        }
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        // Al guardar el Bill Payment, si hay un proveedor con el estatus "Definitivo" no permite guardar
        var objMsg = new Object();
        var proveedorId = currentRd.getValue({ fieldId: 'entity' });
        log.debug({ title: 'proveedorId', details: proveedorId });
        if (proveedorId === '') {
            return true;
        }
        var statusPvd = getVendorStatus(proveedorId);
        log.debug({ title: 'statusPvd', details: statusPvd });
        if (statusPvd === 'Definitivo') {
            return false;
        } else if (statusPvd === 'Sentencia Favorable') {
            return true;
        } else if (statusPvd === 'Desvirtuado') {
            return true;
        } else if (statusPvd === 'Presunto') {
            return true;
        } else {
            return true;
        }

    }
    // Busqueda del estatus del proveedor en la lista negra 69b
    function getVendorStatus(vendor) {
        try {
            var retStatus = '';
            var busquedaPvd = { name: "custentity_efx_fe_lns_status" }
            var estado_proveedor_recordSearchObj = search.create({
                type: search.Type.VENDOR,
                filters:
                    [
                        ['internalId', search.Operator.IS, vendor]
                    ],
                columns:
                    [
                        search.createColumn(busquedaPvd)
                    ]
            });
           
            estado_proveedor_recordSearchObj.run().each(function (result) {
                // log.debug({ title: 'result', details: result });
                retStatus = result.getText(busquedaPvd) || ''
                // log.debug({ title: 'retStatus', details: retStatus });
            });
            return retStatus;

        } catch (error) {
            log.error({ title: 'error getVendorStatus', details: error })
        }
    }
    // Funcion para crear mensajes dependiendo del tipo de estatus del proveedor en la lista negra 69b
    function createMessage(objMsg) {
        try {
            var showMsgCust = {
                title: "",
                message: '',
                type: ''
            }
            switch (objMsg.status) {
                case 'Sentencia Favorable':
                    showMsgCust.title = "Proveedor en Lista Negra"
                    showMsgCust.message = objMsg.message
                    showMsgCust.type = message.Type.INFORMATION

                    break;
                case 'Desvirtuado':
                    showMsgCust.title = "Proveedor en Lista Negra"
                    showMsgCust.message = objMsg.message
                    showMsgCust.type = message.Type.WARNING

                    break;
                case 'Definitivo':
                    showMsgCust.title = "Proveedor en Lista Negra"
                    showMsgCust.message = objMsg.message
                    showMsgCust.type = message.Type.ERROR

                    break;
                case 'Presunto':
                    showMsgCust.title = "Proveedor en Lista Negra"
                    showMsgCust.message = objMsg.message
                    showMsgCust.type = message.Type.WARNING

                    break;
                default:
                    showMsgCust.title = "Error no identificado."
                    showMsgCust.message = 'Consulte a su administrador'
                    showMsgCust.type = message.Type.ERROR

                    break;
            }
            var myMsg = message.create(showMsgCust);
            myMsg.show();
        } catch (e) {
            console.error({ title: 'Error createMessage:', details: e });
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        saveRecord: saveRecord
    };

});
