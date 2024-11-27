const mongoose = require('mongoose');

const eInvoiceSchema = new mongoose.Schema({
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
            required: true,
            minlength: 1,
            maxlength: 15
        },
        transaction_details: {
            supply_type: {
                type: String,
                required: true,
                enum: ['B2B', 'SEZWP', 'SEZWOP', 'EXPWP', 'EXPWOP', 'DEXP']
            },
          /*   charge_type: {
                type: String,
                
                enum: ['Y', 'N']
            },
            igst_on_intra: {
                type: String,
                
                enum: ['Y', 'N']
            },
            ecommerce_gstin: {
                type: String,
                match: /^[0-9]{2}[0-9A-Z]{13}$/
            } */
        },
        document_details: {
            document_type: {
                type: String,
                
                enum: ['INV', 'CRN', 'DBN']
            },
            document_number: {
                type: String
              
                
            },
            document_date: {
                type: String,
                
                
            }
        },
        seller_details: {
            gstin: {
                type: String,
                
                
            },
            legal_name: {
                type: String,
                
                
            },
            /* trade_name: {
                type: String,
                minlength: 3,
                maxlength: 100
            }, */
            address1: {
                type: String,
                required: true,
                
            },
            /* address2: {
                type: String,
                minlength: 3,
                maxlength: 100
            }, */
            location: {
                type: String,
                required: true,
                
            },
            pincode: {
                type: Number,
                required: true,
                
            },
            state_code: {
                type: String,
                required: true,
                
            },
          /*   phone_number: {
                type: String,
                
            },
            email: {
                type: String,
                
            } */
        },
        
        buyer_details: {
            gstin: {
                type: String,
                required: true,
                
            },
            legal_name: {
                type: String,
                required: true,
            },
            /* trade_name: {
                type: String,
                minlength: 3,
                maxlength: 100
            }, */
            address1: {
                type: String,
                required: true,
                
            },
           /*  address2: {
                type: String,
                minlength: 3,
                maxlength: 100
            }, */
            location: {
                type: String,
                required: true,
            },
             pincode: {
                type: Number,
               
               
            },
            place_of_supply: {
                type: String,
                required: true,
            },
             state_code: {
                type: String,
                
                
            },
          /*   phone_number: {
                type: String,
                minlength: 10,
                maxlength: 12
            },
            email: {
                type: String,
                minlength: 6,
                maxlength: 100
            } */
        },
        dispatch_details: {
            company_name: {
                type: String,
                required: true,
               
            },
            address1: {
                type: String,
                required: true
            },
            /* address2: {
                type: String,
                minlength: 3,
                maxlength: 100
            }, */
            location: {
                type: String,
                required: true,
                
            },
            pincode: {
                type: Number,
                required: true,
               
            },
            state_code: {
                type: String,
                required: true,
               
            }
        },
        ship_details: {
           /*  gstin: {
                type: String,
                match: /^[0-9]{2}[0-9A-Z]{13}$/
            }, */
            legal_name: {
                type: String,
                required: true,
                
            },
            /* trade_name: {
                type: String,
                minlength: 3,
                maxlength: 60
            }, */
            address1: {
                type: String,
                required: true
            },
            /* address2: {
                type: String,
                minlength: 3,
                maxlength: 100
            }, */
            location: {
                type: String,
                required: true,
                
            },
            pincode: {
                type: Number,
                required: true,
                
            },
            state_code: {
                type: String,
                required: true,
                
            }
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
                    required: true,
                    match: /^[0-3][0-9]\/[0-1][0-9]\/[2][0][1-9][1-9]$/
                },
                invoice_period_end_date: {
                    type: String,
                    required: true,
                    match: /^[0-3][0-9]\/[0-1][0-9]\/[2][0][1-9][1-9]$/
                },
                /* invoice_reference_number:{
                    type: String
                },
                invoice_remarks: {
                    type: String,
                    minlength: 3,
                    maxlength: 100
                }, */            },
           
            preceding_document_details: [{
                reference_of_original_invoice: {
                    
                    type: String,
                    required:true
                },
                preceding_invoice_date: {
                    type: String,
                   
                }
            }],
        },
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
                required: true
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
                required: true
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
                required: true
            },
            /*  product_description: {
                type: String,
                minlength: 3,
                maxlength: 300
            }, */
            is_service: {
                type: String,
                enum: ['Y', 'N'],
                required: true
            }, 
            hsn_code: {
                type: String,
                required: true,
                
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
                required: true
            },
            total_amount: {
                type: Number,
                required: true
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
                required: true
            },
            gst_rate: {
                type: Number,
                required: true
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
                
                required: true
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
const EInvoice = mongoose.model('EInvoice', eInvoiceSchema);

module.exports = EInvoice;
