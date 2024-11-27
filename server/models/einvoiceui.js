const mongoose = require('mongoose');

const eInvoiceuiSchema = new mongoose.Schema({
        userid: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Client'
          },
          status: {
            type: String,
            
            
        },
        timestamp: { type: Date, default: Date.now },
        user_gstin: {
            type: String,
            
           
        },
        transaction_details: {
            supply_type: {
                type: String,
                
            },
          
        },
        document_details: {
            document_type: {
                type: String,
                
            },
            document_number: {
                type: String,
                
                
            },
            document_date: {
                type: String,
                
                
            }
        },
        seller_details: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EISellerDetails' 
        },
        
        buyer_details: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EiBuyerDetails' 
        },
        dispatch_details: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EidispatchDetails' 
        },
        ship_details: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EishipDetails' 
        },
        
      /*   payment_details: {
            bank_account_number: {
                type: String,
                minlength: 3,
                maxlength: 18
            },
            paid_balance_amount: {
                type: Number
            },
            credit_days: {
                type: Number
            },
            credit_transfer: {
                type: String,
                minlength: 3,
                maxlength: 100
            },
            direct_debit: {
                type: String,
                minlength: 3,
                maxlength: 100
            },
            branch_or_ifsc: {
                type: String,
                minlength: 3,
                maxlength: 11
            },
            payment_mode: {
                type: String,
                minlength: 3,
                maxlength: 16
            },
            payee_name: {
                type: String,
                minlength: 3,
                maxlength: 100
            },
            outstanding_amount: {
                type: Number
            },
            payment_instruction: {
                type: String,
                minlength: 3,
                maxlength: 100
            },
            payment_term: {
                type: String,
                minlength: 3,
                maxlength: 100
            }
        }, */
        reference_details: {
            
            document_period_details: {
                invoice_period_start_date: {
                    type: String,
                    
                },
                invoice_period_end_date: {
                    type: String,
                    
                },
                /* invoice_reference_number:{
                    type: String
                },
                invoice_remarks: {
                    type: String,
                    minlength: 3,
                    maxlength: 100
                }, */            },
            },
            preceding_document_details: [{
                reference_of_original_invoice: {
                    
                    type: String,
                    
                },
                preceding_invoice_date: {
                    type: String,
                   
                }
            }],
          /*   other_reference: {
                type: String,
                minlength: 3,
                maxlength: 20
            }, */
        
      /*   contact_details:[ {
            project_reference_number: {
                type: String,
                minlength: 1,
                maxlength: 20,
                match: /^[0-9A-Za-z/|()|-]{1,20}$/,
                
            },
            receipt_advice_number: {
                type: String,
                minlength: 3,
                maxlength: 20,
                match: /^([0-9A-ZAZ\/ ]){0,20}$/,
                
            },
            receipt_advice_date: {
                type: String,
                match: /^[0-3][0-9]\/[0-1][0-9]\/[2][0][1-9][1-9]$/,
                
            },
            batch_reference_number: {
                type: String,
                minlength: 3,
                maxlength: 20,
                match: /^([0-9A-ZAZ\/ ]){0,20}$/,
                
            },
            contract_reference_number: {
                type: String,
                minlength: 3,
                maxlength: 20,
                match: /^([0-9A-ZAZ\/ ]){0,20}$/,
                
            },
            other_reference: {
                type: String,
                minlength: 3,
                maxlength: 20,
                match: /^([0-9A-ZAZ\/ ]){0,20}$/,
                
            },
            vendor_po_reference_number: {
                type: String,
                minlength: 3,
                maxlength: 16,
                match: /^([0-9A-ZAZ\/ ]){0,20}$/,
                
            },
            vendor_po_reference_date: {
                type: String,
                match: /^[0-3][0-9]\/[0-1][0-9]\/[2][0][1-9][1-9]$/,
               
            }
        }], */
    
        /* additional_document_details: [{
            supporting_document_ur: {
                type: String,
                
            },
            supporting_document: {
                type: String,
                
            },
            additional_information: {
                type: String,
                
            },
        }], */
        value_details: {
            total_assessable_value: {
                type: Number,
                
            },
             /* total_cgst_value: {
                type: Number
            },
            total_sgst_value: {
                type: Number
            },
            total_igst_value: {
                type: Number
            }, */
          /*  total_cess_value: {
                type: Number
            },
            total_cess_value_of_state: {
                type: Number
            },
            round_off_amount: {
                type: Number
            }, */
            total_invoice_value: {
                type: Number,
                
            },
            /* total_discount: {
                type: Number
            },
            total_other_charge: {
                type: Number
            },
            total_cess_value_of_state: {
                type: Number
            },
            total_invoice_value_additional_currency: {
                type: Number
            } */
        },
        item_list: [{
            item_serial_number: {
                type: Number,
                
            },
            /*  product_description: {
                type: String,
                minlength: 3,
                maxlength: 300
            }, */
            is_service: {
                type: String,
                
            }, 
            hsn_code: {
                type: String,
                
                
            },
           /*  bar_code: {
                type: String,
                minlength: 3,
                maxlength: 30
            },
            quantity: {
                type: Number,
                
            },
            free_quantity: {
                type: Number
            },
            unit: {
                type: String,
                enum: ['BAG', 'BAL', 'BDL', 'BKL', 'BOU', 'BOX', 'BTL', 'BUN', 'CAN', 'CBM', 'CCM', 'CMS', 'CTN', 'DOZ', 'DRM', 'GGK', 'GMS', 'GRS', 'GYD', 'KGS', 'KLR', 'KME', 'LTR', 'MTR', 'MLT', 'MTS', 'NOS', 'OTH', 'PAC', 'PCS', 'PRS', 'QTL', 'ROL', 'SET', 'SQF', 'SQM', 'SQY', 'TBS', 'TGM', 'THD', 'TON', 'TUB', 'UGS', 'UNT', 'YDS'],
                
            }, */
            unit_price: {
                type: Number,
                
            },
            total_amount: {
                type: Number,
                
            },
           /*  discount: {
                type: Number
            },
            pre_tax_value: {
                type: Number
            },
            other_charge: {
                type: Number
            }, */
            assessable_value: {
                type: Number,
               
            },
            gst_rate: {
                type: Number,
                
            },
            igst_amount: {
                type: Number
            },
            cgst_amount: {
                type: Number
            },
            sgst_amount: {
                type: Number
            },
             /* cess_nonadvol_amount: {
                type: Number
            },
            cess_amount: {
                type: Number
            },
            state_cess_amount: {
                type: Number
            },
            state_cess_nonadvol_amount: {
                type: Number
            },
            order_line_reference: {
                type: String,
                minlength: 1,
                maxlength: 50
            },
            country_origin: {
                type: String,
                minlength: 2,
                maxlength: 2
            },
            product_serial_number: {
                type: String,
                minlength: 1,
                maxlength: 15
            },
            item_attribute_details: {
                type: String,
                minlength: 3,
                maxlength: 300
            },
            item_attribute_value: {
                type: String,
                minlength: 3,
                maxlength: 300
            }, */
            total_item_value: {
                type: Number,
                
                
            },

           
        }],
            
        AckNo: {
            type: String, // Change from Number to String
        },
            AckDt: {
                type: String, // Store in 'YYYY-MM-DD HH:mm:ss' format
                
            },
            Irn: {
                type: String,
                
            },
            SignedInvoice: {
                type: String,
                
            },
            SignedQRCode: {
                type: String,
                
            },
            EwbNo: {
                type: String, // Nullable, hence using String type
                
            },
            EwbDt: {
                type: String, // Nullable, hence using String type, store in 'YYYY-MM-DD HH:mm:ss' format
                
            },
            EwbValidTill: {
                type: String, // Nullable, hence using String type, store in 'YYYY-MM-DD HH:mm:ss' format
               
            },
            QRCodeUrl: {
                type: String,
               
            },
            EinvoicePdf: {
                type: String,
            
            },
            Status: {
                type: String,
                
            },
            Remarks: {
                type: String,
                default: ""
            },
            alert: {
                type: String,
                default: ""
            },
            error: {
                type: Boolean,
                
            },
            requestId: {
                type: String,
                
            },
            
        
        
               
        
      
});
const EInvoiceui = mongoose.model('EInvoiceui', eInvoiceuiSchema);

module.exports = EInvoiceui;
