/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/message', 'N/ui/serverWidget'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 * @param{message} message
 * @param{serverWidget} serverWidget
 */
    (log, record, search, message, serverWidget) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            // scriptContext.form.addPageInitMessage({ type: message.Type.INFORMATION, message: 'Hello world!', duration: 5000 });
            // var contextType = scriptContext.type;
            // try {
            //     if (contextType === scriptContext.UserEventType.CREATE || contextType === scriptContext.UserEventType.EDIT) {
            //         var newRecord = scriptContext.newRecord;
            //         var vendorName = newRecord.getValue({ fieldId: 'entity' });
            //         log.debug({ title: 'vendorName', details: vendorName });
            //         if (vendorName === '') {
            //             return
            //         }
            //         var statusVendor = getVendorStatus(vendorName);
            //         log.debug({ title: 'statusVendor', details: statusVendor });
            //         if (statusVendor === '') {
            //             return true;
            //         } else if (statusVendor === 'Sentencia Favorable') {
            //             return true;
            //         } else if (statusVendor === 'Desvirtuado') {
            //             return true;
            //         } else if (statusVendor === 'Definitivo') {
            //             // Si el estatus del proveedor es definitivo, elimina el boton para guardar el registro
            //             scriptContext.form.removeButton({ id: 'submitter' })
            //             // return false;
            //         } else if (statusVendor === 'Presunto') {
            //             return true;
            //         } else {
            //             return false;
            //         }
            //     }
            // } catch (error) {
            //     log.error({ title: 'Error beforeLoad', details: error });
            // }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            // var contextTp = scriptContext.type;
            // try {
            //     if (contextTp === scriptContext.UserEventType.CREATE || contextTp === scriptContext.UserEventType.EDIT) {
            //         var now_Record = scriptContext.newRecord;
            //         var pvdName = now_Record.getValue({ fieldId: 'entity' });
            //         log.debug({ title: 'pvdName', details: pvdName });
            //         var estadoPvd = getVendorStatus(pvdName);
            //         log.debug({ title: 'estadoPvd', details: estadoPvd });
            //         if (estadoPvd === 'Definitivo'){
            //             throw "No puedes guardar una factura para este proveedor porque tiene un estatus Definitivo.";
            //         }
            //     }
            // } catch (error) {
            //     log.error({ title: 'Error beforeSubmit', details: error });
            //     throw error;
            // }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
        }
        // Buscar el estatus del proveedor
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
                var searchResultCount = estado_proveedor_recordSearchObj.runPaged().count;
                log.debug("estado_proveedor_recordSearchObj result count", searchResultCount);
                estado_proveedor_recordSearchObj.run().each(function (result) {
                    log.debug({ title: 'result', details: result });
                    retStatus = result.getText(busquedaPvd) || ''
                    log.debug({ title: 'retStatus', details: retStatus });
                });
                return retStatus;

            } catch (error) {
                log.error({ title: 'error getVendorStatus', details: error })
            }
        }


        return { beforeLoad }

    });
