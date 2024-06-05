/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/url'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (log, record, search, serverWidget, url) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                var parametros = scriptContext.request.parameters
                generarFormulario(scriptContext, parametros);
            } catch (e) {
                log.error({
                    title: 'Error onRequest',
                    details: e
                });
            }

        }

        function generarFormulario(scriptContext, parametros) {
            try {
                // const { request, response } = scriptContext
                // const { parameters } = request
                // const filters = []
                // assignFilters(filters, parameters, pageObject)
                var form = serverWidget.createForm({ title: 'Valida Listas Negras' });
                form.clientScriptModulePath = '../Client/TKIO - Consulta Listas Negras - CS.js';
                // form.addButton({ id: 'custpage_tkio_validar', label: 'Validar', functionName: 'validar' });
                form.addSubmitButton({ label: 'Validar' })
                let infoRelated = obtenInfoProveedores(parametros.idRecord);

                var sublist_proveedores = form.addSublist({
                    id: 'custpage_tkio_vendor',
                    label: 'Proveedores',
                    type: serverWidget.SublistType.LIST
                });

                sublist_proveedores.addButton({
                    id: 'sublist_btn_marcar',
                    label: 'Marcar Todos',
                    functionName: 'marcar'
                })
                sublist_proveedores.addButton({
                    id: 'sublist_btn_desmarcar',
                    label: 'Desmarcar Todos',
                    functionName: 'desmarcar'
                })
                sublist_proveedores.addField({ id: 'sublist_check', type: serverWidget.FieldType.CHECKBOX, label: 'Seleccionado' });
                sublist_proveedores.addField({ id: 'sublist_pvd_name', type: serverWidget.FieldType.TEXT, label: 'Proveedor' }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.DISABLED
                });
                sublist_proveedores.addField({ id: 'sublist_pvd_rfc', type: serverWidget.FieldType.TEXT, label: 'RFC' }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.DISABLED
                });
                sublist_proveedores.addField({ id: 'custpage_sublist_estatus', type: serverWidget.FieldType.TEXT, label: 'Estado' }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.DISABLED
                });;
                sublist_proveedores.addField({ id: 'sublist_date_consul', type: serverWidget.FieldType.TEXT, label: 'Fecha de Consulta' }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.DISABLED
                });;

                infoRelated.forEach((item, index) => {

                    sublist_proveedores.setSublistValue({ id: 'sublist_pvd_name', line: index, value: item.entityid })
                    sublist_proveedores.setSublistValue({ id: 'sublist_pvd_rfc', line: index, value: item.custentity_mx_rfc })
                    sublist_proveedores.setSublistValue({ id: 'custpage_sublist_estatus', line: index, value: item.custentity_efx_fe_lns_status })
                    sublist_proveedores.setSublistValue({ id: 'sublist_date_consul', line: index, value: item.custentity_efx_fe_lns_valida_date })
                })
                log.debug({ title: 'infoRelated', details: infoRelated });
                // var lineCount = sublist.lineCount;


                scriptContext.response.writePage(form)
            } catch (e) {
                log.error({
                    title: 'Error generarFormulario:',
                    details: e
                });
            }
        }

        const obtenInfoProveedores = (id) => {
            try {
                var arrPvd = [];
                var customrecord_tkiio_lista_negra_recordSearchObj = search.create({
                    type: search.Type.VENDOR,
                    filters:
                        [
                            ['custentity_mx_rfc', search.Operator.ISNOTEMPTY, id]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "Proveedor" }),
                            search.createColumn({ name: "custentity_mx_rfc", label: "RFC" }),
                            search.createColumn({ name: "custentity_efx_fe_lns_status", label: "Estatus" }),
                            search.createColumn({ name: "custentity_efx_fe_lns_valida_date", label: "Fecha de Consulta" })
                        ]
                });

                var searchResultCount = customrecord_tkiio_lista_negra_recordSearchObj.runPaged().count;
                log.debug("customrecord_tkiio_lista_negra_recordSearchObj result count", searchResultCount);
                customrecord_tkiio_lista_negra_recordSearchObj.run().each(function (result) {
                    log.debug({ title: 'result', details: result });
                    arrPvd.push({
                        entityid: result.getValue({ name: 'entityid' }) || ' ',
                        custentity_mx_rfc: result.getValue({ name: 'custentity_mx_rfc' }) || ' ',
                        custentity_efx_fe_lns_status: result.getText({ name: 'custentity_efx_fe_lns_status' }) || ' ',
                        custentity_efx_fe_lns_valida_date: result.getValue({ name: 'custentity_efx_fe_lns_valida_date' }) || ' '
                    })
                    return true;
                });
                return arrPvd;
            } catch (e) {
                log.error({ title: 'Error obtenInfoProveedores:', details: e });
                return [];
            }
        }

        return { onRequest }

    });
